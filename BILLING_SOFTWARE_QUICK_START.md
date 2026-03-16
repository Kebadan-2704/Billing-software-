# 📖 MD CONSTRUCTION BILLING SOFTWARE - QUICK START GUIDE

## 🎯 START HERE

Your billing software is running at: **http://localhost:3000**

---

## 🚀 Getting Started (5 Minutes)

### Step 1: Select Your Company
```
When you first load the app:
1. You'll see the company selection screen
2. Select or login with your company
3. You're now in the billing dashboard
```

### Step 2: Create Your First Invoice
```
1. Click the blue "+ New Invoice" button
2. Fill in:
   - Client Name: "ABC Construction Company"
   - Client Email: "contact@abc.com"
   - Client Phone: "555-1234"
3. Click "+ Add Item":
   - Description: "Excavation Work"
   - Quantity: 10
   - Unit Price: 500
4. Click "+ Add Item" again for second item if needed
5. Set Tax Rate: 10 (for 10% tax)
6. Choose Payment Terms: "Net 30"
7. Click "Create Invoice"
8. ✅ Invoice created and saved!
```

### Step 3: View Your Invoice
```
1. Find your invoice in the list (top)
2. Click the "View" button
3. See full invoice details
4. Click "Close" to exit
```

### Step 4: Record a Payment
```
1. Click on your invoice (the card)
2. Click the "$" payment button
3. Enter payment amount
4. Click "Record Payment"
5. Status automatically updates to "Paid" or "Partial"
```

---

## 📱 Dashboard Overview

### Header (Top)
- Company name and logo
- Quick stats: Total Paid, Total Invoiced, Total Pending
- Logout button

### Left Sidebar
- List of saved clients
- "+ New Client" button
- Delete client button (X)

### Main Area
```
[Search Box]          [Filter by Status ▼]         [+ New Invoice] [Export CSV] [Analytics]
────────────────────────────────────────────────────────────────────────────────────

📄 Invoice INV-001
   Client: John Smith
   Amount: $5,500.00
   Status: [PAID - Green Badge]
   [View] [Edit] [Delete]

📄 Invoice INV-002
   Client: Sarah Johnson
   Amount: $3,250.00
   Status: [PENDING - Yellow Badge]
   [View] [Edit] [Delete]
```

---

## 🎮 Main Features

### 1. Create Invoice
```
What: Create a new invoice
Where: Blue "+ New Invoice" button (top right)
Fill in:
  ✓ Client info (name, email, phone, address, etc.)
  ✓ Line items (description, qty, price)
  ✓ Tax rate (0-25%)
  ✓ Payment terms
Result: Invoice shows in list, auto-saved
```

### 2. Edit Invoice
```
What: Modify an existing invoice
Where: Click "Edit" button on invoice card
Edit:
  ✓ Client information
  ✓ Line items (add/remove/modify)
  ✓ Tax rate
  ✓ Payment terms
Result: Changes saved automatically
Note: Can only edit Draft invoices
```

### 3. Delete Invoice
```
What: Remove an invoice
Where: Click "Delete" button on invoice card (trash icon)
Warning: This cannot be undone!
Result: Invoice removed from system and history
```

### 4. Record Payment
```
What: Track invoice payments (partial or full)
Where: Click "$" icon on invoice card
Enter: Payment amount
Auto: Status updates to "Paid" or "Partial"
Example: Invoice for $1,000, pay $300 → Status = "Partial"
```

### 5. Search Invoices
```
What: Find invoices quickly
Where: Search box (top)
Search by:
  ✓ Invoice number (e.g., "INV-001")
  ✓ Client name (e.g., "John")
Real-time: Results update as you type
```

### 6. Filter by Status
```
What: Show only certain invoice types
Where: "Filter" dropdown (top right)
Options:
  - All (show everything)
  - Draft (not sent yet)
  - Sent (sent to client)
  - Paid (fully paid)
  - Partial (partially paid)
  - Overdue (past due date)
  - Cancelled (canceled)
Result: List updates instantly
```

### 7. View Analytics
```
What: See business metrics and KPIs
Where: "Analytics" button (top right)
Shows:
  ✓ Total Amount Invoiced
  ✓ Total Amount Paid
  ✓ Total Amount Pending
  ✓ Count by status (how many paid, pending, etc.)
  ✓ Payment collection rate
  ✓ Average invoice amount
Visual: 6 cards with metrics and charts
```

### 8. Export to PDF
```
What: Save invoice as PDF for printing or email
Where: "View" invoice → "Download PDF" button
Result:
  ✓ Professional A4 formatted PDF
  ✓ Ready for printing
  ✓ Ready for email
  ✓ Saves to Downloads folder
```

### 9. Export to CSV
```
What: Save all invoices as spreadsheet
Where: "Export CSV" button (top right)
Result:
  ✓ .csv file with all invoices
  ✓ Open in Excel/Sheets
  ✓ Analyze, pivot, or backup
Format: All fields included (number, amount, status, etc.)
```

### 10. Print Invoice
```
What: Print invoice on paper
Where: "View" invoice → "Print" button
Result:
  ✓ Opens browser print dialog
  ✓ Professional formatting
  ✓ Ready to sign and send
Options: Choose printer, PDF, etc.
```

### 11. Manage Clients
```
What: Save client info for quick reuse
Where: Left sidebar
Actions:
  ✓ "+ New Client" button
  ✓ Click client to select for invoice
  ✓ Click "X" to delete client
Saves: Email, phone, address, tax ID
Benefits: Auto-fill on selection
```

### 12. View Analytics
```
What: See detailed financial overview
Where: "Analytics" button (with chart icon)
Shows:
  ✓ Total amount currently invoiced
  ✓ Total amount received (paid)
  ✓ Total outstanding (pending)
  ✓ Invoice breakdown by status
```

---

## 💾 Data Storage & Backup

### Where is my data stored?
```
✅ In your browser's localStorage
✅ Works offline
✅ Survives page refresh
✅ No backend server
✅ No login required (after company selection)
```

### How to backup your data
```
1. Open Browser DevTools (Press F12)
2. Go to "Application" tab
3. Click "LocalStorage" (left panel)
4. Find: "invoices_{companyId}" and "clients_{companyId}"
5. Right-click → Copy
6. Paste into a text file to backup
```

### How to restore data
```
If you accidentally delete data:
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Paste your backup JSON
4. Refresh page
5. Data restored!
```

---

## ⚙️ Settings & Customization

### Tax Rate
```
Where: When creating/editing invoice
Default: 0% (optional)
Range: 0% - 25%
What happens: 
  • Subtotal calculated first
  • Tax applied to subtotal
  • Total = Subtotal + Tax
Example: Subtotal $1,000 + 10% tax = $1,100 total
```

### Payment Terms
```
Where: When creating/editing invoice
Options:
  • Due on Receipt (pay immediately)
  • Net 15 (pay within 15 days)
  • Net 30 (pay within 30 days)
  • Net 45 (pay within 45 days)
  • Net 60 (pay within 60 days)
What happens: Sets dueDate on invoice
```

### Invoice Notes
```
Where: Optional field when creating invoice
Used for: Terms, conditions, special instructions
Example: "Payment via check to address below"
         "5% discount if paid within 10 days"
```

---

## 🔍 Invoice Status Guide

| Status | Meaning | Color | Use When |
|--------|---------|-------|----------|
| Draft | Not sent yet | Gray | Invoice created but not sent |
| Sent | Sent to client | Blue | Invoice emailed to client |
| Paid | Fully paid | Green | Client paid full amount |
| Partial | Partially paid | Orange | Client paid some but not all |
| Overdue | Past due date | Red | Invoice not paid by due date |
| Cancelled | Canceled | Gray | Invoice no longer valid |

**Auto-Status:**
- When you record payment → Status updates automatically
- If payment = invoice total → Status = Paid
- If payment < invoice total → Status = Partial

---

## 📋 Common Tasks

### Task: Create Invoice for New Client
```
1. Click "+ New Invoice"
2. Fill client details (name, email, phone, address)
3. Add line items:
   • Click "+ Add Item"
   • Enter: Description, Qty, Unit Price
   • Repeat for all items
4. Set tax (optional)
5. Choose payment terms
6. Click "Create Invoice"
✅ Done! Invoice auto-saved
```

### Task: Create Invoice for Saved Client
```
1. Click "+ New Invoice"
2. Click "Select Client" dropdown
3. Choose from saved clients
✅ Client info auto-filled!
4. Add/modify line items
5. Create Invoice
✅ Done!
```

### Task: Get Paid
```
1. Find unpaid invoice in list
2. Click on it
3. Click "Record Payment" ($)
4. Enter payment amount
5. Click "Record Payment"
✅ Status updated! (Partial or Paid)
```

### Task: Send Invoice to Client
```
1. View the invoice
2. Download PDF
3. Email PDF to client
4. Change status to "Sent"
✅ Done!

Or:
1. Print invoice
2. Mail physical copy
3. Change status to "Sent"
✅ Done!
```

### Task: Get Analytics Report
```
1. Click "Analytics" button (top right)
2. See all KPI metrics
3. Review status breakdown
4. Screenshot for reports
✅ Done!
```

### Task: Backup Your Data
```
1. Click "Export CSV"
2. Save .csv file
✅ Backup created!
Note: This is a snapshot in time
```

---

## 🚨 Troubleshooting

### Problem: Invoice not saving
```
✓ Check: Is browser allowing localStorage?
✓ Fix: Settings → Privacy → Allow localStorage
✓ Check: Is there space available?
✓ Fix: Delete old invoices if quota full
```

### Problem: PDF download not working
```
✓ Check: Are popups blocked?
✓ Fix: Settings → Pop-ups → Allow
✓ Check: Is browser updated?
✓ Fix: Update to latest version
```

### Problem: Search not working
```
✓ Check: Are you typing correctly?
✓ Try: Search for different part of name
✓ Clear: search box and try again
```

### Problem: Data missing after refresh
```
✓ Check: Are cookies enabled?
✓ Fix: Settings → Cookies → Allow
✓ Check: Is site allowed localStorage?
✓ Fix: Settings → Exceptions → Allow
```

### Problem: Payment status not updating
```
✓ Check: Did you click "Record Payment"?
✓ Check: Is amount showing correctly?
✓ Fix: Refresh page
✓ Fix: Try recording payment again
```

---

## 💡 Pro Tips

### Tip 1: Save Clients
```
Adding clients you use often saves time!
Click "+ New Client" → Add details → Save
Next time, just select from dropdown
Saves 30 seconds per invoice!
```

### Tip 2: Use Multiple Line Items
```
Instead of: "Project Work - $5,000"
Do this:
  • Excavation - 10 hrs × $100 = $1,000
  • Concrete - 20 yds × $150 = $3,000
  • Labor - 50 hrs × $40 = $2,000
More detail = More professional!
```

### Tip 3: Set Realistic Payment Terms
```
If clients typically pay in 30 days: Set "Net 30"
If clients pay immediately: Set "Due on Receipt"
This helps track overdue invoices!
```

### Tip 4: Use Notes for Terms
```
Click invoice → Edit → Add notes:
"5% early payment discount if paid within 10 days"
"Payment via check to Bob's Company"
"Invoice must be signed and returned"
Helps clients understand your requirements!
```

### Tip 5: Export Regular Backups
```
Every Friday: Export to CSV
Save with date: invoices_2024_01_12.csv
Why: Backup against data loss
```

### Tip 6: Check Analytics Weekly
```
Every Monday: Click "Analytics"
Check: Total Paid vs Total Pending
Review: Any invoices becoming overdue?
Act: Follow up on unpaid invoices
```

---

## 🆕 What's Different

### What Changed from Original App
```
OLD:
❌ Static construction data
❌ Just dashboarding
❌ No real billing functions
❌ Sample projects only
❌ No data persistence

NEW:
✅ Real invoice management
✅ Complete billing system
✅ Full CRUD operations
✅ Professional templates
✅ Auto-save, auto-restore data
✅ Analytics & reporting
✅ Export & print
✅ Payment tracking
✅ Professional UI
✅ Animation effects
```

---

## 📞 Need Help?

### Check These Files
```
📄 SOFTWARE_RATING_REPORT.md - Full technical rating
📄 PROJECT_COMPLETION_SUMMARY.md - Complete feature list
📄 QUICK_REFERENCE.md - Command reference
📄 README.md - Original setup guide
```

### Common Questions

**Q: Is my data secure?**
A: Yes! Data stays in your browser. Never sent anywhere.

**Q: Can multiple people use it?**
A: Yes! Company selection allows different users.

**Q: How much does it cost?**
A: Free! No server costs, no subscriptions.

**Q: Can I customize it?**
A: Yes! Full source code available.

**Q: Does it work offline?**
A: Yes! Everything works without internet.

**Q: How do I deploy it?**
A: Easy! See deployment section in README.

---

## 🎉 You're Ready!

Your billing software is ready to use right now!

### Quick Checklist:
- ✅ App running at localhost:3000
- ✅ All features working
- ✅ Data auto-saves
- ✅ Ready to create invoices
- ✅ Ready to track payments
- ✅ Ready to analyze finances

### Next Steps:
1. 🎯 Create your first invoice
2. 💾 Save a client
3. 💰 Record a payment
4. 📊 View analytics
5. 📄 Export to PDF
6. 🚀 Deploy to production

**Enjoy your billing software! 🎉**

