/**
 * Seed: 3 Capas de Edredão em Linho — Light Beige
 *
 * Sistema de SKU:
 *   CdE        = Capa de Edredão (prefixo da subcategoria)
 *   C8B9A6     = Hex da cor (sem #) — Beige Natural / Linho
 *   135x200    = Dimensões (largura x comprimento)
 *   1          = Sequência (diferenciador)
 *
 *   Fotos:  SKU-p1.jpeg  (capa)
 *           SKU-a1.jpeg, SKU-a2.jpeg ... (adicionais)
 */

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const Product = require('../Models/productModels');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  encodeURIComponent(process.env.DATABASE_PASSWORD),
);

const products = [
  {
    name: 'Capa de Edredão em Linho — Solteiro',
    sku: 'CdE-C8B9A6-135x200-1',
    brand: 'Zara Home',
    category: 'Roupa de Cama',
    subcategory: 'Capas de Edredão',
    tags: ['linho', 'natural', 'premium', 'solteiro'],
    material: '100% Linho',
    composition: '100% Linho Europeu',
    weight: 160, // GSM
    dimensions: ['135x200cm'],
    colors: ['Beige Natural'],
    sizes: ['Solteiro'],
    price: 69.99,
    priceReseller: 48.99,
    currency: 'EUR',
    stock: 25,
    lowStockThreshold: 5,
    summary:
      'Capa de edredão em linho puro com design liso. Fecho de botões ocultos na parte inferior.',
    description:
      'Capa de edredão confeccionada em 100% linho europeu de alta qualidade (160 g/m²). ' +
      'Acabamento lavado para um toque suave e natural desde o primeiro uso. ' +
      'Fecho discreto com botões transparentes na parte inferior. ' +
      'O linho é naturalmente termorregulador, antibacteriano e hipoalergénico — ' +
      'ideal para todas as estações. A cor Beige Natural (#C8B9A6) confere um look ' +
      'orgânico e sofisticado ao quarto. Medida: 135×200 cm (Solteiro).',
    imageCover: 'CdE-C8B9A6-135x200-1-p1.jpeg',
    images: [
      'CdE-C8B9A6-135x200-1-a1.jpeg',
      'CdE-C8B9A6-135x200-1-a2.jpeg',
      'CdE-C8B9A6-135x200-1-a3.jpeg',
      'CdE-C8B9A6-135x200-1-a4.jpeg',
    ],
    active: true,
    featured: true,
  },
  {
    name: 'Capa de Edredão em Linho — Casal',
    sku: 'CdE-C8B9A6-220x220-1',
    brand: 'Zara Home',
    category: 'Roupa de Cama',
    subcategory: 'Capas de Edredão',
    tags: ['linho', 'natural', 'premium', 'casal'],
    material: '100% Linho',
    composition: '100% Linho Europeu',
    weight: 160,
    dimensions: ['220x220cm'],
    colors: ['Beige Natural'],
    sizes: ['Casal'],
    price: 89.99,
    priceReseller: 62.99,
    currency: 'EUR',
    stock: 18,
    lowStockThreshold: 5,
    summary:
      'Capa de edredão em linho puro com design liso. Fecho de botões ocultos na parte inferior.',
    description:
      'Capa de edredão confeccionada em 100% linho europeu de alta qualidade (160 g/m²). ' +
      'Acabamento lavado para um toque suave e natural desde o primeiro uso. ' +
      'Fecho discreto com botões transparentes na parte inferior. ' +
      'O linho é naturalmente termorregulador, antibacteriano e hipoalergénico — ' +
      'ideal para todas as estações. A cor Beige Natural (#C8B9A6) confere um look ' +
      'orgânico e sofisticado ao quarto. Medida: 220×220 cm (Casal).',
    imageCover: 'CdE-C8B9A6-220x220-1-p1.jpeg',
    images: [
      'CdE-C8B9A6-220x220-1-a1.jpeg',
      'CdE-C8B9A6-220x220-1-a2.jpeg',
      'CdE-C8B9A6-220x220-1-a3.jpeg',
      'CdE-C8B9A6-220x220-1-a4.jpeg',
    ],
    active: true,
    featured: true,
  },
  {
    name: 'Capa de Edredão em Linho — King',
    sku: 'CdE-C8B9A6-240x220-1',
    brand: 'Zara Home',
    category: 'Roupa de Cama',
    subcategory: 'Capas de Edredão',
    tags: ['linho', 'natural', 'premium', 'king'],
    material: '100% Linho',
    composition: '100% Linho Europeu',
    weight: 160,
    dimensions: ['240x220cm'],
    colors: ['Beige Natural'],
    sizes: ['King'],
    price: 99.99,
    priceReseller: 69.99,
    currency: 'EUR',
    stock: 12,
    lowStockThreshold: 3,
    summary:
      'Capa de edredão em linho puro com design liso. Fecho de botões ocultos na parte inferior.',
    description:
      'Capa de edredão confeccionada em 100% linho europeu de alta qualidade (160 g/m²). ' +
      'Acabamento lavado para um toque suave e natural desde o primeiro uso. ' +
      'Fecho discreto com botões transparentes na parte inferior. ' +
      'O linho é naturalmente termorregulador, antibacteriano e hipoalergénico — ' +
      'ideal para todas as estações. A cor Beige Natural (#C8B9A6) confere um look ' +
      'orgânico e sofisticado ao quarto. Medida: 240×220 cm (King).',
    imageCover: 'CdE-C8B9A6-240x220-1-p1.jpeg',
    images: [
      'CdE-C8B9A6-240x220-1-a1.jpeg',
      'CdE-C8B9A6-240x220-1-a2.jpeg',
      'CdE-C8B9A6-240x220-1-a3.jpeg',
      'CdE-C8B9A6-240x220-1-a4.jpeg',
    ],
    active: true,
    featured: true,
  },
];

async function seed() {
  await mongoose.connect(DB, { dbName: 'milfios' });
  console.log('✅ DB connected (milfios)');

  // Limpar produtos com estes SKUs (para ser idempotente)
  const skus = products.map((p) => p.sku);
  const deleted = await Product.deleteMany({ sku: { $in: skus } });
  if (deleted.deletedCount) {
    console.log(`🗑️  Removidos ${deleted.deletedCount} produtos existentes com os mesmos SKUs`);
  }

  // Inserir
  const created = await Product.create(products);
  console.log(`\n✅ ${created.length} produtos criados:\n`);

  created.forEach((p) => {
    console.log(`  📦 ${p.name}`);
    console.log(`     SKU:    ${p.sku}`);
    console.log(`     Slug:   ${p.slug}`);
    console.log(`     Preço:  ${p.price}€ (reseller: ${p.priceReseller}€)`);
    console.log(`     Stock:  ${p.stock}`);
    console.log(`     Cover:  ${p.imageCover}`);
    console.log(`     Fotos:  ${p.images.join(', ')}`);
    console.log();
  });

  await mongoose.disconnect();
  console.log('✅ Done');
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e.message);
  process.exit(1);
});
