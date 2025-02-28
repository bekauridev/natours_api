import { login, logout } from './login';
import { signup } from './signup';
import { deleteCurrentAccount } from './deleteAcc';
import { showAlert } from './alert';
import { getCurrentUser } from './getUser';
import { displayMap } from './mapBox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import colors from 'colors';
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
        console.log('✅ Correct username. Account will be deleted.');
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

//  Toggle hamburger menu
hamburger?.addEventListener('click', () => navRow?.classList.toggle('active'));
menuToggle?.addEventListener('click', () =>
  userView?.classList.toggle('active')
);
menuClose?.addEventListener('click', () =>
  userView?.classList.toggle('active')
);
