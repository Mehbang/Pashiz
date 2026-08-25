import {
  ReceiptPaperTemplate,
  ReceiptPaperTemplateProps,
} from '../components/ReceiptPaperTemplate';
import { renderSSR, RenderSSROptions } from './render-ssr';

export const renderReceiptPaperTemplateHtml = (
  props: ReceiptPaperTemplateProps,
  options?: RenderSSROptions
) => {
  return renderSSR(<ReceiptPaperTemplate {...props} />, options);
};
