// Single source for product facts, navigation and the site map.
// Facts here must stay within "Facts, limits and what's coming" in the Jurnl website content source.

export const product = {
  name: 'Jurnl',
  version: '2.6.3',
  released: '23 November 2026',
  taxYear: '2026–27',
  platforms: 'Windows and Mac',
  company: 'ESalary Pty Ltd',
  abn: '71 119 121 023',
  email: 'support@jurnl.com.au', // aliases on the same shared mailbox: hello@, privacy@
  privacyEmail: 'privacy@jurnl.com.au',
  location: 'Canberra, ACT',
};

// Installers for the current release. Beta releases are GitHub pre-releases, so the links name the
// tag (GitHub's latest/download links only follow stable releases). Each release: change version and tag.
const releases = 'https://github.com/esalary/jurnl-releases/releases/download';
export const download = {
  version: '2.6.3',
  channel: 'beta',
  tag: 'v2.6.3',
  windows: { label: 'Windows', file: 'JurnlApp-win-x64-beta-Setup.exe', size: '58 MB', needs: 'Windows 10 or 11, 64-bit' },
  mac: { label: 'Mac', file: 'JurnlApp-osx-arm64-beta-Setup.pkg', size: '46 MB', needs: 'Apple silicon (M1 or later)' },
  url(file: string) {
    return `${releases}/${this.tag}/${file}`;
  },
};

// The hidden download page: not linked from anywhere and not indexed. Send this address to people
// after they register their interest. To retire it, rename the folder in src/pages and public (and
// HIDDEN_DOWNLOAD in api/src/functions/trial.js); old links then stop working.
export const hiddenDownload = '/trial-fne2g6c9hb/';

// User manual (on the hidden page only): replace public/trial-fne2g6c9hb/Jurnl-User-Manual.pdf with each release.
export const manual = {
  href: '/trial-fne2g6c9hb/Jurnl-User-Manual.pdf',
  version: '2.6.3',
  size: '450 KB',
  pages: 16,
};

// Without a licence (from the manual's "Your licence").
export const unlicensed = { companies: 1, employees: 3, text: 'one company and up to three employees' };

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
      { title: 'Read-only copies', href: '/features/read-only-copies/' },
    ],
  },
  { key: 'security', title: 'Security', href: '/security/', pages: [] },
  { key: 'packaging', title: 'For salary packaging', href: '/salary-packaging/', pages: [] },
  { key: 'faq', title: 'FAQ', href: '/faq/', pages: [] },
];

export const sectionByKey = (key: string) => sections.find((s) => s.key === key);
