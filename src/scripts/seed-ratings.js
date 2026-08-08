import 'dotenv/config';
import { sequelize, Product } from '../models/index.js';

const rate = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10;
const count = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Attribue une note moyenne + nombre d'avis plausibles à chaque produit. */
async function run() {
  await sequelize.authenticate();
  const products = await Product.findAll();
  for (const p of products) {
    await p.update({ ratingAvg: rate(4.1, 5), ratingCount: count(6, 48) });
  }
  console.log(`✅ Notes attribuées à ${products.length} produit(s).`);
  process.exit(0);
}

run().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
