'use strict';

// Free trial requests from the public Free trial page. support@ gets the request with the hidden
// download page's address ready to paste into the reply (Reply goes to the person).

const { app } = require('@azure/functions');
const { formHandler, emailHtml } = require('../lib/forms');
const { sendMail } = require('../lib/mail');

const MAILBOX = 'support@jurnl.com.au';
// Same as hiddenDownload in src/data/site.ts (a test checks they match).
const HIDDEN_DOWNLOAD = '/trial-fne2g6c9hb/';

const STAFF = ['Just me', '2 to 5', '6 to 20', 'More than 20'];
const PLATFORMS = ['Windows', 'Mac'];

/** The site's own address (the test site or www.jurnl.com.au), from the request. */
function siteOrigin(request) {
  const forwarded = (request.headers.get('x-forwarded-host') || '').split(',')[0].trim();
  const url = new URL(request.url);
  const host = /^[a-z0-9.-]+(:\d+)?$/i.test(forwarded) ? forwarded : url.host;
  return `https://${host}`;
}

function trialHandler(request, context) {
  const link = siteOrigin(request) + HIDDEN_DOWNLOAD;
  return formHandler({
    thanks: '/download/thanks/',
    back: '/download/',
    fallbackEmail: MAILBOX,
    fields: {
      name: { label: 'Name', max: 100, required: true },
      email: { label: 'Email', max: 200, required: true, email: true },
      business: { label: 'Business name', max: 150 },
      staff: { label: 'How many people do you pay', max: 20, options: STAFF },
      platform: { label: 'Computer', max: 10, options: PLATFORMS },
    },
    async send(f) {
      await sendMail({
        from: MAILBOX,
        to: MAILBOX,
        replyTo: { address: f.email, name: f.name },
        subject: `Jurnl trial request: ${f.name}${f.business ? ` (${f.business})` : ''}`,
        html: emailHtml(
          `New trial request. Reply to this email with the download link: ${link}`,
          [
            ['Name', f.name],
            ['Email', f.email],
            ['Business', f.business],
            ['People paid', f.staff],
            ['Computer', f.platform],
            ['Download link', link],
          ],
        ),
      });
    },
  })(request, context);
}

app.http('trial', { methods: ['POST'], authLevel: 'anonymous', handler: trialHandler });

module.exports = { trial: trialHandler, HIDDEN_DOWNLOAD };
