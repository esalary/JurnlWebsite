// Single source for product facts, navigation and the site map.
// Facts here must stay within "Facts, limits and what's coming" in the Jurnl website content source.

export const product = {
  name: 'Jurnl',
  version: '2.4.0',
  released: '16 November 2026',
  taxYear: '2026–27',
  platforms: 'Windows and Mac',
  company: 'ESalary Pty Ltd',
  abn: '71 119 121 023',
  email: 'support@jurnl.com.au',
  location: 'Canberra, ACT',
};

export type Page = { title: string; href: string };
export type Section = { key: string; title: string; href: string; pages: Page[] };

export const sections: Section[] = [
  {
    key: 'features',
    title: 'Features',
    href: '/features/',
    pages: [
      { title: 'All features', href: '/features/' },
      { title: 'Payroll and leave', href: '/features/payroll/' },
      { title: 'Single Touch Payroll', href: '/features/stp/' },
      { title: 'Invoicing', href: '/features/invoicing/' },
      { title: 'Bills and bank', href: '/features/bills-and-bank/' },
      { title: 'BAS and reports', href: '/features/bas-and-reports/' },
      { title: 'Companies and moving in', href: '/features/companies/' },
    ],
  },
  { key: 'security', title: 'Security', href: '/security/', pages: [] },
  { key: 'packaging', title: 'For salary packaging', href: '/salary-packaging/', pages: [] },
  { key: 'faq', title: 'FAQ', href: '/faq/', pages: [] },
];

export const sectionByKey = (key: string) => sections.find((s) => s.key === key);
