-- 1. Create Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  gst_number TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id INTEGER REFERENCES companies(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'India',
  gst_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id INTEGER REFERENCES companies(id),
  client_id UUID REFERENCES clients(id),
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  subtotal NUMERIC DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0.18,
  tax_amount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Draft',
  notes TEXT,
  payment_terms TEXT,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id INTEGER REFERENCES companies(id),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Populate Initial Data
INSERT INTO companies (name, password, description, icon, color, gst_number, email, phone, address, city, state, logo_url)
SELECT 'MD AUTO MINDS', 'admin123', 'Automotive Solutions & Innovation', '', 'from-indigo-700 to-indigo-600', '27AABCU9003R1Z0', 'billing@mdautominds.com', '+91-9876543210', 'Plot No. 123, Industrial Complex, Miyapur', 'Hyderabad', 'Telangana', '/md-logo-01.png'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'MD AUTO MINDS');

INSERT INTO companies (name, password, description, icon, color, gst_number, email, phone, address, city, state, logo_url)
SELECT 'MD AUTO ACADEMY', 'academy123', 'Automotive Education & Training', '', 'from-blue-700 to-blue-600', '27AABCU9003R1Z1', 'info@mdautoacademy.com', '+91-9876543211', 'Plot No. 456, Education Hub, Kukatpally', 'Hyderabad', 'Telangana', '/md-logo-02.png'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'MD AUTO ACADEMY');

INSERT INTO companies (name, password, description, icon, color, gst_number, email, phone, address, city, state, logo_url)
SELECT 'MD GROUPS OF ENTERPRISES', 'enterprise123', 'Global Infrastructure & Trade', '', 'from-emerald-700 to-emerald-600', '27AABCU9003R1Z2', 'admin@mdgroups.com', '+91-9876543212', 'Building 10, Hi-Tech City, Madhapur', 'Hyderabad', 'Telangana', '/md-logo-03.png'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'MD GROUPS OF ENTERPRISES');

-- 6. Schema Repair (Ensures existing tables are updated)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS gst_number TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
