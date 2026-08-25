import {
  ValidationOptions,
  isISO4217CurrencyCode,
  registerDecorator,
} from 'class-validator';

/**
 * Currency codes the application supports beyond ISO 4217.
 *
 * The Iranian toman is the unit the country actually prices in — ten rials —
 * but it has no ISO code of its own, so the widely used unofficial `IRT` stands
 * in for it.
 */
export const NON_ISO_CURRENCY_CODES = ['IRT'];

/**
 * Accepts any ISO 4217 currency code, plus the codes listed above. Use this in
 * place of `@IsISO4217CurrencyCode()` so an organization can work in a currency
 * the standard does not cover.
 */
export function IsSupportedCurrencyCode(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSupportedCurrencyCode',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return (
            typeof value === 'string' &&
            (isISO4217CurrencyCode(value) ||
              NON_ISO_CURRENCY_CODES.includes(value))
          );
        },
        defaultMessage() {
          return (
            `$property must be a valid ISO 4217 currency code, ` +
            `or one of: ${NON_ISO_CURRENCY_CODES.join(', ')}`
          );
        },
      },
    });
  };
}
