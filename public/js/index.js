import { login, logout } from './login';
import { displayMap } from './mapBox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import colors from 'colors';
// Dom Elements
const loginForm = document.querySelector('.form-login');
const mapElement = document.getElementById('map');
const email = document.getElementById('login-email');
const password = document.getElementById('login-password');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
// Display Map
if (mapElement) {
  const locations = JSON.parse(mapElement.dataset.locations);
  displayMap(locations);
}

// Handle Login Form Submission
if (loginForm) {
  // console.log('loginForm', loginForm);
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
     
    document.querySelector('#login-button').textContent = 'Loading...'
    login(email.value, password.value);
  });
}

// Handle Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
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

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    if (!tourId) return;
    bookTour(tourId);
  });
}
