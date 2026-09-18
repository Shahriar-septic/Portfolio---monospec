/**
 * =========================================================================
 * MONOSPEC STUDIO — GOOGLE APPS SCRIPT FOR CONTACT FORM INQUIRIES
 * =========================================================================
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new).
 * 2. Rename the spreadsheet to "MonoSpec Studio — Inquiries".
 * 3. Go to Extensions > Apps Script.
 * 4. Delete any code in Code.gs and paste this ENTIRE file.
 * 5. Click "Deploy" > "New deployment".
 * 6. Under "Select type", choose "Web app".
 * 7. Set:
 *    - Description: "MonoSpec Contact Webhook"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (crucial for receiving form submissions from your website)
 * 8. Click "Deploy" and authorize the permissions.
 * 9. Copy the generated "Web app URL" and paste it into contact.html (or api/contact.js).
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for other processes to finish
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Inquiries");
    if (!sheet) {
      sheet = ss.getActiveSheet();
      sheet.setName("Inquiries");
    }

    // Set up headers if sheet is brand new
    if (sheet.getLastRow() === 0) {
      setupHeaders(sheet);
    }

    // Parse payload (supports JSON or URL-encoded form data)
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

    // Capture Date & Time
    var now = new Date();
    var formattedDateTime = Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT+6", "yyyy-MM-dd hh:mm:ss a");
    var submissionId = "INQ-" + Utilities.formatDate(now, "GMT", "yyyyMMdd") + "-" + Math.floor(1000 + Math.random() * 9000);

    var name = (data.name || data["user-name"] || "").trim();
    var contact = (data.contact || data["user-contact"] || "").trim();
    var plan = data.plan || data["user-plan"] || "Not specified";
    var message = (data.message || data.req || data["user-req"] || "").trim();

    // Phone / WhatsApp validation: at least 11 digits, reject repeating or sequential dummies
    var digitsOnly = contact.replace(/\D/g, "");
    var dummyNumbers = ["123456", "12341234", "12345678", "123456789", "1234567890", "12345678901"];
    if (!contact || digitsOnly.length < 11 || /^(\d)\1+$/.test(digitsOnly) || dummyNumbers.indexOf(digitsOnly) !== -1) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "Invalid phone number. Local numbers must be at least 11 digits." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Message validation: must have letters and cannot be gibberish keyboard smash
    if (!message || message.length < 2 || !/[a-zA-Z]/.test(message) || /[bcdfghjklmnpqrstvwxz]{5,}/i.test(message) || /asdf|wasd|asda|qwerty/i.test(message)) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "Invalid message: Please write a meaningful message." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Append new lead row
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

    // Subtle alternating row color for premium readability
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
    "Contact (Email / WhatsApp)",
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
