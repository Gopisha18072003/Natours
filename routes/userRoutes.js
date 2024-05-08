const express = require('express');
const reviewRouter = require('./reviewRoutes');
const authController = require('./../controllers/authController');
const {
  getAllUsers,
  getUser,
  uploadUserPhoto,
  createUser,
  resizeUserPhoto,
  updateMe,
  deleteMe,
} = require('./../controllers/userController');
const { signUp, login } = require('./../controllers/authController');



const router = express.Router();
// AUTHENTICATION AND AUTHORIZATION ROUTES
router.use('/:userId/reviews', reviewRouter);
router.use(express.json());
router.route('/sign-up').post(signUp);
router.route('/login').post(login);
router.route('/logout').get(authController.logout);

router.route('/forgot-password').post(authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

router.patch(
  '/update-password',
  authController.protect,
  authController.updatePassword,
);

// UPDATING/DELETING USER DATA ROUTES

router.route('/').get(getAllUsers).post(createUser);
router
  .route('/:id')
  .get(getUser)
  .patch(authController.protect, uploadUserPhoto, resizeUserPhoto, updateMe)
  .delete(authController.protect, deleteMe);

module.exports = router;
