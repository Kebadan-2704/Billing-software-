# MD GROUP OF ENTERPRISES - Professional Billing System

## 🎯 Overview

This is a professional GST-compliant billing and project management system for MD Group of Enterprises with three subsidiary companies:

- **MD GROUP OF ENTERPRISES** - Construction & Business Solutions
- **MD AUTOMIND SOLUTIONS** - Automotive IT & Business Solutions  
- **MD AUTOMIND ACADEMY** - Professional Training & Development

## ✨ Key Features

### 1. **Company Selection System**
- Beautiful card-based company selection interface
- Display of company details including GST numbers
- Project and team member counts
- Budget information
- Password-protected access to each company

**Access:** http://localhost:3000/company-selection

### 2. **Professional Dashboard**
- Real-time financial overview with KPI cards showing:
  - Total number of projects
  - Amount received from clients
  - Amount pending/outstanding
  - Total amount
  
- **6-Month Financial Statement** showing:
  - Monthly breakdown of projects
  - Amount received per month
  - Amount pending per month
  - Total amounts
  
- **Download Functionality** - Export statements as CSV files

**Access:** http://localhost:3000/dashboard

**Demo Credentials:**
- MD GROUP OF ENTERPRISES: Password `1234`
- MD AUTOMIND SOLUTIONS: Password `5678`
- MD AUTOMIND ACADEMY: Password `9012`

### 3. **Professional Invoice Generator**
- Create professional, GSTcompliant invoices
- Company branding with logo and GST number
- Client information section
- Line-item billing with quantity and unit pricing
- Automatic GST (18%) calculation
- Download invoice as PDF
- Email functionality
- Professional formatting with company details

**Access:** http://localhost:3000/invoice

### 4. **Company Settings Page**
- Manage company information:
  - Company name
  - Email and phone
  - GST Registration Number
  - Address, city, and state
  
- All settings reflect on future invoices
- Secure settings management
- Logout functionality

**Access:** http://localhost:3000/settings

## 📊 Company Information

### MD GROUP OF ENTERPRISES
- **GST:** 27AABCU9003R1Z0
- **Email:** info@mdgroup.com
- **Phone:** +91-98765-43210
- **Location:** Hyderabad, Telangana
- **Projects:** 24 | **Team:** 78

### MD AUTOMIND SOLUTIONS
- **GST:** 27AABCU9004R1Z0
- **Email:** solutions@mdautomind.com
- **Phone:** +91-98765-43211
- **Location:** Bangalore, Karnataka
- **Projects:** 32 | **Team:** 95

### MD AUTOMIND ACADEMY
- **GST:** 27AABCU9005R1Z0
- **Email:** academy@mdautomind.com
- **Phone:** +91-98765-43212
- **Location:** Pune, Maharashtra
- **Projects:** 18 | **Team:** 42

## 🎨 Design Features

### UI/UX
- **Modern Design:** Gradient backgrounds with animated elements
- **Professional Colors:** Color-coded by company for easy identification
- **Responsive Layout:** Works seamlessly on desktop and tablets
- **Smooth Animations:** Framer Motion animations for engaging interactions
- **Dark Mode Header:** Professional dark header with contrasting content areas

### Technical Stack
- **Frontend:** Next.js 15, React 18, TypeScript
- **Styling:** Tailwind CSS with custom configurations
- **Animations:** Framer Motion
- **PDF Generation:** html2canvas + jsPDF
- **Icons:** Lucide React

## 📋 Navigation

```
Home Page (/)
  ↓
Company Selection (/company-selection)
  ├→ Enter Password
  ├→ Dashboard (/dashboard)
  │   ├→ View Financial Overview
  │   ├→ View Monthly Statements (3/6 months)
  │   ├→ Download Statement (CSV)
  │   ├→ Create Invoice (nav button)
  │   ├→ Settings (nav button)
  │   └→ Logout (nav button)
  ├→ Invoice (/invoice)
  │   ├→ View Professional Invoice
  │   ├→ Download PDF
  │   └→ Send Email
  └→ Settings (/settings)
      ├→ Edit Company Info
      ├→ Update GST Number
      ├→ Manage Contact Details
      └→ Logout
```

## 💳 Financial Data Structure

### Monthly Statement Fields
- **Month:** Display month and year
- **Projects:** Number of projects in that month
- **Amount Received:** Income received from clients
- **Amount Pending:** Outstanding/awaiting payment
- **Total Amount:** Sum of received and pending

### Key Metrics
- All amounts displayed in Indian Rupees (₹)
- Professional number formatting with commas
- 6-month rolling statement view
- Quick 3-month view option

## 🔐 Security Features

- Password-protected company access
- Company-specific data isolation
- Session-based authentication
- Logout functionality
- Secure settings management

## 📥 Download & Export

### CSV Statement Format
- Comprehensive financial data export
- Includes all 6-month data
- GST number for compliance
- Generation timestamp
- Easy import to Excel/Sheets

### PDF Invoice Features
- High-resolution output
- Professional formatting
- Company branding
- GST compliance information
- Easy to share and print

## 🚀 Getting Started

1. **Navigate to Home:**
   ```
   http://localhost:3000
   ```

2. **Select a Company:**
   - Click on any company card
   - Enter the demo password (shown in modal)

3. **Access Dashboard:**
   - View financial overview
   - Check monthly statements
   - Download statements

4. **Create Invoices:**
   - Click "Create Invoice" button
   - Review professional invoice
   - Download as PDF

5. **Manage Settings:**
   - Click "Settings" to manage company info
   - Update GST numbers
   - Modify contact details

## 📱 Responsive Design

- Desktop: Full layout with all features
- Tablet: Optimized grid layouts
- Mobile: Stack-based navigation
- All functionality available on all devices

## 🎯 Use Cases

1. **Monthly Financial Reporting** - Generate and download monthly statements
2. **Invoice Generation** - Create professional invoices for clients
3. **Multi-Company Management** - Manage multiple subsidiaries from one platform
4. **GST Compliance** - All invoices include GST calculations and company GST numbers
5. **Client Billing** - Professional invoice templates for different clients
6. **Financial Tracking** - Track received vs. pending amounts by month

## 🔄 Future Enhancements

- Database integration for persistent data
- Real invoice templates with client history
- Recurring invoices
- Payment tracking and reminders
- Multi-user access
- Advanced reporting and analytics
- Email invoice delivery integration
- Inventory management
- Tax return filing automation

## 📞 Support

For questions or issues, contact:
- **General:** info@mdgroup.com
- **Technical:** solutions@mdautomind.com
- **Training:** academy@mdautomind.com

---

**Version:** 2.0.0  
**Last Updated:** March 2026  
**Status:** Production Ready
