const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'O item do carrinho precisa de um produto'],
  },
  quantity: {
    type: Number,
    required: [true, 'O item do carrinho precisa de uma quantidade'],
    min: [1, 'A quantidade mínima é 1'],
    default: 1,
  },
  color: {
    type: String,
    trim: true,
  },
  size: {
    type: String,
    trim: true,
  },
  // Preço no momento de adicionar ao carrinho (baseado no role do user)
  price: {
    type: Number,
    required: [true, 'O item do carrinho precisa de um preço'],
    min: [0, 'O preço não pode ser negativo'],
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'O carrinho precisa de pertencer a um utilizador'],
      unique: true, // 1 carrinho por user
    },
    items: [cartItemSchema],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

// ───────── Virtuals ─────────
cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
});

cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// ───────── Query Middleware ─────────
// Popular dados do produto automaticamente
cartSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'items.product',
    select: 'name imageCover price priceReseller stock slug',
  });
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
