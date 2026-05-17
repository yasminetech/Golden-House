const db = require('./db');
const bcrypt = require('bcryptjs');

const products = [
    {
        name: 'Artisanal Ceramic Vase',
        description: 'Hand-thrown matte ceramic vase with a minimalist silhouette, perfect for dried botanicals.',
        price: 85.00,
        image_url: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800',
        category: 'Vases',
        stock: 50
    },
    {
        name: 'Boho Rattan Mirror',
        description: 'A statement sunburst mirror handcrafted from sustainable natural rattan.',
        price: 120.00,
        image_url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800',
        category: 'Wall Decor',
        stock: 25
    },
    {
        name: 'Velvet Emerald Armchair',
        description: 'Luxurious deep emerald velvet armchair with gold-finished legs for a touch of opulence.',
        price: 450.00,
        image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800',
        category: 'Furniture',
        stock: 12
    },
    {
        name: 'Minimalist Wall Clock',
        description: 'Silent sweep movement with a brushed copper frame and clean white face.',
        price: 65.00,
        image_url: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800',
        category: 'Clocks',
        stock: 80
    },
    {
        name: 'Linen Textured Throw',
        description: 'Soft, breathable linen throw in a neutral oat shade, perfect for cozying up your sofa.',
        price: 45.00,
        image_url: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=800',
        category: 'Textiles',
        stock: 60
    },
    {
        name: 'Crystal Sculpture Base',
        description: 'Abstract glass sculpture that plays with light and shadows, a true conversation starter.',
        price: 110.00,
        image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
        category: 'Sculptures',
        stock: 15
    },
    {
        name: 'Marble Top Coffee Table',
        description: 'Solid Carrara marble top paired with a minimalist black steel frame.',
        price: 320.00,
        image_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800',
        category: 'Furniture',
        stock: 8
    },
    {
        name: 'Hand-Poured Soy Candle',
        description: 'Infused with essential oils of sandalwood and bergamot in a frosted glass jar.',
        price: 32.00,
        image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800',
        category: 'Fragrance',
        stock: 100
    },
    {
        name: 'Abstract Oil Painting',
        description: 'Original abstract composition in earthy tones, hand-painted on linen canvas.',
        price: 280.00,
        image_url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800',
        category: 'Art',
        stock: 5
    },
    {
        name: 'Nordic Wooden Bench',
        description: 'Clean lines and warm oak wood make this bench a versatile addition to any entryway.',
        price: 190.00,
        image_url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800',
        category: 'Furniture',
        stock: 10
    },
    {
        name: 'Macramé Wall Hanging',
        description: 'Intricate bohemian macramé piece made from recycled cotton cord.',
        price: 55.00,
        image_url: 'https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800',
        category: 'Wall Decor',
        stock: 30
    },
    {
        name: 'Terrazzo Table Lamp',
        description: 'Playful yet sophisticated lamp with a handmade terrazzo base and linen shade.',
        price: 89.00,
        image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
        category: 'Lighting',
        stock: 20
    }
];

async function seed() {
    try {
        console.log('Transforming to Home Decor Boutique...');
        
        // Seed Admin
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.execute('INSERT IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', 
            ['Admin', 'admin@goldenhouse.shop', hashedPassword, 'admin']);

        // PURGE ALL OLD PRODUCTS
        await db.execute('DELETE FROM products');
        
        // Seed curated Home Decor
        for (const p of products) {
            await db.execute(
                'INSERT INTO products (name, description, price, image_url, category, stock) VALUES (?, ?, ?, ?, ?, ?)',
                [p.name, p.description, p.price, p.image_url, p.category, p.stock]
            );
        }
        console.log('Success! Only Home Decor items remain.');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
seed();
