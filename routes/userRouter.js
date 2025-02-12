const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);
router.patch(
  '/updatePassword',

  authController.updatePassword
);

router.get(
  '/me',

  userController.getMe,
  userController.showUser
);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router.route('/').get(userController.indexUser).post(userController.storeUser);
router
  .route('/:id')
  .get(userController.showUser)
  .patch(userController.updateUser)
  .delete(
    // authController.protect,
    // authController.restrictTo('admin', 'lead-guide'),
    userController.destroyUser
  );

module.exports = router;
