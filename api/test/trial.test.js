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

function mockGraph(status = 202) {
  const sends = [];
  globalThis.fetch = async (url, init) => {
    if (url.includes('login.microsoftonline.com')) return new Response(JSON.stringify({ access_token: 'tok', expires_in: 3600 }), { status: 200 });
    sends.push(JSON.parse(init.body).message);
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

const good = { name: 'Sam Lee', email: 'sam@example.com', business: 'Lee Plumbing', staff: '6 to 20', companies: '2 or 3', elapsed: '8000', company_website: '' };

test('a licence request goes to support@ with reply-to the person', async () => {
  resetTokenCache();
  const sends = mockGraph();
  const res = await trial(request(good), context);
  assert.equal(res.status, 200);
  assert.equal(sends.length, 1);
  assert.equal(sends[0].toRecipients[0].emailAddress.address, 'support@jurnl.com.au');
  assert.deepEqual(sends[0].replyTo[0].emailAddress, { address: 'sam@example.com', name: 'Sam Lee' });
  assert.equal(sends[0].subject, 'Jurnl trial licence request: Sam Lee (Lee Plumbing)');
  assert.match(sends[0].body.content, /Reply to this email with the licence/);
  assert.match(sends[0].body.content, /6 to 20/);
  assert.match(sends[0].body.content, /2 or 3/);
});

test('nothing is ever emailed to the person who filled it in', async () => {
  process.env.TRIAL_DOWNLOAD_URL = 'https://downloads.example.net/jurnl';
  const sends = mockGraph();
  await trial(request(good), context);
  delete process.env.TRIAL_DOWNLOAD_URL;
  assert.equal(sends.length, 1);
  assert.equal(sends[0].toRecipients[0].emailAddress.address, 'support@jurnl.com.au');
});

test('a send failure tells them to email support@', async () => {
  resetTokenCache();
  mockGraph(403);
  const res = await trial(request(good), context);
  assert.equal(res.status, 502);
  assert.match(res.jsonBody.message, /support@jurnl\.com\.au/);
});

test('honeypot submissions send nothing', async () => {
  const sends = mockGraph();
  const res = await trial(request({ ...good, company_website: 'x' }), context);
  assert.equal(res.status, 200);
  assert.equal(sends.length, 0);
});
