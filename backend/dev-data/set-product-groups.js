/**
 * set-product-groups.js
 * Define o campo productGroup nos produtos existentes.
 * Executar UMA VEZ: node backend/dev-data/set-product-groups.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: `${__dirname}/../config.env` });

const Product = require('../Models/productModels');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

const GROUPS = [
  {
    // Todos os produtos de Capa de Edredão em Linho (natural + verde) → mesmo group
    match: { sku: /^CdE-/ },
    productGroup: 'capa-de-edredao-em-linho',
  },
];

(async () => {
  await mongoose.connect(DB);
  console.log('✅ DB conectada\n');

  for (const { match, productGroup } of GROUPS) {
    const result = await Product.updateMany(match, { $set: { productGroup } });
    console.log(`🏷️  productGroup="${productGroup}" → ${result.modifiedCount} produtos actualizados`);

    const docs = await Product.find(match).select('name sku productGroup');
    docs.forEach((d) => console.log(`   • ${d.sku}  ${d.name}`));
    console.log();
  }

  await mongoose.disconnect();
  console.log('✅ Concluído');
})();
