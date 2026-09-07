export const ManualJournalMeta = {
  defaultFilterField: 'date',
  defaultSort: {
    sortOrder: 'DESC',
    sortField: 'name',
  },
  importable: true,
  exportFlattenOn: 'entries',

  exportable: true,
  importAggregator: 'group',
  importAggregateOn: 'entries',
  importAggregateBy: 'journalNumber',

  print: {
    pageTitle: 'Manual Journals',
  },

  fields: {
    date: {
      name: 'manual_journal.field.date',
      column: 'date',
      fieldType: 'date',
    },
    journal_number: {
      name: 'manual_journal.field.journal_number',
      column: 'journal_number',
      fieldType: 'text',
    },
    reference: {
      name: 'manual_journal.field.reference',
      column: 'reference',
      fieldType: 'text',
    },
    journal_type: {
      name: 'manual_journal.field.journal_type',
      column: 'journal_type',
      fieldType: 'text',
    },
    amount: {
      name: 'manual_journal.field.amount',
      column: 'amount',
      fieldType: 'number',
    },
    description: {
      name: 'manual_journal.field.description',
      column: 'description',
      fieldType: 'text',
    },
    status: {
      name: 'manual_journal.field.status',
      column: 'status',
      fieldType: 'enumeration',
      options: [
        { key: 'draft', label: 'Draft' },
        { key: 'published', label: 'published' },
      ],
      filterCustomQuery: StatusFieldFilterQuery,
      sortCustomQuery: StatusFieldSortQuery,
    },
    created_at: {
      name: 'manual_journal.field.created_at',
      column: 'created_at',
      fieldType: 'date',
    },
  },
  columns: {
    date: {
      name: 'manual_journal.field.date',
      type: 'date',
      accessor: 'formattedDate',
    },
    journalNumber: {
      name: 'manual_journal.field.journal_number',
      type: 'text',
    },
    reference: {
      name: 'manual_journal.field.reference',
      type: 'text',
    },
    journalType: {
      name: 'manual_journal.field.journal_type',
      type: 'text',
    },
    amount: {
      name: 'resource.amount',
      accessor: 'formattedAmount',
    },
    currencyCode: {
      name: 'manual_journal.field.currency',
      type: 'text',
      printable: false,
    },
    exchangeRate: {
      name: 'manual_journal.field.exchange_rate',
      type: 'number',
      printable: false,
    },
    description: {
      name: 'manual_journal.field.description',
      type: 'text',
    },
    entries: {
      name: 'resource.entries',
      type: 'collection',
      collectionOf: 'object',
      columns: {
        credit: {
          name: 'resource.credit',
          type: 'text',
        },
        debit: {
          name: 'resource.debit',
          type: 'text',
        },
        account: {
          name: 'resource.account',
          accessor: 'account.name',
        },
        contact: {
          name: 'resource.contact',
          accessor: 'contact.displayName',
        },
        note: {
          name: 'resource.note',
        },
      },
      publish: {
        name: 'resource.publish',
        type: 'boolean',
        printable: false,
      },
      publishedAt: {
        name: 'resource.published_at',
        printable: false,
      },
    },
    createdAt: {
      name: 'resource.created_at',
      accessor: 'formattedCreatedAt',
      printable: false,
    },
  },
  fields2: {
    date: {
      name: 'manual_journal.field.date',
      fieldType: 'date',
      required: true,
    },
    journalNumber: {
      name: 'manual_journal.field.journal_number',
      fieldType: 'text',
      required: true,
    },
    reference: {
      name: 'manual_journal.field.reference',
      fieldType: 'text',
    },
    journalType: {
      name: 'manual_journal.field.journal_type',
      fieldType: 'text',
    },
    currencyCode: {
      name: 'manual_journal.field.currency',
      fieldType: 'text',
    },
    exchange_rate: {
      name: 'manual_journal.field.exchange_rate',
      fieldType: 'number',
    },
    description: {
      name: 'manual_journal.field.description',
      fieldType: 'text',
    },
    entries: {
      name: 'resource.entries',
      fieldType: 'collection',
      collectionOf: 'object',
      collectionMinLength: 2,
      required: true,
      fields: {
        credit: {
          name: 'resource.credit',
          fieldType: 'number',
          required: true,
        },
        debit: {
          name: 'resource.debit',
          fieldType: 'number',
          required: true,
        },
        accountId: {
          name: 'resource.account',
          fieldType: 'relation',
          relationModel: 'Account',
          relationImportMatch: ['name', 'code'],
          required: true,
        },
        contact: {
          name: 'resource.contact',
          fieldType: 'relation',
          relationModel: 'Contact',
          relationImportMatch: 'displayName',
        },
        note: {
          name: 'resource.note',
          fieldType: 'text',
        },
      },
    },
    publish: {
      name: 'resource.publish',
      fieldType: 'boolean',
    },
  },
};

/**
 * Status field sorting custom query.
 */
function StatusFieldSortQuery(query, role) {
  return query.modify('sortByStatus', role.order);
}

/**
 * Status field filter custom query.
 */
function StatusFieldFilterQuery(query, role) {
  query.modify('filterByStatus', role.value);
}
