'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { HttpRequest } = require('@azure/functions');
const { resetTokenCache } = require('../src/lib/mail');
const { contact } = require('../src/functions/contact');

process.env.GRAPH_TENANT_ID = 'tenant';
process.env.GRAPH_CLIENT_ID = 'client';
process.env.GRAPH_CLIENT_SECRET = 'secret';

const context = { log() {}, error() {} };

function mockGraph(sendStatus = 202) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    if (url.includes('login.microsoftonline.com')) return new Response(JSON.stringify({ access_token: 'tok', expires_in: 3600 }), { status: 200 });
    return new Response(sendStatus === 202 ? null : '{"error":{"code":"ErrorAccessDenied"}}', { status: sendStatus });
  };
  return calls;
}

function formRequest(fields, accept = 'text/html') {
  return new HttpRequest({
    method: 'POST',
    url: 'https://example.net/api/contact',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept },
    body: { string: new URLSearchParams(fields).toString() },
  });
}

const good = { name: 'Alex Test', email: 'alex@example.com', phone: '', topic: 'The free trial', message: 'Hello\r\nSecond line <b>', elapsed: '9000', company_website: '' };

test('sends the enquiry to support@ with reply-to the sender, then redirects', async () => {
  resetTokenCache();
  const calls = mockGraph();
  const res = await contact(formRequest(good), context);
  assert.equal(res.status, 303);
  assert.equal(res.headers.Location, '/contact/thanks/');
  const send = calls.find((c) => c.url.includes('/sendMail'));
  assert.match(send.url, /users\/support%40jurnl\.com\.au\/sendMail$/);
  assert.equal(send.init.headers.Authorization, 'Bearer tok');
  const { message } = JSON.parse(send.init.body);
  assert.equal(message.toRecipients[0].emailAddress.address, 'support@jurnl.com.au');
  assert.deepEqual(message.replyTo[0].emailAddress, { address: 'alex@example.com', name: 'Alex Test' });
  assert.equal(message.subject, 'Jurnl enquiry: The free trial (Alex Test)');
  assert.match(message.body.content, /Hello\nSecond line &lt;b&gt;/);
});

test('JSON callers get JSON', async () => {
  mockGraph();
  const res = await contact(formRequest(good, 'application/json'), context);
  assert.equal(res.status, 200);
  assert.equal(res.jsonBody.ok, true);
});

test('missing fields and bad email are rejected without sending', async () => {
  const calls = mockGraph();
  const res = await contact(formRequest({ ...good, name: ' ', email: 'nope' }, 'application/json'), context);
  assert.equal(res.status, 400);
  assert.match(res.jsonBody.message, /fill in name/);
  assert.match(res.jsonBody.message, /email address/);
  assert.equal(calls.length, 0);
});

test('honeypot and too-fast submissions look accepted but send nothing', async () => {
  const calls = mockGraph();
  assert.equal((await contact(formRequest({ ...good, company_website: 'http://spam' }), context)).status, 303);
  assert.equal((await contact(formRequest({ ...good, elapsed: '400' }), context)).status, 303);
  assert.equal(calls.length, 0);
});

test('unknown topic falls back to Something else; subject has no line breaks', async () => {
  const calls = mockGraph();
  await contact(formRequest({ ...good, topic: 'x\r\nBcc: evil@example.com', name: 'A\nB' }), context);
  const { message } = JSON.parse(calls.find((c) => c.url.includes('/sendMail')).init.body);
  assert.equal(message.subject, 'Jurnl enquiry: Something else (A B)');
});

test('a Graph failure tells the person to email instead', async () => {
  resetTokenCache();
  mockGraph(403);
  const res = await contact(formRequest(good, 'application/json'), context);
  assert.equal(res.status, 502);
  assert.match(res.jsonBody.message, /support@jurnl\.com\.au/);
  const html = await contact(formRequest(good), context);
  assert.equal(html.status, 502);
  assert.match(html.body, /could not be sent/);
});

test('missing settings fail cleanly', async () => {
  resetTokenCache();
  const saved = process.env.GRAPH_CLIENT_SECRET;
  delete process.env.GRAPH_CLIENT_SECRET;
  mockGraph();
  const res = await contact(formRequest(good, 'application/json'), context);
  process.env.GRAPH_CLIENT_SECRET = saved;
  assert.equal(res.status, 502);
});
