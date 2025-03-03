// Auth
import { signup } from './auth/signup';
import { login, logout } from './auth/login';

// User
import { getCurrentUser } from './user/getUser';
import { updateSettings } from './user/updateSettings';
import { deleteCurrentAccount } from './user/deleteAcc';
// Review
import {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
} from './review/review';
// Services
import { bookTour } from './services/stripe'; // Stripe
import { displayMap } from './services/mapBox'; // map
import MicroModal from 'micromodal'; // for modals
// utils
import { showAlert } from './utils/alert';
import { toggleActiveClass, uiUpdate } from './utils/helpers';
// Dom Elements
// Log In
const logInBtn = document.querySelector('#login-button');
const loginForm = document.querySelector('.form-login');
const logInEmail = document.getElementById('login-email');
const logInPassword = document.getElementById('login-password');
// Log Out
const logoutBtn = document.querySelector('.nav__el--logout');
// Sign Up
const signUpBtn = document.querySelector('#signup-button');
const signupForm = document.querySelector('.form-signup');
const signUpName = document.querySelector('#signup-name');
const signUpEmail = document.querySelector('#signup-email');
const signUpPassword = document.querySelector('#signup-password');
const signUpPasswordConfirm = document.querySelector(
  '#signup-confirm-password'
);
// User Update
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

// Account Delete
const userDeleteForm = document.querySelector('.form-account-delete');
const deleteBtn = document.querySelector('.btn--delete-account');
const accountDeleteConfirm = document.querySelector('#account-delete-confirm');

// Booking
const bookBtn = document.getElementById('book-tour');

// Map
const mapElement = document.getElementById('map');

// hamburger menu
const hamburger = document.querySelector('.hamburger');
const navRow = document.querySelector('.nav_row');

// Account menu
const menuToggle = document.querySelector('.user-view-menu-toggle__button');
const menuClose = document.querySelector('.user-view__menu__btn-close');
const userView = document.querySelector('.user-view__menu');

// Review
const reviewForm = document.querySelector('.form-review');
const reviewRating = document.querySelector('#review-rating-input');
const reviewFeedBack = document.querySelector('#review-feedback-input');
const reviewBtn = document.querySelector('#review-button');
const deleteReviewBtn = document.querySelector('#deleteReviewBtn');
const reviewCards = document.querySelectorAll('.reviews__card');

// File Upload
const photoInput = document.getElementById('photo');
const uploadStatus = document.getElementById('uploadStatus');

// initialize MicroModal
MicroModal.init({
  disableScroll: false, //  background scrolling
  awaitCloseAnimation: true, // Smooth animation when closing
});

// Display Map
if (mapElement) {
  const locations = JSON.parse(mapElement.dataset.locations);
  displayMap(locations);
}

// Handle Login Form Submission
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    logInBtn.textContent = 'Loading...';
    logInBtn.disabled = true;

    try {
      await login(logInEmail.value, logInPassword.value);
    } catch (err) {
      // console.error('Login failed:', err);
    } finally {
      // Reset button after the request is completed (success or error)
      logInBtn.textContent = 'Log In';
      logInBtn.disabled = false;
    }
  });
}

// Handle Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

// Handle Sign up form
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      signUpBtn.textContent = 'Loading...';
      signUpBtn.disabled = true;
      await signup(
        signUpName.value,
        signUpEmail.value,
        signUpPassword.value,
        signUpPasswordConfirm.value
      );
    } catch (err) {
      // console.error('Signup failed:', err);
    } finally {
      // Reset button after the request is completed (success or error)
      signUpBtn.disabled = false;
      signUpBtn.textContent = 'Sign Up';
    }
  });
}

// Handle User Data Update
if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn-SaveSettings').textContent = 'Updating...';
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    await updateSettings(form, 'data');
    document.querySelector('.btn-SaveSettings').textContent = 'Save settings';
    location.reload();
  });
}

// Handle User password Update
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    // Values
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { currentPassword, password, passwordConfirm },
      'password'
    );

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.querySelector('.btn--save-password').textContent = 'Save password';
  });
}

// Handle Account deletion
if (userDeleteForm) {
  userDeleteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      deleteBtn.textContent = 'Deleting...';
      deleteBtn.disabled = true;

      const userData = await getCurrentUser();
      if (!userData) {
        showAlert(
          'error',
          'Could not retrieve user information. Please try again.'
        );
        return;
      }

      const userName = userData.name.toLowerCase();
      const input = accountDeleteConfirm?.value?.trim().toLowerCase();

      if (!input) {
        showAlert('error', 'Please enter your username.');
        return;
      }

      if (userName === input) {
        await deleteCurrentAccount();
      } else {
        showAlert('error', 'Incorrect name. Please enter your full username');
      }
    } catch (err) {
      // console.error('Error deleting account:', err);
      showAlert('error', 'Something went wrong. Please try again.');
    } finally {
      deleteBtn.textContent = 'Delete Account';
      deleteBtn.disabled = false;
    }
  });
}

// Handle Booking
if (bookBtn) {
  bookBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.target.textContent = 'Processing...';
    e.target.disabled = true;

    try {
      const { tourId } = e.target.dataset;
      if (!tourId) throw new Error('Tour ID not found');
      await bookTour(tourId);
    } catch (err) {
      // console.error('Failed to book the tour!');
    } finally {
      e.target.textContent = 'Book Tour';
      e.target.disabled = false;
    }
  });
}

// currentReview is defined if review is already created
let currentReview = null;

const tourId = reviewCards.length ? reviewCards[0].dataset.tourid : null;

// This Function is changing the state of reviewForm if review is already created
// review is created or not is handled by _reviewCard.pug
async function prepareForUpdate(reviewId) {
  if (!reviewId) return;

  // Form elements (loading)
  uiUpdate(
    'loading',
    [reviewFeedBack, reviewRating, reviewBtn],
    [reviewBtn],
    'Update'
  );
  try {
    currentReview = await getReviews(reviewId); // Fetch review

    if (currentReview) {
      uiUpdate(
        'done',
        [reviewFeedBack, reviewRating, reviewBtn],
        [reviewBtn],
        'Update'
      );
      reviewRating.value = currentReview.rating; // Fill rating input
      reviewFeedBack.value = currentReview.review; // Fill feedback input
    }
  } catch (err) {
    uiUpdate('error', [reviewFeedBack, reviewRating, reviewBtn], [reviewBtn]);

    // console.error('Error fetching review:', err);
    showAlert('error', 'Something went wrong');
  }
}

// Function to delete a review
async function reviewDeleteHandler(reviewId) {
  if (!reviewId) return;

  // console.log(`Attempting to delete review: ${reviewId}`);
  uiUpdate('loading', [deleteReviewBtn], [deleteReviewBtn]);

  try {
    await deleteReview(reviewId);
  } catch (err) {
    // console.error('Error deleting review:', err);
    showAlert('error', 'Error deleting review. Try again.');
  } finally {
    uiUpdate('done', [deleteReviewBtn], [deleteReviewBtn], 'Delete');
    MicroModal.close('deleteReview-modal'); // Close modal
  }
}

// Handle Review icons click
document.addEventListener('click', (e) => {
  const reviewCard = e.target.closest('.reviews__card');
  if (!reviewCard) return;

  const reviewId = reviewCard.dataset.reviewid;

  // Open modal & pre-fill fields when editing
  if (e.target.closest('[data-for="editReview"]')) {
    prepareForUpdate(reviewId);
  }

  // Handle Delete Review
  if (e.target.closest('[data-for="deleteReview"]')) {
    // console.log(`Review ID: ${reviewId} Review Deletion activated`);

    deleteReviewBtn.onclick = () => reviewDeleteHandler(reviewId);
  }
});

// Handle review form submission (Create or Update)
// Review added or edited will be determined by currentReview
reviewForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!reviewFeedBack.value || !reviewRating.value) {
    showAlert('error', 'Please fill out all fields!');
    return;
  }

  try {
    uiUpdate('loading', [reviewBtn], [reviewBtn]);

    // If review already exists, update it
    if (currentReview) {
      await updateReview(
        currentReview.id,
        reviewFeedBack.value,
        reviewRating.value
      );
    } else {
      // console.log(reviewFeedBack.value, reviewRating.value);
      // console.log('Adding new review for tour:', tourId);
      await addReview(reviewFeedBack.value, reviewRating.value, tourId);
    }
  } catch (err) {
    // console.error('Error while saving review:', err);
  } finally {
    uiUpdate('done', [reviewBtn], [reviewBtn]);
    currentReview = null; // Reset after submission
    MicroModal.close('editReview-modal'); // Close modal
  }
});

//  Toggle hamburger menu
hamburger?.addEventListener('click', () => toggleActiveClass(navRow));

// Account left side menu
menuToggle?.addEventListener('click', () => toggleActiveClass(userView));
menuClose?.addEventListener('click', () => toggleActiveClass(userView));

// Handle image upload indicator display
if (photoInput) {
  // Show selected file name
  photoInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      // uploadStatus.textContent = `${e.target.files[0].name}`;
      uploadStatus.textContent = 'Image uploaded successfully!';
    }
  });
}
