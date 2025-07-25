-- Drop existing constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- Add new constraint with all valid categories
ALTER TABLE products ADD CONSTRAINT products_category_check 
CHECK (category IN ('simple', 'oversized', 'delave', 'sweatshirt', 'hoodie', 'tote', 'anime')); 