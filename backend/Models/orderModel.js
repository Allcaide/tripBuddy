const mongoose = require('mongoose');

// ───────── OrderItem (sub-documento) ─────────
// Snapshot do produto no momento da compra — imutável.
// Se o produto mudar de preço/nome/imagem depois, a encomenda mantém os dados originais.
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'O item da encomenda precisa de um produto'],
  },
  // ── Snapshot dos dados do produto no momento da compra ──
  name: {
    type: String,
    required: [true, 'O item da encomenda precisa do nome do produto'],
  },
  imageCover: String,
  sku: String,
  brand: String,

  // ── Variante escolhida ──
  color: { type: String, trim: true },
  size: { type: String, trim: true },

  // ── Preço & quantidade ──
  quantity: {
    type: Number,
    required: [true, 'O item da encomenda precisa de uma quantidade'],
    min: [1, 'A quantidade mínima é 1'],
  },
  priceAtPurchase: {
    type: Number,
    required: [true, 'O item da encomenda precisa do preço de compra'],
    min: [0, 'O preço não pode ser negativo'],
  },
});

// Virtual: subtotal deste item
orderItemSchema.virtual('subtotal').get(function () {
  return this.priceAtPurchase * this.quantity;
});

// ───────── Order (documento principal) ─────────
const orderSchema = new mongoose.Schema(
  {
    // ── Referências ──
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A encomenda precisa de pertencer a um utilizador'],
    },
    orderNumber: {
      type: String,
      unique: true,
    },

    // ── Items ──
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (arr) {
          return arr && arr.length > 0;
        },
        message: 'A encomenda precisa de pelo menos um item',
      },
    },

    // ── Financeiro ──
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: [true, 'A encomenda precisa de um total'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'EUR',
      enum: ['EUR', 'USD', 'GBP'],
    },

    // ── Estado ──
    status: {
      type: String,
      enum: [
        'pending',      // criada, aguarda pagamento
        'paid',         // pagamento confirmado
        'processing',   // em preparação
        'shipped',      // expedida
        'delivered',    // entregue
        'cancelled',    // cancelada
        'refunded',     // devolvida/reembolsada
      ],
      default: 'pending',
    },

    // ── Pagamento ──
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'bank_transfer', 'cash_on_delivery'],
      default: 'stripe',
    },
    paymentIntentId: String,   // Stripe payment intent / checkout session ID
    paidAt: Date,

    // ── Morada de envio ──
    shippingAddress: {
      name: { type: String, trim: true },
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'PT' },
      phone: { type: String, trim: true },
    },

    // ── Tracking ──
    trackingNumber: String,
    shippedAt: Date,
    deliveredAt: Date,

    // ── Notas ──
    notes: { type: String, trim: true },       // notas do cliente
    adminNotes: { type: String, trim: true },   // notas internas
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true, // createdAt + updatedAt
  },
);

// ───────── Índices ─────────
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ paymentIntentId: 1 });

// ───────── Virtuals ─────────
orderSchema.virtual('totalItems').get(function () {
  if (!this.items) return 0;
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// ───────── Pre-save: gerar orderNumber ─────────
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    // Formato: MF-YYYYMMDD-XXXXX (ex: MF-20260218-00042)
    const date = new Date();
    const prefix = `MF-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

    // Contar encomendas de hoje para sequência
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const count = await mongoose.model('Order').countDocuments({
      createdAt: { $gte: startOfDay },
    });

    this.orderNumber = `${prefix}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// ───────── Query Middleware ─────────
orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email',
  });
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
