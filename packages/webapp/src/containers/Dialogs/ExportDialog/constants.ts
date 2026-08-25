import intl from 'react-intl-universal';
export const ExportResources = [
  { value: 'account', text: intl.get('accounts') },
  { value: 'item', text: intl.get('items') },
  { value: 'item_category', text: intl.get('resource_item_category_plural') },
  { value: 'customer', text: intl.get('customers') },
  { value: 'vendor', text: intl.get('vendors') },
  { value: 'manual_journal', text: intl.get('manual_journal') },
  { value: 'expense', text: intl.get('expenses') },
  { value: 'sale_invoice', text: intl.get('invoices') },
  { value: 'sale_estimate', text: ' Estimates' },
  { value: 'sale_receipt', text: intl.get('receipts') },
  {
    value: 'payment_receive',
    text: intl.get('resource_payment_received_plural'),
  },
  { value: 'credit_note', text: intl.get('resource_credit_note_plural') },
  { value: 'bill', text: intl.get('bills') },
  { value: 'bill_payment', text: intl.get('bill_payments') },
  { value: 'vendor_credit', text: intl.get('sidebar_vendor_credits') },
  { value: 'tax_rate', text: intl.get('tax_rate') },
];
