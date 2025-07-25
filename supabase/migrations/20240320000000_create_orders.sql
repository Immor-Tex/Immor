-- Drop the tables if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- Create orders table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    items JSONB NOT NULL,
    shipping_address JSONB NOT NULL
);

-- Create order_items table
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for orders table
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Create indexes for order_items table
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON orders;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON order_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON order_items;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON order_items;

-- Create policies for orders table
CREATE POLICY "Enable read access for authenticated users"
ON orders FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON orders FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON orders FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON orders FOR DELETE
TO authenticated
USING (true);

-- Create policies for order_items table
CREATE POLICY "Enable read access for authenticated users"
ON order_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON order_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON order_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create function to update inventory on order
CREATE OR REPLACE FUNCTION update_inventory_on_order(order_items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    item record;
BEGIN
    -- Loop through each item in the order
    FOR item IN SELECT * FROM jsonb_to_recordset(order_items) AS x(product_id uuid, quantity integer)
    LOOP
        -- Update product stock
        UPDATE products
        SET stock = stock - item.quantity
        WHERE id = item.product_id;
    END LOOP;
END;
$$;

-- Create function to restore inventory on order deletion
CREATE OR REPLACE FUNCTION restore_inventory_on_order_deletion(order_items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    item record;
BEGIN
    -- Loop through each item in the order
    FOR item IN SELECT * FROM jsonb_to_recordset(order_items) AS x(product_id uuid, quantity integer)
    LOOP
        -- Restore product stock
        UPDATE products
        SET stock = stock + item.quantity
        WHERE id = item.product_id;
    END LOOP;
END;
$$;

-- Create sequence for daily order numbers
CREATE SEQUENCE IF NOT EXISTS daily_order_number_seq;

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    today text;
    next_num integer;
    new_order_number text;
BEGIN
    -- Get today's date in YYYYMMDD format
    today := to_char(CURRENT_DATE, 'YYYYMMDD');
    
    -- Get next sequence number
    next_num := nextval('daily_order_number_seq');
    
    -- Format: ORD-YYYYMMDD-XXXX
    new_order_number := 'ORD-' || today || '-' || lpad(next_num::text, 4, '0');
    
    RETURN new_order_number;
END;
$$;

-- Reset sequence daily
CREATE OR REPLACE FUNCTION reset_daily_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Reset sequence at midnight
    IF current_timestamp::time = '00:00:00' THEN
        ALTER SEQUENCE daily_order_number_seq RESTART WITH 1;
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger to reset sequence daily
CREATE OR REPLACE TRIGGER reset_order_number_sequence
    AFTER INSERT ON orders
    FOR EACH STATEMENT
    EXECUTE FUNCTION reset_daily_order_number(); 