# نصب و نگهداری سامانه مالی پشیز

راهنمای راه‌اندازی روی یک سرور اوبونتوی تازه و نگهداری آن.

## پیش‌نیاز سرور

| | کمینه | پیشنهادی |
|---|---|---|
| اوبونتو | 22.04 | 24.04 |
| حافظه | 2GB + swap | 4GB |
| دیسک | 10GB | 20GB |
| پورت | 80 | 80 و 443 |

ساخت رابط کاربری سنگین‌ترین بخش است. روی سرور کم‌حافظه، `setup.sh` خودش
یک فایل swap دو گیگابایتی می‌سازد.

## نصب

```bash
curl -fsSL https://raw.githubusercontent.com/Mehbang/Pashiz/pashiz/setup.sh | sudo bash
```

یا اگر مخزن را از پیش گرفته‌اید:

```bash
sudo ./setup.sh
```

اسکریپت این کارها را انجام می‌دهد: نصب داکر، دریافت منبع در `/opt/pashiz`،
ساخت `.env` با رمزهای تصادفی، ساخت ایمیج‌ها، آماده‌سازی فضای ذخیره‌سازی
پیوست‌ها، اجرای مهاجرت پایگاه‌داده و بالا آوردن سرویس‌ها.

اجرای دوبارهٔ آن بی‌خطر است: `.env` موجود هرگز بازنویسی نمی‌شود.

### تنظیم‌های اختیاری

```bash
sudo BASE_URL=https://hesab.example.ir PASHIZ_DIR=/srv/pashiz ./setup.sh
```

| متغیر | پیش‌فرض |
|---|---|
| `PASHIZ_DIR` | `/opt/pashiz` |
| `PASHIZ_BRANCH` | `pashiz` |
| `BASE_URL` | `http://<ip سرور>` |
| `PUBLIC_PROXY_PORT` | `80` |
| `DOCKER_REGISTRY_MIRROR` | ندارد |

### اگر رجیستری داکر در دسترس نیست

ایمیج‌های پایه از Docker Hub می‌آیند. جایی که دسترسی محدود است، یک آینه بدهید:

```bash
sudo DOCKER_REGISTRY_MIRROR=https://docker.arvancloud.ir ./setup.sh
```

اسکریپت پیش از شروع ساخت، دسترسی را می‌آزماید و اگر برقرار نبود با پیام
روشن متوقف می‌شود — نه چند دقیقه بعد با خطای TLS.

## نگهداری

همهٔ کارهای روزمره با `update.sh` انجام می‌شود:

```bash
cd /opt/pashiz

sudo ./update.sh            # دریافت نسخهٔ تازه، پشتیبان‌گیری، ساخت، راه‌اندازی
sudo ./update.sh rebuild    # ساخت دوباره بدون دریافت نسخهٔ تازه
sudo ./update.sh rollback   # بازگشت به نسخهٔ پیش از آخرین به‌روزرسانی
     ./update.sh backup     # پشتیبان از پایگاه‌داده و تنظیمات
     ./update.sh status
     ./update.sh logs server
     ./update.sh stop
```

به‌روزرسانی پیش از هر کار پشتیبان می‌گیرد، `.env` را دست نمی‌زند و هیچ
volume‌ای را پاک نمی‌کند.

### پشتیبان

`./update.sh backup` یک دامپ از **همهٔ** پایگاه‌داده‌ها می‌گیرد — پایگاه‌دادهٔ
سامانه به‌علاوهٔ پایگاه‌دادهٔ هر سازمان، که نامشان هنگام اجرا ساخته می‌شود —
و در `./backups` می‌گذارد.

برای پشتیبان‌گیری شبانه:

```bash
sudo crontab -e
# 0 2 * * * cd /opt/pashiz && ./update.sh backup >> /var/log/pashiz-backup.log 2>&1
```

بازیابی:

```bash
cd /opt/pashiz
./update.sh stop
docker compose -f docker-compose.prod.yml -f docker-compose.pashiz.yml --env-file .env up -d mysql
gunzip < backups/pashiz-<تاریخ>.sql.gz | docker exec -i pashiz-mysql sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"'
./update.sh start
```

## دامنه و HTTPS

`setup.sh` روی HTTP و پورت ۸۰ راه می‌اندازد. برای دامنه با گواهی، ساده‌ترین
راه گذاشتن یک nginx یا Caddy جلوی آن است:

1. در `.env` مقدار `PUBLIC_PROXY_PORT=8080` را بگذارید و
   `BASE_URL=https://hesab.example.ir` را تنظیم کنید.
2. `sudo ./update.sh restart`
3. پروکسی بیرونی را روی `http://127.0.0.1:8080` تنظیم کنید و گواهی را
   با Let's Encrypt بگیرید.

`BASE_URL` باید دقیقاً همان نشانی‌ای باشد که کاربر در مرورگر می‌بیند؛
لینک‌های پرداخت و ایمیل‌ها از روی آن ساخته می‌شوند.

## نخستین سازمان

نشانی را باز کنید و ثبت‌نام کنید. **هنگام ساخت سازمان زبان «فارسی» را
انتخاب کنید** — تقویم شمسی، ارقام فارسی، نمودار حساب‌ها، انبار، نرخ‌های
مالیات و نام ارزها همه بر پایهٔ همین تنظیم ساخته می‌شوند.

اگر سازمانی را پیش‌تر با زبان دیگری ساخته‌اید و بعد به فارسی برگردانده‌اید،
داده‌های اولیه‌اش انگلیسی مانده‌اند. این دستور آن‌ها را ترجمه می‌کند:

```bash
docker exec pashiz-server node packages/server/dist/cli.js tenants:translate-seeded-data
# گزارش می‌دهد؛ برای اعمال:
docker exec pashiz-server node packages/server/dist/cli.js tenants:translate-seeded-data --apply
```

فقط ردیف‌هایی را که هنوز دقیقاً متن انگلیسی اولیه را دارند عوض می‌کند، پس
نامی که خودتان ویرایش کرده‌اید دست‌نخورده می‌ماند.

## ساختار سرویس‌ها

| سرویس | نقش |
|---|---|
| `proxy` | Envoy؛ `/api` را به سرور و بقیه را به رابط کاربری می‌فرستد |
| `webapp` | رابط کاربری ساخته‌شده، پشت nginx |
| `server` | NestJS API |
| `mysql` | MariaDB — پایگاه‌دادهٔ سامانه و سازمان‌ها |
| `redis` | صف‌ها و کش |
| `gotenberg` | تولید PDF برای چاپ فاکتور |
| `garage` | فضای S3 برای پیوست‌ها و لوگو |
| `database_migration` | یک‌بار اجرا می‌شود و مهاجرت‌ها را انجام می‌دهد |

بر خلاف بالادست، `server` و `webapp` از روی منبع همین مخزن ساخته می‌شوند نه
از ایمیج‌های `bigcapitalhq`؛ وگرنه هیچ‌یک از تغییرات این فورک در آن‌ها نیست.
این کار در `docker-compose.pashiz.yml` انجام شده که همیشه در کنار
`docker-compose.prod.yml` به کار می‌رود.

## عیب‌یابی

```bash
./update.sh logs server        # خطاهای API
./update.sh logs webapp
./update.sh logs database_migration
./update.sh status
```

**چاپ یا دانلود PDF کار نمی‌کند** — `gotenberg` باید بالا باشد و
`GOTENBERG_DOCS_URL` در `.env` باید `http://server:3000/public/` باشد.

**سرور بالا نمی‌آید** — بیشتر وقت‌ها مهاجرت پایگاه‌داده شکست خورده است:
`./update.sh logs database_migration`

**ساخت رابط کاربری در میانهٔ کار می‌میرد** — حافظه کم آمده. swap اضافه کنید:

```bash
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
