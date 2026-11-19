---
layout: ../layouts/PageLayout.astro
title: "Free trial"
description: "Download the free trial of Jurnl, payroll and accounting for Australian small businesses: signed installers for Windows and Mac, automatic updates, no card and no account."
intro: "Try Jurnl with your own business, free, on Windows or Mac."
---

Fill in the short form and we'll email you the download link. No card and no account needed.

<form class="form" method="post" action="/api/trial" data-form data-thanks="/download/thanks/">
  <div class="field">
    <label for="t-name">Name</label>
    <input id="t-name" name="name" type="text" autocomplete="name" required />
  </div>
  <div class="field">
    <label for="t-email">Email</label>
    <input id="t-email" name="email" type="email" autocomplete="email" required />
  </div>
  <div class="field">
    <label for="t-business">Business name (optional)</label>
    <input id="t-business" name="business" type="text" autocomplete="organization" />
  </div>
  <div class="field">
    <label for="t-staff">How many people do you pay?</label>
    <select id="t-staff" name="staff">
      <option>Just me</option>
      <option>2 to 5</option>
      <option>6 to 20</option>
      <option>More than 20</option>
    </select>
  </div>
  <div class="field">
    <label for="t-platform">Computer</label>
    <select id="t-platform" name="platform">
      <option>Windows</option>
      <option>Mac</option>
    </select>
  </div>
  <div class="field">
    <label for="t-key">Free trial key</label>
    <select id="t-key" name="key">
      <option>Not yet: I'll start without a key</option>
      <option>Yes, please send me a trial key</option>
    </select>
  </div>
  <div class="hp" aria-hidden="true">
    <label for="company_website">Leave this empty</label>
    <input id="company_website" name="company_website" type="text" tabindex="-1" autocomplete="off" />
  </div>
  <p class="muted" style="font-size: 0.875rem">We use your details only to send the trial and follow up about Jurnl. See our <a href="/privacy/">privacy policy</a>.</p>
  <button class="btn btn--primary" type="submit" style="justify-self: start">Send me the download link</button>
  <p class="form-status" role="status" aria-live="polite"></p>
</form>

## The free trial

- **Start without a key:** one company and a few employees.
- **A free trial key raises the limits.** Ask for one with the form above.
- **The trial covers everything,** with Single Touch Payroll through the Single Touch Lite file until direct lodgement from Jurnl is approved by the ATO.
- **Your licence is a small file** entered once in Settings. It never needs an internet connection to check.

## Installing and updates

- **A signed Windows installer and a signed, notarised Mac app,** so neither system blocks it.
- **Automatic updates with release notes,** during the trial too.
- **Your database is backed up before every update,** and the backup is kept.

## What you'll need

- A Windows or Mac computer.
- **If you work alone,** nothing else: keep the company in a folder on your own computer. Jurnl copies your backups to a second place you choose, such as a USB drive.
- **If others will work on it,** a shared folder that everyone syncs from the same provider, for example all on OneDrive or all on Dropbox.
- Your ABN and bank details to set up your company. The setup wizard walks you through the rest.
