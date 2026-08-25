import {
  EstimatePaperTemplate,
  EstimatePaperTemplateProps,
} from '../components/EstimatePaperTemplate';
import { renderSSR, RenderSSROptions } from './render-ssr';

/**
 * Renders estimate paper template html.
 * @param {EstimatePaperTemplateProps} props
 * @returns {string}
 */
export const renderEstimatePaperTemplateHtml = (
  props: EstimatePaperTemplateProps,
  options?: RenderSSROptions
) => {
  return renderSSR(<EstimatePaperTemplate {...props} />, options);
};
