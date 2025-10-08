const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/logout', authController.logout);
router.use(authController.protect); //O middleware é executado de seguida (cima para baixo) e tudo o que vier depois deste o user tem que estar autnticado

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.updateMe
);

router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin')); //Daqui para baixo só admin é que consegue executar estes pedidos

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.addNewUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
