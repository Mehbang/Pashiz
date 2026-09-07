import { Features } from '@/common/types/Features';

export const BillMeta = {
  defaultFilterField: 'vendor',
  defaultSort: {
    sortOrder: 'DESC',
    sortField: 'bill_date',
  },
  importable: true,
  exportFlattenOn: 'entries',
  exportable: true,
  importAggregator: 'group',
  importAggregateOn: 'entries',
  importAggregateBy: 'billNumber',
  print: {
    pageTitle: 'Bills',
  },
  fields: {
    vendor: {
      name: 'bill.field.vendor',
      column: 'vendor_id',
      fieldType: 'relation',

      relationType: 'enumeration',
      relationKey: 'vendor',

      relationEntityLabel: 'display_name',
      relationEntityKey: 'id',
    },
    bill_number: {
      name: 'bill.field.bill_number',
      column: 'bill_number',
      columnable: true,
      fieldType: 'text',
    },
    bill_date: {
      name: 'bill.field.bill_date',
      column: 'bill_date',
      columnable: true,
      fieldType: 'date',
    },
    due_date: {
      name: 'bill.field.due_date',
      column: 'due_date',
      columnable: true,
      fieldType: 'date',
    },
    reference_no: {
      name: 'bill.field.reference_no',
      column: 'reference_no',
      columnable: true,
      fieldType: 'text',
    },
    status: {
      name: 'bill.field.status',
      fieldType: 'enumeration',
      columnable: true,
      options: [
        { label: 'bill.field.status.paid', key: 'paid' },
        { label: 'bill.field.status.partially-paid', key: 'partially-paid' },
        { label: 'bill.field.status.overdue', key: 'overdue' },
        { label: 'bill.field.status.unpaid', key: 'unpaid' },
        { label: 'bill.field.status.opened', key: 'opened' },
        { label: 'bill.field.status.draft', key: 'draft' },
      ],
      filterCustomQuery: StatusFieldFilterQuery,
      sortCustomQuery: StatusFieldSortQuery,
    },
    amount: {
      name: 'bill.field.amount',
      column: 'amount',
      fieldType: 'number',
    },
    payment_amount: {
      name: 'bill.field.payment_amount',
      column: 'payment_amount',
      fieldType: 'number',
    },
    note: {
      name: 'bill.field.note',
      column: 'note',
      fieldType: 'text',
    },
    created_at: {
      name: 'bill.field.created_at',
      column: 'created_at',
      fieldType: 'date',
    },
  },
  columns: {
    billDate: {
      name: 'resource.date',
      accessor: 'formattedBillDate',
    },
    billNumber: {
      name: 'resource.bill_no',
      type: 'text',
    },
    referenceNo: {
      name: 'resource.reference_no',
      type: 'text',
    },
    dueDate: {
      name: 'resource.due_date',
      type: 'date',
      accessor: 'formattedDueDate',
    },
    vendorId: {
      name: 'resource.vendor',
      accessor: 'vendor.displayName',
      type: 'text',
    },
    amount: {
      name: 'resource.amount',
      accessor: 'formattedAmount',
    },
    exchangeRate: {
      name: 'resource.exchange_rate',
      type: 'number',
      printable: false,
    },
    currencyCode: {
      name: 'resource.currency_code',
      type: 'text',
      printable: false,
    },
    dueAmount: {
      name: 'resource.due_amount',
      accessor: 'formattedDueAmount',
    },
    paidAmount: {
      name: 'resource.paid_amount',
      accessor: 'formattedPaymentAmount',
    },
    note: {
      name: 'resource.note',
      type: 'text',
      printable: false,
    },
    open: {
      name: 'resource.open',
      type: 'boolean',
      printable: false,
    },
    entries: {
      name: 'resource.entries',
      accessor: 'entries',
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
    billNumber: {
      name: 'bill.field.bill_number',
      fieldType: 'text',
      required: true,
    },
    referenceNo: {
      name: 'bill.field.reference_no',
      fieldType: 'text',
    },
    billDate: {
      name: 'bill.field.bill_date',
      fieldType: 'date',
      required: true,
    },
    dueDate: {
      name: 'bill.field.due_date',
      fieldType: 'date',
      required: true,
    },
    vendorId: {
      name: 'bill.field.vendor',
      fieldType: 'relation',
      relationModel: 'Contact',
      relationImportMatch: 'displayName',
      required: true,
    },
    exchangeRate: {
      name: 'bill.field.exchange_rate',
      fieldType: 'number',
    },
    note: {
      name: 'bill.field.note',
      fieldType: 'text',
    },
    open: {
      name: 'bill.field.open',
      fieldType: 'boolean',
    },
    entries: {
      name: 'bill.field.entries',
      fieldType: 'collection',
      collectionOf: 'object',
      collectionMinLength: 1,
      required: true,
      fields: {
        itemId: {
          name: 'bill.field.item',
          fieldType: 'relation',
          relationModel: 'Item',
          relationImportMatch: ['name', 'code'],
          required: true,
          importHint: 'bill.field.item_hint',
        },
        rate: {
          name: 'bill.field.rate',
          fieldType: 'number',
          required: true,
        },
        quantity: {
          name: 'bill.field.quantity',
          fieldType: 'number',
          required: true,
        },
        description: {
          name: 'bill.field.description',
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

/**
 * Status field filter custom query.
 */
function StatusFieldFilterQuery(query, role) {
  query.modify('statusFilter', role.value);
}

/**
 * Status field sort custom query.
 */
function StatusFieldSortQuery(query, role) {
  query.modify('sortByStatus', role.order);
}
