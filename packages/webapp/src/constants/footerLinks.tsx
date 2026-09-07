import intl from 'react-intl-universal';

// The upstream project's own documentation and support channels. They stay
// because they are where this software is actually documented; the bare brand
// link was dropped, since it pointed a Pashiz operator at another product's
// home page rather than at any help.
export const getFooterLinks = (): Array<{ title: string; link: string }> => [
  {
    title: intl.get('blog'),
    link: 'https://docs.bigcapital.ly/blog',
  },
  {
    title: intl.get('community'),
    link: 'https://discord.com/invite/c8nPBJafeb',
  },
  {
    title: intl.get('support'),
    link: 'https://discord.com/invite/c8nPBJafeb',
  },
  {
    title: intl.get('docs'),
    link: 'https://docs.bigcapital.ly',
  },
];
