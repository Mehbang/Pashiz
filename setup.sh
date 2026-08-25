#!/usr/bin/env bash
#
# Pashiz — installation on a clean Ubuntu server.
#
#   curl -fsSL https://raw.githubusercontent.com/Mehbang/Pashiz/pashiz/setup.sh | sudo bash
#
# or, from a clone:
#
#   sudo ./setup.sh
#
# The script installs Docker, fetches the source, writes an .env with freshly
# generated secrets, builds the images and starts everything. Running it again
# on an installed machine is safe: an existing .env is never overwritten and
# the Garage bootstrap is idempotent.
#
# Non-interactive use — set any of these beforehand:
#   PASHIZ_DIR       install directory                (default /opt/pashiz)
#   PASHIZ_BRANCH    branch to deploy                 (default pashiz)
#   PASHIZ_REPO      git remote                       (default this fork)
#   BASE_URL         URL the application is served on (default http://<host-ip>)
#   PUBLIC_PROXY_PORT  http port                      (default 80)
#   PASHIZ_DOMAIN    domain to serve over HTTPS; when set, Caddy is put in
#                    front and a Let's Encrypt certificate is obtained.
#                    Leave empty to stay on plain HTTP.
#   DOCKER_REGISTRY_MIRROR  registry mirror to pull the base images through,
#                    for networks where Docker Hub is blocked or throttled.

set -euo pipefail

PASHIZ_REPO="${PASHIZ_REPO:-https://github.com/Mehbang/Pashiz.git}"
PASHIZ_BRANCH="${PASHIZ_BRANCH:-pashiz}"
PASHIZ_DIR="${PASHIZ_DIR:-/opt/pashiz}"
PUBLIC_PROXY_PORT="${PUBLIC_PROXY_PORT:-80}"

COMPOSE_FILES=(-f docker-compose.prod.yml -f docker-compose.pashiz.yml)

# The HTTPS overlay is included whenever a domain is configured, so both
# scripts act on the same set of services without being told which mode the
# server is in.
add_https_overlay_if_configured() {
  [ -f .env ] || return 0
  local domain
  # `|| true`: under `pipefail` a grep that matches nothing would otherwise
  # take the whole script down through `set -e`.
  domain=$(grep -E '^PASHIZ_DOMAIN=' .env 2>/dev/null | head -1 | cut -d= -f2- || true)

  if [ -n "$domain" ]; then
    COMPOSE_FILES+=(-f docker-compose.https.yml)
  fi
}

# ---------------------------------------------------------------- output ----

bold()  { printf '\033[1m%s\033[0m\n' "$*"; }
step()  { printf '\n\033[1;34m==>\033[0m \033[1m%s\033[0m\n' "$*"; }
info()  { printf '    %s\n' "$*"; }
warn()  { printf '\033[1;33m    ! %s\033[0m\n' "$*"; }
die()   { printf '\033[1;31m\nخطا: %s\033[0m\n' "$*" >&2; exit 1; }

banner() {
cat <<'EOF'

  ┌────────────────────────────────────────────┐
  │            سامانه مالی پشیز                │
  │   Persian accounting — self-hosted setup   │
  └────────────────────────────────────────────┘
EOF
}

# ------------------------------------------------------------ preflight ----

require_root() {
  [ "$(id -u)" -eq 0 ] || die "این اسکریپت را با sudo اجرا کنید:  sudo ./setup.sh"
}

check_os() {
  [ -f /etc/os-release ] || die "توزیع شناسایی نشد؛ این اسکریپت برای اوبونتو نوشته شده است."
  # shellcheck disable=SC1091
  . /etc/os-release

  case "${ID:-}${ID_LIKE:-}" in
    *ubuntu*|*debian*) ;;
    *) warn "این اسکریپت روی اوبونتو آزموده شده؛ روی ${PRETTY_NAME:-این توزیع} ممکن است کار نکند." ;;
  esac
}

check_resources() {
  local mem_mb disk_gb
  mem_mb=$(( $(grep MemTotal /proc/meminfo | awk '{print $2}') / 1024 ))
  disk_gb=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')

  info "حافظه: ${mem_mb}MB    فضای دیسک: ${disk_gb}GB"

  if [ "$mem_mb" -lt 3500 ]; then
    warn "ساخت رابط کاربری به حدود ۴ گیگابایت حافظه نیاز دارد."
    if [ ! -f /swapfile ]; then
      step "ساخت فایل swap دو گیگابایتی"
      fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null
      swapon /swapfile
      grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
      info "swap فعال شد."
    fi
  fi
  [ "$disk_gb" -ge 10 ] || warn "کمتر از ۱۰ گیگابایت فضای آزاد است؛ ساخت ایمیج‌ها ممکن است شکست بخورد."
}

# -------------------------------------------------------------- install ----

install_packages() {
  step "نصب پیش‌نیازها"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl git openssl >/dev/null
  info "ca-certificates, curl, git, openssl"
}

install_docker() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    info "داکر از قبل نصب است: $(docker --version | cut -d, -f1)"
    return
  fi
  step "نصب داکر"

  install -m 0755 -d /etc/apt/keyrings
  local codename
  # shellcheck disable=SC1091
  . /etc/os-release
  codename="${UBUNTU_CODENAME:-${VERSION_CODENAME:-jammy}}"

  curl -fsSL "https://download.docker.com/linux/ubuntu/gpg" -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc

  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${codename} stable" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin >/dev/null

  systemctl enable --now docker >/dev/null 2>&1 || true
  info "نصب شد: $(docker --version | cut -d, -f1)"
}

configure_registry_mirror() {
  [ -n "${DOCKER_REGISTRY_MIRROR:-}" ] || return 0

  step "تنظیم آینهٔ رجیستری"
  mkdir -p /etc/docker

  if [ -f /etc/docker/daemon.json ] && grep -q registry-mirrors /etc/docker/daemon.json; then
    info "آینه از قبل تنظیم شده است."
    return
  fi
  if [ -f /etc/docker/daemon.json ]; then
    cp /etc/docker/daemon.json "/etc/docker/daemon.json.bak.$(date +%s)"
    warn "پروندهٔ daemon.json موجود پشتیبان‌گیری و بازنویسی شد."
  fi
  printf '{\n  "registry-mirrors": ["%s"]\n}\n' "$DOCKER_REGISTRY_MIRROR" > /etc/docker/daemon.json

  systemctl restart docker
  sleep 3
  info "آینه: $DOCKER_REGISTRY_MIRROR"
}

# The base images all come from Docker Hub. Where it is unreachable the build
# fails several minutes in with a TLS timeout, so it is checked up front.
check_registry_reachable() {
  step "بررسی دسترسی به رجیستری داکر"

  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 \
    "${DOCKER_REGISTRY_MIRROR:-https://registry-1.docker.io}/v2/" 2>/dev/null || echo 000)

  if [ "$code" != "000" ]; then
    info "در دسترس است (HTTP $code)."
    return
  fi

  warn "رجیستری داکر در دسترس نیست."
  cat <<'EOF'

    ساخت ایمیج‌ها بدون دسترسی به رجیستری ممکن نیست. دو راه دارید:

      ۱) یک آینهٔ رجیستری بدهید و دوباره اجرا کنید:

           sudo DOCKER_REGISTRY_MIRROR=https://docker.arvancloud.ir ./setup.sh

         (نمونه‌های دیگر: https://docker.iranserver.com ، https://registry.docker.ir
          هر ارائه‌دهنده‌ای که در دسترس‌تان است.)

      ۲) یا از یک شبکهٔ دارای دسترسی، ایمیج‌ها را بسازید و با
         docker save / docker load به این سرور منتقل کنید.

EOF
  die "بدون دسترسی به رجیستری ادامه ممکن نیست."
}

fetch_source() {
  if [ -d "$PASHIZ_DIR/.git" ]; then
    step "به‌روزرسانی منبع در $PASHIZ_DIR"
    git -C "$PASHIZ_DIR" fetch --depth=1 origin "$PASHIZ_BRANCH"
    git -C "$PASHIZ_DIR" checkout -q "$PASHIZ_BRANCH"
    git -C "$PASHIZ_DIR" reset --hard "origin/$PASHIZ_BRANCH"
  elif [ -f "$PWD/docker-compose.pashiz.yml" ]; then
    # Already running from inside a clone.
    PASHIZ_DIR="$PWD"
    step "استفاده از منبع موجود در $PASHIZ_DIR"
  else
    step "دریافت منبع در $PASHIZ_DIR"
    mkdir -p "$(dirname "$PASHIZ_DIR")"
    git clone --branch "$PASHIZ_BRANCH" --depth=1 "$PASHIZ_REPO" "$PASHIZ_DIR"
  fi
  cd "$PASHIZ_DIR"
  info "نسخه: $(git rev-parse --short HEAD)"
}

# ------------------------------------------------------------------ env ----

# Replaces KEY=... in .env, appending the key when it is not present.
#
# The generated secrets contain characters that are special to sed's
# replacement (`&`, `/`, backslashes), so the value travels through the
# environment and is written literally rather than interpolated.
set_env() {
  local key="$1" value="$2"

  if grep -qE "^${key}=" .env; then
    KEY="$key" VALUE="$value" awk '
      BEGIN { prefix = ENVIRON["KEY"] "="; value = ENVIRON["VALUE"] }
      index($0, prefix) == 1 { print prefix value; next }
      { print }
    ' .env > .env.tmp && mv .env.tmp .env
  else
    printf '%s=%s\n' "$key" "$value" >> .env
  fi
}

# `|| true` keeps a missing key from tripping `set -e` under `pipefail`.
get_env() { grep -E "^$1=" .env 2>/dev/null | head -1 | cut -d= -f2- || true; }

detect_base_url() {
  local ip
  ip=$(hostname -I 2>/dev/null | awk '{print $1}')
  [ -n "$ip" ] || ip="localhost"
  if [ "$PUBLIC_PROXY_PORT" = "80" ]; then
    echo "http://${ip}"
  else
    echo "http://${ip}:${PUBLIC_PROXY_PORT}"
  fi
}

# Asked before .env is written, since the answer decides BASE_URL, which port
# Envoy publishes on, and whether Caddy joins the stack.
ask_for_domain() {
  # Already installed, or answered through the environment.
  [ -f .env ] && return 0
  [ -n "${PASHIZ_DOMAIN:-}" ] && return 0

  if [ ! -t 0 ]; then
    # Piped from curl with no terminal to ask on.
    info "بدون دامنه روی HTTP نصب می‌شود. برای HTTPS متغیر PASHIZ_DOMAIN را بدهید."
    PASHIZ_DOMAIN=""
    return 0
  fi

  step "دامنه و HTTPS"
  cat <<'EOF'
    اگر دامنه‌ای دارید که به IP این سرور اشاره می‌کند، آن را وارد کنید تا
    گواهی Let's Encrypt خودکار گرفته و تمدید شود.

    شرط‌ها: رکورد DNS به این سرور اشاره کند و پورت‌های ۸۰ و ۴۴۳ از
    اینترنت باز باشند.

    خالی بگذارید تا روی HTTP نصب شود (فقط برای شبکهٔ داخلی مناسب است).

EOF
  read -rp "    دامنه [خالی = بدون HTTPS]: " PASHIZ_DOMAIN
  PASHIZ_DOMAIN=$(echo "${PASHIZ_DOMAIN:-}" | tr -d '[:space:]' | sed -E 's#^https?://##; s#/.*$##')

  if [ -n "$PASHIZ_DOMAIN" ]; then
    check_dns_points_here "$PASHIZ_DOMAIN"
  fi
}

# A certificate cannot be issued if the domain does not resolve here, and the
# failure surfaces minutes later inside Caddy's log. Better to say so now.
check_dns_points_here() {
  local domain="$1" resolved public
  resolved=$(getent hosts "$domain" 2>/dev/null | awk '{print $1}' | head -1)
  public=$(curl -fsS --max-time 10 https://api.ipify.org 2>/dev/null || echo "")

  if [ -z "$resolved" ]; then
    warn "دامنهٔ $domain به هیچ نشانی‌ای resolve نمی‌شود."
    warn "گواهی گرفته نخواهد شد تا وقتی رکورد DNS ساخته شود."
  elif [ -n "$public" ] && [ "$resolved" != "$public" ]; then
    warn "دامنه به $resolved اشاره می‌کند ولی نشانی این سرور $public است."
    warn "تا وقتی این دو یکی نشوند، گواهی گرفته نمی‌شود."
  else
    info "DNS درست است: $domain → ${resolved}"
  fi
}

create_env() {
  if [ -f .env ]; then
    step "پروندهٔ .env موجود است و دست‌نخورده می‌ماند"
    return
  fi
  step "ساخت .env با رمزهای تازه"
  cp .env.example .env

  local db_password db_root_password jwt_secret app_jwt_secret
  db_password=$(openssl rand -hex 24)
  db_root_password=$(openssl rand -hex 24)
  jwt_secret=$(openssl rand -hex 32)
  app_jwt_secret=$(openssl rand -hex 32)

  set_env DB_PASSWORD "$db_password"
  set_env DB_ROOT_PASSWORD "$db_root_password"
  set_env JWT_SECRET "$jwt_secret"
  set_env APP_JWT_SECRET "$app_jwt_secret"

  # Garage (S3 for attachments) needs its own secrets before it will start.
  set_env GARAGE_RPC_SECRET "$(openssl rand -hex 32)"
  set_env GARAGE_ADMIN_TOKEN "$(openssl rand -hex 32)"

  if [ -n "${PASHIZ_DOMAIN:-}" ]; then
    set_env PASHIZ_DOMAIN "$PASHIZ_DOMAIN"
    set_env BASE_URL "${BASE_URL:-https://$PASHIZ_DOMAIN}"

    # Caddy takes 80 and 443. Envoy keeps its published ports on loopback so
    # the application cannot be reached over plain HTTP from outside.
    set_env PUBLIC_PROXY_PORT "127.0.0.1:8080"
    set_env PUBLIC_PROXY_SSL_PORT "127.0.0.1:8443"
  else
    set_env PASHIZ_DOMAIN ""
    set_env PUBLIC_PROXY_PORT "$PUBLIC_PROXY_PORT"
    set_env BASE_URL "${BASE_URL:-$(detect_base_url)}"
  fi

  # Gotenberg reaches the API by its service name on the compose network.
  set_env GOTENBERG_URL "http://gotenberg:3000"
  set_env GOTENBERG_DOCS_URL "http://server:3000/public/"

  chmod 600 .env
  info "رمزهای پایگاه‌داده، JWT و Garage ساخته شد."
  info "نشانی: $(get_env BASE_URL)"
}

# -------------------------------------------------------------- compose ----

dc() { docker compose "${COMPOSE_FILES[@]}" --env-file .env "$@"; }

build_images() {
  step "ساخت ایمیج‌ها (چند دقیقه طول می‌کشد)"
  dc build --pull server webapp
  info "ایمیج‌های پشیز ساخته شد."
}

# Prepares the object store the application keeps attachments and logos in.
#
# The Garage image ships the `garage` binary and nothing else — no shell — so
# the setup script mounted into it by upstream cannot run there. The same
# steps are driven from here instead, against the v1.3.1 CLI, whose `key
# create` and `bucket allow` take their subject as a positional argument.
bootstrap_garage() {
  step "آماده‌سازی فضای ذخیره‌سازی پیوست‌ها"

  if [ -n "$(get_env S3_ACCESS_KEY_ID)" ]; then
    info "کلید S3 از قبل در .env هست؛ رد شد."
    return 0
  fi
  dc up -d garage >/dev/null 2>&1

  # `garage` writes its progress to stderr; only the payload is wanted here.
  garage_cli() {
    dc exec -T garage /garage "$@" 2>/dev/null
  }

  printf '    در انتظار Garage'
  local ready=""
  for _ in $(seq 1 30); do
    if garage_cli status >/dev/null 2>&1; then ready=1; break; fi
    printf '.'; sleep 2
  done
  printf '\n'

  if [ -z "$ready" ]; then
    warn "Garage بالا نیامد؛ بارگذاری پیوست‌ها کار نخواهد کرد."
    return 0
  fi

  # A node with no role assigned cannot store anything, so give it the whole
  # local disk allowance before creating the bucket.
  if ! garage_cli status | grep -q "dc1"; then
    local node
    node=$(garage_cli node id | head -1 | tr -d '\r' | cut -d@ -f1)

    garage_cli layout assign "$node" -z "${GARAGE_LOCAL_ZONE:-dc1}" \
      -c "${GARAGE_CAPACITY:-10G}" >/dev/null 2>&1 || true
    garage_cli layout apply --version 1 >/dev/null 2>&1 || true
    sleep 3
  fi

  local bucket key secret
  bucket=$(get_env S3_BUCKET); bucket="${bucket:-bigcapital}"

  garage_cli bucket create "$bucket" >/dev/null 2>&1 || true

  # Re-running must not mint a second key, so an existing one is read back.
  if garage_cli key list | grep -q "bigcapital"; then
    info "کلید S3 از قبل در Garage هست؛ خوانده شد."
  else
    garage_cli key create bigcapital >/dev/null 2>&1 || true
  fi
  local info_out
  info_out=$(garage_cli key info bigcapital --show-secret 2>/dev/null || true)
  key=$(echo "$info_out"    | awk '/^Key ID:/{print $3}'     | head -1 | tr -d '\r')
  secret=$(echo "$info_out" | awk '/^Secret key:/{print $3}' | head -1 | tr -d '\r')

  garage_cli bucket allow --read --write --owner --key bigcapital "$bucket" \
    >/dev/null 2>&1 || true

  if [ -n "$key" ] && [ -n "$secret" ]; then
    set_env S3_ACCESS_KEY_ID "$key"
    set_env S3_SECRET_ACCESS_KEY "$secret"
    info "کلید S3 ساخته و در .env ذخیره شد."
  else
    warn "کلید S3 خوانده نشد؛ بارگذاری پیوست‌ها کار نخواهد کرد."
    warn "دستی بررسی کنید:  docker compose exec garage /garage key info bigcapital --show-secret"
  fi
}

start_services() {
  step "راه‌اندازی سرویس‌ها"
  dc up -d

  printf '    در انتظار مهاجرت پایگاه‌داده'
  local migration_status=""
  for _ in $(seq 1 150); do
    migration_status=$(docker inspect -f '{{.State.Status}}' pashiz-database-migration 2>/dev/null || echo missing)
    [ "$migration_status" = "running" ] || break
    printf '.'; sleep 2
  done
  printf '\n'

  local exit_code
  exit_code=$(docker inspect -f '{{.State.ExitCode}}' pashiz-database-migration 2>/dev/null || echo 1)
  if [ "$exit_code" != "0" ]; then
    dc logs --tail 40 database_migration
    die "مهاجرت پایگاه‌داده شکست خورد. گزارش بالا را ببینید."
  fi
  info "مهاجرت پایگاه‌داده انجام شد ✅"

  printf '    در انتظار سرور'
  for _ in $(seq 1 90); do
    if docker logs pashiz-server 2>&1 | grep -qi "listening on port\|Nest application successfully started"; then
      break
    fi
    printf '.'; sleep 2
  done
  printf '\n'
  info "سرور بالا آمد ✅"
}

finish() {
  local url
  url=$(get_env BASE_URL)

  cat <<EOF

$(bold "نصب کامل شد.")

    نشانی        : ${url}
    پوشهٔ نصب     : ${PASHIZ_DIR}
    تنظیمات      : ${PASHIZ_DIR}/.env

    گزارش‌ها      : cd ${PASHIZ_DIR} && ./update.sh logs
    توقف         : cd ${PASHIZ_DIR} && ./update.sh stop
    به‌روزرسانی   : cd ${PASHIZ_DIR} && sudo ./update.sh

$(bold "گام بعدی")

    نشانی بالا را در مرورگر باز کنید و نخستین سازمان را بسازید.
    هنگام ساخت سازمان، زبان «فارسی» را انتخاب کنید تا تقویم شمسی،
    نمودار حساب‌ها و داده‌های اولیه فارسی ساخته شوند.

    اگر روی دامنه سرویس می‌دهید، BASE_URL را در .env اصلاح کنید و
    سپس  sudo ./update.sh restart  را بزنید.

EOF
}

main() {
  banner
  require_root
  check_os
  check_resources
  install_packages
  install_docker
  configure_registry_mirror
  check_registry_reachable
  fetch_source
  ask_for_domain
  create_env
  add_https_overlay_if_configured
  build_images
  bootstrap_garage
  start_services
  finish
}

main "$@"
