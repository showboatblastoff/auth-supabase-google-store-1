import { createClient } from '@/utils/supabaseClient';

interface SeedCategory {
  name: string;
  slug: string;
  description: string;
}

interface SeedProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  inventory_count: number;
  category_slug: string;
  is_featured: boolean;
}

export async function seedCategories(): Promise<void> {
  const supabase = createClient();
  
  const categories: SeedCategory[] = [
    {
      name: 'Basketball Jerseys',
      slug: 'basketball-jerseys',
      description: 'High-quality basketball jerseys for fans and players'
    },
    {
      name: 'Footwear',
      slug: 'footwear',
      description: 'Performance basketball shoes and casual footwear'
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Basketball accessories including headbands, wristbands, and more'
    }
  ];
  
  for (const category of categories) {
    const { error } = await supabase
      .from('categories')
      .upsert([category], { onConflict: 'slug' });
    
    if (error) {
      console.error(`Error seeding category ${category.name}:`, error);
    } else {
      console.log(`Category ${category.name} seeded successfully`);
    }
  }
}

export async function seedProducts(): Promise<void> {
  const supabase = createClient();
  
  // First get the category IDs
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('id, slug');
  
  if (!categoriesData || categoriesData.length === 0) {
    console.error('No categories found. Please seed categories first.');
    return;
  }
  
  // Create a map of category slugs to IDs
  const categoryMap = new Map(
    categoriesData.map(category => [category.slug, category.id])
  );
  
  const basketballJerseyId = categoryMap.get('basketball-jerseys');
  
  if (!basketballJerseyId) {
    console.error('Basketball Jerseys category not found');
    return;
  }
  
  // Basketball jersey products
  const jerseys: SeedProduct[] = [
    {
      name: 'Classic Red Basketball Jersey #23',
      slug: 'classic-red-basketball-jersey-23',
      description: 'This classic red basketball jersey features the iconic number 23. Made with breathable, high-performance fabric for maximum comfort on and off the court.',
      price: 89.99,
      image_url: 'https://images.unsplash.com/photo-1518908336710-4e1cf821d3d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      inventory_count: 50,
      category_slug: 'basketball-jerseys',
      is_featured: true
    },
    {
      name: 'Blue Away Team Jersey #30',
      slug: 'blue-away-team-jersey-30',
      description: 'The blue away team jersey featuring number 30. Perfect for fans who want to support their favorite player on the road.',
      price: 79.99,
      image_url: 'https://images.unsplash.com/photo-1577212017446-3e3c80c6c4a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      inventory_count: 35,
      category_slug: 'basketball-jerseys',
      is_featured: true
    },
    {
      name: 'Black Special Edition Jersey #24',
      slug: 'black-special-edition-jersey-24',
      description: 'Limited edition black jersey commemorating the legendary number 24. Features premium materials and a sleek design.',
      price: 129.99,
      image_url: 'https://images.unsplash.com/photo-1574971690553-92594208efa7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      inventory_count: 15,
      category_slug: 'basketball-jerseys',
      is_featured: true
    },
    {
      name: 'White Home Team Jersey #7',
      slug: 'white-home-team-jersey-7',
      description: 'Classic white home team jersey with number 7. Features moisture-wicking technology to keep you cool during intense games.',
      price: 84.99,
      image_url: 'https://images.unsplash.com/photo-1571425156608-42edc8a4906f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      inventory_count: 40,
      category_slug: 'basketball-jerseys',
      is_featured: false
    },
    {
      name: 'Retro Green Basketball Jersey #33',
      slug: 'retro-green-basketball-jersey-33',
      description: 'Vintage-inspired green jersey with classic striping and number 33. A throwback to the golden era of basketball.',
      price: 99.99,
      image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      inventory_count: 25,
      category_slug: 'basketball-jerseys',
      is_featured: true
    },
    {
      name: 'Purple Championship Edition Jersey #8',
      slug: 'purple-championship-edition-jersey-8',
      description: 'Commemorate the championship with this limited edition purple jersey featuring number 8. Includes special embroidered details.',
      price: 119.99,
      image_url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      inventory_count: 20,
      category_slug: 'basketball-jerseys',
      is_featured: true
    }
  ];
  
  // Insert products with their category IDs
  for (const jersey of jerseys) {
    const categoryId = categoryMap.get(jersey.category_slug);
    
    if (!categoryId) {
      console.error(`Category with slug ${jersey.category_slug} not found`);
      continue;
    }
    
    const productData = {
      name: jersey.name,
      slug: jersey.slug,
      description: jersey.description,
      price: jersey.price,
      image_url: jersey.image_url,
      inventory_count: jersey.inventory_count,
      category_id: categoryId,
      is_featured: jersey.is_featured
    };
    
    const { error } = await supabase
      .from('products')
      .upsert([productData], { onConflict: 'slug' });
    
    if (error) {
      console.error(`Error seeding product ${jersey.name}:`, error);
    } else {
      console.log(`Product ${jersey.name} seeded successfully`);
    }
  }
}

export async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    await seedCategories();
    await seedProducts();
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
} 