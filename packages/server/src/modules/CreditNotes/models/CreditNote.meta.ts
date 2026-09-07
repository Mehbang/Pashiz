import { Features } from '@/common/types/Features';

function StatusFieldFilterQuery(query, role) {
  query.modify('filterByStatus', role.value);
}

function StatusFieldSortQuery(query, role) {
  query.modify('sortByStatus', role.order);
}

export const CreditNoteMeta = {
  defaultFilterField: 'name',
  defaultSort: {
    sortOrder: 'DESC',
    sortField: 'name',
  },
  exportable: true,
  exportFlattenOn: 'entries',

  importable: true,
  importAggregator: 'group',
  importAggregateOn: 'entries',
  importAggregateBy: 'creditNoteNumber',

  print: {
    pageTitle: 'Credit Notes',
  },

  fields: {
    customer: {
      name: 'credit_note.field.customer',
      column: 'customer_id',
      fieldType: 'relation',

      relationType: 'enumeration',
      relationKey: 'customer',

      relationEntityLabel: 'display_name',
      relationEntityKey: 'id',
    },
    credit_date: {
      name: 'credit_note.field.credit_note_date',
      column: 'credit_note_date',
      fieldType: 'date',
    },
    credit_number: {
      name: 'credit_note.field.credit_note_number',
      column: 'credit_note_number',
      fieldType: 'text',
    },
    reference_no: {
      name: 'credit_note.field.reference_no',
      column: 'reference_no',
      fieldType: 'text',
    },
    amount: {
      name: 'credit_note.field.amount',
      column: 'amount',
      fieldType: 'number',
    },
    currency_code: {
      name: 'credit_note.field.currency_code',
      column: 'currency_code',
      fieldType: 'number',
    },
    note: {
      name: 'credit_note.field.note',
      column: 'note',
      fieldType: 'text',
    },
    terms_conditions: {
      name: 'credit_note.field.terms_conditions',
      column: 'terms_conditions',
      fieldType: 'text',
    },
    status: {
      name: 'credit_note.field.status',
      fieldType: 'enumeration',
      options: [
        { key: 'draft', label: 'credit_note.field.status.draft' },
        { key: 'published', label: 'credit_note.field.status.published' },
        { key: 'open', label: 'credit_note.field.status.open' },
        { key: 'closed', label: 'credit_note.field.status.closed' },
      ],
      filterCustomQuery: StatusFieldFilterQuery,
      sortCustomQuery: StatusFieldSortQuery,
    },
    created_at: {
      name: 'credit_note.field.created_at',
      column: 'created_at',
      fieldType: 'date',
    },
  },
  columns: {
    customer: {
      name: 'resource.customer',
      accessor: 'customer.displayName',
    },
    exchangeRate: {
      name: 'resource.exchange_rate',
      printable: false,
    },
    creditNoteDate: {
      name: 'resource.credit_note_date',
      accessor: 'formattedCreditNoteDate',
    },
    referenceNo: {
      name: 'resource.reference_no',
    },
    note: {
      name: 'resource.note',
    },
    termsConditions: {
      name: 'resource.terms_conditions',
      printable: false,
    },
    creditNoteNumber: {
      name: 'resource.credit_note_number',
      printable: false,
    },
    open: {
      name: 'resource.open',
      type: 'boolean',
      printable: false,
    },
    entries: {
      name: 'resource.entries',
      type: 'collection',
      collectionOf: 'object',
      columns: {
        itemName: {
          name: 'resource.item_name',
          accessor: 'item.name',
        },
        rate: {
          name: 'resource.item_rate',
          accessor: 'rateFormatted',
        },
        quantity: {
          name: 'resource.item_quantity',
          accessor: 'quantityFormatted',
        },
        description: {
          name: 'resource.item_description',
        },
        amount: {
          name: 'resource.item_amount',
          accessor: 'totalFormatted',
        },
      },
    },
    branch: {
      name: 'resource.branch',
      type: 'text',
      accessor: 'branch.name',
      features: [Features.BRANCHES],
    },
    warehouse: {
      name: 'resource.warehouse',
      type: 'text',
      accessor: 'warehouse.name',
      features: [Features.BRANCHES],
    },
  },
  fields2: {
    customerId: {
      name: 'credit_note.field.customer',
      fieldType: 'relation',
      relationModel: 'Contact',
      relationImportMatch: 'displayName',
      required: true,
    },
    exchangeRate: {
      name: 'credit_note.field.exchange_rate',
      fieldType: 'number',
    },
    creditNoteDate: {
      name: 'credit_note.field.credit_note_date',
      fieldType: 'date',
      required: true,
    },
    referenceNo: {
      name: 'credit_note.field.reference_no',
      fieldType: 'text',
    },
    note: {
      name: 'credit_note.field.note',
      fieldType: 'text',
    },
    termsConditions: {
      name: 'credit_note.field.terms_conditions',
      fieldType: 'text',
    },
    creditNoteNumber: {
      name: 'credit_note.field.credit_note_number',
      fieldType: 'text',
    },
    open: {
      name: 'credit_note.field.open',
      fieldType: 'boolean',
    },
    entries: {
      name: 'credit_note.field.entries',
      fieldType: 'collection',
      collectionOf: 'object',
      collectionMinLength: 1,
      fields: {
        itemId: {
          name: 'credit_note.field.item',
          fieldType: 'relation',
          relationModel: 'Item',
          relationImportMatch: ['name', 'code'],
          required: true,
          importHint: 'invoice.field.item_hint',
        },
        rate: {
          name: 'credit_note.field.rate',
          fieldType: 'number',
          required: true,
        },
        quantity: {
          name: 'credit_note.field.quantity',
          fieldType: 'number',
          required: true,
        },
        description: {
          name: 'credit_note.field.description',
          fieldType: 'text',
        },
      },
    },
    branchId: {
      name: 'invoice.field.branch',
      fieldType: 'relation',
      relationModel: 'Branch',
      relationImportMatch: ['name', 'code'],
      features: [Features.BRANCHES],
      required: true,
    },
    warehouseId: {
      name: 'invoice.field.warehouse',
      fieldType: 'relation',
      relationModel: 'Warehouse',
      relationImportMatch: ['name', 'code'],
      features: [Features.WAREHOUSES],
      required: true,
    },
  },
};
