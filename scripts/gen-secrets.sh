#!/usr/bin/env bash
#
# Pashiz — generate the secrets a self-hosted install needs, into .env.
#
#   ./scripts/gen-secrets.sh
#
# This is the "file" half of setting credentials up: it writes a complete .env
# with every random value filled in — the database passwords, the JWT signing
# key, the Garage object-store secrets, the ClickHouse guard value, and the
# administration portal's URL segment and session key. Run it once, before the
# first `docker compose … up`, when you are installing by hand rather than
# through setup.sh (which generates the very same values itself).
#
# Safe to run again: a value that is already set is never changed, so a second
# run only fills what is still blank. It never prints a secret — the values go
# into .env (chmod 600) and nowhere else — except the administration portal's
# address, which is a URL you have to know to use and is shown once at the end.
#
# The one credential it does NOT set is the portal password: hashing that needs
# a node binary from the built image, so it lives in `./update.sh admin` (or the
# one-liner in the README). Everything else the portal needs is generated here.
#
# No root required — it only writes .env in the repository root.

set -euo pipefail

# The script lives in scripts/, so the repository root is one level up. `cd` is
# portable here (no `readlink -f`, which BSD/macOS lack) because the path comes
# from $0 resolved through the shell's own pwd.
cd "$(cd "$(dirname "$0")" && pwd)/.."

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
step() { printf '\n\033[1;34m==>\033[0m \033[1m%s\033[0m\n' "$*"; }
info() { printf '    %s\n' "$*"; }
warn() { printf '\033[1;33m    ! %s\033[0m\n' "$*"; }
die()  { printf '\033[1;31m\nخطا: %s\033[0m\n' "$*" >&2; exit 1; }

command -v openssl >/dev/null 2>&1 || die "openssl لازم است و پیدا نشد."
[ -f .env.example ] || die ".env.example پیدا نشد. این اسکریپت را از ریشهٔ مخزن اجرا کنید."

# set_env / get_env behave exactly like setup.sh's, so a .env written by either
# is read the same way by the other. Values can hold characters special to sed
# (& / \), so they travel through the environment and are written literally by
# awk rather than interpolated.
get_env() { [ -f .env ] && grep -E "^$1=" .env 2>/dev/null | head -1 | cut -d= -f2- || true; }

set_env() {
  local key="$1" value="$2"
  if [ -f .env ] && grep -qE "^${key}=" .env; then
    KEY="$key" VALUE="$value" awk '
      BEGIN { prefix = ENVIRON["KEY"] "="; value = ENVIRON["VALUE"] }
      index($0, prefix) == 1 { print prefix value; next }
      { print }
    ' .env > .env.tmp && mv .env.tmp .env
  else
    printf '%s=%s\n' "$key" "$value" >> .env
  fi
}

# Fills a key only when it is absent or empty, so a second run never rotates a
# live secret. There is deliberately no --force: rotating DB_PASSWORD or the
# Garage keys under a running install would lock the application out of its own
# data and object store.
ensure_secret() {
  local key="$1" gen="$2"
  if [ -n "$(get_env "$key")" ]; then
    info "$key از قبل هست — دست‌نخورده ماند."
  else
    set_env "$key" "$gen"
    info "$key ساخته شد."
  fi
}

# --------------------------------------------------------------------- run ---

FRESH=0
if [ ! -f .env ]; then
  step "ساخت .env از روی .env.example"
  cp .env.example .env
  FRESH=1
  info ".env ساخته شد."
else
  step "تکمیل .env موجود"
  info "مقادیری که از قبل پر شده‌اند دست‌نخورده می‌مانند."
fi
chmod 600 .env 2>/dev/null || true

# The database passwords are a special case: .env.example ships throwaway
# defaults for them (bigcapital / root), not blanks, so "fill if empty" would
# leave those weak values in place. On a freshly copied .env they are replaced
# with strong random ones. On an existing .env they belong to a database that is
# probably already running with them, so they are left alone — only flagged if
# they are still the published defaults.
step "رمزهای پایگاه‌داده"
if [ "$FRESH" = 1 ]; then
  set_env DB_PASSWORD      "$(openssl rand -hex 24)"
  set_env DB_ROOT_PASSWORD "$(openssl rand -hex 24)"
  info "DB_PASSWORD و DB_ROOT_PASSWORD ساخته شد."
else
  if [ "$(get_env DB_PASSWORD)" = "bigcapital" ] || [ "$(get_env DB_ROOT_PASSWORD)" = "root" ]; then
    warn "رمز پایگاه‌داده هنوز مقدار پیش‌فرض نمونه است (bigcapital/root)."
    warn "اگر هنوز پایگاه‌داده‌ای بالا نیامده، این دو را در .env دستی عوض کنید."
    warn "اگر پایگاه‌داده بالا آمده، عوض‌کردنشان دسترسی برنامه را قطع می‌کند."
  fi
fi

# Empty in .env.example, so "fill if blank" is always the right thing here.
step "کلیدهای رمزنگاری و سرویس‌ها"
ensure_secret JWT_SECRET          "$(openssl rand -hex 32)"
ensure_secret APP_JWT_SECRET      "$(openssl rand -hex 32)"
ensure_secret GARAGE_RPC_SECRET   "$(openssl rand -hex 32)"
ensure_secret GARAGE_ADMIN_TOKEN  "$(openssl rand -hex 32)"

# ClickHouse stays parked behind an unused compose profile, but
# docker-compose.prod.yml guards CLICKHOUSE_PASSWORD with `:?` and compose
# evaluates that guard before it applies profiles — so without a value even
# `docker compose build` refuses to start. Generated here so the first compose
# command does not stop on it.
ensure_secret CLICKHOUSE_PASSWORD "$(openssl rand -hex 24)"

# The portal's own URL segment and session signing key. The password hash is
# set separately — it needs the built image — via `./update.sh admin`.
step "صفحهٔ مدیریت"
ensure_secret PASHIZ_ADMIN_PATH   "$(openssl rand -hex 32)"
ensure_secret PASHIZ_ADMIN_SECRET "$(openssl rand -hex 32)"

# On a fresh .env the Gotenberg URLs are still .env.example's development values
# (localhost / host.docker.internal). On the compose network the API is reached
# by service name, so they are corrected here. An existing .env is left as the
# operator set it.
if [ "$FRESH" = 1 ]; then
  step "نشانی سرویس‌ها روی شبکهٔ compose"
  set_env GOTENBERG_URL      "http://gotenberg:3000"
  set_env GOTENBERG_DOCS_URL "http://server:3000/public/"
  info "GOTENBERG_URL و GOTENBERG_DOCS_URL تنظیم شد."

  # BASE_URL is install-specific; the example value (example.com) is never
  # right. Guess the server's own address so a local bring-up works, and tell
  # the operator to correct it for a real domain.
  ip=$(hostname -I 2>/dev/null | awk '{print $1}' || true)
  set_env BASE_URL "http://${ip:-localhost}"
fi

chmod 600 .env 2>/dev/null || true

# ---------------------------------------------------------------- summary ---

admin_path=$(get_env PASHIZ_ADMIN_PATH)
base_url=$(get_env BASE_URL)

cat <<EOF

$(bold "رمزها در .env نوشته شد.")

    پرونده      : $(pwd)/.env   (دسترسی ۶۰۰)
    نشانی فعلی  : ${base_url}

$(bold "دو کار باقی مانده:")

    ۱) BASE_URL را در .env به نشانی واقعی‌ای که کاربر در مرورگر می‌بیند تنظیم
       کنید (و برای HTTPS، PASHIZ_DOMAIN را). لینک‌های ایمیل و پرداخت از روی
       BASE_URL ساخته می‌شوند.

    ۲) گذرواژهٔ صفحهٔ مدیریت را بسازید (در .env فقط درهم‌سازی ذخیره می‌شود):

           sudo ./update.sh admin

       نشانی صفحهٔ مدیریت پس از آن این خواهد بود:

           ${base_url}/api/admin/${admin_path}

EOF
