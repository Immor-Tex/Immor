-- First, update existing products to use new categories
UPDATE products 
SET category = CASE 
    WHEN category = 'jersey' THEN 'sweatshirt'
    ELSE category 
END;

-- Drop the existing constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- Add the new constraint with updated categories
ALTER TABLE products ADD CONSTRAINT products_category_check 
CHECK (category IN ('simple', 'oversized', 'delave', 'sweatshirt', 'hoodie', 'tote')); 