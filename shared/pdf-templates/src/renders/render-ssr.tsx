import { renderToString } from 'react-dom/server';
import createCache from '@emotion/cache';
import { extractCritical } from '@emotion/server';
import { OpenSansFontLink, VazirmatnFontLink } from '../constants';
import { PaperTemplateLayout } from '../components/PaperTemplateLayout';

/** Languages whose documents are laid out right-to-left. */
const RTL_LANGUAGES = ['fa', 'ar'];

export interface RenderSSROptions {
  /** Language of the organization the document belongs to. */
  lang?: string;
}

export const renderSSR = (
  children: React.ReactNode,
  { lang = 'en' }: RenderSSROptions = {}
) => {
  const key = 'invoice-paper-template';
  const cache = createCache({ key });
  const isRtl = RTL_LANGUAGES.includes(lang);

  const renderedHtml = renderToString(
    <PaperTemplateLayout cache={cache} lang={lang}>
      {children}
    </PaperTemplateLayout>
  );
  const extractedHtml = extractCritical(renderedHtml);

  return `<!DOCTYPE html>
<html lang="${lang}"${isRtl ? ' dir="rtl"' : ''}>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Invoice</title>
    ${OpenSansFontLink}
    ${lang === 'fa' ? VazirmatnFontLink : ''}
    <style data-emotion="${key} ${extractedHtml.ids.join(' ')}">${extractedHtml.css
    }</style>
</head>
<body>
    <div id="root">${extractedHtml.html}</div>
</body>
</html>`;
};
