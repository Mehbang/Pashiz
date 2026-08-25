import {
  CreditNotePaperTemplate,
  CreditNotePaperTemplateProps,
} from '../components/CreditNotePaperTemplate';
import { renderSSR, RenderSSROptions } from './render-ssr';

/**
 * Renders credit note paper template html.
 * @param {CreditNotePaperTemplateProps} props
 * @returns {string}
 */
export const renderCreditNotePaperTemplateHtml = (
  props: CreditNotePaperTemplateProps,
  options?: RenderSSROptions
) => {
  return renderSSR(<CreditNotePaperTemplate {...props} />, options);
};

