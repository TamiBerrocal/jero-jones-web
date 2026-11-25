# Welcome email

When someone subscribes from the Home or Quién form, Supabase inserts a row into `newsletter_subscribers`. A
Database Webhook then POSTs that row to a Google Apps Script web app, which sends the welcome email from the
shared Gmail account.

```
signup form → Supabase newsletter_subscribers (INSERT) → Database Webhook → Apps Script doPost → Gmail
```

- `template.gs`: subject, HTML and plain-text body. Plain JS, so it can be previewed locally.
- `welcome.gs`: the web app (`doPost`), plus `setupKey()` and `testSend()` helpers.
- The header image is `public/assets/email/header.jpg`, served by GitHub Pages. JPG because Outlook can't show WebP.

There are no secrets in this repo. The webhook key lives only in the Apps Script project's Script Properties.
No 2-Step Verification or app password is needed: the script runs as the Gmail account itself.

Limit: about 100 recipients a day on a regular Gmail account.

## Preview

```bash
node scripts/preview-email.mjs
```

This writes `email/preview.html` (gitignored) using the local header image. Open it in the browser.

## One-time setup

Do this signed in to the shared Gmail account.

1. Go to https://script.google.com and click **New project**. Name it "Jero Jones welcome email".
2. Replace the contents of `Code.gs` with `welcome.gs`. Add a second file (**+** → Script) named `template` and
   paste `template.gs`. Save.
3. Pick `setupKey` in the function menu and click **Run**. Google asks for permission:
   **Review permissions** → choose the account → "Google hasn't verified this app" → **Advanced** →
   **Go to Jero Jones welcome email (unsafe)** → **Allow**. That warning is normal for a personal script.
   The execution log prints `?key=...`. Keep that text for step 6.
4. Pick `testSend` and click **Run**. The welcome email should arrive in the shared inbox.
5. Click **Deploy** → **New deployment** → gear icon → **Web app**. Set "Execute as" to **Me** and "Who has
   access" to **Anyone**. Click **Deploy** and copy the web app URL (it ends in `/exec`).
6. In the Supabase dashboard, open **Database → Webhooks → Create a new hook**:
   - Table: `newsletter_subscribers`, events: **Insert**.
   - Type: **HTTP Request**, method **POST**.
   - URL: the `/exec` URL followed by the `?key=...` text from step 3.
   - Save.
7. Subscribe from the site with a real address. The email should arrive within a minute (check Spam too).
   Apps Script's **Executions** panel shows each run.

Apps Script answers POSTs with a 302 redirect, so the Supabase webhook log may show 302 instead of 200. The email
has already been sent by then.

## Changing the email

Edit `template.gs` here, preview it, then paste it into the Apps Script project. Then click **Deploy → Manage
deployments**, edit the existing deployment, set Version to **New version** and deploy. That keeps the same URL,
so the webhook doesn't change. A new header image goes live when it's pushed to `main`.

## If emails stop arriving

- Executions panel shows "Rejected": the key in the webhook URL doesn't match. Run `setupKey` again and update the URL.
- No executions at all: check the webhook in Supabase (table, event, URL).
- "Service invoked too many times": the daily Gmail quota ran out. It resets after 24 hours.
