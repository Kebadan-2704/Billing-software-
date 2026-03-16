# 🛠️ Developer Reference Guide

## Project Structure

```
md-construction-app/
├── app/
│   ├── api/               # Backend API routes
│   │   ├── projects/      # Project endpoints
│   │   └── tasks/         # Task endpoints
│   ├── company-selection/ # Company selection page
│   ├── dashboard/         # Dashboard page
│   ├── invoice/           # Invoice generation page
│   ├── settings/          # Company settings page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── ProfessionalDashboard.tsx       # Main dashboard component
│   ├── EnhancedProfessionalInvoice.tsx # Invoice component
│   ├── CompanyCard.tsx                 # Company selection card
│   ├── BillingDashboard.tsx            # Billing dashboard
│   └── Other components...
├── lib/
│   ├── auth-context.tsx   # Authentication context
│   └── types.ts           # TypeScript type definitions
├── public/                # Static assets
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript config
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies
└── Documentation files
    ├── FEATURES.md
    ├── QUICK_START.md
    ├── SYSTEM_SUMMARY.md
    ├── DEVELOPMENT_CHECKLIST.md
    └── More...
```

## Key Components

### 1. ProfessionalDashboard Component
**File:** `components/ProfessionalDashboard.tsx`

**Features:**
- KPI card display
- Financial statement table
- CSV export functionality
- Company information header
- Navigation buttons

**Props:** None (uses useAuth hook)

**State:**
- `selectedPeriod` - '3months' or '6months'

**Key Functions:**
- `formatAmount()` - Format numbers as Indian Rupees
- `downloadStatement()` - Export CSV file

---

### 2. Professional Invoice Component
**File:** `components/EnhancedProfessionalInvoice.tsx`

**Features:**
- Invoice template rendering
- PDF generation via html2canvas + jsPDF
- Professional formatting
- GST calculation

**Props:**
```typescript
interface ProfessionalInvoiceProps {
  invoiceNumber?: string
  issueDate?: string
  dueDate?: string
  client?: Client
  items?: InvoiceItem[]
}
```

**Key Functions:**
- `downloadPDF()` - Generate and download invoice as PDF

---

### 3. Company Selection Page
**File:** `app/company-selection/page.tsx`

**Features:**
- Company card display
- Password modal
- Company selection logic
- Navigation to dashboard

**State:**
- `selectedCompanyId` - Currently selected company
- `password` - Password input
- `error` - Error messages
- `isLoading` - Loading state

---

### 4. Dashboard Page
**File:** `app/dashboard/page.tsx`

**Features:**
- Authentication check
- Loads ProfessionalDashboard component
- Redirect to company-selection if not authenticated

---

### 5. Settings Page
**File:** `app/settings/page.tsx`

**Features:**
- Company information editing
- GST number management
- Form submission
- Logout functionality

**Form Fields:**
- companyName
- gstNumber
- email
- phone
- address
- city
- state

---

## Authentication

### Auth Context
**File:** `lib/auth-context.tsx`

```typescript
export interface Company {
  id: number
  name: string
  password: string
  description: string
  icon: string
  color: string
  gstNumber?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  projects?: number
  budget?: number
  spent?: number
  teamMembers?: number
}

export const COMPANIES: Company[] = [
  // Company data here
]
```

**Hooks:**
- `useAuth()` - Get authentication context
  - `currentCompany` - Currently logged-in company
  - `isAuthenticated` - Authentication status
  - `login()` - Login function
  - `logout()` - Logout function

---

## Types

### TypeScript Definitions
**File:** `lib/types.ts`

**Invoice Types:**
```typescript
export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxable: boolean
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  taxId?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  clientId: string
  client: Client
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled'
  notes?: string
  termsAndConditions?: string
  paymentTerms?: string
  createdAt: string
  updatedAt: string
}
```

**Company Types:**
```typescript
export interface CompanySettings {
  companyName: string
  email: string
  phone: string
  gstNumber?: string
  companyLogo?: string
  address?: string
  city?: string
  state?: string
}

export interface MonthlyData {
  month: string
  projectsCount: number
  amountReceived: number
  amountPending: number
  totalAmount: number
}

export interface CompanyFinancials {
  totalProjects: number
  totalAmountReceived: number
  totalAmountPending: number
  totalAmount: number
  monthlyData: MonthlyData[]
}
```

---

## Data Flow

### Company Selection Flow
```
CompanySelectionPage
  ↓ (Select company)
  ↓ (Show password modal)
  ↓ (Enter password)
  ↓ (Validate password)
  ↓ (Call login())
  ↓ (Set currentCompany)
  ↓ (Navigate to /dashboard)
  ↓
DashboardPage
```

### Dashboard Flow
```
DashboardPage
  ↓ (Check isAuthenticated)
  ↓ (Verify currentCompany)
  ↓ (Load ProfessionalDashboard)
  ↓
ProfessionalDashboard
  ├ Display KPI Cards
  ├ Display Monthly Statement
  ├ Show Navigation Buttons
  └ Enable CSV Export
```

### Invoice Generation Flow
```
InvoicePage
  ↓ (Load sample invoice data)
  ↓ (Render professional template)
  ↓
User Actions:
  ├ Download PDF
  │   ├ html2canvas capture
  │   ├ jsPDF generation
  │   └ Trigger browser download
  │
  ├ Send Email
  │   └ (Ready for integration)
  │
  └ View Preview
      └ Rendered on page
```

---

## Styling

### Tailwind CSS Configuration
**File:** `tailwind.config.ts`

**Custom Classes Used:**
- Gradient backgrounds: `from-[color] to-[color]`
- Responsive grids: `md:grid-cols-2`, `md:grid-cols-3`
- Shadow effects: `shadow-lg`, `shadow-2xl`
- Animations: `animate-*`

### Color Scheme

**Company Colors:**
- MD GROUP: `from-blue-600 to-blue-400`
- MD AUTOMIND SOLUTIONS: `from-orange-600 to-orange-400`
- MD AUTOMIND ACADEMY: `from-green-600 to-green-400`

**Status Colors:**
- Success: Green shades (`from-green-500 to-green-600`)
- Warning: Orange shades (`from-orange-500 to-orange-600`)
- Info: Blue shades (`from-blue-500 to-blue-600`)
- Pending: Purple shades (`from-purple-500 to-purple-600`)

---

## Animation Framework

**Framer Motion Usage:**

```typescript
// Entrance animations
<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} />

// Hover effects
<motion.div whileHover={{ scale: 1.05, y: -10 }} />

// Exit animations
<motion.div exit={{ opacity: 0, y: -10 }} />

// Stagger animations
<motion.div variants={containerVariants} initial="hidden" animate="visible" />

// Continuous animations
<motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ repeat: Infinity }} />
```

---

## Dependencies

### Core
- `next`: ^15.1.0
- `react`: ^18.3.1
- `react-dom`: ^18.3.1
- `typescript`: ^5.6.2

### UI & Animations
- `framer-motion`: ^12.36.0
- `lucide-react`: ^0.577.0
- `tailwindcss`: ^3.4.3

### Export & Download
- `html2canvas`: ^1.4.1
- `jspdf`: ^4.2.0

### Dev Dependencies
- `@types/react`: ^18.3.3
- `@types/react-dom`: ^18.3.0
- `@types/node`: ^20.15.0
- `eslint`: ^8.56.0
- `autoprefixer`: ^10.4.19
- `postcss`: ^8.4.38

---

## API Routes

### Projects API
**Endpoint:** `GET/POST /api/projects`

**Purpose:** Manage project data

### Tasks API
**Endpoint:** `GET/POST /api/tasks`

**Purpose:** Manage task data

*Note: Currently configured but can be expanded for backend integration*

---

## Configuration Files

### tsconfig.json
- Target: ES2020
- Module: ESNext
- JSX: preserve
- Path aliases: `@/*` → `./`

### next.config.js
- React.StrictMode enabled
- Image optimization configured

### tailwind.config.ts
- Custom color palette
- Extended theme settings
- Animation configurations

---

## Best Practices

### Component Structure
```typescript
'use client'  // Client component directive

import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function ComponentName() {
  // Hooks
  const { currentCompany } = useAuth()
  const router = useRouter()
  
  // State
  const [state, setState] = useState()
  
  // Effects
  useEffect(() => {}, [])
  
  // Handlers
  const handleEvent = () => {}
  
  // Render
  return (
    <motion.div>
      {/* JSX */}
    </motion.div>
  )
}
```

### Styling Pattern
```typescript
className={`
  base-styles
  ${conditional ? 'conditional-styles' : 'alternate-styles'}
  md:responsive-styles
`}
```

### Animation Pattern
```typescript
<motion.component
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  whileHover={{ scale: 1.05 }}
/>
```

---

## Performance Optimization

- **Code Splitting:** Next.js automatic route-based splitting
- **Image Optimization:** Next.js Image component
- **Animation Performance:** Hardware-accelerated transforms
- **State Management:** Context API for global state
- **Memoization:** React.memo for expensive components

---

## Future Enhancement Opportunities

1. **Database Integration**
   - MongoDB or PostgreSQL
   - Real invoice storage
   - Historical data retention

2. **Authentication**
   - JWT tokens
   - Role-based access
   - Multi-user support

3. **Email Integration**
   - Nodemailer or SendGrid
   - Invoice email delivery
   - Automated reminders

4. **Payment Processing**
   - Stripe integration
   - Payment tracking
   - Automated invoicing

5. **Advanced Reporting**
   - Custom date ranges
   - Advanced filters
   - Data visualization

6. **Mobile App**
   - React Native version
   - Offline support
   - Push notifications

---

## Troubleshooting Guide

### Build Issues
```bash
# Clear cache
rm -rf .next
npm run build

# Check dependencies
npm install

# Run development server
npm run dev
```

### Component Not Loading
- Check import statements
- Verify 'use client' directive
- Check console for errors
- Verify props passing

### Styling Issues
- Rebuild Tailwind: `npm run build`
- Check class names spelling
- Verify responsive classes
- Check tailwind.config.ts

### Animation Not Working
- Verify Framer Motion import
- Check animation syntax
- Ensure motion.divs are used
- Check browser DevTools

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**Last Updated:** March 15, 2026  
**Version:** 2.0.0  
**Status:** Production Ready
