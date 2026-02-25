const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    // ───────── Identificação ─────────
    name: {
      type: String,
      required: [true, 'Um produto precisa de um nome'],
      unique: true,
      trim: true,
      maxlength: [80, 'O nome do produto não pode ter mais de 80 caracteres'],
      minlength: [3, 'O nome do produto deve ter pelo menos 3 caracteres'],
    },
    slug: String,
    sku: {
      type: String,
      unique: true,
      sparse: true, // permite null/undefined sem conflito de unique
      trim: true,
    },

    // ───────── Marca / Fornecedor ─────────
    // MilFios funciona como intermediário — este campo identifica o fornecedor ou marca original.
    brand: {
      type: String,
      trim: true,
      // ex: "Zara Home", "H&M Home", "Fornecedor XYZ"
    },

    // ───────── Categorização ─────────
    // Sem enum — o admin pode criar categorias novas livremente.
    // O frontend popula o dropdown com os valores distintos já existentes na DB.
    category: {
      type: String,
      required: [true, 'Um produto precisa de uma categoria'],
      trim: true,
      // ex: "Toalhas de Mesa", "Roupa de Cama", "Cortinas"
    },
    subcategory: {
      type: String,
      trim: true,
      // ex: "Lençóis", "Fronhas", "Edredões"
    },
    tags: {
      type: [String],
      default: [],
    },

    // ───────── Detalhes têxtil ─────────
    material: {
      type: String,
      trim: true,
      // ex: "100% Algodão", "Poliéster/Algodão 50/50"
    },
    composition: {
      type: String,
      trim: true,
    },
    weight: {
      type: Number, // gramas por m² (GSM) — padrão na indústria têxtil
      min: [0, 'O peso não pode ser negativo'],
    },
    dimensions: {
      type: [String],
      default: [],
      // ex: ["240x260cm", "150x200cm"] — mesmo produto pode ter várias dimensões
    },
    colors: {
      type: [String],
      default: [],
      // ex: ["branco", "cinza", "azul-marinho"]
    },
    sizes: {
      type: [String],
      default: [],
      // ex: ["solteiro", "casal", "king"] ou ["S", "M", "L"]
    },

    // ───────── Preços ─────────
    price: {
      type: Number,
      required: [true, 'Um produto precisa de um preço (consumidor final)'],
      min: [0, 'O preço não pode ser negativo'],
    },
    priceReseller: {
      type: Number,
      min: [0, 'O preço de revendedor não pode ser negativo'],
      // preço especial para users com role "reseller"
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // Só funciona em criação de documentos novos (this aponta para o doc)
          return val < this.price;
        },
        message: 'O preço com desconto deve ser inferior ao preço normal',
      },
    },
    currency: {
      type: String,
      default: 'EUR',
      enum: ['EUR', 'USD', 'GBP'],
    },

    // ───────── Stock ─────────
    stock: {
      type: Number,
      required: [true, 'Um produto precisa de quantidade em stock'],
      min: [0, 'O stock não pode ser negativo'],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5, // alerta quando stock <= este valor
    },

    // ───────── Avaliações ─────────
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'A avaliação mínima é 0'],
      max: [5, 'A avaliação máxima é 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    // ───────── Descrição ─────────
    summary: {
      type: String,
      trim: true,
      required: [true, 'Um produto precisa de um resumo'],
    },
    description: {
      type: String,
      trim: true,
    },

    // ───────── Imagens ─────────
    imageCover: {
      type: String,
      required: [true, 'Um produto precisa de uma imagem de capa'],
    },
    images: {
      type: [String],
    },

    // ───────── Visibilidade ─────────
    active: {
      type: Boolean,
      default: true,
      // se false, o produto não aparece para compradores
    },
    featured: {
      type: Boolean,
      default: false,
      // produtos em destaque na homepage
    },

    // ───────── Timestamps ─────────
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true, // adiciona createdAt + updatedAt automáticos
  },
);

// ───────── Índices ─────────
productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ active: 1, featured: -1 });
productSchema.index({ brand: 1 });

// ───────── Virtuals ─────────
// Indica se o produto tem stock baixo
productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.lowStockThreshold;
});

productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Virtual populate — reviews ligadas ao produto
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

// ───────── Document Middleware ─────────
// Gerar slug a partir do nome antes de guardar
productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// ───────── Query Middleware ─────────
// Filtrar produtos inativos automaticamente em qualquer find
productSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// ───────── Static Methods ─────────
// Retorna os valores distintos de campos dinâmicos para popular dropdowns no frontend.
// Uso: const options = await Product.getDistinctFieldValues();
productSchema.statics.getDistinctFieldValues = async function () {
  const [categories, subcategories, colors, sizes, dimensions, materials, tags, brands] =
    await Promise.all([
      this.distinct('category'),
      this.distinct('subcategory'),
      this.distinct('colors'),
      this.distinct('sizes'),
      this.distinct('dimensions'),
      this.distinct('material'),
      this.distinct('tags'),
      this.distinct('brand'),
    ]);

  return {
    categories: categories.filter(Boolean).sort(),
    subcategories: subcategories.filter(Boolean).sort(),
    colors: colors.filter(Boolean).sort(),
    sizes: sizes.filter(Boolean).sort(),
    dimensions: dimensions.filter(Boolean).sort(),
    materials: materials.filter(Boolean).sort(),
    tags: tags.filter(Boolean).sort(),
    brands: brands.filter(Boolean).sort(),
  };
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
