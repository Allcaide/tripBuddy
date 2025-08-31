const jwt = require('jsonwebtoken');
const User = require('./../Models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    //instead og req.body metemos como está abaixo para só preencher os campos que precisamos e não deixar que façam injeção de dados para tornar os utilizadores como admin
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  }); //in mongo the id is _id

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});
