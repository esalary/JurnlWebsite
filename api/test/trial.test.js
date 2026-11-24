'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { HttpRequest } = require('@azure/functions');
const { resetTokenCache } = require('../src/lib/mail');
const { trial, HIDDEN_DOWNLOAD } = require('../src/functions/trial');

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

const request = (fields, headers = {}) =>
  new HttpRequest({
    method: 'POST',
    url: 'https://calm-wave.example.net/api/trial',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json', ...headers },
    body: { string: new URLSearchParams(fields).toString() },
  });

const good = { name: 'Sam Lee', email: 'sam@example.com', business: 'Lee Plumbing', staff: '2 to 5', platform: 'Mac', elapsed: '8000', company_website: '' };

test('the hidden page address matches the site', () => {
  const site = fs.readFileSync(path.join(__dirname, '../../src/data/site.ts'), 'utf8');
  assert.match(site, new RegExp(`hiddenDownload = '${HIDDEN_DOWNLOAD}'`));
  assert.ok(fs.existsSync(path.join(__dirname, '../../src/pages', HIDDEN_DOWNLOAD, 'index.astro')));
});

test('a trial request goes to support@ with the download link to send', async () => {
  resetTokenCache();
  const sends = mockGraph();
  const res = await trial(request(good, { 'x-forwarded-host': 'www.jurnl.com.au' }), context);
  assert.equal(res.status, 200);
  assert.equal(sends.length, 1);
  assert.equal(sends[0].toRecipients[0].emailAddress.address, 'support@jurnl.com.au');
  assert.deepEqual(sends[0].replyTo[0].emailAddress, { address: 'sam@example.com', name: 'Sam Lee' });
  assert.equal(sends[0].subject, 'Jurnl trial request: Sam Lee (Lee Plumbing)');
  assert.match(sends[0].body.content, new RegExp(`https://www\\.jurnl\\.com\\.au${HIDDEN_DOWNLOAD}`));
  assert.match(sends[0].body.content, /Mac/);
});

test('without a forwarded host the link uses the request address; odd hosts are ignored', async () => {
  let sends = mockGraph();
  await trial(request(good), context);
  assert.match(sends[0].body.content, new RegExp(`https://calm-wave\\.example\\.net${HIDDEN_DOWNLOAD}`));
  sends = mockGraph();
  await trial(request(good, { 'x-forwarded-host': 'evil.example/<b>' }), context);
  assert.match(sends[0].body.content, /https:\/\/calm-wave\.example\.net/);
});

test('nothing is emailed to the person who filled it in', async () => {
  const sends = mockGraph();
  await trial(request(good), context);
  assert.equal(sends.length, 1);
});

test('honeypot submissions send nothing', async () => {
  const sends = mockGraph();
  const res = await trial(request({ ...good, company_website: 'x' }), context);
  assert.equal(res.status, 200);
  assert.equal(sends.length, 0);
});
