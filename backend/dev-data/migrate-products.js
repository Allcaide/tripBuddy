/**
 * migrate-products.js
 * Renomeia os 3 produtos linho existentes para o novo formato
 * e cria os 3 tamanhos linho em falta + 6 variantes verde.
 *
 * Uso: node dev-data/migrate-products.js
 */

'use strict';
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });
const mongoose = require('mongoose');
const Product  = require('../Models/productModels');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

/* ═══════════════════════════════════════════════════
   Dados base compartilhados (linho natural)
═══════════════════════════════════════════════════ */
const LINHO_BASE = {
  brand: 'Zara Home',
  category: 'Roupa de Cama',
  subcategory: 'Capas de Edredão',
  material: '100% Linho',
  composition: '100% Linho',
  weight: 140,
  colors: ['linho'],
  tags: ['linho', 'cama', 'edredão', 'natural'],
  summary: 'Capa de edredão em linho lavado de 140 gsm liso. Fecho de botões ocultos na parte inferior. A técnica de lavagem proporciona maior suavidade e fluidez ao tecido.',
  description: 'Fabricada em 100% linho de alta qualidade. O processo de lavagem a pedra suaviza as fibras, tornando o tecido mais macio e confortável desde o primeiro uso. Fácil manutenção — pode ser lavada à máquina.',
  active: true,
  featured: true,
  lowStockThreshold: 5,
};

const VERDE_BASE = {
  ...LINHO_BASE,
  colors: ['verde'],
  featured: false,
};

/* ═══════════════════════════════════════════════════
   Actualizações dos 3 produtos existentes (linho)
═══════════════════════════════════════════════════ */
const linhoUpdates = [
  {
    sku: 'CdE-C8B9A6-135x200-1',
    name: 'Capa de Edredão em Linho — 135x200 cm',
    dimensions: ['Cama 90cm (135×200 cm)'],
    price: 69.99,
    stock: 25,
  },
  {
    sku: 'CdE-C8B9A6-220x220-1',
    name: 'Capa de Edredão em Linho — 220x220 cm',
    dimensions: ['Cama 135/140cm (220×220 cm)'],
    price: 89.99,
    stock: 18,
  },
  {
    sku: 'CdE-C8B9A6-240x220-1',
    name: 'Capa de Edredão em Linho — 240x220 cm',
    dimensions: ['Cama 150/160cm (240×220 cm)'],
    price: 99.99,
    stock: 12,
  },
];

/* ═══════════════════════════════════════════════════
   Novos produtos linho (3 tamanhos em falta)
═══════════════════════════════════════════════════ */
const linhoNew = [
  {
    ...LINHO_BASE,
    name: 'Capa de Edredão em Linho — 150x220 cm',
    sku: 'CdE-C8B9A6-150x220-1',
    dimensions: ['Cama 90cm (150×220 cm)'],
    price: 69.99,
    stock: 20,
    imageCover: 'CdE-C8B9A6-150x220-1-p1.jpeg',
    images: [
      'CdE-C8B9A6-150x220-1-a1.jpeg',
      'CdE-C8B9A6-150x220-1-a2.jpeg',
      'CdE-C8B9A6-150x220-1-a3.jpeg',
    ],
  },
  {
    ...LINHO_BASE,
    name: 'Capa de Edredão em Linho — 260x240 cm',
    sku: 'CdE-C8B9A6-260x240-1',
    dimensions: ['Cama 180cm (260×240 cm)'],
    price: 119,
    stock: 10,
    imageCover: 'CdE-C8B9A6-260x240-1-p1.jpeg',
    images: [
      'CdE-C8B9A6-260x240-1-a1.jpeg',
      'CdE-C8B9A6-260x240-1-a2.jpeg',
      'CdE-C8B9A6-260x240-1-a3.jpeg',
    ],
  },
  {
    ...LINHO_BASE,
    name: 'Capa de Edredão em Linho — 290x260 cm',
    sku: 'CdE-C8B9A6-290x260-1',
    dimensions: ['Cama 200cm (290×260 cm)'],
    price: 129,
    stock: 8,
    imageCover: 'CdE-C8B9A6-290x260-1-p1.jpeg',
    images: [
      'CdE-C8B9A6-290x260-1-a1.jpeg',
      'CdE-C8B9A6-290x260-1-a2.jpeg',
      'CdE-C8B9A6-290x260-1-a3.jpeg',
    ],
  },
];

/* ═══════════════════════════════════════════════════
   Novos produtos verde (6 tamanhos)
═══════════════════════════════════════════════════ */
const verdeSizes = [
  { dim: '135x200', label: 'Cama 90cm (135×200 cm)',    price: 69.99,  stock: 20 },
  { dim: '150x220', label: 'Cama 90cm (150×220 cm)',    price: 69.99,  stock: 20 },
  { dim: '220x220', label: 'Cama 135/140cm (220×220 cm)', price: 89.99, stock: 15 },
  { dim: '240x220', label: 'Cama 150/160cm (240×220 cm)', price: 99.99, stock: 10 },
  { dim: '260x240', label: 'Cama 180cm (260×240 cm)',   price: 119,    stock: 8  },
  { dim: '290x260', label: 'Cama 200cm (290×260 cm)',   price: 129,    stock: 6  },
];

const verdeNew = verdeSizes.map(({ dim, label, price, stock }) => ({
  ...VERDE_BASE,
  name: `Capa de Edredão em Linho Verde — ${dim} cm`,
  sku: `CdE-4A7A5A-${dim}-1`,
  dimensions: [label],
  price,
  stock,
  imageCover: `CdE-4A7A5A-${dim}-1-p1.jpeg`,
  images: [
    `CdE-4A7A5A-${dim}-1-a1.jpeg`,
    `CdE-4A7A5A-${dim}-1-a2.jpeg`,
    `CdE-4A7A5A-${dim}-1-a3.jpeg`,
  ],
}));

/* ═══════════════════════════════════════════════════
   Runner
═══════════════════════════════════════════════════ */
async function run() {
  await mongoose.connect(DB);
  console.log('✅ MongoDB conectado');

  /* 1. Actualizar os 3 linho existentes */
  for (const upd of linhoUpdates) {
    const doc = await Product.findOneAndUpdate(
      { sku: upd.sku },
      {
        name: upd.name,
        dimensions: upd.dimensions,
        price: upd.price,
        stock: upd.stock,
        summary: LINHO_BASE.summary,
        description: LINHO_BASE.description,
        material: LINHO_BASE.material,
        composition: LINHO_BASE.composition,
        weight: LINHO_BASE.weight,
        colors: LINHO_BASE.colors,
        tags: LINHO_BASE.tags,
      },
      { new: true, runValidators: false }
    );
    if (doc) {
      console.log(`  ✏️  Actualizado: ${doc.name}`);
    } else {
      console.warn(`  ⚠️  Não encontrado SKU: ${upd.sku}`);
    }
  }

  /* 2. Criar novos linho */
  for (const data of linhoNew) {
    const exists = await Product.findOne({ sku: data.sku });
    if (exists) {
      console.log(`  ⏭  Já existe: ${data.name}`);
      continue;
    }
    const doc = await Product.create(data);
    console.log(`  ➕ Criado: ${doc.name}`);
  }

  /* 3. Criar verde */
  for (const data of verdeNew) {
    const exists = await Product.findOne({ sku: data.sku });
    if (exists) {
      console.log(`  ⏭  Já existe: ${data.name}`);
      continue;
    }
    const doc = await Product.create(data);
    console.log(`  ➕ Criado: ${doc.name}`);
  }

  await mongoose.disconnect();
  console.log('\n🎉 Migração concluída!');
}

run().catch((err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
