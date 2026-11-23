'use strict';

// Free trial licence requests from the Download page. The installers are on the site itself,
// so this only tells support@, who replies with the licence (Reply goes to the person).

const { app } = require('@azure/functions');
const { formHandler, emailHtml } = require('../lib/forms');
const { sendMail } = require('../lib/mail');

const MAILBOX = 'support@jurnl.com.au';

const STAFF = ['Just me', '2 to 5', '6 to 20', 'More than 20'];
const COMPANIES = ['1', '2 or 3', 'More than 3'];

const trial = formHandler({
  thanks: '/download/thanks/',
  back: '/download/#licence',
  fallbackEmail: MAILBOX,
  fields: {
    name: { label: 'Name', max: 100, required: true },
    email: { label: 'Email', max: 200, required: true, email: true },
    business: { label: 'Business name', max: 150 },
    staff: { label: 'How many people do you pay', max: 20, options: STAFF },
    companies: { label: 'How many companies', max: 20, options: COMPANIES },
  },
  async send(f) {
    await sendMail({
      from: MAILBOX,
      to: MAILBOX,
      replyTo: { address: f.email, name: f.name },
      subject: `Jurnl trial licence request: ${f.name}${f.business ? ` (${f.business})` : ''}`,
      html: emailHtml(
        'New trial licence request. Reply to this email with the licence.',
        [
          ['Name', f.name],
          ['Email', f.email],
          ['Business', f.business],
          ['People paid', f.staff],
          ['Companies', f.companies],
        ],
      ),
    });
  },
});

app.http('trial', { methods: ['POST'], authLevel: 'anonymous', handler: trial });

module.exports = { trial };
