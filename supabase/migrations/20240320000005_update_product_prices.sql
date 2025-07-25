-- Update all product prices to 159 MAD
UPDATE products 
SET price = 159.00 
WHERE price != 159.00;

-- Update any products that might have NULL prices
UPDATE products 
SET price = 159.00 
WHERE price IS NULL; 