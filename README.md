# Jurnl website

Public website for Jurnl, payroll and accounting for Australian small businesses, made by ESalary Pty Ltd. Built with [Astro](https://astro.build); the same setup as the eSalary website.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Where things are

| What | Where |
| --- | --- |
| Product facts, menu, site map | `src/data/site.ts` |
| Brand colours, fonts, styling | `src/styles/global.css` |
| Homepage | `src/pages/index.astro` |
| Feature pages (Markdown) | `src/pages/features/` |
| Security, salary packaging, legal pages | `src/pages/*.md` |
| FAQ, contact | `src/pages/faq.astro`, `src/pages/contact.astro` |
| Logos and favicons (from the Jurnl logo kit) | `public/` |
| Screenshots | `public/images/screens/` (see below) |

## Content source

All product claims come from the "Jurnl: website content source" doc. Keep copy inside its "Facts, limits and what's coming" section.

## Screenshots

Pages show a labelled placeholder until the image is added to `public/images/screens/` with these names:

| File | Shows |
| --- | --- |
| pay-run.png | Pay run |
| pay-slip.png | Pay slip |
| invoice-payments.png | Invoice with payments and credit notes |
| credit-note.png | Credit note PDF |
| stp-breakdown.png | STP Phase 2 breakdown |
| gst-detail.png | GST detail |
| people-roles.png | People and roles |

## Still to do

- [ ] Screenshots
- [ ] Trial and contact forms (Azure Functions at `/api/trial` and `/api/contact`)
- [x] Jurnl support email: support@jurnl.com.au
- [ ] Pricing
- [ ] Hosting on Azure Static Web Apps and the jurnl.com.au domain
