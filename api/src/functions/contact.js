'use strict';

const { app } = require('@azure/functions');
const { formHandler, emailHtml } = require('../lib/forms');
const { sendMail } = require('../lib/mail');

const MAILBOX = 'support@jurnl.com.au';

const TOPICS = ['A question about Jurnl', 'The free trial', 'Pricing', 'Something else'];

const contact = formHandler({
  thanks: '/contact/thanks/',
  back: '/contact/',
  fallbackEmail: MAILBOX,
  fields: {
    name: { label: 'Name', max: 100, required: true },
    email: { label: 'Email', max: 200, required: true, email: true },
    topic: { label: 'About', max: 60, options: TOPICS },
    message: { label: 'Message', max: 5000, required: true, multiline: true },
  },
  async send(f) {
    await sendMail({
      from: MAILBOX,
      to: MAILBOX,
      replyTo: { address: f.email, name: f.name },
      subject: `Jurnl enquiry: ${f.topic || 'General'} (${f.name})`,
      html: emailHtml(
        'New enquiry from the Jurnl website. Reply to this email to answer.',
        [
          ['Name', f.name],
          ['Email', f.email],
          ['About', f.topic],
        ],
        f.message,
      ),
    });
  },
});

app.http('contact', { methods: ['POST'], authLevel: 'anonymous', handler: contact });

module.exports = { contact };
