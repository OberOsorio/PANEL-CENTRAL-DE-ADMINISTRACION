-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    organization_name TEXT NOT NULL,
    responsible_name TEXT NOT NULL,
    tax_id TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    country TEXT NOT NULL,
    department TEXT NOT NULL,
    city TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    active_users_count INTEGER DEFAULT 0,
    max_users_allowed INTEGER DEFAULT 0,
    active_campaigns_count INTEGER DEFAULT 0,
    notes TEXT,
    logo_url TEXT,
    user_id UUID NOT NULL DEFAULT auth.uid()
);

-- Enable RLS and create policy for clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY clients_policy ON clients
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create licenses table
CREATE TABLE IF NOT EXISTS licenses (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    activated_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    status TEXT NOT NULL,
    license_type TEXT NOT NULL,
    max_users INTEGER DEFAULT 0,
    used_users INTEGER DEFAULT 0,
    max_campaigns INTEGER DEFAULT 0,
    used_campaigns INTEGER DEFAULT 0,
    max_storage_gb INTEGER DEFAULT 0,
    enabled_module_codes TEXT[] DEFAULT '{}',
    license_key TEXT NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    user_id UUID NOT NULL DEFAULT auth.uid()
);

-- Enable RLS and create policy for licenses
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY licenses_policy ON licenses
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    currency TEXT NOT NULL,
    periodicity TEXT NOT NULL,
    start_date TEXT NOT NULL,
    next_billing_date TEXT NOT NULL,
    expiration_date TEXT NOT NULL,
    status TEXT NOT NULL,
    payment_method TEXT,
    user_id UUID NOT NULL DEFAULT auth.uid()
);

-- Enable RLS and create policy for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_policy ON subscriptions
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create users_list table
CREATE TABLE IF NOT EXISTS users_list (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    campaign_id TEXT,
    campaign_name TEXT,
    role_id TEXT NOT NULL,
    role_name TEXT NOT NULL,
    status TEXT NOT NULL,
    last_access_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    ip_address TEXT,
    avatar_url TEXT,
    user_id UUID NOT NULL DEFAULT auth.uid()
);

-- Enable RLS and create policy for users_list
ALTER TABLE users_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_list_policy ON users_list
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    name TEXT NOT NULL,
    candidate_name TEXT NOT NULL,
    election_type TEXT NOT NULL,
    territory TEXT NOT NULL,
    start_date TEXT NOT NULL,
    election_date TEXT NOT NULL,
    status TEXT NOT NULL,
    budget NUMERIC DEFAULT 0,
    spent NUMERIC DEFAULT 0,
    logo_url TEXT,
    user_id UUID NOT NULL DEFAULT auth.uid()
);

-- Enable RLS and create policy for campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY campaigns_policy ON campaigns
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    invoice_number TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    currency TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    paid_at TEXT,
    status TEXT NOT NULL,
    user_id UUID NOT NULL DEFAULT auth.uid()
);

-- Enable RLS and create policy for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoices_policy ON invoices
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user_id_ref TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    client_id TEXT,
    client_name TEXT,
    action TEXT NOT NULL,
    category TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    result TEXT NOT NULL,
    user_id UUID NOT NULL DEFAULT auth.uid()
);

-- Enable RLS and create policy for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_policy ON audit_logs
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    client_id TEXT,
    user_id UUID NOT NULL DEFAULT auth.uid()
);

-- Enable RLS and create policy for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_policy ON notifications
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
