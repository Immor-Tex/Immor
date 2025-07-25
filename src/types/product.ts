export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  anime?: AnimeType;  // Optional anime field for anime-related products
  sizes: string[];
  colors: string[];
  images: string[];
  color_images: { [key: string]: string[] };
  stock: number;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ProductCategory = 'simple' | 'oversized' | 'delave' | 'sweatshirt' | 'hoodie' | 'tote' | 'anime';

export type AnimeType = 'one_piece' | 'hunter_x_hunter' | 'naruto' | 'dragon_ball' | 'jujutsu_kaisen' | 'attack_on_titan' | 'death_note' | 'other';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}