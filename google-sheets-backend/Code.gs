/**
 * =========================================================================
 * MONOSPEC STUDIO — GOOGLE APPS SCRIPT FOR CONTACT FORM INQUIRIES
 * =========================================================================
 * 
 * Instructions:
 * 1. Open your Google Spreadsheet ("MonoSpec Studio — Inquiries").
 * 2. Go to Extensions > Apps Script.
 * 3. Replace all code in Code.gs with this file.
 * 4. Click "Deploy" > "Manage deployments" > Edit > Select "New version" > Click "Deploy".
 * 
 * Features:
 * - Anti-Bot Honeypot Trap detection.
 * - Deduplication Engine: Rejects rapid duplicate entries within 3 minutes.
 * - Strict Linguistic & Gibberish Filter: Blocks keyboard mash & unreadable words (e.g. "puioniub", "asilhjdbalsib").
 * - Phone Number & Dummy Pattern Verification.
 * - Auto-formatting with Dark-theme header and alternating rows.
 */

// Genuine English words with 3 consecutive vowels (prevents flagging real words)
var THREE_VOWEL_WHITELIST = [
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
];

var KEYBOARD_PATTERNS = [
  'asdf', 'fdsa', 'qwerty', 'ytrewq', 'zxcv', 'vcxz',
  'hjkl', 'lkjh', 'asda', 'sdas', 'wasd', 'dsaw',
  'ghjk', 'kjhg', 'bnm', 'mnb', 'qaz', 'wsx', 'edc',
  'rfv', 'tgb', 'yhn', 'ujm', 'ik,', 'poiuy', 'yuiop'
];

var COMMON_WORDS = [
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
];

function isWordRecognized(w) {
  var word = w.toLowerCase();
  if (COMMON_WORDS.indexOf(word) !== -1) return true;
  if (THREE_VOWEL_WHITELIST.indexOf(word) !== -1) return true;
  // Simple stem check
  if (word.length > 3 && word.slice(-3) === "ing" && COMMON_WORDS.indexOf(word.slice(0, -3)) !== -1) return true;
  if (word.length > 2 && word.slice(-2) === "ed" && COMMON_WORDS.indexOf(word.slice(0, -2)) !== -1) return true;
  if (word.length > 2 && word.slice(-2) === "es" && COMMON_WORDS.indexOf(word.slice(0, -2)) !== -1) return true;
  if (word.length > 1 && word.slice(-1) === "s" && COMMON_WORDS.indexOf(word.slice(0, -1)) !== -1) return true;
  if (word.length > 2 && word.slice(-2) === "ly" && COMMON_WORDS.indexOf(word.slice(0, -2)) !== -1) return true;
  return false;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for concurrent write safety
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Inquiries");
    if (!sheet) {
      sheet = ss.getActiveSheet();
      sheet.setName("Inquiries");
    }

    // Set up headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      setupHeaders(sheet);
    }

    // Parse payload (JSON or URL-encoded form data)
    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    // 0. Anti-Bot Honeypot Trap check
    if (data.website_url_hp || data.website_trap) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "Automated submission rejected." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var now = new Date();
    var nowMs = now.getTime();
    var formattedDateTime = Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+6", "yyyy-MM-dd hh:mm:ss a");
    var submissionId = "INQ-" + Utilities.formatDate(now, "GMT", "yyyyMMdd") + "-" + Math.floor(1000 + Math.random() * 9000);

    var name = (data.name || data["user-name"] || "").trim();
    var contact = (data.contact || data["user-contact"] || "").trim();
    var plan = data.plan || data["user-plan"] || "Not specified";
    var message = (data.message || data.req || data["user-req"] || "").trim();

    // 1. Phone / WhatsApp validation: at least 11 digits, reject repeating or sequential dummies
    var digitsOnly = contact.replace(/\D/g, "");
    var dummyNumbers = ["123456", "12341234", "12345678", "123456789", "1234567890", "12345678901", "01234567890", "0123456789"];
    if (!contact || digitsOnly.length < 11 || /^(\d)\1+$/.test(digitsOnly) || dummyNumbers.indexOf(digitsOnly) !== -1) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "Invalid phone number. Local numbers must be at least 11 digits." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Name validation: 2-50 chars, no keyboard patterns
    if (!name || name.length < 2 || name.length > 50 || !/[aeiouyAEIOUY]/.test(name) || /(.)\1{2,}/.test(name)) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "Please provide a valid name." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Message validation: Must be meaningful (blocks "puioniub", "asilhjdbalsib", etc.)
    if (!message || message.length < 2 || !/[a-zA-Z]/.test(message)) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "Invalid message: Please write a meaningful message." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var words = message.toLowerCase().match(/[a-z]+/g) || [];
    if (words.length === 0) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "Invalid message: Words must contain readable characters." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Token analysis
    for (var wIdx = 0; wIdx < words.length; wIdx++) {
      var word = words[wIdx];

      // Repeated single character (e.g. "aaaaa", "zzzz")
      if (/(.)\1{2,}/.test(word)) {
        return ContentService
          .createTextOutput(JSON.stringify({ status: "error", message: "Message contains repeating characters." }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // 5+ consecutive consonants (e.g. asilhjdbalsib -> lhjdb)
      if (/[bcdfghjklmnpqrstvwxz]{5,}/.test(word)) {
        return ContentService
          .createTextOutput(JSON.stringify({ status: "error", message: "Message contains unreadable words." }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // 3+ consecutive vowels (e.g. puioniub -> uio)
      if (/[aeiou]{3,}/.test(word)) {
        var isWhite = false;
        for (var vi = 0; vi < THREE_VOWEL_WHITELIST.length; vi++) {
          if (word.indexOf(THREE_VOWEL_WHITELIST[vi]) !== -1 || THREE_VOWEL_WHITELIST[vi].indexOf(word) !== -1) {
            isWhite = true;
            break;
          }
        }
        if (!isWhite && !isWordRecognized(word)) {
          return ContentService
            .createTextOutput(JSON.stringify({ status: "error", message: "Message contains unrecognized vowel sequences." }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }

      // Keyboard walk patterns
      for (var kp = 0; kp < KEYBOARD_PATTERNS.length; kp++) {
        if (word.indexOf(KEYBOARD_PATTERNS[kp]) !== -1 && !isWordRecognized(word)) {
          return ContentService
            .createTextOutput(JSON.stringify({ status: "error", message: "Message contains keyboard patterns." }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // Single-word check: Must be in dictionary or whitelist
    if (words.length === 1) {
      if (!isWordRecognized(words[0])) {
        return ContentService
          .createTextOutput(JSON.stringify({ status: "error", message: "Single-word message was not recognized as a valid inquiry." }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Multi-word density check: At least 35% recognizable words
    if (words.length >= 2) {
      var recognizedCount = 0;
      for (var rIdx = 0; rIdx < words.length; rIdx++) {
        if (isWordRecognized(words[rIdx])) {
          recognizedCount++;
        }
      }
      if ((recognizedCount / words.length) < 0.35) {
        return ContentService
          .createTextOutput(JSON.stringify({ status: "error", message: "Message could not be understood as meaningful text." }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // 4. Anti-Clustering & Deduplication Protection
    // Inspect recent rows: Reject duplicate submissions within 3 minutes (prevents spreadsheet pollution)
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var checkRows = Math.min(15, lastRow - 1);
      var startRow = lastRow - checkRows + 1;
      var recentValues = sheet.getRange(startRow, 1, checkRows, 6).getValues();

      for (var r = 0; r < recentValues.length; r++) {
        var prevDateStr = recentValues[r][0];
        var prevContactDigits = String(recentValues[r][2] || "").replace(/\D/g, "");
        var prevMsg = String(recentValues[r][4] || "").toLowerCase().trim();

        var prevTime = new Date(prevDateStr).getTime();
        var isRecent = !isNaN(prevTime) && (nowMs - prevTime) < 180000; // 3 minutes

        if (isRecent) {
          if (digitsOnly && prevContactDigits === digitsOnly) {
            return ContentService
              .createTextOutput(JSON.stringify({ status: "error", message: "Duplicate submission. An inquiry for this phone number was recently logged." }))
              .setMimeType(ContentService.MimeType.JSON);
          }
          if (message.toLowerCase() === prevMsg) {
            return ContentService
              .createTextOutput(JSON.stringify({ status: "error", message: "Duplicate submission. An identical inquiry was recently logged." }))
              .setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
    }

    // 5. Append new inquiry row
    sheet.appendRow([
      formattedDateTime,
      name,
      contact,
      plan,
      message,
      submissionId
    ]);

    // Format new row
    var newRowIdx = sheet.getLastRow();
    var rowRange = sheet.getRange(newRowIdx, 1, 1, 6);
    rowRange.setFontFamily("Inter");
    rowRange.setFontSize(10);
    rowRange.setVerticalAlignment("middle");
    rowRange.setWrap(true);

    // Alternating row color for readability
    if (newRowIdx % 2 === 0) {
      rowRange.setBackground("#fcfcfd");
    } else {
      rowRange.setBackground("#ffffff");
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        message: "Inquiry saved to Google Spreadsheet successfully",
        dateTime: formattedDateTime,
        id: submissionId
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "online",
      service: "MonoSpec Studio Inquiries API",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupHeaders(sheet) {
  var headers = [
    "Date & Time",
    "Client Name",
    "Contact (WhatsApp / Phone)",
    "Selected Plan / Tier",
    "Project Requirements",
    "Submission ID"
  ];

  sheet.appendRow(headers);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  
  // High-end dark theme with brand orange specular rim
  headerRange.setBackground("#111116");
  headerRange.setFontColor("#ff8a00");
  headerRange.setFontWeight("bold");
  headerRange.setFontFamily("Outfit");
  headerRange.setFontSize(11);
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  
  sheet.setRowHeight(1, 40);
  sheet.setFrozenRows(1);

  // Set initial column widths
  sheet.setColumnWidth(1, 190); // Date & Time
  sheet.setColumnWidth(2, 180); // Name
  sheet.setColumnWidth(3, 240); // Contact
  sheet.setColumnWidth(4, 260); // Plan
  sheet.setColumnWidth(5, 420); // Requirements
  sheet.setColumnWidth(6, 150); // ID
}
