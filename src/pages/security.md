---
layout: ../layouts/PageLayout.astro
title: "Security"
section: "security"
description: "Jurnl keeps your books in an encrypted database on your own computer, with a sign-in and role for each person, an audit trail of every change, and automatic backups. No cloud drive needed if you work alone."
intro: "Encrypted, signed in, and on the record. Your books stay on your computer and in your own folder."
screenshots:
  - file: people-roles.png
    alt: "People and roles"
    caption: "Each person signs in with their own password and role; the recovery code covers a forgotten owner password."
---
## Encryption

- **The whole database is encrypted** with SQLCipher.
- **Tax file numbers, dates of birth, addresses and bank details are encrypted again,** as a second layer.
- **No vendor cloud** holds your books. Jurnl itself never holds your data.

## A sign-in for each person

- Up to four people who edit and three read-only, each with their own password and role.
- **Owner:** everything. **Manager:** no settings or bank details. **Bookkeeper:** books only, no payroll key, and can't approve pay. **Read-only:** a private copy.
- **Removing a person changes the keys,** so their old access stops working.
- **A recovery code** if the owner's password is lost.

## Audit trail

Every change is recorded: who, when, on which computer, old value to new. Each record has its own history, and there's a sign-in history too.

## Your data, your folder

Jurnl is a desktop app. It works on a local copy and keeps the master in your shared folder, with a lock so two people don't edit at once.

- **The shared folder** can be OneDrive, Dropbox or another synced folder, or simply a folder on your own computer if you work alone.
- **Works offline:** your work is saved back to the shared folder when you're online again, and Jurnl warns you while you're offline.
- **Automatic backups,** and a backup before every upgrade, never pruned. Restore any backup from Settings.
- **Safeguards** if two computers' copies drift apart.
- **A test copy mode** to try things without touching your real books.

### Just you, on one computer? No cloud drive needed

This is how Jurnl started: one person keeping the books on their own computer. Nothing is missing: the same encryption, sign-in and automatic backups as a shared company. Choose "On this computer, just me" when you set up the company.

Jurnl also copies your backups to a second place you choose, such as a USB drive, and reminds you if it hasn't. When you add people, one step moves the company into a shared folder.

### Sharing between people needs one cloud drive provider

Everyone who works on a company syncs the same shared folder, so they all need an account with the same provider: for example, all on OneDrive (Microsoft 365 work accounts, for your own staff or guests from another organisation), or all on Dropbox.

Someone without that provider, such as your accountant or lender, can still be given a [read-only copy](/features/read-only-copies/).
