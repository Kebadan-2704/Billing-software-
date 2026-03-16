🎉 # GST & LOGO SETUP GUIDE - INDIAN BILLING 

## ✅ What's New!

Your billing software now has **full GST support** for Indian companies!

### New Features Added:
✅ **Company GST Number** - Set once, displays on all invoices  
✅ **Company Logo** - Upload your company logo to appear on bills  
✅ **Client GST Tracking** - Store client GST numbers per invoice  
✅ **Professional Invoice Template** - GST formatted invoices  
✅ **Settings Panel** - Easy configuration for company details  

---

## 🚀 QUICK START (5 Minutes)

### Step 1: Open Settings
```
1. Open app at http://localhost:3000
2. Click the purple "⚙️ Settings" button (top right)
3. You'll see the Company Settings panel
```

### Step 2: Add Your GST Number
```
1. Find "GST Information (Indian Companies)" section
2. Enter your GST number: 15AABCD1234H1Z0
   Format: 15 digits (Example above)
3. The GST will appear on all future invoices
```

### Step 3: Add Your Logo
```
1. Find "Company Logo" section
2. Paste your logo URL: https://yourcompany.com/logo.png
3. You'll see a preview appear
4. Logo will show on printed invoices and PDFs
```

### Step 4: Save Settings
```
Click "Save Settings" button (green)
✅ Your settings are automatically saved to browser storage
```

---

## 📋 INVOICE - WHERE GST APPEARS

### On Invoice View/Print:

**Top Left (FROM Section):**
```
Your Company Name
🇮🇳 GST: 15AABCD1234H1Z0

Optional:
Company Address
Ph: +91-XXXXX-XXXXX
```

**Top Right (LOGO):**
```
[YOUR COMPANY LOGO]
```

**Bill To Section (Client GST):**
```
BILL TO:
Client Name
Client Email
Client Phone
Client Address
GST: CLIENT_GST_NUMBER (if added)
```

**Invoice Summary:**
```
Subtotal:        $1,000.00
GST (18%):         $180.00    ← Shows as "GST" not "Tax"
────────────────────────────
TOTAL DUE:       $1,180.00
```

---

## 🎯 HOW TO USE - STEP BY STEP

### To Set GST Number:

```
1. Click "⚙️ Settings" button at top right
2. Scroll to "GST Information" section  
3. Type your 15-digit GST number
4. Click "Save Settings"
5. ✅ Done! GST appears on all future invoices
```

**GST Number Format:**
```
GSTIN Format: 15 characters
Example: 27AABCD1234E1Z0

Breakdown:
27 = State code (27 for Maharashtra, etc.)
AA = Entity type code
BC = Dealer category codes
D = Check digit
1234E = First 5 characters of PAN (if available)
1Z0 = Department code
```

### To Add Your Logo:

```
1. Click "⚙️ Settings" button
2. Scroll to "Company Logo" section
3. Paste image URL (PNG or JPG recommended)
4. Wait for preview to load
5. Click "Save Settings"
6. ✅ Logo appears on all invoice PDFs & prints
```

**Logo Requirements:**
```
✅ URL Format: https://yourcompany.com/logo.png
✅ Recommended Size: 200x100 pixels (max)
✅ Format: PNG (transparent) or JPG
✅ Must be publicly accessible URL
✅ File should be less than 500KB
```

**Where to Host Your Logo:**
```
Option 1: Your website
  - Upload to yourcompany.com site
  - Copy image URL

Option 2: Free services
  - Imgur: https://imgur.com/upload
  - Imgbb: https://imgbb.com/
  - Cloud storage: Google Drive, Dropbox

Option 3: Use data URL
  - Convert image to base64
  - Use data:image/png;base64,...
```

### To Add Client GST:

**When Creating/Editing Invoice:**
```
1. Click "+ New Invoice"
2. Fill in client info as usual
3. NEW FIELD: "Client GST Number (Optional)"
4. Enter client's GST number (15 digit)
5. Create invoice
6. ✅ Client GST appears on bill
```

**Example:**
```
FROM:
Your Company Name
GST: 15AABCD1234H1Z0
Bangalore, India
Ph: 080-12345678

BILL TO:
ABC Manufacturing Ltd
GST: 27AABCD1234E1Z0
Mumbai, India
```

### To Add Company Details:

```
Settings → Company Information section

Fields you can add:
• Company Phone: +91-XXXXX-XXXXX
• Company Address: Your full address
  (Shows on invoices)
```

---

## 📊 INVOICE EXPORT

### PDF Export (With GST & Logo):
```
1. Create or view an invoice
2. Click "Download PDF"
3. PDF includes:
   ✅ Your logo at top
   ✅ Your company GST
   ✅ Client GST
   ✅ "GST" label (not "Tax")
   ✅ Professional formatting
```

### Print Invoice:
```
1. View invoice
2. Click "Print" button
3. Choose printer
4. Prints with:
   ✅ Logo
   ✅ All GST numbers
   ✅ Professional layout
```

### CSV Export:
```
All invoice data includes GST numbers
Open in Excel/Sheets for analysis
```

---

## ✨ BEFORE & AFTER

### BEFORE (Without GST):
```
INVOICE
Invoice #: INV-001

Date: 15-03-2024
Due Date: 14-04-2024

[No Company Logo]
Your Company Name

Client Name
john@company.com

Description      Qty    Price     Amount
Services         1      1000    1,000.00
                                ──────────
Subtotal:                        1,000.00
Tax (18%):                         180.00
TOTAL DUE:                       1,180.00
```

###AFTER (With GST & Logo):
```
[COMPANY LOGO HERE]

INVOICE
Invoice #: INV-001

Date: 15-03-2024
Due Date: 14-04-2024

FROM:                              
Your Company Name
🇮🇳 GST: 15AABCD1234H1Z0
Bangalore, India
Ph: 080-12345678

BILL TO:
ABC Manufacturing Ltd
john@company.com
Mumbai, India
🇮🇳 GST: 27AABCD1234E1Z0

Description      Qty    Price     Amount
Services         1      1000    1,000.00
                                ──────────
Subtotal:                        1,000.00
GST (18%):                         180.00
TOTAL DUE:                       1,180.00
```

---

## 🔧 TROUBLESHOOTING

### Problem: Logo not showing
```
✅ Fix: Ensure URL is correct and public
✅ Fix: Use HTTPS URL (not HTTP)
✅ Fix: Check image file format (PNG/JPG)
✅ Fix: Try a different image URL
✅ Fix: Check browser console (F12) for errors
```

### Problem: Logo shows broken image
```
✅ Fix: URL might be blocked by CORS
✅ Fix: Upload logo elsewhere
✅ Fix: Use free host like Imgur or Imgbb
✅ Fix: Make sure URL is publicly accessible
```

### Problem: GST not showing on invoice
```
✅ Fix: Check if you clicked "Save Settings"
✅ Fix: Refresh invoice view (F5)
✅ Fix: Create a NEW invoice (old ones might need re-save)
✅ Fix: Check GST format is 15 digits
```

### Problem: Data not saving
```
✅ Fix: Check if LocalStorage is enabled
✅ Fix: Go to Settings → Cookies → Allow
✅ Fix: Clear browser cache and refresh
✅ Fix: Try in private/incognito mode
```

---

## 📝 SAMPLE GST NUMBERS

**Maharashtra:**
```
27AABCD1234H1Z0
```

**Tamil Nadu:**
```
33AABCD1234H1Z0
```

**Delhi:**
```
07AABCD1234H1Z0
```

**Karnataka:**
```
29AABCD1234H1Z0
```

**Gujarat:**
```
24AABCD1234H1Z0
```

---

## 🇮🇳 INDIAN TAX COMPLIANCE

### GST Rates (configurable in app):
```
✅ 5% SGST + 5% CGST = 10% (Some goods)
✅ 9% SGST + 9% CGST = 18% (Most services) ← Default
✅ 14% SGST + 14% CGST = 28% (Luxury items)
✅ 0% (Exempt items)
```

### Invoice Display (Compliant):
```
✅ GST labeled as "GST" (not "Tax")
✅ Both company and client GST shown
✅ Line amount = Qty × Unit Price
✅ Subtotal calculated correctly
✅ GST applied to subtotal
✅ Final total = Subtotal + GST
```

---

## 💾 DATA STORAGE

### Where Settings Are Stored:
```
Browser LocalStorage
Key: companySettings_{companyId}
Content: {
  "gstNumber": "15AABCD1234H1Z0",
  "logoUrl": "https://...",
  "companyPhone": "+91-...",
  "companyAddress": "..."
}
```

### Backup Your Settings:
```
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "LocalStorage"
4. Find "companySettings_{id}"
5. Copy the value
6. Save to text file
```

---

## 🎁 PRO TIPS

### Tip 1: Logo Size Matters
```
Perfect: 400x200 pixels (landscape)
Good: Anything 200-600 pixels wide
Bad: Too large = slow loading
Pro Tip: Use website that auto-resizes (Imgur)
```

### Tip 2: Use Transparent Logo
```
PNG with transparent background looks best
White or grey background can look odd
Use tools like Photoshop or Canva
```

### Tip 3: Include Contact on Invoice
```
In Settings, add:
• Phone: +91-XXXXX-XXXXX
• Address: Full office address
• Website: yourcompany.com
Shows professional & complete
```

### Tip 4: Set GST Terms
```
In invoice notes, add:
"All prices subject to GST"
"GST to be charged as applicable"
"Total includes GST and other taxes"
Professional compliance touch
```

### Tip 5: Client GST Optional
```
Only enter if client is registered with GST
B2B invoices: Always add
B2C invoices: Often optional
Check with client if unsure
```

---

## 🚀 NEXT STEPS

### Now That You Have Settings Configured:

1. **📄 Create Your First GST Invoice**
   - Click "+ New Invoice"
   - Add client GST number
   - Create invoice
   - View - See GST on bill

2. **📥 Export as PDF**
   - View invoice
   - Click "Download PDF"
   - Save and email to client

3. **🖨️ Print Invoice**
   - View invoice
   - Click "Print"
   - Select printer
   - Beautiful GST-compliant hardcopy

4. **📊 Track Finances**
   - Click "Analytics"
   - See GST amounts included
   - Monitor collections

---

## ✅ CHECKLIST

Before considering setup complete:

```
☑️ GST number entered in Settings
☑️ Logo URL added (optional)
☑️ Company phone added
☑️ Company address added
☑️ Created test invoice with GST
☑️ Viewed invoice template
☑️ Exported PDF successfully
☑️ Printed invoice successfully
☑️ Settings saved (persisted locally)
☑️ Ready for production use!
```

---

## 📞 SUPPORT

### Common Questions

**Q: Can I change GST number later?**
A: Yes! Edit in Settings anytime

**Q: Will old invoices update with new GST?**
A: No, they keep original GST (intentional for records)

**Q: Can I use without GST?**
A: Yes, leave blank - won't show

**Q: Can I set different GST rates?**
A: Yes, change percentage per invoice

**Q: Is my data secure?**
A: Yes, everything stays in your browser

**Q: Can multiple companies?**
A: Yes, each company has separate settings

---

## 🎉 YOU'RE READY!

Your Indian billing software is now configured with:
✅ GST Support  
✅ Professional Logo  
✅ Compliant Invoicing  
✅ Tax Tracking  
✅ Beautiful PDFs  

**Start Creating Invoices Now!**

