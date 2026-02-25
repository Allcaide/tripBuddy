const multer = require('multer');
const sharp = require('sharp');

const Product = require('../Models/productModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

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

exports.uploadProductImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 10,
  },
]);

exports.resizeProductImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  // Determinar prefixo do nome: usar SKU se disponível, senão product-{id}
  const sku = req.body.sku || req.params.id || Date.now();
  const prefix = sku;

  // 1) Cover Image
  if (req.files.imageCover) {
    req.body.imageCover = `${prefix}-p1.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/products/${req.body.imageCover}`);
  }

  // 2) Additional Images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        // a1, a2, a3... (imagens adicionais)
        const filename = `${prefix}-a${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/products/${filename}`);

        req.body.images.push(filename);
      }),
    );
  }

  next();
});



//Route Handlers
exports.getAllProducts = factory.getAll(Product, 'reviews');
exports.addNewProduct = factory.createOne(Product);

exports.getProduct = factory.getOne(Product, { path: 'reviews' });

exports.getProductBySlug = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
  });

  if (!product) {
    return next(new AppError('Nenhum produto encontrado com esse slug', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: product,
    },
  });
});
exports.updateProduct = factory.updateOne(Product);
exports.deleteProduct = factory.deleteOne(Product);

// Retorna valores distintos para popular dropdowns (categorias, cores, tamanhos, etc.)
exports.getFieldOptions = catchAsync(async (req, res, next) => {
  const options = await Product.getDistinctFieldValues();

  res.status(200).json({
    status: 'success',
    data: {
      options,
    },
  });
});

