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

    const clientName = (name || '').trim();
    const clientContact = (contact || '').trim();
    const clientPlan = plan || 'Not specified';
    const clientMessage = (message || messageAlt || '').trim();

    // 1. Name validation
    if (!clientName || clientName.length < 2 || !/[a-zA-Z]/.test(clientName) || /^(.)\1+$/.test(clientName)) {
      return res.status(400).json({ error: 'Please provide a valid name.' });
    }

    // 2. Phone / WhatsApp Number validation (minimum 11 digits, starts with 01 for local)
    const cleanedContact = clientContact.replace(/[\s\-\(\)\.]/g, '');
    const digitsOnly = cleanedContact.replace(/\D/g, '');
    const sequentialDummies = ['123456', '12341234', '12345678', '123456789', '1234567890', '12345678901', '987654321', '9876543210'];
    if (!cleanedContact || /^(\d)\1+$/.test(digitsOnly) || sequentialDummies.includes(digitsOnly)) {
      return res.status(400).json({ error: 'Please enter a valid WhatsApp or mobile number, not a placeholder.' });
    }
    if (!cleanedContact.startsWith('+')) {
      if (digitsOnly.length < 11 || !/^01[3-9]\d{8}$/.test(digitsOnly)) {
        return res.status(400).json({ error: 'Local phone numbers must be 11 digits starting with 01 (e.g. 01XXXXXXXXX).' });
      }
    } else if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return res.status(400).json({ error: 'International numbers must be between 10 and 15 digits.' });
    }

    // 3. Meaningful message validation (detect keyboard mash and gibberish)
    if (!clientMessage || clientMessage.length < 2 || !/[a-zA-Z]/.test(clientMessage)) {
      return res.status(400).json({ error: 'Please provide a meaningful message describing your project.' });
    }
    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(clientMessage) || /asdf|wasd|asda|qwerty/i.test(clientMessage)) {
      return res.status(400).json({ error: 'Message contains unrecognized keyboard typing. Please write in meaningful words.' });
    }

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
