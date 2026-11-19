'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { HttpRequest } = require('@azure/functions');
const { resetTokenCache } = require('../src/lib/mail');
const { trial } = require('../src/functions/trial');

process.env.GRAPH_TENANT_ID = 'tenant';
process.env.GRAPH_CLIENT_ID = 'client';
process.env.GRAPH_CLIENT_SECRET = 'secret';
const context = { log() {}, error() {} };

function mockGraph(statusFor = () => 202) {
  const sends = [];
  globalThis.fetch = async (url, init) => {
    if (url.includes('login.microsoftonline.com')) return new Response(JSON.stringify({ access_token: 'tok', expires_in: 3600 }), { status: 200 });
    const message = JSON.parse(init.body).message;
    sends.push(message);
    const status = statusFor(message);
    return new Response(status === 202 ? null : 'denied', { status });
  };
  return sends;
}

const request = (fields) =>
  new HttpRequest({
    method: 'POST',
    url: 'https://example.net/api/trial',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: { string: new URLSearchParams(fields).toString() },
  });

const good = { name: 'Sam Lee', email: 'sam@example.com', business: 'Lee Plumbing', staff: '2 to 5', platform: 'Mac', elapsed: '8000', company_website: '' };

test('without a download URL, only support@ is told', async () => {
  resetTokenCache();
  delete process.env.TRIAL_DOWNLOAD_URL;
  const sends = mockGraph();
  const res = await trial(request(good), context);
  assert.equal(res.status, 200);
  assert.equal(sends.length, 1);
  assert.equal(sends[0].toRecipients[0].emailAddress.address, 'support@jurnl.com.au');
  assert.equal(sends[0].subject, 'Jurnl trial request: Sam Lee (Lee Plumbing)');
  assert.match(sends[0].body.content, /Reply to this email with the download link/);
  assert.match(sends[0].body.content, /Mac/);
});

test('with a download URL, the person gets the link and support@ is told it was sent', async () => {
  process.env.TRIAL_DOWNLOAD_URL = 'https://downloads.example.net/jurnl?x=1&y=2';
  const sends = mockGraph();
  await trial(request(good), context);
  delete process.env.TRIAL_DOWNLOAD_URL;
  assert.equal(sends.length, 2);
  assert.equal(sends[0].toRecipients[0].emailAddress.address, 'sam@example.com');
  assert.equal(sends[0].subject, 'Your Jurnl free trial');
  assert.match(sends[0].body.content, /Hi Sam,/);
  assert.match(sends[0].body.content, /href="https:\/\/downloads\.example\.net\/jurnl\?x=1&amp;y=2"/);
  assert.match(sends[1].body.content, /emailed automatically/);
});

test('if the link email fails, support@ is still told to send it by hand', async () => {
  process.env.TRIAL_DOWNLOAD_URL = 'https://downloads.example.net/jurnl';
  const sends = mockGraph((m) => (m.toRecipients[0].emailAddress.address === 'sam@example.com' ? 403 : 202));
  const res = await trial(request(good), context);
  delete process.env.TRIAL_DOWNLOAD_URL;
  assert.equal(res.status, 200);
  assert.match(sends[1].body.content, /FAILED/);
});

test('a non-https download URL is ignored', async () => {
  process.env.TRIAL_DOWNLOAD_URL = 'javascript:alert(1)';
  const sends = mockGraph();
  await trial(request(good), context);
  delete process.env.TRIAL_DOWNLOAD_URL;
  assert.equal(sends.length, 1);
});

test('asking for a trial key shows in the subject and the email', async () => {
  delete process.env.TRIAL_DOWNLOAD_URL;
  const sends = mockGraph();
  await trial(request({ ...good, key: 'Yes, please send me a trial key' }), context);
  assert.equal(sends[0].subject, 'Jurnl trial request + trial key: Sam Lee (Lee Plumbing)');
  assert.match(sends[0].body.content, /would like a free trial key/);
  const plain = mockGraph();
  await trial(request(good), context);
  assert.match(plain[0].body.content, /Not yet/);
});

test('honeypot submissions send nothing', async () => {
  const sends = mockGraph();
  const res = await trial(request({ ...good, company_website: 'x' }), context);
  assert.equal(res.status, 200);
  assert.equal(sends.length, 0);
});
