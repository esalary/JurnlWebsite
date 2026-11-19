'use strict';

// Shared form handling: read and validate the fields, catch spam, send, and answer
// either with JSON (the page's script) or a redirect / plain page (no JavaScript).

const HONEYPOT = 'company_website'; // hidden field people never see; bots fill it in
const MIN_ELAPSED_MS = 2500; // the page's script records how long the form was open

const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Trims, removes control characters (keeping line breaks when multiline) and caps the length. */
function clean(value, { max = 200, multiline = false } = {}) {
  if (value === undefined || value === null) return '';
  let text = String(value).replace(/\r\n?/g, '\n');
  text = multiline ? text.replace(/[^\S\n]+\n/g, '\n').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '') : text.replace(/[\u0000-\u001F\u007F]+/g, ' ');
  return text.trim().slice(0, max);
}

async function readBody(request) {
  const type = (request.headers.get('content-type') || '').toLowerCase();
  if (type.includes('application/json')) {
    const data = await request.json();
    return data && typeof data === 'object' ? data : {};
  }
  const form = await request.formData();
  const data = {};
  for (const [key, value] of form.entries()) if (typeof value === 'string') data[key] = value;
  return data;
}

/**
 * @param {Record<string, string>} raw
 * @param {Record<string, {label: string, max?: number, required?: boolean, email?: boolean, multiline?: boolean, options?: string[]}>} spec
 */
function validate(raw, spec) {
  const values = {};
  const errors = [];
  for (const [name, rule] of Object.entries(spec)) {
    let value = clean(raw[name], rule);
    if (rule.options && value && !rule.options.includes(value)) value = rule.options[rule.options.length - 1];
    values[name] = value;
    if (rule.required && !value) errors.push(`Please fill in ${rule.label.toLowerCase()}.`);
    else if (rule.email && value && !EMAIL.test(value)) errors.push('Please check your email address.');
  }
  return { values, errors };
}

function isSpam(raw) {
  if (clean(raw[HONEYPOT])) return true;
  const elapsed = Number(raw.elapsed);
  return raw.elapsed !== undefined && raw.elapsed !== '' && Number.isFinite(elapsed) && elapsed < MIN_ELAPSED_MS;
}

function wantsJson(request) {
  return (request.headers.get('accept') || '').includes('application/json');
}

function plainPage(title, message, back) {
  return `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>body{font:18px/1.6 system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1.25rem}</style></head><body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><p><a href="${escapeHtml(back)}">Go back</a></p></body></html>`;
}

function reply(request, { ok, message, thanks, back, status }) {
  if (wantsJson(request)) return { status: status || (ok ? 200 : 400), jsonBody: { ok, message } };
  if (ok) return { status: 303, headers: { Location: thanks } };
  return {
    status: status || 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: plainPage('Your message was not sent', message, back),
  };
}

/** A simple, readable email: a heading, a table of fields and an optional message block. */
function emailHtml(heading, rows, message) {
  const cell = 'padding:6px 16px 6px 0;vertical-align:top;';
  const table = rows
    .filter(([, value]) => value)
    .map(([label, value]) => `<tr><td style="${cell}color:#555;white-space:nowrap">${escapeHtml(label)}</td><td style="${cell}">${escapeHtml(value)}</td></tr>`)
    .join('');
  const body = message
    ? `<div style="margin-top:16px;padding:12px 16px;background:#f4f4f4;border-radius:6px;white-space:pre-wrap">${escapeHtml(message)}</div>`
    : '';
  return `<div style="font:15px/1.5 Segoe UI,Arial,sans-serif;color:#1a1a1a"><p style="font-weight:600;margin:0 0 12px">${escapeHtml(heading)}</p><table style="border-collapse:collapse">${table}</table>${body}</div>`;
}

/**
 * Builds an Azure Functions HTTP handler.
 * @param {{ fields: object, thanks: string, back: string, send: (values: object, context: object) => Promise<void> }} form
 */
function formHandler(form) {
  return async (request, context) => {
    let raw;
    try {
      raw = await readBody(request);
    } catch {
      return reply(request, { ok: false, message: 'The form could not be read. Please try again.', back: form.back });
    }

    if (isSpam(raw)) {
      context.log('Form ignored as spam.');
      return reply(request, { ok: true, message: 'Thank you.', thanks: form.thanks });
    }

    const { values, errors } = validate(raw, form.fields);
    if (errors.length) return reply(request, { ok: false, message: errors.join(' '), back: form.back });

    try {
      await form.send(values, context);
    } catch (error) {
      context.error(error);
      return reply(request, {
        ok: false,
        status: 502,
        message: `Sorry, your message could not be sent just now. Please email us at ${form.fallbackEmail} instead.`,
        back: form.back,
      });
    }
    return reply(request, { ok: true, message: 'Thank you.', thanks: form.thanks });
  };
}

module.exports = { formHandler, emailHtml, escapeHtml, clean, validate, isSpam, HONEYPOT };
