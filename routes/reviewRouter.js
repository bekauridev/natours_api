const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.indexReview)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.storeReview
  );

router
  .route('/:id')
  .get(reviewController.showReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.destroyReview
  );

module.exports = router;
