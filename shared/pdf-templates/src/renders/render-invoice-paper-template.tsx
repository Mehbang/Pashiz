import {
  InvoicePaperTemplate,
  InvoicePaperTemplateProps,
} from '../components/InvoicePaperTemplate';
import { renderSSR, RenderSSROptions } from './render-ssr';

export const renderInvoicePaperTemplateHtml = (
  props: InvoicePaperTemplateProps,
  options?: RenderSSROptions
) => {
  return renderSSR(<InvoicePaperTemplate {...props} />, options);
};
