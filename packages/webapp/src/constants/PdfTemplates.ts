import intl from 'react-intl-universal';

/**
 * The filler shown in the invoice-branding preview before a real document is
 * loaded. It used to be the upstream company's own name, US address and email,
 * which a Persian organization saw while designing its own invoice.
 */
export const DefaultPdfTemplateTerms = intl.get('pdf_sample.terms');

export const DefaultPdfTemplateStatement = intl.get('pdf_sample.statement');

export const DefaultPdfTemplateItemName = intl.get('web_development');

export const DefaultPdfTemplateItemDescription = intl.get(
  'pdf_sample.item_description',
);

export const DefaultPdfTemplateAddressBilledTo = intl.get(
  'pdf_sample.address_billed_to',
);

export const DefaultPdfTemplateAddressBilledFrom = intl.get(
  'pdf_sample.address_billed_from',
);
