-- Add colorImages column to products table
ALTER TABLE products
ADD COLUMN color_images JSONB DEFAULT '{}'::jsonb;

-- Update existing rows to have an empty object as default
UPDATE products
SET color_images = '{}'::jsonb
WHERE color_images IS NULL; 