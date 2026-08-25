import {
  PaymentReceivedPaperTemplateProps,
  PaymentReceivedPaperTemplate,
} from '../components/PaymentReceivedPaperTemplate';
import { renderSSR, RenderSSROptions } from './render-ssr';

export const renderPaymentReceivedPaperTemplateHtml = (
  props: PaymentReceivedPaperTemplateProps,
  options?: RenderSSROptions
) => {
  return renderSSR(<PaymentReceivedPaperTemplate {...props} />, options);
};
