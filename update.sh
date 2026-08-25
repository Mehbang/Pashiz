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

# The Garage volume, declared with an explicit name in the prod compose file.
GARAGE_VOLUME="bigcapital_prod_garage"

# Secrets that bind the database rows and the object store together. A restored
# copy needs these, because the S3 key and the Garage node identity live inside
# the volume and are referenced from .env. Everything else in .env — the domain,
# the database password — belongs to the machine, not to the data.
BINDING_KEYS="GARAGE_RPC_SECRET GARAGE_ADMIN_TOKEN S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY S3_BUCKET S3_REGION JWT_SECRET APP_JWT_SECRET"

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
  work=$(mktemp -d)
  trap 'rm -rf "$work"' RETURN

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
  work=$(mktemp -d)
  trap 'rm -rf "$work"' RETURN
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
