---
layout: ../layouts/PageLayout.astro
title: "Free trial"
description: "Download a free trial of Jurnl, payroll and accounting for Australian small businesses, for Windows or Mac."
intro: "Try Jurnl with your own business, free, on Windows or Mac."
---

Fill in the short form and we'll email you the download link.

<!-- TODO: /api/trial is an Azure Function to be added; it will email the download link. -->
<form class="form" method="post" action="/api/trial">
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
  <p class="muted" style="font-size: 0.875rem">We use your details only to send the trial and follow up about Jurnl. See our <a href="/privacy/">privacy policy</a>.</p>
  <button class="btn btn--primary" type="submit" style="justify-self: start">Send me the download link</button>
</form>

## What you'll need

- A Windows or Mac computer.
- A shared folder for your books, such as OneDrive, if more than one person will use Jurnl.
- Your ABN and bank details to set up your company. The setup wizard walks you through the rest.
