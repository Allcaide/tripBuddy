const User = require('./../Models/userModel'); // Importing the Tour model

const catchAsync = require('./../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  //3RD SEND REPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users: users,
    },
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet',
  });
};
exports.addNewUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined yet',
  });
};
