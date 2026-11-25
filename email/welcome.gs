// Apps Script web app that sends the welcome email (template.gs) from the shared Gmail account.
// A Supabase Database Webhook POSTs here on every INSERT into newsletter_subscribers:
//   <web app /exec URL>?key=<WEBHOOK_KEY>   body: { type, table, schema, record, old_record }
// Setup and redeploy steps: email/README.md.

function doPost(e) {
  try {
    var key = PropertiesService.getScriptProperties().getProperty('WEBHOOK_KEY');
    if (!key || !e || !e.parameter || e.parameter.key !== key) {
      console.warn('Rejected: missing or wrong key');
      return reply('rejected');
    }

    var payload = JSON.parse((e.postData && e.postData.contents) || '{}');
    if (payload.type !== 'INSERT' || payload.table !== 'newsletter_subscribers' || !payload.record) {
      console.warn('Ignored payload: ' + payload.type + ' on ' + payload.table);
      return reply('ignored');
    }

    var email = String(payload.record.email || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      console.warn('Ignored: invalid email');
      return reply('ignored');
    }

    sendWelcome(email);
    return reply('sent');
  } catch (err) {
    // Always answer, so the webhook doesn't retry and send duplicates.
    console.error(err);
    return reply('error');
  }
}

function sendWelcome(to) {
  var mail = welcomeEmail();
  MailApp.sendEmail({
    to: to,
    subject: mail.subject,
    htmlBody: mail.html,
    body: mail.text,
    name: 'Jero Jones',
  });
}

// Run once from the editor: creates the secret key and prints the query string for the webhook URL.
// The first run also asks for the Gmail permission.
function setupKey() {
  var key = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
  PropertiesService.getScriptProperties().setProperty('WEBHOOK_KEY', key);
  console.log('Add this to the end of the web app URL in the Supabase webhook: ?key=' + key);
}

// Run from the editor to receive the welcome email in this account's own inbox.
function testSend() {
  sendWelcome(Session.getEffectiveUser().getEmail());
  console.log('Sent to ' + Session.getEffectiveUser().getEmail());
}

function reply(text) {
  return ContentService.createTextOutput(text);
}
