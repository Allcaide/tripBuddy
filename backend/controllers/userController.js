const multer = require('multer');
const User = require('./../Models/userModel');
const Order = require('../Models/orderModel');
const Cart = require('../Models/cartModel');
const Product = require('../Models/productModels');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const sharp = require('sharp');


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if used POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  //filtered the data that should not be updated, like the role to admin
  let filteredBody = filterObj(req.body, 'name', 'email');

  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  // 2) Update user Data
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.addNewUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Pleasy use sign up instead',
  });
};

exports.getAllUsers = factory.getAll(User);
//Do NOT update passwords with this
exports.updateUser = factory.updateOne(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);

// ═══════════════════════════════════════
//  ADMIN — Perfil completo de um user
// ═══════════════════════════════════════

// ───────── GET /users/:id/profile — User + orders + carrinho (admin) ─────────
exports.getUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('Utilizador não encontrado', 404));
  }

  // Buscar orders deste user
  const orders = await Order.find({ user: req.params.id }).sort('-createdAt');

  // Buscar carrinho deste user
  const cart = await Cart.findOne({ user: req.params.id });

  res.status(200).json({
    status: 'success',
    data: {
      data: {
        user,
        orders,
        cart: cart || { items: [], totalPrice: 0, totalItems: 0 },
      },
    },
  });
});

// ───────── GET /users/:id/orders — Orders de um user específico (admin) ─────────
exports.getUserOrders = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('Utilizador não encontrado', 404));
  }

  const orders = await Order.find({ user: req.params.id }).sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      data: orders,
    },
  });
});

// ═══════════════════════════════════════
//  ADMIN — Dashboard Stats
// ═══════════════════════════════════════

// ───────── GET /users/admin/stats — Estatísticas gerais (admin) ─────────
exports.getAdminStats = catchAsync(async (req, res, next) => {
  // Contagens rápidas em paralelo
  const [
    totalUsers,
    totalOrders,
    totalProducts,
    activeProducts,
    orderStats,
    usersByRole,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments(),
    Product.countDocuments({ active: true }),

    // Revenue & orders por status
    Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
    ]),

    // Users por role
    User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]),

    // 10 encomendas mais recentes
    Order.find()
      .sort('-createdAt')
      .limit(10)
      .populate({ path: 'user', select: 'name email' }),

    // Produtos com stock baixo
    Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      active: true,
    })
      .select('name sku stock lowStockThreshold imageCover')
      .sort('stock'),
  ]);

  // Calcular totais de revenue
  const totalRevenue = orderStats.reduce((sum, s) => {
    if (['paid', 'processing', 'shipped', 'delivered'].includes(s._id)) {
      return sum + s.revenue;
    }
    return sum;
  }, 0);

  const ordersByStatus = {};
  orderStats.forEach((s) => {
    ordersByStatus[s._id] = { count: s.count, revenue: s.revenue };
  });

  const usersBreakdown = {};
  usersByRole.forEach((r) => {
    usersBreakdown[r._id] = r.count;
  });

  res.status(200).json({
    status: 'success',
    data: {
      data: {
        overview: {
          totalUsers,
          totalOrders,
          totalProducts,
          activeProducts,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
        },
        usersByRole: usersBreakdown,
        ordersByStatus,
        recentOrders,
        lowStockProducts,
      },
    },
  });
});
