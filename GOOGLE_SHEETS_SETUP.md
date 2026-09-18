# How to Connect Google Sheets to MonoSpec Contact Me Page

Follow these simple steps (takes under 2 minutes) to start receiving client inquiries directly in your Google Spreadsheet:

---

### Step 1: Create Your Google Spreadsheet
1. Go to [sheets.new](https://sheets.new) in your browser.
2. Name the sheet: **`MonoSpec Studio — Inquiries`**

---

### Step 2: Add the Apps Script Code
1. In the Google Sheets menu, click **Extensions** > **Apps Script**.
2. Erase any placeholder code inside `Code.gs`.
3. Open [`google-sheets-backend/Code.gs`](./google-sheets-backend/Code.gs) in this repository, copy its entire contents, and paste it into `Code.gs`.
4. Click the **Save** icon (diskette icon) or press `Ctrl + S`.

---

### Step 3: Deploy as Web App
1. In the top right corner of Apps Script, click the blue **Deploy** button > **New deployment**.
2. Next to "Select type", click the gear icon (⚙️) and select **Web app**.
3. Fill in the fields:
   - **Description**: `MonoSpec Contact Webhook`
   - **Execute as**: `Me (your_email@gmail.com)`
   - **Who has access**: **`Anyone`** *(IMPORTANT: This allows your website to submit inquiry rows without requiring visitors to log in)*
4. Click **Deploy**.
5. Click **Authorize access**, choose your Google account, click **Advanced** > **Go to Untitled project (unsafe)**, and click **Allow**.
6. Google will provide you with a **Web app URL** that looks like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
7. Copy this URL.

---

### Step 4: Paste URL into Website
In [`contact.html`](./contact.html), find:
```javascript
const GOOGLE_SCRIPT_WEBAPP_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";
```
Replace `"YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL"` with your copied Web app URL.

That's it! As soon as any client submits the form on your Contact Me page:
- A new row will instantly appear in your Google Sheet with **Date & Time**, **Name**, **WhatsApp/Phone**, **Selected Plan**, and **Message**.
- A high-end frosted glass confirmation card will be shown to the client.
- No WhatsApp redirection will occur.

---

### How to Update an Existing Deployment (Important)
Whenever you update `Code.gs` with new anti-spam features:
1. Open your Apps Script project and paste the updated [`google-sheets-backend/Code.gs`](./google-sheets-backend/Code.gs).
2. Click **Save** (`Ctrl + S`).
3. Click **Deploy** > **Manage deployments**.
4. Click the **Edit** (pencil) icon next to your Active deployment.
5. In the **Version** dropdown, select **`New version`**.
6. Click **Deploy**. *(Your Web App URL stays the exact same!)*
