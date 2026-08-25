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

cmd_backup() {
  require_env
  step "پشتیبان‌گیری"
  mkdir -p "$BACKUP_DIR"

  local stamp archive
  stamp=$(date +%Y%m%d-%H%M%S)
  archive="$BACKUP_DIR/pashiz-$stamp.sql.gz"

  # --all-databases covers the system database and every tenant database,
  # whose names are generated at run time.
  docker exec pashiz-mysql sh -c \
    "exec mysqldump -uroot -p\"\$MYSQL_ROOT_PASSWORD\" --all-databases --single-transaction --quick" \
    2>/dev/null | gzip > "$archive" || die "پشتیبان‌گیری از پایگاه‌داده ناموفق بود."

  cp .env "$BACKUP_DIR/env-$stamp"
  chmod 600 "$BACKUP_DIR/env-$stamp"

  info "پایگاه‌داده : $archive  ($(du -h "$archive" | cut -f1))"
  info "تنظیمات    : $BACKUP_DIR/env-$stamp"
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

  cmd_rebuild
}

cmd_rebuild() {
  require_root
  require_env

  step "ساخت ایمیج‌ها"
  dc build server webapp

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
  sudo ./update.sh rollback     بازگشت به نسخهٔ پیش از آخرین به‌روزرسانی
       ./update.sh backup       پشتیبان از پایگاه‌داده و تنظیمات
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
  rollback) cmd_rollback ;;
  backup)   cmd_backup ;;
  start)    cmd_start ;;
  stop)     cmd_stop ;;
  restart)  cmd_restart ;;
  status)   cmd_status ;;
  https)    shift; cmd_https "$@" ;;
  logs)     shift; cmd_logs "$@" ;;
  help|-h|--help) usage ;;
  *) usage; die "دستور ناشناخته: $1" ;;
esac
