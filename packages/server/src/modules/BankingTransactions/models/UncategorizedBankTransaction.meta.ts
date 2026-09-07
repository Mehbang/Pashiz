export const UncategorizedBankTransactionMeta = {
  defaultFilterField: 'createdAt',
  defaultSort: {
    sortOrder: 'DESC',
    sortField: 'created_at',
  },
  importable: true,
  fields: {
    date: {
      name: 'banking.field.date',
      column: 'date',
      fieldType: 'date',
    },
    payee: {
      name: 'banking.field.payee',
      column: 'payee',
      fieldType: 'text',
    },
    description: {
      name: 'banking.field.description',
      column: 'description',
      fieldType: 'text',
    },
    referenceNo: {
      name: 'banking.field.reference_no',
      column: 'reference_no',
      fieldType: 'text',
    },
    amount: {
      name: 'banking.field.amount',
      column: 'Amount',
      fieldType: 'numeric',
      required: true,
    },
    account: {
      name: 'banking.field.account',
      column: 'account_id',
      fieldType: 'relation',
      to: { model: 'Account', to: 'id' },
    },
    createdAt: {
      name: 'banking.field.created_at',
      column: 'createdAt',
      fieldType: 'date',
      importable: false,
    },
  },
  fields2: {
    date: {
      name: 'banking.field.date',
      fieldType: 'date',
      required: true,
    },
    payee: {
      name: 'banking.field.payee',
      fieldType: 'text',
    },
    description: {
      name: 'banking.field.description',
      fieldType: 'text',
    },
    referenceNo: {
      name: 'banking.field.reference_no',
      fieldType: 'text',
    },
    amount: {
      name: 'banking.field.amount',
      fieldType: 'number',
      required: true,
    },
  },
};
