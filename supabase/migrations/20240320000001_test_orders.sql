-- Insert test orders
INSERT INTO orders (
    order_number,
    user_id,
    customer_name,
    customer_email,
    total_amount,
    status,
    items,
    shipping_address
) VALUES 
(
    'ORD-001',
    '00000000-0000-0000-0000-000000000000', -- Replace with a real user ID if needed
    'Test Customer',
    'test@example.com',
    318.00,
    'pending',
    '[
        {
            "product_id": "00000000-0000-0000-0000-000000000001",
            "product_name": "Test Product",
            "quantity": 2,
            "price": 159.00
        }
    ]'::jsonb,
    '{
        "street": "123 Test St",
        "city": "Test City",
        "state": "TS",
        "zip": "12345",
        "country": "Test Country"
    }'::jsonb
),
(
    'ORD-002',
    '00000000-0000-0000-0000-000000000000', -- Replace with a real user ID if needed
    'Another Customer',
    'another@example.com',
    159.00,
    'processing',
    '[
        {
            "product_id": "00000000-0000-0000-0000-000000000002",
            "product_name": "Another Product",
            "quantity": 1,
            "price": 159.00
        }
    ]'::jsonb,
    '{
        "street": "456 Test Ave",
        "city": "Test Town",
        "state": "TS",
        "zip": "67890",
        "country": "Test Country"
    }'::jsonb
); 