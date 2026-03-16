# 🔧 COMPLETE FUNCTION REFERENCE GUIDE

## 📍 LOCATION MAP & FUNCTION INVENTORY

```
c:\Users\welcome\Desktop\md-construction-app\
│
├── lib/
│   ├── auth-context.tsx
│   │   ├── AuthProvider (component)
│   │   ├── login()
│   │   ├── logout()
│   │   └── useAuth()
│   │
│   └── types.ts
│       ├── Invoice (interface)
│       ├── InvoiceItem (interface)
│       ├── Client (interface)
│       ├── CompanySettings (interface)
│       └── CompanyFinancials (interface)
│
├── components/
│   ├── BillingDashboard.tsx (PRIMARY)
│   │   ├── createInvoice()
│   │   ├── deleteInvoice()
│   │   ├── exportPdf()
│   │   ├── printInvoice()
│   │   ├── getStatusColor()
│   │   └── [UI: Form, List, Modals]
│   │
│   ├── ProfessionalInvoice.tsx
│   │   └── Invoice template rendering
│   │
│   ├── CompanyCard.tsx
│   │   └── Company selection card UI
│   │
│   └── Other components (stubs)
│
├── app/
│   ├── page.tsx (Landing)
│   ├── layout.tsx (Root with AuthProvider)
│   │
│   ├── company-selection/
│   │   └── page.tsx
│   │       ├── handlePasswordSubmit()
│   │       ├── closePasswordModal()
│   │       └── [UI: Company cards, password modal]
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │       └── Loads BillingDashboard component
│   │
│   ├── settings/
│   │   └── page.tsx (Company settings page)
│   │
│   └── api/
│       ├── projects/route.ts (stub)
│       └── tasks/route.ts (stub)
│
└── Configuration Files
    ├── package.json (dependencies)
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── next.config.js
    └── postcss.config.js
```

---

## 🔄 FUNCTION CALL FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│ USER STARTS APP                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │ page.tsx (Landing)   │
         └────────────┬─────────┘
                      │
                      ▼
    ┌─────────────────────────────────┐
    │ company-selection/page.tsx       │
    │ ✓ Render company cards          │
    │ ✓ Show COMPANIES array          │
    └────────────┬────────────────────┘
                 │
    ┌────────────▼──────────────┐
    │ Click company card        │
    │ Show password modal       │
    │ handlePasswordSubmit()    │
    └────────────┬──────────────┘
                 │
                 ▼
    ┌───────────────────────────────────┐    ┌─────────────────┐
    │ login(company, password)          │───▶ CheckPassword    │
    │ (from auth-context)               │    └────┬────────────┘
    └────────────┬──────────────────────┘         │
                 │◀─────────────────────────────▶ │ Valid?
                 │                               │
                 ▼                               ▼
         ┌──────────────────┐          ┌─────────────────┐
         │ SUCCESS          │          │ Show error      │
         │ setAuth(company) │          │ Retry           │
         │ setIsAuth(true)  │          └─────────────────┘
         └────────┬─────────┘
                  │
                  ▼ router.push('/dashboard')
         ┌─────────────────────────┐
         │ dashboard/page.tsx       │
         │ ✓ Check isAuthenticated │
         │ ✓ Load BillingDashboard │
         └────────────┬────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │ BillingDashboard Component           │
    │                                       │
    │ STATE:                               │
    │ - invoices[] (empty initially)       │
    │ - showNewInvoiceModal               │
    │ - showInvoiceView                   │
    │ - selectedInvoice                   │
    │ - formData {client, item}           │
    └────────────┬────────────────────────┘
                 │
        ┌────────┴─────────┬──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────┐    ┌──────────────┐    ┌──────────────┐
   │NEW       │    │VIEW INVOICE  │    │DELETE        │
   │INVOICE   │    │              │    │              │
   │createInv │    │showInvoice   │    │deleteInv()   │
   │()        │    │View()        │    │              │
   └─────────┘    └──────────────┘    └──────────────┘
        │                 │                  │
        │                 ▼                  │
        │         ┌────────────────┐        │
        │         │Print/Export    │        │
        │         │printInvoice()  │        │
        │         │exportPdf()     │        │
        │         └────────────────┘        │
        └────────────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Logout Button        │
              │ logout()             │
              │ setAuth(null)        │
              │ setIsAuth(false)     │
              └────────────┬─────────┘
                           │
                           ▼
              Back to company-selection
```

---

## ⚙️ DETAILED FUNCTION SPECIFICATIONS

### **1. login() - Authentication Function**

**Location:** `lib/auth-context.tsx`

**Signature:**
```typescript
login(company: Company, password: string): boolean
```

**What It Does:**
- Compares provided password with `company.password`
- If match: Sets `currentCompany` state, sets `isAuthenticated = true`
- If no match: Returns false, no state change
- Returns boolean for success/failure

**Called By:**
- `company-selection/page.tsx` → `handlePasswordSubmit()`

**Example:**
```typescript
const isValid = login(selectedCompany, "admin123")
if (isValid) {
  router.push('/dashboard')  // Success
} else {
  setError('Invalid credentials')  // Failure
}
```

**Dependencies:**
- React Context (useState)
- No external services

**Related Functions:**
- logout()

---

### **2. logout() - Clear Authentication**

**Location:** `lib/auth-context.tsx`

**Signature:**
```typescript
logout(): void
```

**What It Does:**
- Clears `currentCompany` (sets to null)
- Sets `isAuthenticated = false`
- Effectively "logs out" user

**Called By:**
- `BillingDashboard.tsx` → `handleLogout()`

**Example:**
```typescript
const handleLogout = () => {
  logout()  // Clear auth state
  router.push('/company-selection')  // Redirect
}
```

**Dependencies:**
- React Context (useState)

**Related Functions:**
- login()

---

### **3. createInvoice() - Create New Invoice**

**Location:** `components/BillingDashboard.tsx`

**Signature:**
```typescript
createInvoice(): void
```

**What It Does:**
1. Validates required fields: `clientName`, `itemDescription`, `itemPrice`
2. Generates `invoiceNumber` (format: `INV-{companyId}-{timestamp}`)
3. Calculates dates:
   - `issueDate`: Today
   - `dueDate`: Provided or +30 days
4. Calculates amounts:
   - `subtotal = quantity × unitPrice`
   - `taxAmount = subtotal × 0.18` (18% GST)
   - `total = subtotal + taxAmount`
5. Creates Invoice object
6. Adds to `invoices[]` state (newest first)
7. Resets form

**Called By:**
- User clicks "Create Invoice" button in modal

**Validation:**
```typescript
if (!formData.clientName || !formData.itemDescription || !formData.itemPrice) {
  alert('Please fill in all required fields')
  return
}
```

**Example:**
```typescript
const newInvoice = {
  id: "1234567890",
  invoiceNumber: "INV-1-67890",
  issueDate: "2026-03-15",
  dueDate: "2026-04-14",
  clientId: "John Doe",
  client: { name: "John Doe", email: "john@example.com", ... },
  items: [{
    id: "1",
    description: "Professional Services",
    quantity: 2,
    unitPrice: 500,
    amount: 1000,
    taxable: true
  }],
  subtotal: 1000,
  taxRate: 0.18,
  taxAmount: 180,
  total: 1180,
  status: "Draft",
  createdAt: "2026-03-15T...",
  updatedAt: "2026-03-15T..."
}
```

**Dependencies:**
- `formData` state
- `currentCompany` from auth context
- Date library (built-in JavaScript)

**Related Functions:**
- deleteInvoice()
- updateInvoice() *[doesn't exist yet]*

---

### **4. deleteInvoice() - Remove Invoice**

**Location:** `components/BillingDashboard.tsx`

**Signature:**
```typescript
deleteInvoice(id: string): void
```

**What It Does:**
1. Shows confirmation dialog: "Are you sure?"
2. If confirmed: Filters invoice from `invoices[]` array
3. Updates UI (invoice disappears from list)
4. If cancelled: Does nothing

**Called By:**
- User clicks "Delete" icon on invoice card

**Example:**
```typescript
deleteInvoice("1234567890")
// Confirmation: "Are you sure you want to delete this invoice?"
// If YES: invoices = invoices.filter(inv => inv.id !== "1234567890")
// If NO: Action cancelled
```

**State Changes:**
```typescript
setInvoices(invoices.filter(inv => inv.id !== id))
```

**Dependencies:**
- `invoices` state
- Browser `confirm()` dialog

**Related Functions:**
- createInvoice()

---

### **5. exportPdf() - Download as PDF**

**Location:** `components/BillingDashboard.tsx`

**Signature:**
```typescript
exportPdf(invoice: Invoice): Promise<void>
```

**What It Does:**
1. Captures the invoice HTML from `invoiceRef`
2. Converts HTML to canvas image using `html2canvas`
3. Creates PDF document using `jsPDF`
4. Adds canvas image to PDF
5. Triggers download with filename: `{invoiceNumber}.pdf`

**Called By:**
- User clicks "Download PDF" button on invoice detail

**Libraries Used:**
- `html2canvas` - Convert HTML to canvas
- `jsPDF` - Generate PDF files

**Example:**
```typescript
// User views: "INV-1-67890"
// Clicks: Download PDF button
// Result: File downloaded as "INV-1-67890.pdf"
```

**Code:**
```typescript
const exportPdf = async (invoice: Invoice) => {
  if (invoiceRef.current) {
    const canvas = await html2canvas(invoiceRef.current, { scale: 2 })
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 10, 10, 190, 277)
    pdf.save(`${invoice.invoiceNumber}.pdf`)
  }
}
```

**Dependencies:**
- `html2canvas` library
- `jsPDF` library
- `invoiceRef` (React ref to invoice HTML)

**Related Functions:**
- printInvoice()

---

### **6. printInvoice() - Print Invoice**

**Location:** `components/BillingDashboard.tsx`

**Signature:**
```typescript
printInvoice(): void
```

**What It Does:**
- Opens browser print dialog
- User can print to printer or "Print to PDF"
- No file download (uses browser native print)

**Called By:**
- User clicks "Print" button on invoice detail

**Example:**
```typescript
printInvoice()
// Result: Browser print dialog opens
// User sees invoice preview
// User can: Print to printer or Print to PDF
```

**Code:**
```typescript
const printInvoice = () => {
  window.print()
}
```

**CSS Support:**
```css
@media print {
  body { margin: 0; padding: 0; background: white; }
  .fixed, button { display: none !important; }
}
```

**Dependencies:**
- Browser `window.print()` API
- CSS media queries

**Related Functions:**
- exportPdf()

---

### **7. getStatusColor() - Status Styling**

**Location:** `components/BillingDashboard.tsx`

**Signature:**
```typescript
getStatusColor(status: string): string
```

**What It Does:**
- Maps invoice status to Tailwind CSS color classes
- Returns color for status badge display

**Status Mapping:**
```typescript
"Paid"      → "bg-green-100 text-green-800"   // Green
"Sent"      → "bg-blue-100 text-blue-800"     // Blue
"Overdue"   → "bg-red-100 text-red-800"       // Red
"Draft"     → "bg-gray-100 text-gray-800"     // Gray
"Cancelled" → "bg-slate-100 text-slate-800"   // Slate
default     → "bg-gray-100 text-gray-800"     // Gray
```

**Called By:**
- Invoice list rendering
- Invoice detail modal

**Example:**
```typescript
<span className={getStatusColor("Paid")}>
  Paid
</span>
// Result: Green badge with "Paid" text
```

**Dependencies:**
- Tailwind CSS classes
- No external libraries

---

### **8. handlePasswordSubmit() - Form Submission**

**Location:** `app/company-selection/page.tsx`

**Signature:**
```typescript
handlePasswordSubmit(e: React.FormEvent): Promise<void>
```

**What It Does:**
1. Prevents default form submission
2. Sets `isLoading = true` (for UI feedback)
3. Clears any previous errors
4. Delays 600ms (for UX perception)
5. Calls `login(selectedCompany, password)`
6. If success: Navigates to `/dashboard`
7. If failure: Shows error message, clears password

**Called By:**
- User submits password form

**Example:**
```typescript
// User enters password "admin123"
// Clicks "Login"
// 600ms delay...
// login() validates
// If valid: Redirect to /dashboard
// If invalid: Show "Invalid credentials. Please try again."
```

**Error Handling:**
```typescript
if (selectedCompany && login(selectedCompany, password)) {
  setIsLoading(false)
  router.push('/dashboard')
} else {
  setError('Invalid credentials. Please try again.')
  setPassword('')
  setIsLoading(false)
}
```

**Dependencies:**
- `useAuth()` hook
- `useRouter()` hook
- `selectedCompany` state

**Related Functions:**
- login()
- closePasswordModal()

---

### **9. closePasswordModal() - Close Modal**

**Location:** `app/company-selection/page.tsx`

**Signature:**
```typescript
closePasswordModal(): void
```

**What It Does:**
- Clears `selectedCompanyId` (hides modal)
- Resets `password` field
- Clears `error` message

**Called By:**
- User clicks close/cancel button
- User clicks outside modal

**Example:**
```typescript
closePasswordModal()
// Result: Password modal disappears
//         Form is reset
//         User can select different company
```

**Dependencies:**
- Component `state`

**Related Functions:**
- handlePasswordSubmit()

---

## 🔌 CURRENTLY UNUSED FUNCTIONS

### **In Types But Not Used:**
```typescript
CompanyFinancials {
  totalProjects: number
  totalAmountReceived: number
  totalAmountPending: number
  totalAmount: number
  monthlyData: MonthlyData[]
}
// ❌ No functions use this yet
// 💡 Needed for: Dashboard analytics

MonthlyData {
  month: string
  projectsCount: number
  amountReceived: number
  amountPending: number
  totalAmount: number
}
// ❌ No functions use this yet
// 💡 Needed for: Monthly reporting
```

### **API Endpoints (Stubs):**
```typescript
/api/projects/route.ts  // Returns []
/api/tasks/route.ts     // Returns []
// ❌ Not connected to anything
// 💡 Ready for: Backend development
```

---

## 📈 CALL DEPENDENCY TREE

```
Entry Point
    │
    └─→ AuthProvider
        │
        ├─→ useAuth()
        │   ├─→ login()
        │   └─→ logout()
        │
        └─→ Page Routing
            │
            ├─→ /company-selection
            │   ├─→ COMPANIES (data)
            │   ├─→ handlePasswordSubmit()
            │   │   └─→ login()
            │   ├─→ closePasswordModal()
            │   └─→ [UI Components]
            │
            ├─→ /dashboard
            │   └─→ BillingDashboard
            │       ├─→ createInvoice()
            │       │   └─→ Invoice (type)
            │       ├─→ deleteInvoice()
            │       ├─→ exportPdf()
            │       │   └─→ html2canvas
            │       │   └─→ jsPDF
            │       ├─→ printInvoice()
            │       ├─→ getStatusColor()
            │       └─→ [UI Components]
            │
            ├─→ /invoice
            │   └─→ ProfessionalInvoice
            │
            ├─→ /settings
            │   └─→ Company settings form
            │
            └─→ /api/*
                ├─→ /api/projects
                └─→ /api/tasks
```

---

## 🎯 WHAT'S MISSING?

These functions **don't exist yet** but would improve the app:

```typescript
// CRITICAL
❌ updateInvoice()       - Edit existing invoice
❌ saveToStorage()       - Persist to localStorage/database
❌ loadFromStorage()     - Retrieve saved invoices
❌ searchInvoices()      - Filter by criteria
❌ calculateMetrics()    - Dashboard KPI numbers

// IMPORTANT
❌ addLineItem()         - Add multiple items to invoice
❌ removeLineItem()      - Remove item from invoice
❌ addPayment()          - Record payment
❌ sendEmail()           - Email invoice to client
❌ validateFormData()    - Better input validation

// NICE TO HAVE
❌ applyDiscount()       - Apply discount to invoice
❌ generateReport()      - Financial report
❌ exportToCSV()         - Export invoice list
❌ importInvoices()      - Bulk import
❌ calculateDueDate()    - Smart date calculation
```

---

## 💡 NEXT STEPS

1. **Review** this function reference
2. **Identify** which functions to add first
3. **Plan** feature implementation
4. **Request** specific function builds

Ready to implement? Ask for:
- "Build multiple line items feature"
- "Add localStorage persistence"
- "Create invoice editing function"
- Or any other function from the list above!
