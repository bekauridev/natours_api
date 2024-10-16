const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.indexReview)
  .post(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.setTourUserIds,
    reviewController.storeReview
  );

router
  .route('/:id')
  .get(reviewController.showReview)
  .delete(reviewController.destroyReview)
  .patch(reviewController.updateReview);

module.exports = router;
