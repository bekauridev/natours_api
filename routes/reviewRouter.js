const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const { filterByUser } = require('../middlewares/filterByUser');
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.indexReview)
  .post(
    authController.restrictTo('user', 'admin'),
    reviewController.setTourUserIds,
    reviewController.storeReview
  );

router
  .route('/:id')
  .get(reviewController.showReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    filterByUser,
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    filterByUser,
    reviewController.destroyReview
  );

module.exports = router;
