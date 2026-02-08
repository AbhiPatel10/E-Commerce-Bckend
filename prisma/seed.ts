import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';

const url = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
});

const prisma = new PrismaClient({ adapter });

const products = [
    {
        name: "Gucci Marmont Leather Bag",
        slug: "gucci-marmont-leather-bag",
        price: 1890,
        description: "The Gucci Marmont bag has been crafted in Italy from chevron-quilted leather and accented with the brand's iconic 'GG' plaque. This timeless piece features a sliding chain strap that can be worn on the shoulder or cross-body, making it versatile for any occasion.",
        shortDescription: "Italian leather with iconic GG plaque",
        // images will be handled separately or joined if simple string array not supported directly in relation, 
        // but the schema has Image model. For simplicity in this seed, we might skip complex relations or create them properly.
        // The current schema has `images Image[]`.
        categoryName: "Bags",
        stock: 5,
        features: ["Chevron-quilted leather", "Antique gold-toned hardware", "Microfiber lining", "Internal open pocket"],
        imageUrls: [
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1590735234551-0c58e8549d44?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&auto=format&fit=crop"
        ]
    },
    {
        name: "Calvin Klein Crew Neck Tee",
        slug: "calvin-klein-crew-neck-tee",
        price: 45,
        description: "An essential for every wardrobe, this Calvin Klein t-shirt is cut from soft cotton-jersey for a regular fit. The minimalist design is finished with the brand's logo discreetly embroidered on the chest. Perfect for layering or wearing solo with jeans.",
        shortDescription: "Premium cotton jersey with embroidered logo",
        categoryName: "Clothing",
        stock: 15,
        features: ["100% cotton", "Regular fit", "Crew neckline", "Embroidered logo"],
        imageUrls: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop"
        ]
    },
    {
        name: "Air Jordan 1 Retro High",
        slug: "air-jordan-1-retro-high",
        price: 180,
        description: "The Air Jordan 1 Retro High OG delivers heritage style with premium leather, comfortable cushioning and classic design details. Since its debut in 1985, this sneaker has revolutionized the sport and culture of basketball.",
        shortDescription: "Heritage style with premium leather",
        categoryName: "Shoes",
        stock: 8,
        features: ["Full-grain leather upper", "Air-Sole unit in heel", "Solid rubber outsole", "Deep flex grooves"],
        imageUrls: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1518002171953-a080ee806dab?w=800&auto=format&fit=crop"
        ]
    },
    {
        name: "Ray-Ban Wayfarer Classic",
        slug: "ray-ban-wayfarer-classic",
        price: 163,
        description: "Ray-Ban Original Wayfarer Classics are the most recognizable style in the history of sunglasses. Since its initial design in 1952, Wayfarer Classics gained popularity among celebrities, musicians, artists and those with an impeccable fashion sense.",
        shortDescription: "Iconic acetate frames with G-15 lenses",
        categoryName: "Accessories",
        stock: 10,
        features: ["Green G-15 lenses", "Acetate frame", "100% UV protection", "Made in Italy"],
        imageUrls: [
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1574718048866-285600c0256d?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=800&auto=format&fit=crop"
        ]
    },
    {
        name: "Armani Silk Scarf",
        slug: "armani-silk-scarf",
        price: 18,
        description: "Add a touch of sophistication to your ensemble with this Emporio Armani scarf. Crafted from pure silk, it features a subtle logo pattern and delicate fringed edges. Lightweight yet warm, it's the perfect accessory for transitional weather.",
        shortDescription: "100% pure silk with logo pattern",
        categoryName: "Accessories",
        stock: 20,
        features: ["100% silk", "Tonal logo pattern", "Fringed edges", "Dry clean only"],
        imageUrls: [
            "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1606085854823-3b7c2a71d794?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1481216657930-cb75271a39ac?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1517445312882-628d6978d387?w=800&auto=format&fit=crop"
        ]
    },
    {
        name: "Nike Air Max 90",
        slug: "nike-air-max-90",
        price: 130,
        description: "The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle outsole, stitched overlays and classic TPU accents. Fresh details give a modern look while Max Air cushioning adds comfort to your journey.",
        shortDescription: "Iconic design with Max Air cushioning",
        categoryName: "Shoes",
        stock: 12,
        features: ["Foam midsole", "Max Air cushioning", "Rubber Waffle outsole", "Padded collar"],
        imageUrls: [
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1597248881519-db089d3744a5?w=800&auto=format&fit=crop"
        ]
    },
    {
        name: "Gucci Wool Coat",
        slug: "gucci-wool-coat",
        price: 2800,
        description: "This double-breasted coat from Gucci captures the house's retro-inflected aesthetic. Tailored in Italy from insulating wool, it has a smart peak lapel and golden buttons embossed with the brand's logo.",
        shortDescription: "Double-breasted Italian wool coat",
        categoryName: "Clothing",
        stock: 3,
        features: ["100% wool", "Double-breasted", "Gold-tone buttons", "Made in Italy"],
        imageUrls: [
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&auto=format&fit=crop"
        ]
    },
    {
        name: "Nike Air Force 1 '07",
        slug: "nike-air-force-1-07",
        price: 110,
        description: "The radiance lives on in the Nike Air Force 1 '07, the basketball original that puts a fresh spin on what you know best: durably stitched overlays, clean finishes and the perfect amount of flash to make you shine.",
        shortDescription: "Legendary style, refined for today",
        categoryName: "Shoes",
        stock: 25,
        features: ["Stitched overlays", "Nike Air cushioning", "Low-cut silhouette", "Perforations on toe"],
        imageUrls: [
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1588117260148-44788496275c?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1555529902-526e14a92706?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1582269601004-bb50630b98a3?w=800&auto=format&fit=crop"
        ]
    },
    {
        name: "Nike Sportswear Hoodie",
        slug: "nike-sportswear-hoodie",
        price: 65,
        description: "The Nike Sportswear Club Fleece Hoodie provides soft comfort for street style. Made from soft fleece fabric, it keeps you warm in cool weather. The classic design is versatile enough for everyday wear.",
        shortDescription: "Soft fleece hoodie for everyday comfort",
        categoryName: "Clothing",
        stock: 18,
        features: ["Standard fit", "Drawstring hood", "Kangaroo pocket", "Ribbed cuffs"],
        imageUrls: [
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop"
        ]
    },
    {
        name: "Ray-Ban Aviator Classic",
        slug: "ray-ban-aviator-classic",
        price: 175,
        description: "One of the most iconic sunglass models in the world, Ray-Ban Aviator Classic sunglasses were originally designed for U.S. Aviators in 1937. Aviator Classic sunglasses are a timeless model that combines great aviator styling with exceptional quality.",
        shortDescription: "Timeless pilot shape with gold frame",
        categoryName: "Accessories",
        stock: 7,
        features: ["Pilot shape", "Gold tone metal", "Green G-15 lenses", "Adjustable nose pads"],
        imageUrls: [
            "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1614715838608-dd527c2dc95c?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1628161358058-293e50629705?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1569300508603-6e2eb2752136?w=800&auto=format&fit=crop"
        ]
    },
    {
        name: "Gucci Ace Sneaker",
        slug: "gucci-ace-sneaker",
        price: 680,
        description: "The Ace low-top sneaker is characterized by the House's Web stripe, an evolution of the original design debuted in the 1970s. The white leather design features the red and green web detail on the side and a contrasting heel detail.",
        shortDescription: "Low-top with signature Web stripe",
        categoryName: "Shoes",
        stock: 6,
        features: ["White leather", "Green and red Web", "Red/Green metallic leather on heels", "Rubber sole"],
        imageUrls: [
            "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop"
        ]
    },
    {
        name: "Armani Executive Blazer",
        slug: "armani-executive-blazer",
        price: 1200,
        description: "A symbol of Armani's tailoring excellence, this blazer is crafted from premium wool-blend fabric. It features a structured shoulder, slim lapels, and a tailored fit that provides an elegant silhouette for any formal or business occasion.",
        shortDescription: "Tailored wool-blend blazer",
        categoryName: "Clothing",
        stock: 4,
        features: ["Wool blend", "Slim fit", "Single-breasted", "Made in Italy"],
        imageUrls: [
            "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1550246140-5119ae4790b8?w=800&auto=format&fit=crop"
        ]
    },
    {
        name: "Calvin Klein Slim Jeans",
        slug: "calvin-klein-slim-jeans",
        price: 98,
        description: "These slim-fitting jeans from Calvin Klein Jeans are crafted from stretch denim for everyday comfort. Featuring a classic 5-pocket styling and omega top-stitching on the back pockets, they are a versatile staple.",
        shortDescription: "Stretch denim with slim fit",
        categoryName: "Clothing",
        stock: 14,
        features: ["Cotton stretch denim", "Slim fit", "Medium rise", "Zip fly"],
        imageUrls: [
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&auto=format&fit=crop"
        ]
    }
];

async function main() {
    console.log('Start seeding...');

    // Create Admin User
    const adminEmail = 'admin@artisan.com';
    const adminPassword = 'admin_password_123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.admin.upsert({
        where: { email: adminEmail },
        update: { password: hashedPassword },
        create: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Admin User',
        },
    });
    console.log(`Admin user created with email: ${adminEmail}`);

    // Create Categories
    const categories = ["Bags", "Clothing", "Shoes", "Accessories"];

    for (const name of categories) {
        const slug = name.toLowerCase();
        await prisma.category.upsert({
            where: { name },
            update: {},
            create: {
                name,
                slug,
                description: `All your favorite ${name}`,
            },
        });
    }

    // Create Products
    for (const p of products) {
        const category = await prisma.category.findUnique({ where: { name: p.categoryName } });
        if (!category) {
            console.warn(`Category ${p.categoryName} not found for product ${p.name}`);
            continue;
        }

        const createdProduct = await prisma.product.upsert({
            where: { slug: p.slug },
            update: {},
            create: {
                name: p.name,
                slug: p.slug,
                description: p.description,
                shortDescription: p.shortDescription,
                price: p.price,
                stock: p.stock,
                features: p.features, // JSON
                categoryId: category.id,
                // Since we have an Image model and simple relation, let's create images for the product
                images: {
                    create: p.imageUrls.map(url => ({
                        url,
                        provider: 'external',
                        providerKey: url // using url as key for external for now
                    }))
                }
            },
        });
        console.log(`Created product with id: ${createdProduct.id}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
