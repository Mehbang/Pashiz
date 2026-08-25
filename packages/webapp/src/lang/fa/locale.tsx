// @ts-nocheck
// Based on https://github.com/jquense/yup/blob/2973d0a/src/locale.js

import printValue from '../printValue';

export const locale = {
  mixed: {
    default: '${path} نامعتبر است.',
    required: '${path} الزامی است.',
    oneOf: '${path} باید یکی از مقادیر زیر باشد: ${values}',
    notOneOf: '${path} نباید یکی از مقادیر زیر باشد: ${values}',
    notType: ({ path, type, value, originalValue }) => {
      const isCast = originalValue != null && originalValue !== value;
      let msg =
        `${path} باید از نوع \`${type}\` باشد، ` +
        `اما مقدار نهایی این بود: \`${printValue(value, true)}\`` +
        (isCast
          ? ` (تبدیل‌شده از مقدار \`${printValue(originalValue, true)}\`).`
          : '.');

      if (value === null) {
        msg +=
          `\n اگر «null» به‌عنوان مقدار خالی در نظر گرفته شده است، حتماً` +
          ' schema را با `.nullable()` علامت‌گذاری کنید.';
      }

      return msg;
    },
    defined: '${path} باید تعیین شود.',
  },
  string: {
    length: '${path} باید دقیقاً ${length} نویسه باشد.',
    min: '${path} باید حداقل ${min} نویسه باشد.',
    max: '${path} باید حداکثر ${max} نویسه باشد.',
    matches: '${path} باید با الگوی زیر مطابقت داشته باشد: "${regex}"',
    email: '${path} باید یک ایمیل معتبر باشد.',
    url: '${path} باید یک نشانی اینترنتی معتبر باشد.',
    trim: '${path} نباید فاصله اضافی در ابتدا یا انتها داشته باشد.',
    lowercase: '${path} باید با حروف کوچک نوشته شود.',
    uppercase: '${path} باید با حروف بزرگ نوشته شود.',
  },
  number: {
    min: '${path} باید بزرگ‌تر یا مساوی ${min} باشد.',
    max: '${path} باید کوچک‌تر یا مساوی ${max} باشد.',
    lessThan: '${path} باید کمتر از ${less} باشد.',
    moreThan: '${path} باید بیشتر از ${more} باشد.',
    notEqual: '${path} نباید برابر ${notEqual} باشد.',
    positive: '${path} باید عددی مثبت باشد.',
    negative: '${path} باید عددی منفی باشد.',
    integer: '${path} باید عددی صحیح باشد.',
  },
  date: {
    min: '${path} باید تاریخی پس از ${min} باشد.',
    max: '${path} باید تاریخی پیش از ${max} باشد.',
  },
  boolean: {},
  object: {
    noUnknown:
      '${path} نمی‌تواند کلیدهایی خارج از ساختار تعریف‌شده داشته باشد.',
  },
  array: {
    min: '${path} باید حداقل ${min} مورد داشته باشد.',
    max: '${path} باید حداکثر ${max} مورد داشته باشد.',
  },
};
