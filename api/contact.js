export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, contact, plan, message, req: messageAlt } = req.body || {};

    const clientName = name || 'N/A';
    const clientContact = contact || 'N/A';
    const clientPlan = plan || 'Not specified';
    const clientMessage = message || messageAlt || '';

    const now = new Date();
    // Human-readable formatted Date & Time
    const formattedDateTime = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'Asia/Dhaka'
    }).format(now);

    const payload = {
      name: clientName,
      contact: clientContact,
      plan: clientPlan,
      message: clientMessage,
      dateTime: formattedDateTime,
      isoTimestamp: now.toISOString()
    };

    // Forward to Google Apps Script Web App
    const googleScriptUrl = process.env.GOOGLE_SCRIPT_WEBAPP_URL || "https://script.google.com/macros/s/AKfycbyNcC2xJMiYkat1GuYaeTPe0LhyRd3buZfgQv6mRQ6IGtafDJv5HxMlNmQPhwzpGfua1w/exec";
    if (googleScriptUrl) {
      try {
        await fetch(googleScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (fwdErr) {
        console.warn('Forward to Google Script failed:', fwdErr);
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Inquiry logged successfully with Date & Time',
      dateTime: formattedDateTime
    });
  } catch (error) {
    console.error('Contact API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
