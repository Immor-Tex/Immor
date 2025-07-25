import { supabase } from '../lib/supabase';

export const updateAllProductPrices = async () => {
  try {
    console.log('Starting price update...');
    
    // First, get all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, price');
    
    if (fetchError) {
      console.error('Error fetching products:', fetchError);
      return;
    }
    
    console.log(`Found ${products?.length || 0} products to update`);
    
    if (!products || products.length === 0) {
      console.log('No products found to update');
      return;
    }
    
    // Update each product to 159 MAD
    const updatePromises = products.map(product => 
      supabase
        .from('products')
        .update({ price: 159 })
        .eq('id', product.id)
    );
    
    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    const successes = results.filter(result => !result.error);
    
    console.log(`Successfully updated ${successes.length} products`);
    
    if (errors.length > 0) {
      console.error(`Failed to update ${errors.length} products:`, errors);
    }
    
    console.log('Price update completed!');
    
  } catch (error) {
    console.error('Error updating prices:', error);
  }
};

// Function to run the update (you can call this from browser console)
(window as any).updatePrices = updateAllProductPrices; 