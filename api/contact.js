// Anti-spam memory cache for IP rate limiting
const ipRateLimitMap = new Map();

// Whitelist of genuine English words with 3 consecutive vowels
const THREE_VOWEL_WHITELIST = new Set([
  'beauty', 'beautiful', 'beautifully', 'beautify', 'queue', 'queuing', 'queued',
  'audio', 'audiovisual', 'serious', 'seriously', 'review', 'reviewing', 'reviewed', 'reviewer',
  'previous', 'previously', 'gorgeous', 'gorgeously', 'quiet', 'quietly', 'quietness',
  'anxious', 'anxiously', 'curious', 'curiously', 'curiosity', 'obvious', 'obviously',
  'various', 'continuously', 'continuous', 'precious', 'spacious', 'gracious', 'conscious',
  'delicious', 'suspicious', 'jealous', 'famous', 'courageous', 'outrageous', 'advantageous',
  'religious', 'generous', 'ambitious', 'cautious', 'infectious', 'fictitious', 'efficacious',
  'spurious', 'tedious', 'dubious', 'copious', 'glorious', 'furious', 'mysterious', 'victorious',
  'canoeist', 'onomatopoeia', 'liaison', 'lieutenant', 'plateau', 'bureau', 'chateau', 'milieu',
  'roulette', 'souvenir', 'tourist', 'tourism', 'boulevard', 'boutique', 'coupon', 'silhouette',
  'guarantee', 'guardian', 'guidance', 'juice', 'juicy', 'suit', 'suite', 'suitable',
  'suitcase', 'fruit', 'fruits', 'cruise', 'bruise', 'pursuit', 'nuisance', 'receipt',
  'receive', 'receiving', 'received', 'ceiling', 'deceive', 'perceive', 'conceive',
  'view', 'views', 'viewer', 'viewing', 'interview', 'preview', 'overview',
  'cooperate', 'cooperative', 'coordinate', 'coordination', 'poet', 'poetry', 'poetic', 'phoenix'
]);

const KEYBOARD_PATTERNS = [
  'asdf', 'fdsa', 'qwerty', 'ytrewq', 'zxcv', 'vcxz',
  'hjkl', 'lkjh', 'asda', 'sdas', 'wasd', 'dsaw',
  'ghjk', 'kjhg', 'bnm', 'mnb', 'qaz', 'wsx', 'edc',
  'rfv', 'tgb', 'yhn', 'ujm', 'ik,', 'poiuy', 'yuiop'
];

const COMMON_WORDS = new Set([
  'hi', 'hello', 'hey', 'greetings', 'dear', 'good', 'morning', 'afternoon', 'evening',
  'salam', 'assalamu', 'alaikum', 'kemon', 'achen', 'bhai', 'bro', 'sir', 'madam',
  'dorkar', 'lagbe', 'janbo', 'janaben', 'khoj', 'khobor', 'dhonnobad', 'thanks', 'thank', 'you',
  'i', 'me', 'my', 'we', 'us', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'them',
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'can', 'could', 'would', 'should', 'will', 'shall', 'may', 'might', 'must',
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'until', 'while', 'of', 'at', 'by',
  'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
  'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'project', 'website', 'web', 'site', 'app', 'application', 'design', 'designer', 'develop',
  'development', 'developer', 'frontend', 'backend', 'fullstack', 'software', 'tech',
  'technology', 'system', 'expert', 'hire', 'team', 'portfolio', 'agency', 'store',
  'ecommerce', 'woocommerce', 'shopify', 'wordpress', 'nextjs', 'react', 'tailwind',
  'landing', 'page', 'pages', 'services', 'service', 'pricing', 'price', 'cost', 'quote',
  'quotation', 'timeline', 'features', 'details', 'info', 'information', 'help', 'discuss',
  'discussion', 'talk', 'call', 'contact', 'interested', 'inquiry', 'inquiries', 'inquire',
  'create', 'build', 'make', 'launch', 'scale', 'dominate', 'custom', 'scope', 'work',
  'business', 'company', 'brand', 'startup', 'start', 'fast', 'urgent', 'express', 'priority',
  'standard', 'budget', 'taka', 'bdt', 'usd', 'dollar', 'please', 'like', 'love', 'want',
  'need', 'know', 'tell', 'send', 'proposal', 'brochure', 'consultation', 'consult',
  'advice', 'audit', 'redesign', 'revamp', 'seo', 'ui', 'ux', 'graphic', 'graphics', 'logo',
  'clean', 'modern', 'responsive', 'mobile', 'desktop', 'speed', 'fast', 'quality',
  'question', 'questions', 'ready', 'transform', 'digital', 'architecture', 'engineering',
  'online', 'payment', 'gateway', 'checkout', 'cart', 'product', 'products', 'inventory',
  'client', 'clients', 'customer', 'customers', 'sales', 'lead', 'leads', 'revenue',
  'marketing', 'solution', 'solutions', 'platform', 'management', 'portal', 'dashboard',
  'secure', 'security', 'database', 'cloud', 'hosting', 'domain', 'setup', 'maintain',
  'maintenance', 'support', 'assist', 'assistance', 'requirements', 'requirement', 'spec',
  'specification', 'monospec', 'shahriar', 'estimate', 'tier', 'plan', 'package', 'starter',
  'pro', 'elite', 'enterprise', 'customized', 'revised', 'revision', 'brief', 'contract',
  'look', 'looking', 'see', 'get', 'give', 'take', 'come', 'think', 'find', 'feel', 'try',
  'ask', 'show', 'leave', 'feel', 'put', 'mean', 'keep', 'let', 'begin', 'seem',
  'talk', 'turn', 'start', 'might', 'show', 'hear', 'play', 'run', 'move', 'live',
  'believe', 'hold', 'bring', 'happen', 'write', 'provide', 'sit', 'stand', 'lose',
  'pay', 'meet', 'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand',
  'watch', 'follow', 'stop', 'speak', 'read', 'allow', 'add', 'spend', 'grow',
  'open', 'walk', 'win', 'offer', 'remember', 'consider', 'appear', 'buy', 'wait',
  'serve', 'expect', 'stay', 'reach', 'remain'
]);

function isWordInDict(word) {
  const w = word.toLowerCase();
  if (COMMON_WORDS.has(w)) return true;
  if (w.endsWith('ing') && COMMON_WORDS.has(w.slice(0, -3))) return true;
  if (w.endsWith('ing') && COMMON_WORDS.has(w.slice(0, -3) + 'e')) return true;
  if (w.endsWith('ed') && COMMON_WORDS.has(w.slice(0, -2))) return true;
  if (w.endsWith('ed') && COMMON_WORDS.has(w.slice(0, -1))) return true;
  if (w.endsWith('es') && COMMON_WORDS.has(w.slice(0, -2))) return true;
  if (w.endsWith('s') && COMMON_WORDS.has(w.slice(0, -1))) return true;
  if (w.endsWith('ly') && COMMON_WORDS.has(w.slice(0, -2))) return true;
  if (w.endsWith('er') && COMMON_WORDS.has(w.slice(0, -2))) return true;
  if (w.endsWith('est') && COMMON_WORDS.has(w.slice(0, -3))) return true;
  if (w.endsWith('ment') && COMMON_WORDS.has(w.slice(0, -4))) return true;
  if (w.endsWith('tion') && COMMON_WORDS.has(w.slice(0, -4))) return true;
  return false;
}

export default async function handler(req, res) {
  // CORS Headers
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
    const { name, contact, plan, message, req: messageAlt, website_url_hp } = req.body || {};

    // 0. Anti-bot honeypot check
    if (website_url_hp && website_url_hp.trim() !== '') {
      return res.status(400).json({ error: 'Automated submission detected.' });
    }

    // Rate Limiting by IP (Max 4 submissions per 3 minutes)
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const nowMs = Date.now();
    const ipTimestamps = (ipRateLimitMap.get(clientIp) || []).filter(t => (nowMs - t) < 180000);
    if (ipTimestamps.length >= 4) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait a few minutes before submitting again.' });
    }
    ipTimestamps.push(nowMs);
    ipRateLimitMap.set(clientIp, ipTimestamps);

    const clientName = (name || '').trim();
    const clientContact = (contact || '').trim();
    const clientPlan = plan || 'Not specified';
    const clientMessage = (message || messageAlt || '').trim();

    // 1. Name validation
    if (!clientName || clientName.length < 2 || clientName.length > 50 || !/^[a-zA-Z\s\.\'\-]+$/.test(clientName) || !/[aeiouyAEIOUY]/.test(clientName) || /(.)\1{2,}/.test(clientName)) {
      return res.status(400).json({ error: 'Please enter a genuine name.' });
    }

    const nameTokens = clientName.toLowerCase().match(/[a-z]+/g) || [];
    for (const nw of nameTokens) {
      if (/[bcdfghjklmnpqrstvwxz]{5,}/.test(nw) || (/[aeiou]{3,}/.test(nw) && !['louise', 'louisa', 'beau', 'eunice', 'mia'].includes(nw))) {
        return res.status(400).json({ error: 'Please enter a genuine name.' });
      }
      for (const pat of KEYBOARD_PATTERNS) {
        if (nw.includes(pat)) {
          return res.status(400).json({ error: 'Name contains invalid keyboard patterns.' });
        }
      }
    }

    // 2. Phone / WhatsApp Number validation (minimum 11 digits, starts with 01 for local)
    const cleanedContact = clientContact.replace(/[\s\-\(\)\.]/g, '');
    const digitsOnly = cleanedContact.replace(/\D/g, '');
    const sequentialDummies = [
      '123456', '12341234', '12345678', '123456789', '1234567890', '12345678901',
      '987654321', '9876543210', '0123456789', '01234567890', '12121212', '123123123'
    ];
    if (!cleanedContact || /^(\d)\1+$/.test(digitsOnly) || sequentialDummies.includes(digitsOnly) || '0123456789012345'.includes(digitsOnly)) {
      return res.status(400).json({ error: 'Please enter a valid WhatsApp or mobile number, not a placeholder.' });
    }

    // Block repeating suffix (e.g. 01700000000)
    if (digitsOnly.length >= 11 && /^01\d(\d)\1{7,}$/.test(digitsOnly)) {
      return res.status(400).json({ error: 'Please enter a genuine phone number, not dummy repeating digits.' });
    }

    if (cleanedContact.startsWith('+8801') || cleanedContact.startsWith('8801')) {
      const localPart = cleanedContact.replace(/^\+?88/, '');
      if (!/^01[3-9]\d{8}$/.test(localPart)) {
        return res.status(400).json({ error: 'Bangladesh numbers must have 11 digits starting with 01.' });
      }
    } else if (cleanedContact.startsWith('+')) {
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        return res.status(400).json({ error: 'International numbers must be between 10 and 15 digits.' });
      }
    } else {
      if (digitsOnly.length !== 11 || !/^01[3-9]\d{8}$/.test(digitsOnly)) {
        return res.status(400).json({ error: 'Local phone numbers must be 11 digits starting with 01 (e.g. 01XXXXXXXXX).' });
      }
    }

    // 3. Meaningful message validation (guards against puioniub, asilhjdbalsib, etc.)
    if (!clientMessage || clientMessage.length < 2 || !/[a-zA-Z]/.test(clientMessage)) {
      return res.status(400).json({ error: 'Please provide a meaningful message describing your project.' });
    }

    const messageTokens = clientMessage.toLowerCase().match(/[a-z]+/g) || [];
    if (!messageTokens.length) {
      return res.status(400).json({ error: 'Please write meaningful words in your message.' });
    }

    for (const word of messageTokens) {
      if (/(.)\1{2,}/.test(word)) {
        return res.status(400).json({ error: 'Message contains repeating characters like "' + word + '".' });
      }
      if (word.length >= 6 && /(..)\1{2,}/.test(word)) {
        return res.status(400).json({ error: 'Message contains repeating syllable keys.' });
      }
      for (const pat of KEYBOARD_PATTERNS) {
        if (word.includes(pat) && !isWordInDict(word)) {
          return res.status(400).json({ error: 'Message contains random keyboard typing ("' + pat + '").' });
        }
      }
      if (/[bcdfghjklmnpqrstvwxz]{5,}/.test(word)) {
        return res.status(400).json({ error: 'Unreadable words like "' + word.slice(0, 8) + '..." are not allowed.' });
      }
      // 3 or more consecutive vowels check (blocks "puioniub" -> uio)
      if (/[aeiou]{3,}/.test(word)) {
        let isWhitelisted = false;
        for (const white of THREE_VOWEL_WHITELIST) {
          if (word.includes(white) || white.includes(word)) {
            isWhitelisted = true;
            break;
          }
        }
        if (!isWhitelisted && !isWordInDict(word)) {
          return res.status(400).json({ error: 'Unrecognized word with abnormal vowel sequence ("' + word + '").' });
        }
      }
      if (word.length >= 5 && !/[aeiouy]/.test(word)) {
        return res.status(400).json({ error: 'Please type meaningful words with vowels.' });
      }
      if (word.length >= 6 && !isWordInDict(word)) {
        const vowelCount = (word.match(/[aeiouy]/g) || []).length;
        const ratio = vowelCount / word.length;
        if (ratio < 0.18 || ratio > 0.70) {
          return res.status(400).json({ error: 'The word "' + word + '" does not appear to be a real word.' });
        }
      }
    }

    // Single-word check
    if (messageTokens.length === 1) {
      const singleWord = messageTokens[0];
      if (!isWordInDict(singleWord) && !THREE_VOWEL_WHITELIST.has(singleWord)) {
        return res.status(400).json({ error: 'The word "' + singleWord + '" is not recognized as a valid message.' });
      }
    }

    // Multi-word density check
    if (messageTokens.length >= 2) {
      let recognizedCount = 0;
      for (const w of messageTokens) {
        if (isWordInDict(w) || THREE_VOWEL_WHITELIST.has(w)) {
          recognizedCount++;
        }
      }
      if ((recognizedCount / messageTokens.length) < 0.40) {
        return res.status(400).json({ error: 'Your message could not be understood as meaningful text.' });
      }
    }

    const now = new Date();
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
