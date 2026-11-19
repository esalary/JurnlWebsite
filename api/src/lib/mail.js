'use strict';

// Sends mail through Microsoft Graph with the "Websites mail" app registration
// (client credentials). Exchange limits the app to the mailboxes tagged
// CustomAttribute1 = "website", so `from` must be one of those.

let cached = null;

function settings(env) {
  const tenant = env.GRAPH_TENANT_ID;
  const clientId = env.GRAPH_CLIENT_ID;
  const secret = env.GRAPH_CLIENT_SECRET;
  if (!tenant || !clientId || !secret) {
    throw new Error('Mail settings are missing: set GRAPH_TENANT_ID, GRAPH_CLIENT_ID and GRAPH_CLIENT_SECRET.');
  }
  return { tenant, clientId, secret };
}

async function getToken(env = process.env, fetchFn = fetch) {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token;
  const { tenant, clientId, secret } = settings(env);
  const res = await fetchFn(`https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: secret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }).toString(),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) {
    // AADSTS7000222 = the client secret has expired.
    throw new Error(`Token request failed (${res.status}): ${body.error_description || body.error || 'no details'}`);
  }
  cached = { token: body.access_token, expires: Date.now() + (body.expires_in || 3600) * 1000 };
  return cached.token;
}

function address(a) {
  return typeof a === 'string' ? { emailAddress: { address: a } } : { emailAddress: { address: a.address, name: a.name } };
}

/**
 * @param {{ from: string, to: string | {address:string,name?:string}, replyTo?: {address:string,name?:string},
 *           subject: string, html: string }} mail
 */
async function sendMail(mail, { env = process.env, fetchFn = fetch } = {}) {
  const token = await getToken(env, fetchFn);
  const message = {
    subject: mail.subject,
    body: { contentType: 'HTML', content: mail.html },
    toRecipients: [address(mail.to)],
  };
  if (mail.replyTo) message.replyTo = [address(mail.replyTo)];
  const res = await fetchFn(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mail.from)}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, saveToSentItems: true }),
  });
  if (res.status !== 202) {
    const text = await res.text().catch(() => '');
    // 403 ErrorAccessDenied = the mailbox is not in the "Website mailboxes" scope.
    throw new Error(`sendMail from ${mail.from} failed (${res.status}): ${text.slice(0, 500)}`);
  }
}

function resetTokenCache() {
  cached = null;
}

module.exports = { sendMail, getToken, resetTokenCache };
