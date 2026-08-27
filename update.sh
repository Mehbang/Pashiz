#!/usr/bin/env bash
#
# Pashiz — update and day-to-day operation.
#
#   sudo ./update.sh            pull, rebuild, migrate, restart
#   ./update.sh status          what is running
#   ./update.sh logs [service]  follow the logs
#   ./update.sh start|stop|restart
#   ./update.sh backup          dump the databases and .env
#   ./update.sh rollback        return to the version before the last update
#
# An update never touches .env and never deletes a volume, so the data and
# the configuration survive it. The commit the update started from is
# recorded, which is what `rollback` returns to.

set -euo pipefail

cd "$(dirname "$(readlink -f "$0")")"

PASHIZ_BRANCH="${PASHIZ_BRANCH:-pashiz}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
PREVIOUS_REF_FILE=".pashiz-previous-version"

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

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
step() { printf '\n\033[1;34m==>\033[0m \033[1m%s\033[0m\n' "$*"; }
info() { printf '    %s\n' "$*"; }
warn() { printf '\033[1;33m    ! %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m\nخطا: %s\033[0m\n' "$*" >&2; exit 1; }

add_https_overlay_if_configured

dc() { docker compose "${COMPOSE_FILES[@]}" --env-file .env "$@"; }

# One temporary directory per run, removed however the script ends.
#
# Not `trap ... RETURN` inside the function that needs it: bash leaves such a
# trap installed after that function returns, so it fires again when the next
# function returns — by which point the `local` directory it names is gone and
# `set -u` takes the whole script down with "work: unbound variable".
TMP_WORK=""

cleanup_tmp_work() {
  if [ -n "$TMP_WORK" ]; then
    rm -rf "$TMP_WORK"
    TMP_WORK=""
  fi
}
trap cleanup_tmp_work EXIT

make_tmp_work() {
  cleanup_tmp_work
  TMP_WORK=$(mktemp -d)
}

# Building the webapp is the heaviest thing this software ever does: Vite and
# rollup hold the whole application in memory at once. On a small server the
# kernel kills the builder part-way through, and Docker reports only
# `failed to execute bake: signal: killed`.
#
# The bar here is deliberately well above what the build needs at rest. A
# 3.8GB machine looks comfortable and is not — with no swap it dies every
# time.
ensure_swap() {
  local mem_mb swap_mb disk_gb
  mem_mb=$(( $(grep MemTotal /proc/meminfo | awk '{print $2}') / 1024 ))
  swap_mb=$(( $(grep SwapTotal /proc/meminfo | awk '{print $2}') / 1024 ))

  [ $(( mem_mb + swap_mb )) -lt 8000 ] || return 0

  if [ "$swap_mb" -gt 0 ]; then
    info "حافظه کم است، ولی swap فعال است (${swap_mb}MB)."
    return 0
  fi

  if [ -f /swapfile ]; then
    swapon /swapfile && info "فایل swap موجود فعال شد."
    return 0
  fi

  disk_gb=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')
  if [ "${disk_gb:-0}" -lt 10 ]; then
    warn "حافظه برای ساخت ایمیج کم است و برای فایل swap هم فضای دیسک نیست."
    return 0
  fi

  step "ساخت فایل swap چهار گیگابایتی"
  # fallocate is instant but is not supported on every filesystem.
  fallocate -l 4G /swapfile 2>/dev/null ||
    dd if=/dev/zero of=/swapfile bs=1M count=4096 status=none
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  info "swap فعال شد و پس از راه‌اندازی دوبارهٔ سرور هم فعال می‌ماند."
}

build_failed() {
  warn "ساخت ایمیج «$1» به پایان نرسید."
  warn "اگر پیام «signal: killed» دیدید، حافظهٔ سرور در میانهٔ ساخت تمام شده است."
  warn "با «free -h» ببینید swap فعال است؛ سپس «./update.sh rebuild» را بزنید."
  die "ساخت ایمیج‌ها ناتمام ماند."
}

# One service per invocation, deliberately. `docker compose build server
# webapp` hands both to buildx bake, which builds them concurrently — two
# pnpm installs and two bundlers at once, which a small server does not
# survive.
build_images() {
  step "ساخت ایمیج‌ها (چند دقیقه طول می‌کشد)"
  ensure_swap

  local service
  for service in server webapp; do
    info "ساخت $service …"
    dc build "$@" "$service" || build_failed "$service"
  done
  info "ایمیج‌های پشیز ساخته شد."
}

# `|| true` keeps a missing key from tripping `set -e` under `pipefail`.
get_env() { grep -E "^$1=" .env 2>/dev/null | head -1 | cut -d= -f2- || true; }

# Values can contain characters special to sed, so they travel through the
# environment and are written literally.
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

require_root() {
  [ "$(id -u)" -eq 0 ] || die "این کار را با sudo اجرا کنید:  sudo ./update.sh $*"
}

require_env() {
  [ -f .env ] || die "پروندهٔ .env پیدا نشد. آیا setup.sh اجرا شده است؟"
}

# ------------------------------------------------------------- commands ----

# The Garage volume, declared with an explicit name in the prod compose file.
GARAGE_VOLUME="bigcapital_prod_garage"

# Secrets that bind the database rows and the object store together. A restored
# copy needs these, because the S3 key and the Garage node identity live inside
# the volume and are referenced from .env. Everything else in .env — the domain,
# the database password — belongs to the machine, not to the data.
#
# The JWT secrets are deliberately absent. Carrying them would let sessions
# survive a migration, which is worth very little, at the cost of copying a
# signing key from wherever the archive was made — and a development .env
# usually still holds the published default from .env.example. Restoring one of
# those onto a public server would hand anyone the ability to mint tokens for
# it. Users signing in again is the cheaper outcome.
BINDING_KEYS="GARAGE_RPC_SECRET GARAGE_ADMIN_TOKEN S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY S3_BUCKET S3_REGION"

# Everything needed to reproduce this installation somewhere else: the
# organizations' data, the files attached to it, and the secrets that tie the
# two together.
cmd_backup() {
  require_env
  step "پشتیبان‌گیری"
  mkdir -p "$BACKUP_DIR"

  local stamp work archive
  stamp=$(date +%Y%m%d-%H%M%S)
  archive="$(cd "$BACKUP_DIR" && pwd)/pashiz-$stamp.tar.gz"
  make_tmp_work
  work="$TMP_WORK"

  # The application databases only. `--all-databases` would also carry the
  # server's MySQL grants, and restoring those onto another machine replaces
  # its accounts, leaving that machine's own .env password no longer valid.
  local databases
  databases=$(docker exec pashiz-mysql sh -c \
    "exec mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" -N -e \
     \"SHOW DATABASES LIKE 'bigcapital%'\"" 2>/dev/null | tr -d '\r' | tr '\n' ' ')

  [ -n "$databases" ] || die "هیچ پایگاه‌دادهٔ پشیز پیدا نشد."
  info "پایگاه‌داده‌ها: $(echo "$databases" | wc -w | tr -d ' ') مورد"

  docker exec pashiz-mysql sh -c \
    "exec mysqldump -uroot -p\"\$MYSQL_ROOT_PASSWORD\" --databases $databases \
     --single-transaction --quick --routines --events" \
    2>/dev/null | gzip > "$work/databases.sql.gz" \
    || die "پشتیبان‌گیری از پایگاه‌داده ناموفق بود."

  # Attachments and the company logo live in the object store, not in MySQL.
  # Garage is paused so the volume is captured at rest.
  info "فایل‌های پیوست..."
  dc stop garage >/dev/null 2>&1 || true
  docker run --rm -v "${GARAGE_VOLUME}:/data:ro" -v "$work:/out" alpine \
    tar czf /out/garage.tar.gz -C /data . >/dev/null 2>&1 \
    || warn "پشتیبان‌گیری از فضای ذخیره‌سازی ناموفق بود."
  dc start garage >/dev/null 2>&1 || true

  # Only the binding secrets, never the whole .env.
  : > "$work/secrets.env"
  chmod 600 "$work/secrets.env"
  local key value
  for key in $BINDING_KEYS; do
    value=$(get_env "$key")
    [ -n "$value" ] && printf '%s=%s\n' "$key" "$value" >> "$work/secrets.env"
  done

  printf 'pashiz-backup 1\ncreated=%s\ncommit=%s\ndatabases=%s\n' \
    "$(date -Iseconds)" "$(git rev-parse --short HEAD 2>/dev/null || echo unknown)" \
    "$databases" > "$work/MANIFEST"

  tar czf "$archive" -C "$work" MANIFEST databases.sql.gz garage.tar.gz secrets.env 2>/dev/null \
    || tar czf "$archive" -C "$work" MANIFEST databases.sql.gz secrets.env
  chmod 600 "$archive"

  info "بایگانی: $archive  ($(du -h "$archive" | cut -f1))"
  info "شامل پایگاه‌داده‌ها، پیوست‌ها و کلیدهای پیوند‌دهنده است."

  # An update calls this and then builds for several minutes; the dump and the
  # storage tarball should not sit on the disk for all of it.
  cleanup_tmp_work
}

# Brings a backup up on this installation. Intended for a machine that has
# already been through setup.sh, whose own .env therefore holds this machine's
# domain and database password; only the binding secrets are taken from the
# archive.
cmd_restore() {
  require_root
  require_env

  local archive="${1:-}"
  [ -n "$archive" ] || die "بایگانی را بدهید:  sudo ./update.sh restore backups/pashiz-….tar.gz"
  [ -f "$archive" ] || die "پروندهٔ $archive پیدا نشد."
  archive=$(cd "$(dirname "$archive")" && pwd)/$(basename "$archive")

  local work
  make_tmp_work
  work="$TMP_WORK"
  tar xzf "$archive" -C "$work" || die "بایگانی خوانده نشد."
  [ -f "$work/databases.sql.gz" ] || die "این بایگانی پشتیبان پشیز نیست."

  step "بازیابی از $(basename "$archive")"
  sed 's/^/    /' "$work/MANIFEST" 2>/dev/null || true
  echo
  warn "داده‌های کنونی این نصب کاملاً جایگزین می‌شوند."
  read -rp "    ادامه می‌دهید؟ [y/N] " answer
  [[ "$answer" =~ ^[Yy]$ ]] || { info "لغو شد."; return 0; }

  # A safety copy of what is about to be replaced.
  cmd_backup

  step "بازیابی پایگاه‌داده"
  dc stop server webapp >/dev/null 2>&1 || true
  gunzip -c "$work/databases.sql.gz" | docker exec -i pashiz-mysql sh -c \
    "exec mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\"" \
    || die "بازیابی پایگاه‌داده ناموفق بود."
  info "پایگاه‌داده بازیابی شد."

  if [ -f "$work/garage.tar.gz" ]; then
    step "بازیابی فایل‌های پیوست"
    dc stop garage >/dev/null 2>&1 || true
    docker run --rm -v "${GARAGE_VOLUME}:/data" -v "$work:/in" alpine sh -c \
      'rm -rf /data/* /data/..?* 2>/dev/null; tar xzf /in/garage.tar.gz -C /data' \
      >/dev/null 2>&1 || warn "بازیابی فضای ذخیره‌سازی ناموفق بود."
    info "پیوست‌ها بازیابی شدند."
  fi

  # The object store only answers to the keys it was created with, so those
  # travel with the data rather than being regenerated here.
  step "به‌کارگیری کلیدهای پیوند‌دهنده"
  local line key value
  while IFS= read -r line; do
    key="${line%%=*}"; value="${line#*=}"
    [ -n "$key" ] && set_env "$key" "$value"
  done < "$work/secrets.env"
  info "$(wc -l < "$work/secrets.env" | tr -d " ") کلید به .env نوشته شد."

  step "راه‌اندازی دوباره"
  dc up -d --force-recreate >/dev/null 2>&1
  wait_for_migration
  info "بازیابی انجام شد ✅  نشانی: $(get_env BASE_URL)"
  cleanup_tmp_work
}

cmd_update() {
  require_root
  require_env

  local current
  current=$(git rev-parse HEAD)

  step "دریافت نسخهٔ تازه"
  git fetch origin "$PASHIZ_BRANCH"
  local target
  target=$(git rev-parse "origin/$PASHIZ_BRANCH")

  if [ "$current" = "$target" ]; then
    info "همین حالا روی آخرین نسخه هستید ($(git rev-parse --short HEAD))."
    info "برای ساخت دوبارهٔ ایمیج‌ها:  sudo ./update.sh rebuild"
    return
  fi
  info "از $(git rev-parse --short "$current")  به  $(git rev-parse --short "$target")"
  git --no-pager log --oneline "$current..$target" | head -20 | sed 's/^/      /'

  cmd_backup

  echo "$current" > "$PREVIOUS_REF_FILE"

  step "به‌کارگیری نسخهٔ تازه"
  git checkout -q "$PASHIZ_BRANCH"
  git reset --hard "$target"

  # A newer .env.example may introduce settings the running .env lacks.
  report_new_env_keys

  # This script has just replaced itself on disk, but bash is executing the
  # version it parsed at startup. Anything the update changed *in here* takes
  # effect on the next run, not this one — worth knowing when a fix seems not
  # to have applied.
  if ! git diff --quiet "$current" "$target" -- update.sh; then
    warn "خودِ update.sh در این نسخه تغییر کرده است."
    warn "تغییرهای آن از اجرای بعدی اثر می‌کنند."
  fi

  cmd_rebuild
}

# The server container runs as uid 1001 and writes the portal's backups into
# this directory. It has to exist and be owned by that uid before the container
# starts, or the first backup fails with a permission error.
ensure_backup_dir() {
  mkdir -p backups/portal
  chown -R 1001:1001 backups/portal 2>/dev/null || true
  chmod 700 backups/portal 2>/dev/null || true
}

cmd_rebuild() {
  require_root
  require_env

  build_images
  ensure_backup_dir

  step "راه‌اندازی دوباره"
  dc up -d

  wait_for_migration
  info "به‌روزرسانی انجام شد ✅  نسخه: $(git rev-parse --short HEAD)"
  info "نشانی: $(get_env BASE_URL)"
}

# A setting added upstream is only a problem when it has no default in the
# code, so these are reported rather than merged in silently.
report_new_env_keys() {
  local missing=()
  while IFS= read -r key; do
    grep -qE "^${key}=" .env || missing+=("$key")
  done < <(grep -oE '^[A-Z0-9_]+=' .env.example | tr -d '=')

  if [ ${#missing[@]} -gt 0 ]; then
    warn "این تنظیمات در .env.example تازه‌اند و در .env شما نیستند:"
    printf '      %s\n' "${missing[@]}"
    warn "اگر لازم بودند، دستی به .env بیفزایید."
  fi
}

# Sets or rotates the administration portal's credentials.
#
# Also the way to recover a portal whose password was lost: there is no reset
# link and no account to email, by design — the only way in is from a shell on
# the server, which is the same level of access the portal itself grants.
cmd_admin() {
  require_root
  require_env

  step "اعتبارنامهٔ صفحهٔ مدیریت"

  local username password again
  read -rp "    نام کاربری [$(get_env PASHIZ_ADMIN_USERNAME || echo admin)]: " username
  username=${username:-$(get_env PASHIZ_ADMIN_USERNAME)}
  username=${username:-admin}

  while :; do
    read -rsp "    گذرواژهٔ تازه (دست‌کم ۱۲ نویسه): " password; echo
    if [ ${#password} -lt 12 ]; then
      warn "کوتاه است. این صفحه به همهٔ داده‌های نصب دسترسی دارد."
      continue
    fi
    read -rsp "    دوباره: " again; echo
    [ "$password" = "$again" ] && break
    warn "دو گذرواژه یکی نبودند."
  done
  unset again

  local hash
  hash=$(printf '%s' "$password" | docker run --rm -i \
    pashiz/server:latest node packages/server/scripts/hash-admin-password.js) \
    || die "درهم‌سازی گذرواژه ناموفق بود. آیا ایمیج ساخته شده است؟"
  unset password

  set_env PASHIZ_ADMIN_USERNAME "$username"
  set_env PASHIZ_ADMIN_PASSWORD_HASH "$hash"

  # The address survives a password change — losing it would mean hunting
  # through .env for no reason.
  [ -n "$(get_env PASHIZ_ADMIN_PATH)" ] || set_env PASHIZ_ADMIN_PATH "$(openssl rand -hex 32)"

  # The signing key does not. Sessions are signed with it and nothing else, so
  # replacing it is what actually ends every open session — which is the whole
  # point of changing a password you think someone else has.
  set_env PASHIZ_ADMIN_SECRET "$(openssl rand -hex 32)"

  chmod 600 .env

  step "راه‌اندازی دوباره سرور"
  dc up -d server >/dev/null 2>&1

  # Writing .env is not enough: the compose file names every variable the
  # container receives, so a key that is not listed there never arrives and the
  # portal answers 404 as though it had never been set up. Check rather than
  # assume.
  local seen
  seen=$(docker exec pashiz-server sh -c 'echo "$PASHIZ_ADMIN_PASSWORD_HASH"' 2>/dev/null || true)
  if [ -z "$seen" ]; then
    warn "اعتبارنامه در .env نوشته شد ولی به کانتینر نرسید."
    warn "«sudo ./update.sh rebuild» را بزنید و دوباره امتحان کنید."
    return 1
  fi

  info "انجام شد. نشانی صفحهٔ مدیریت:"
  info "  $(get_env BASE_URL)/api/admin/$(get_env PASHIZ_ADMIN_PATH)"
  warn "همهٔ نشست‌های باز صفحهٔ مدیریت بسته شدند."
}

# Prints the portal address for an operator who has mislaid it.
cmd_admin_url() {
  require_env
  local path
  path=$(get_env PASHIZ_ADMIN_PATH)

  [ -n "$path" ] || die "صفحهٔ مدیریت ساخته نشده است. «sudo ./update.sh admin» را بزنید."
  info "$(get_env BASE_URL)/api/admin/${path}"
}

cmd_rollback() {
  require_root
  require_env
  [ -f "$PREVIOUS_REF_FILE" ] || die "نسخهٔ پیشینی ثبت نشده است."

  local previous
  previous=$(cat "$PREVIOUS_REF_FILE")

  step "بازگشت به $(git rev-parse --short "$previous")"
  warn "مهاجرت‌های پایگاه‌داده برگردانده نمی‌شوند."
  warn "اگر به‌روزرسانی ساختار پایگاه‌داده را تغییر داده بود، از پشتیبان بازیابی کنید."
  read -rp "    ادامه می‌دهید؟ [y/N] " answer
  [[ "$answer" =~ ^[Yy]$ ]] || { info "لغو شد."; return; }

  git reset --hard "$previous"
  cmd_rebuild
}

wait_for_migration() {
  printf '    در انتظار مهاجرت پایگاه‌داده'
  for _ in $(seq 1 150); do
    local status
    status=$(docker inspect -f '{{.State.Status}}' pashiz-database-migration 2>/dev/null || echo missing)
    [ "$status" = "running" ] || break
    printf '.'; sleep 2
  done
  printf '\n'

  local exit_code
  exit_code=$(docker inspect -f '{{.State.ExitCode}}' pashiz-database-migration 2>/dev/null || echo 1)
  if [ "$exit_code" != "0" ]; then
    dc logs --tail 40 database_migration
    die "مهاجرت پایگاه‌داده شکست خورد."
  fi
  info "مهاجرت پایگاه‌داده انجام شد ✅"
}


# Turns HTTPS on (or off) after the fact, for a server installed on plain HTTP
# that has since been given a domain.
cmd_https() {
  require_root
  require_env

  local domain="${1:-}"

  if [ "$domain" = "off" ]; then
    step "خاموش‌کردن HTTPS"
    set_env PASHIZ_DOMAIN ""
    set_env PUBLIC_PROXY_PORT "80"
    set_env PUBLIC_PROXY_SSL_PORT "443"

    local ip
    ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    set_env BASE_URL "http://${ip:-localhost}"

    # Caddy is stopped through the overlay it was started with, before the
    # file set is recomputed without it.
    docker compose -f docker-compose.prod.yml -f docker-compose.pashiz.yml \
      -f docker-compose.https.yml --env-file .env rm -sf caddy >/dev/null 2>&1 || true

    COMPOSE_FILES=(-f docker-compose.prod.yml -f docker-compose.pashiz.yml)
    dc up -d
    info "روی HTTP: $(get_env BASE_URL)"
    return
  fi

  if [ -z "$domain" ]; then
    die "دامنه را بدهید:  sudo ./update.sh https hesab.example.ir"
  fi
  domain=$(echo "$domain" | tr -d '[:space:]' | sed -E 's#^https?://##; s#/.*$##')

  step "روشن‌کردن HTTPS برای $domain"

  local resolved public
  resolved=$(getent hosts "$domain" 2>/dev/null | awk '{print $1}' | head -1)
  public=$(curl -fsS --max-time 10 https://api.ipify.org 2>/dev/null || echo "")

  if [ -z "$resolved" ]; then
    warn "دامنه به هیچ نشانی‌ای resolve نمی‌شود؛ گواهی گرفته نخواهد شد."
  elif [ -n "$public" ] && [ "$resolved" != "$public" ]; then
    warn "دامنه به $resolved اشاره می‌کند ولی این سرور $public است."
  else
    info "DNS درست است: $domain → $resolved"
  fi

  set_env PASHIZ_DOMAIN "$domain"
  set_env BASE_URL "https://$domain"
  set_env PUBLIC_PROXY_PORT "127.0.0.1:8080"
  set_env PUBLIC_PROXY_SSL_PORT "127.0.0.1:8443"

  COMPOSE_FILES=(-f docker-compose.prod.yml -f docker-compose.pashiz.yml -f docker-compose.https.yml)

  # The proxy has to be recreated so its published ports move to loopback.
  dc up -d --force-recreate proxy
  dc up -d

  info "در انتظار گواهی..."
  local ok=""
  for _ in $(seq 1 30); do
    if docker logs pashiz-caddy 2>&1 | grep -q "certificate obtained successfully\|serving initial configuration"; then
      ok=1; break
    fi
    sleep 2
  done

  if [ -n "$ok" ]; then
    info "HTTPS فعال شد ✅  https://$domain"
  else
    warn "گواهی هنوز گرفته نشده. گزارش را ببینید:  ./update.sh logs caddy"
  fi
}

cmd_start()   { require_env; dc up -d; info "بالا آمد."; }
cmd_stop()    { require_env; dc down;  info "متوقف شد."; }
cmd_restart() { require_env; dc restart; info "دوباره راه‌اندازی شد."; }
cmd_status()  { require_env; dc ps; }

cmd_logs() {
  require_env
  if [ $# -gt 0 ]; then
    dc logs -f --tail 100 "$1"
  else
    dc logs -f --tail 100
  fi
}

usage() {
  cat <<'EOF'

سامانه مالی پشیز — به‌روزرسانی و راهبری

  sudo ./update.sh              دریافت نسخهٔ تازه، پشتیبان‌گیری، ساخت و راه‌اندازی
  sudo ./update.sh rebuild      ساخت دوبارهٔ ایمیج‌ها بدون دریافت نسخهٔ تازه
  sudo ./update.sh admin        ساخت یا تعویض گذرواژهٔ صفحهٔ مدیریت
       ./update.sh admin-url    نشان‌دادن نشانی صفحهٔ مدیریت
  sudo ./update.sh rollback     بازگشت به نسخهٔ پیش از آخرین به‌روزرسانی
       ./update.sh backup       بایگانی کامل: پایگاه‌داده + پیوست‌ها + کلیدها
  sudo ./update.sh restore <بایگانی>  بالا آوردن یک بایگانی روی این نصب
       ./update.sh status       وضعیت سرویس‌ها
       ./update.sh logs [نام]   دنبال‌کردن گزارش‌ها
       ./update.sh start|stop|restart

  sudo ./update.sh https <دامنه>    روشن‌کردن HTTPS روی نصب موجود
  sudo ./update.sh https off        بازگشت به HTTP

پشتیبان‌ها در ./backups ذخیره می‌شوند. به‌روزرسانی هرگز .env یا
داده‌های پایگاه‌داده را پاک نمی‌کند.

EOF
}

case "${1:-update}" in
  update)   cmd_update ;;
  rebuild)  cmd_rebuild ;;
  admin)    cmd_admin ;;
  admin-url) cmd_admin_url ;;
  rollback) cmd_rollback ;;
  backup)   cmd_backup ;;
  start)    cmd_start ;;
  stop)     cmd_stop ;;
  restart)  cmd_restart ;;
  status)   cmd_status ;;
  restore)  shift; cmd_restore "$@" ;;
  https)    shift; cmd_https "$@" ;;
  logs)     shift; cmd_logs "$@" ;;
  help|-h|--help) usage ;;
  *) usage; die "دستور ناشناخته: $1" ;;
esac
