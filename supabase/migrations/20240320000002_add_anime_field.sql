-- Add anime field to products table
ALTER TABLE products ADD COLUMN anime TEXT;

-- Update existing products to have a default anime value
UPDATE products SET anime = 'one_piece' WHERE category = 'anime';

-- Add check constraint for anime field
ALTER TABLE products ADD CONSTRAINT products_anime_check 
CHECK (anime IN ('one_piece', 'hunter_x_hunter', 'naruto', 'dragon_ball', 'jujutsu_kaisen', 'attack_on_titan', 'death_note', 'other') OR anime IS NULL); 