'use strict';

const { app } = require('@azure/functions');
const { formHandler, emailHtml, escapeHtml } = require('../lib/forms');
const { sendMail } = require('../lib/mail');

const MAILBOX = 'support@jurnl.com.au';

const STAFF = ['Just me', '2 to 5', '6 to 20', 'More than 20'];
const PLATFORMS = ['Windows', 'Mac'];
const KEY = ["Not yet: I'll start without a key", 'Yes, please send me a trial key'];

// When TRIAL_DOWNLOAD_URL is set (Static Web App → Environment variables), the person is
// emailed the link straight away. Until then, support@ gets the request and sends it by hand.
function downloadUrl(env = process.env) {
  const url = (env.TRIAL_DOWNLOAD_URL || '').trim();
  return /^https:\/\//i.test(url) ? url : '';
}

function welcomeHtml(name, url, platform) {
  const first = escapeHtml(name.split(/\s+/)[0] || name);
  const link = escapeHtml(url);
  return `<div style="font:15px/1.6 Segoe UI,Arial,sans-serif;color:#1C2541;max-width:560px">
<p>Hi ${first},</p>
<p>Thanks for trying Jurnl. You can download it for ${escapeHtml(platform)} here:</p>
<p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#1C2541;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600">Download Jurnl</a></p>
<p>If the button doesn't work, copy this link into your browser:<br><a href="${link}">${link}</a></p>
<p>When you first open Jurnl, the setup wizard walks you through creating your company. If you have any questions, just reply to this email.</p>
<p>The Jurnl team<br><a href="https://www.jurnl.com.au">www.jurnl.com.au</a></p>
</div>`;
}

const trial = formHandler({
  thanks: '/download/thanks/',
  back: '/download/',
  fallbackEmail: MAILBOX,
  fields: {
    name: { label: 'Name', max: 100, required: true },
    email: { label: 'Email', max: 200, required: true, email: true },
    business: { label: 'Business name', max: 150 },
    staff: { label: 'How many people do you pay', max: 20, options: STAFF },
    platform: { label: 'Computer', max: 10, options: PLATFORMS },
    key: { label: 'Free trial key', max: 40, options: KEY },
  },
  async send(f, context) {
    const url = downloadUrl();
    const wantsKey = f.key === KEY[1];
    let sent = '';
    if (url) {
      try {
        await sendMail({
          from: MAILBOX,
          to: { address: f.email, name: f.name },
          subject: 'Your Jurnl free trial',
          html: welcomeHtml(f.name, url, f.platform || 'Windows'),
        });
        sent = 'Download link emailed automatically.';
      } catch (error) {
        context.error(error);
        sent = 'The automatic email FAILED: please send the download link by hand.';
      }
    }
    await sendMail({
      from: MAILBOX,
      to: MAILBOX,
      replyTo: { address: f.email, name: f.name },
      subject: `Jurnl trial request${wantsKey ? ' + trial key' : ''}: ${f.name}${f.business ? ` (${f.business})` : ''}`,
      html: emailHtml(
        [sent || 'New trial request. Reply to this email with the download link.', wantsKey ? 'They would like a free trial key.' : '']
          .filter(Boolean)
          .join(' '),
        [
          ['Name', f.name],
          ['Email', f.email],
          ['Business', f.business],
          ['People paid', f.staff],
          ['Computer', f.platform],
          ['Trial key', wantsKey ? 'Yes, send a trial key' : 'Not yet'],
        ],
      ),
    });
  },
});

app.http('trial', { methods: ['POST'], authLevel: 'anonymous', handler: trial });

module.exports = { trial, welcomeHtml };
