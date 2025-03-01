// Auth
import { signup } from './auth/signup';
import { login, logout } from './auth/login';

// User
import { getCurrentUser } from './user/getUser';
import { updateSettings } from './user/updateSettings';
import { deleteCurrentAccount } from './user/deleteAcc';
// Review
import { addReview, getReviews, updateReview } from './review/review';
//Services Stripe & map
import { bookTour } from './services/stripe';
import { displayMap } from './services/mapBox';

// utils
import { showAlert } from './utils/alert';
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
const openModalBtn = document.querySelector('#open-review-modal-btn');
const addReviewClose = document.querySelector('.addReview__close');
const reviewModal = document.querySelector('.addReview-modal');
const reviewForm = document.querySelector('.form-review');
const reviewRating = document.querySelector('#review-rating-input');
const reviewFeedBack = document.querySelector('#review-feedback-input');
const reviewBtn = document.querySelector('#review-button');
const reviewEditIcons = document.querySelectorAll('.review-edit-icon'); // Select all edit icons
const reviewCard = document.querySelector('.reviews__card');

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
      console.error('Login failed:', err);
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
      console.error('Signup failed:', err);
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
      console.error('Error deleting account:', err);
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
      console.error('Failed to book the tour!');
    } finally {
      e.target.textContent = 'Book Tour';
      e.target.disabled = false;
    }
  });
}

const toggleActiveClass = (element) => element?.classList.toggle('active');

//  Toggle hamburger menu
hamburger?.addEventListener('click', () => toggleActiveClass(navRow));

// Account left side menu
menuToggle?.addEventListener('click', () => toggleActiveClass(userView));
menuClose?.addEventListener('click', () => toggleActiveClass(userView));

// Review related
openModalBtn?.addEventListener('click', toggleModal);
addReviewClose?.addEventListener('click', toggleModal);

// Get current review ID
const reviewId = reviewCard?.dataset.reviewid;
// Get current tour ID
const tourId = reviewCard?.dataset.tourid;

let currentReview = null; // Store fetched review globally

// Toggle modal visibility
function toggleModal() {
  reviewModal?.classList.toggle('active');
}

// Open modal & pre-fill fields when editing
reviewEditIcons.forEach((icon) => {
  icon.addEventListener('click', async (e) => {
    if (!reviewCard) return;

    toggleModal(); // Open modal

    if (reviewId) {
      try {
        currentReview = await getReviews(reviewId); // Fetch review and store globally

        if (currentReview) {
          reviewFeedBack.value = currentReview.review; // Fill feedback input
          reviewRating.value = currentReview.rating; // Fill rating input
          reviewBtn.textContent = 'Update'; // Change button text
        }
      } catch (err) {
        console.error('Error fetching review:', err);
      }
    }
  });
});

// Handle review form submission (create or update)
reviewForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!reviewFeedBack.value || !reviewRating.value) {
    showAlert('error', 'Please fill out all fields!');
    return;
  }

  try {
    reviewBtn.textContent = 'Loading...';
    reviewBtn.disabled = true;

    if (currentReview) {
      await updateReview(
        currentReview.id,
        reviewFeedBack.value,
        reviewRating.value
      );
    } else {
      await addReview(reviewFeedBack.value, reviewRating.value, tourId);
    }
    setTimeout(() => location.reload(), 1000);
  } catch (err) {
    console.error('Error while saving review:', err);
  } finally {
    reviewBtn.textContent = 'Submit';
    reviewBtn.disabled = false;
    currentReview = null; // Reset after submission
    toggleModal();
  }
});
