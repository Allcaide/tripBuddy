const Cart = require('../Models/cartModel');
const Product = require('../Models/productModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// ───────── Helper: determinar preço baseado no role ─────────
const getPriceForRole = (product, userRole) => {
  if (userRole === 'reseller' && product.priceReseller) {
    return product.priceReseller;
  }
  return product.price;
};

// ───────── GET /cart — Ver o meu carrinho ─────────
exports.getCart = catchAsync(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    // Se não tem carrinho, retorna um vazio
    return res.status(200).json({
      status: 'success',
      data: {
        cart: {
          items: [],
          totalPrice: 0,
          totalItems: 0,
        },
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

// ───────── POST /cart — Adicionar item ao carrinho ─────────
exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1, color, size } = req.body;

  // 1) Verificar se o produto existe e tem stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Produto não encontrado', 404));
  }

  if (product.stock < quantity) {
    return next(
      new AppError(
        `Stock insuficiente. Disponível: ${product.stock}`,
        400,
      ),
    );
  }

  // 2) Determinar preço baseado no role do user
  const price = getPriceForRole(product, req.user.role);

  // 3) Encontrar ou criar carrinho
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [{ product: productId, quantity, color, size, price }],
    });
  } else {
    // Verificar se o item já existe (mesmo produto + cor + tamanho)
    const existingItemIndex = cart.items.findIndex((item) => {
      // item.product pode ser um ObjectId OU um objeto populado
      const itemProductId =
        typeof item.product === 'object' && item.product._id
          ? item.product._id.toString()
          : item.product.toString();
      return (
        itemProductId === productId &&
        (item.color || '') === (color || '') &&
        (item.size || '') === (size || '')
      );
    });

    if (existingItemIndex > -1) {
      // Atualizar quantidade
      const newQty = cart.items[existingItemIndex].quantity + quantity;

      if (newQty > product.stock) {
        return next(
          new AppError(
            `Stock insuficiente. Disponível: ${product.stock}`,
            400,
          ),
        );
      }

      cart.items[existingItemIndex].quantity = newQty;
      cart.items[existingItemIndex].price = price; // atualizar preço
    } else {
      // Adicionar novo item
      cart.items.push({ product: productId, quantity, color, size, price });
    }

    await cart.save();
  }

  // Re-fetch com populate
  cart = await Cart.findById(cart._id);

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

// ───────── PATCH /cart/:itemId — Atualizar quantidade de um item ─────────
exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return next(new AppError('A quantidade deve ser pelo menos 1', 400));
  }

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new AppError('Carrinho não encontrado', 404));
  }

  const item = cart.items.id(req.params.itemId);

  if (!item) {
    return next(new AppError('Item não encontrado no carrinho', 404));
  }

  // Verificar stock
  const product = await Product.findById(item.product);
  if (product && quantity > product.stock) {
    return next(
      new AppError(`Stock insuficiente. Disponível: ${product.stock}`, 400),
    );
  }

  item.quantity = quantity;
  await cart.save();

  // Re-fetch com populate
  cart = await Cart.findById(cart._id);

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

// ───────── DELETE /cart/:itemId — Remover item do carrinho ─────────
exports.removeCartItem = catchAsync(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new AppError('Carrinho não encontrado', 404));
  }

  const item = cart.items.id(req.params.itemId);

  if (!item) {
    return next(new AppError('Item não encontrado no carrinho', 404));
  }

  item.deleteOne();
  await cart.save();

  // Re-fetch com populate
  cart = await Cart.findById(cart._id);

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

// ───────── DELETE /cart — Limpar carrinho ─────────
exports.clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    // Se não tem carrinho, retorna um vazio (não é erro)
    return res.status(200).json({
      status: 'success',
      data: {
        cart: {
          items: [],
          totalPrice: 0,
          totalItems: 0,
        },
      },
    });
  }

  cart.items = [];
  await cart.save();

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

// ═══════════════════════════════════════
//  ADMIN ENDPOINTS
// ═══════════════════════════════════════

// ───────── GET /cart/admin/all — Todos os carrinhos (admin) ─────────
exports.getAllCarts = catchAsync(async (req, res, next) => {
  const carts = await Cart.find()
    .populate({ path: 'user', select: 'name email role photo' })
    .sort('-updatedAt');

  res.status(200).json({
    status: 'success',
    results: carts.length,
    data: {
      data: carts,
    },
  });
});

// ───────── GET /cart/admin/:userId — Carrinho de um user específico (admin) ─────────
exports.getUserCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.params.userId }).populate({
    path: 'user',
    select: 'name email role photo',
  });

  if (!cart) {
    return res.status(200).json({
      status: 'success',
      data: {
        data: {
          user: req.params.userId,
          items: [],
          totalPrice: 0,
          totalItems: 0,
        },
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: cart,
    },
  });
});
