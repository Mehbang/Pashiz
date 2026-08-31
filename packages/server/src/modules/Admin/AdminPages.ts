import { PageOptions, csrfField, email, esc, page } from './AdminView';
import type { AdminOrganizationRow, AdminUserRow } from './AdminData.service';
import type { BackupFile, BackupState } from './AdminBackup.service';
import type { MailSettings, SignupSettings } from './InstanceSettings.service';

type Common = Pick<PageOptions, 'base' | 'csrf' | 'notice'>;

const date = (value: string | null) =>
  value ? new Date(value).toLocaleDateString('fa-IR') : '—';

const bytes = (size: number) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
};

export function overviewView(
  options: Common & {
    users: AdminUserRow[];
    organizations: AdminOrganizationRow[];
    signup: SignupSettings;
    backupCount: number;
  },
) {
  const { users, organizations, signup, backupCount } = options;
  const stat = (label: string, value: string) =>
    `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`;

  return page(
    { ...options, title: 'نمای کلی', active: 'overview' },
    `<section>
      <h2>نمای کلی</h2>
      <p class="hint">وضعیت این نصب در یک نگاه.</p>
      <table>
        ${stat('کاربران', String(users.length))}
        ${stat('کاربران فعال', String(users.filter((u) => u.active).length))}
        ${stat('سازمان‌ها', String(organizations.length))}
        ${stat('ثبت‌نام', signup.disabled ? 'بسته' : 'باز')}
        ${stat('بایگانی‌های پشتیبان', String(backupCount))}
      </table>
    </section>`,
  );
}

export function usersView(options: Common & { users: AdminUserRow[] }) {
  const rows = options.users
    .map(
      (user) => `<tr>
        <td>${email(user.email)}</td>
        <td>${esc(user.name) || '—'}</td>
        <td>${user.active ? 'فعال' : 'غیرفعال'}</td>
        <td>${esc(String(user.organizationCount))}</td>
        <td>${user.verified ? 'بله' : 'خیر'}</td>
        <td><a class="dl" href="${esc(options.base)}/users/${esc(String(user.id))}/backup">دانلود پشتیبان</a></td>
      </tr>`,
    )
    .join('');

  return page(
    { ...options, title: 'کاربران', active: 'users' },
    `<section>
      <h2>کاربران</h2>
      <p class="hint">پشتیبانِ هر کاربر شامل همهٔ سازمان‌هایی است که عضو آن‌هاست.</p>
      <table>
        <tr><th>ایمیل</th><th>نام</th><th>وضعیت</th><th>سازمان‌ها</th><th>تأیید‌شده</th><th></th></tr>
        ${rows || '<tr><td colspan="6">کاربری نیست.</td></tr>'}
      </table>
    </section>`,
  );
}

export function organizationsView(
  options: Common & { organizations: AdminOrganizationRow[] },
) {
  const rows = options.organizations
    .map(
      (org) => `<tr>
        <td>${esc(org.name) || '—'}</td>
        <td>${email(org.ownerEmail) || '—'}</td>
        <td>${esc(org.baseCurrency) || '—'}</td>
        <td>${esc(org.language) || '—'}</td>
        <td>${org.initialized ? 'آماده' : 'راه‌اندازی‌نشده'}</td>
        <td>${
          org.initialized
            ? `<a class="dl" href="${esc(options.base)}/organizations/${esc(String(org.id))}/backup">دانلود پشتیبان</a>`
            : '—'
        }</td>
      </tr>`,
    )
    .join('');

  return page(
    { ...options, title: 'سازمان‌ها', active: 'organizations' },
    `<section>
      <h2>سازمان‌ها</h2>
      <p class="hint">هر پرونده همان قالب <code>.pashiz</code> است که در تنظیمات سازمان هم درون‌ریزی می‌شود.</p>
      <table>
        <tr><th>نام</th><th>مالک</th><th>ارز</th><th>زبان</th><th>وضعیت</th><th></th></tr>
        ${rows || '<tr><td colspan="6">سازمانی نیست.</td></tr>'}
      </table>
    </section>`,
  );
}

export function signupView(options: Common & { settings: SignupSettings }) {
  const { settings } = options;

  return page(
    { ...options, title: 'ثبت‌نام', active: 'signup' },
    `<section>
      <h2>دسترسی ثبت‌نام</h2>
      <p class="hint">تغییرات بی‌درنگ اثر می‌کنند؛ نیازی به راه‌اندازی دوباره نیست.</p>
      <form method="post" action="${esc(options.base)}/signup">
        ${csrfField(options.csrf)}
        <label><input type="checkbox" name="disabled"${settings.disabled ? ' checked' : ''}>
          ثبت‌نام تازه بسته باشد</label>
        <label><input type="checkbox" name="emailConfirmation"${settings.emailConfirmation ? ' checked' : ''}>
          برای ثبت‌نام تأیید ایمیل لازم باشد</label>
        <label><span>دامنه‌های مجاز (با کاما یا فاصله جدا کنید؛ خالی یعنی همه)</span>
          <input type="text" name="allowedDomains" value="${esc(settings.allowedDomains.join(', '))}"></label>
        <label><span>ایمیل‌های مجاز</span>
          <input type="text" name="allowedEmails" value="${esc(settings.allowedEmails.join(', '))}"></label>
        <button>ذخیره</button>
      </form>
    </section>`,
  );
}

export function mailView(options: Common & { settings: MailSettings }) {
  const { settings } = options;

  return page(
    { ...options, title: 'ایمیل', active: 'mail' },
    `<section>
      <h2>تنظیمات ایمیل</h2>
      <p class="hint">برای بازیابی گذرواژه، تأیید ثبت‌نام و ارسال فاکتور به‌کار می‌رود.</p>
      <form method="post" action="${esc(options.base)}/mail">
        ${csrfField(options.csrf)}
        <div class="row">
          <label><span>میزبان SMTP</span>
            <input type="text" name="host" value="${esc(settings.host)}"></label>
          <label><span>درگاه</span>
            <input type="number" name="port" value="${esc(settings.port)}"></label>
        </div>
        <label><input type="checkbox" name="secure"${settings.secure ? ' checked' : ''}>
          اتصال امن (TLS مستقیم، معمولاً درگاه ۴۶۵)</label>
        <div class="row">
          <label><span>نام کاربری</span>
            <input type="text" name="username" value="${esc(settings.username)}" autocomplete="off"></label>
          <label><span>گذرواژه</span>
            <input type="password" name="password" placeholder="${settings.password ? '(بدون تغییر)' : ''}" autocomplete="new-password"></label>
        </div>
        <p class="muted">گذرواژهٔ ذخیره‌شده هرگز به این صفحه بازگردانده نمی‌شود. اگر خالی بماند، همان که هست می‌ماند.</p>
        <div class="row">
          <label><span>نام فرستنده</span>
            <input type="text" name="fromName" value="${esc(settings.fromName)}"></label>
          <label><span>نشانی فرستنده</span>
            <input type="email" name="fromAddress" value="${esc(settings.fromAddress)}"></label>
        </div>
        <button>ذخیره</button>
      </form>
    </section>
    <section>
      <h2>آزمون</h2>
      <p class="hint">یک پیام آزمایشی با تنظیمات ذخیره‌شده می‌فرستد.</p>
      <form method="post" action="${esc(options.base)}/mail/test">
        ${csrfField(options.csrf)}
        <label><span>به نشانی</span>
          <input type="email" name="to" required></label>
        <button class="quiet">فرستادن پیام آزمایشی</button>
      </form>
    </section>`,
  );
}

export interface RestoreTarget {
  id: number;
  name: string;
  organizationId: string;
}

export function backupsView(
  options: Common & {
    files: BackupFile[];
    state: BackupState;
    targets: RestoreTarget[];
  },
) {
  const { files, state, targets } = options;

  const status =
    state.status === 'running'
      ? '<p class="muted">پشتیبان‌گیری در جریان است. صفحه را دوباره بارگذاری کنید.</p>'
      : state.status === 'failed'
        ? `<p class="muted">آخرین تلاش ناموفق بود: ${esc(state.message)}</p>`
        : state.status === 'done'
          ? `<p class="muted">آخرین بایگانی: ${esc(state.name)}</p>`
          : '';

  const rows = files
    .map(
      (file) => `<tr>
        <td>${esc(file.name)}</td>
        <td>${esc(bytes(file.sizeBytes))}</td>
        <td>${esc(date(file.createdAt))}</td>
        <td><a class="dl" href="${esc(options.base)}/backups/download?name=${encodeURIComponent(file.name)}">دانلود</a></td>
        <td>${
          // Only a whole-installation dump can be put back from here. An
          // organization export is restored from that organization's own
          // settings, where the person doing it can see whose books they are
          // about to replace.
          file.name.endsWith('.sql.gz')
            ? `<form method="post" action="${esc(options.base)}/backups/restore">
                 ${csrfField(options.csrf)}
                 <input type="hidden" name="name" value="${esc(file.name)}">
                 <input name="confirm" placeholder="نام پرونده را بنویسید" size="22" required>
                 <button class="danger">بازگرداندن</button>
               </form>`
            : // An organization export or a user bundle: the operator says
              // which organization it goes into, because the file's own
              // organization id belongs to wherever it came from.
              `<form method="post" action="${esc(options.base)}/backups/restore-organization">
                 ${csrfField(options.csrf)}
                 <input type="hidden" name="name" value="${esc(file.name)}">
                 <select name="tenantId" required>
                   <option value="">سازمان مقصد…</option>
                   ${targets
                     .map(
                       (t) =>
                         `<option value="${esc(t.id)}">${esc(t.name || t.organizationId)}</option>`,
                     )
                     .join('')}
                 </select>
                 ${
                   file.name.endsWith('.pashizbundle')
                     ? '<input name="entryIndex" placeholder="شمارهٔ سازمان در بسته" size="8" value="0">'
                     : ''
                 }
                 <input name="confirm" placeholder="نام پرونده را بنویسید" size="20" required>
                 <button class="danger">بازگرداندن</button>
               </form>`
        }</td>
        <td><form method="post" action="${esc(options.base)}/backups/delete">
          ${csrfField(options.csrf)}
          <input type="hidden" name="name" value="${esc(file.name)}">
          <button class="quiet">پاک‌کردن</button></form></td>
      </tr>`,
    )
    .join('');

  return page(
    { ...options, title: 'پشتیبان‌ها', active: 'backups' },
    `<section>
      <h2>پشتیبان کل نصب</h2>
      <p class="hint">همهٔ پایگاه‌داده‌های پشیز را روی سرور بایگانی می‌کند و اینجا برای دانلود می‌گذارد.</p>
      <p class="muted">پیوست‌ها و کلیدهای پیوند‌دهنده در این بایگانی نیستند. برای پشتیبان کامل — که آن‌ها را هم دارد — <code>./update.sh backup</code> را روی سرور بزنید؛ آن بایگانی عمداً از این صفحه قابل دانلود نیست، چون کلیدهای فضای ذخیره‌سازی را در خود دارد.</p>
      ${status}
      <form method="post" action="${esc(options.base)}/backups">
        ${csrfField(options.csrf)}
        <button${state.status === 'running' ? ' disabled' : ''}>گرفتن پشتیبان تازه</button>
      </form>
    </section>
    <section>
      <h2>پشتیبان‌گیری خودکار</h2>
      <p class="hint">هر روز ساعت ۱۲ ظهر و ۱۲ شب به وقت تهران، یک پشتیبان کامل و یک پشتیبان جدا برای هر سازمان گرفته می‌شود.</p>
      <p class="muted">نام این‌ها <code>auto</code> دارد و ۲۸ تای آخر از هر نوع نگه داشته می‌شود؛ بایگانی‌هایی که خودتان گرفته‌اید هرگز خودکار پاک نمی‌شوند.</p>
      <form method="post" action="${esc(options.base)}/backups/run-scheduled">
        ${csrfField(options.csrf)}
        <button class="quiet">همین حالا اجرا کن</button>
      </form>
    </section>
    <section>
      <h2>بایگانی‌های موجود</h2>
      <p class="hint">پشتیبان‌هایی که از سازمان‌ها و کاربران می‌گیرید هم اینجا نگه داشته می‌شوند، نه فقط در دانلودهای شما.</p>
      <p class="muted">بازگرداندن یک پشتیبان کامل، <b>همهٔ</b> سازمان‌های این نصب را با محتوای آن جایگزین می‌کند. برای تأیید باید نام خود پرونده را بنویسید. سرور پس از آن چند ثانیه بالا می‌آید.</p>
      <table>
        <tr><th>نام</th><th>حجم</th><th>تاریخ</th><th></th><th>بازگرداندن</th><th></th></tr>
        ${rows || '<tr><td colspan="6">بایگانی‌ای نیست.</td></tr>'}
      </table>
    </section>`,
  );
}
