export const VendorMeta = {
  defaultFilterField: 'displayName',
  defaultSort: {
    sortOrder: 'DESC',
    sortField: 'created_at',
  },
  importable: true,
  exportable: true,
  fields: {
    first_name: {
      name: 'vendor.field.first_name',
      column: 'first_name',
      fieldType: 'text',
    },
    last_name: {
      name: 'vendor.field.last_name',
      column: 'last_name',
      fieldType: 'text',
    },
    display_name: {
      name: 'vendor.field.display_name',
      column: 'display_name',
      fieldType: 'text',
    },
    email: {
      name: 'vendor.field.email',
      column: 'email',
      fieldType: 'text',
    },
    work_phone: {
      name: 'vendor.field.work_phone',
      column: 'work_phone',
      fieldType: 'text',
    },
    personal_phone: {
      name: 'vendor.field.personal_phone',
      column: 'personal_phone',
      fieldType: 'text',
    },
    company_name: {
      name: 'vendor.field.company_name',
      column: 'company_name',
      fieldType: 'text',
    },
    website: {
      name: 'vendor.field.website',
      column: 'website',
      fieldType: 'text',
    },
    created_at: {
      name: 'vendor.field.created_at',
      column: 'created_at',
      fieldType: 'date',
    },
    balance: {
      name: 'vendor.field.balance',
      column: 'balance',
      fieldType: 'number',
    },
    opening_balance: {
      name: 'vendor.field.opening_balance',
      column: 'opening_balance',
      fieldType: 'number',
    },
    opening_balance_at: {
      name: 'vendor.field.opening_balance_at',
      column: 'opening_balance_at',
      fieldType: 'date',
    },
    currency_code: {
      name: 'vendor.field.currency',
      column: 'currency_code',
      fieldType: 'text',
    },
    status: {
      name: 'vendor.field.status',
      type: 'enumeration',
      options: [
        { key: 'overdue', label: 'vendor.field.status.overdue' },
        { key: 'unpaid', label: 'vendor.field.status.unpaid' },
      ],
      filterCustomQuery: (query, role) => {
        switch (role.value) {
          case 'overdue':
            query.modify('overdue');
            break;
          case 'unpaid':
            query.modify('unpaid');
            break;
        }
      },
    },
  },
  columns: {
    firstName: {
      name: 'vendor.field.first_name',
      type: 'text',
    },
    lastName: {
      name: 'vendor.field.last_name',
      type: 'text',
    },
    displayName: {
      name: 'vendor.field.display_name',
      type: 'text',
    },
    email: {
      name: 'vendor.field.email',
      type: 'text',
    },
    workPhone: {
      name: 'vendor.field.work_phone',
      type: 'text',
    },
    personalPhone: {
      name: 'vendor.field.personal_phone',
      type: 'text',
    },
    companyName: {
      name: 'vendor.field.company_name',
      type: 'text',
    },
    website: {
      name: 'vendor.field.website',
      type: 'text',
    },
    balance: {
      name: 'vendor.field.balance',
      type: 'number',
    },
    openingBalance: {
      name: 'vendor.field.opening_balance',
      type: 'number',
      printable: false,
    },
    openingBalanceAt: {
      name: 'vendor.field.opening_balance_at',
      type: 'date',
      printable: false,
    },
    currencyCode: {
      name: 'vendor.field.currency',
      type: 'text',
      printable: false,
    },
    status: {
      name: 'vendor.field.status',
      printable: false,
    },
    note: {
      name: 'vendor.field.note',
      type: 'text',
      printable: false,
    },
    // Billing Address
    billingAddress1: {
      name: 'resource.billing_address_1',
      column: 'billing_address1',
      type: 'text',
      exportable: true,
      printable: false,
    },
    billingAddress2: {
      name: 'resource.billing_address_2',
      column: 'billing_address2',
      type: 'text',
      exportable: true,
      printable: false,
    },
    billingAddressCity: {
      name: 'resource.billing_address_city',
      column: 'billing_address_city',
      type: 'text',
      exportable: true,
      printable: false,
    },
    billingAddressCountry: {
      name: 'resource.billing_address_country',
      column: 'billing_address_country',
      type: 'text',
      exportable: true,
      printable: false,
    },
    billingAddressPostcode: {
      name: 'resource.billing_address_postcode',
      column: 'billing_address_postcode',
      type: 'text',
      exportable: true,
      printable: false,
    },
    billingAddressState: {
      name: 'resource.billing_address_state',
      column: 'billing_address_state',
      type: 'text',
      exportable: true,
      printable: false,
    },
    billingAddressPhone: {
      name: 'resource.billing_address_phone',
      column: 'billing_address_phone',
      type: 'text',
      exportable: true,
      printable: false,
    },
    // Shipping Address
    shippingAddress1: {
      name: 'resource.shipping_address_1',
      column: 'shipping_address1',
      type: 'text',
      exportable: true,
      printable: false,
    },
    shippingAddress2: {
      name: 'resource.shipping_address_2',
      column: 'shipping_address2',
      type: 'text',
      exportable: true,
      printable: false,
    },
    shippingAddressCity: {
      name: 'resource.shipping_address_city',
      column: 'shipping_address_city',
      type: 'text',
      exportable: true,
      printable: false,
    },
    shippingAddressCountry: {
      name: 'resource.shipping_address_country',
      column: 'shipping_address_country',
      type: 'text',
      exportable: true,
      printable: false,
    },
    shippingAddressPostcode: {
      name: 'resource.shipping_address_postcode',
      column: 'shipping_address_postcode',
      type: 'text',
      exportable: true,
      printable: false,
    },
    shippingAddressState: {
      name: 'resource.shipping_address_state',
      column: 'shipping_address_state',
      type: 'text',
      exportable: true,
      printable: false,
    },
    shippingAddressPhone: {
      name: 'resource.shipping_address_phone',
      column: 'shipping_address_phone',
      type: 'text',
      exportable: true,
      printable: false,
    },
    createdAt: {
      name: 'vendor.field.created_at',
      type: 'date',
      exportable: true,
      printable: false,
    },
  },
  fields2: {
    firstName: {
      name: 'vendor.field.first_name',
      column: 'first_name',
      fieldType: 'text',
    },
    lastName: {
      name: 'vendor.field.last_name',
      column: 'last_name',
      fieldType: 'text',
    },
    displayName: {
      name: 'vendor.field.display_name',
      column: 'display_name',
      fieldType: 'text',
      required: true,
    },
    email: {
      name: 'vendor.field.email',
      column: 'email',
      fieldType: 'text',
    },
    workPhone: {
      name: 'vendor.field.work_phone',
      column: 'work_phone',
      fieldType: 'text',
    },
    personalPhone: {
      name: 'vendor.field.personal_phone',
      column: 'personal_phone',
      fieldType: 'text',
    },
    companyName: {
      name: 'vendor.field.company_name',
      column: 'company_name',
      fieldType: 'text',
    },
    website: {
      name: 'vendor.field.website',
      column: 'website',
      fieldType: 'text',
    },
    openingBalance: {
      name: 'vendor.field.opening_balance',
      column: 'opening_balance',
      fieldType: 'number',
    },
    openingBalanceAt: {
      name: 'vendor.field.opening_balance_at',
      column: 'opening_balance_at',
      fieldType: 'date',
    },
    openingBalanceExchangeRate: {
      name: 'resource.opening_balance_exchange_rate',
      column: 'opening_balance_exchange_rate',
      fieldType: 'number',
    },
    currencyCode: {
      name: 'vendor.field.currency',
      column: 'currency_code',
      fieldType: 'text',
    },
    note: {
      name: 'resource.note',
      column: 'note',
      fieldType: 'text',
    },
    active: {
      name: 'resource.active',
      column: 'active',
      fieldType: 'boolean',
    },
    // Billing Address
    billingAddress1: {
      name: 'resource.billing_address_1',
      column: 'billing_address1',
      fieldType: 'text',
    },
    billingAddress2: {
      name: 'resource.billing_address_2',
      column: 'billing_address2',
      fieldType: 'text',
    },
    billingAddressCity: {
      name: 'resource.billing_address_city',
      column: 'billing_address_city',
      fieldType: 'text',
    },
    billingAddressCountry: {
      name: 'resource.billing_address_country',
      column: 'billing_address_country',
      fieldType: 'text',
    },
    billingAddressPostcode: {
      name: 'resource.billing_address_postcode',
      column: 'billing_address_postcode',
      fieldType: 'text',
    },
    billingAddressState: {
      name: 'resource.billing_address_state',
      column: 'billing_address_state',
      fieldType: 'text',
    },
    billingAddressPhone: {
      name: 'resource.billing_address_phone',
      column: 'billing_address_phone',
      fieldType: 'text',
    },
    // Shipping Address
    shippingAddress1: {
      name: 'resource.shipping_address_1',
      column: 'shipping_address1',
      fieldType: 'text',
    },
    shippingAddress2: {
      name: 'resource.shipping_address_2',
      column: 'shipping_address2',
      fieldType: 'text',
    },
    shippingAddressCity: {
      name: 'resource.shipping_address_city',
      column: 'shipping_address_city',
      fieldType: 'text',
    },
    shippingAddressCountry: {
      name: 'resource.shipping_address_country',
      column: 'shipping_address_country',
      fieldType: 'text',
    },
    shippingAddressPostcode: {
      name: 'resource.shipping_address_postcode',
      column: 'shipping_address_postcode',
      fieldType: 'text',
    },
    shippingAddressState: {
      name: 'resource.shipping_address_state',
      column: 'shipping_address_state',
      fieldType: 'text',
    },
    shippingAddressPhone: {
      name: 'resource.shipping_address_phone',
      column: 'shipping_address_phone',
      fieldType: 'text',
    },
  },
};
