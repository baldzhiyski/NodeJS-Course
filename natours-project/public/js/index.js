import axios from 'axios';
import { login, logout, registerUser } from '../js/login';
import { updateSettings, resetPassword } from '../js/updateSettings';
import { bookTour } from './booking';
import { toggleFavorite } from '../js/markFavourite';
import '@babel/polyfill';

// Dom Elements
const loginForm = document.querySelector('.login-form');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const resetPassButton = document.getElementById('send-reset-btn');
const bookBtn = document.getElementById('book-tour');
const registerForm = document.querySelector('.register-form'); // Fix class name

const favoriteButtons = document.querySelectorAll('.favorite-btn');
const favoritesToggle = document.getElementById('favorites-dropdown-toggle');
const dropdownMenu = document.getElementById('favorites-dropdown');

favoriteButtons.forEach((button) => {
  button.addEventListener('click', () => toggleFavorite(button));
});

// Add event listener to the "Favorites" button
if (favoritesToggle) {
  favoritesToggle.addEventListener('click', function () {
    const dropdown = document.getElementById('favorites-dropdown');

    // Toggle the display of the dropdown menu
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
      dropdown.style.display = 'block'; // Show the dropdown
    } else {
      dropdown.style.display = 'none'; // Hide the dropdown
    }
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const userToBeRegistered = {
      firstName,
      lastName,
      email,
      password,
      confirmPass: confirmPassword,
      role: 'user',
    };

    console.log(userToBeRegistered);

    registerUser(userToBeRegistered);
  });
}

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    const email = document.getElementById('email').value;
    const [firstName, lastName] = document
      .getElementById('name')
      .value.split(' ');
    form.append('firstName', firstName);
    form.append('lastName', lastName);
    form.append('email', email);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const password = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm =
      document.getElementById('password-confirm').value;
    await updateSettings(
      { password, newPassword, newPasswordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (resetPassButton) {
  resetPassButton.addEventListener('click', async () => {
    const email = document.getElementById('email-reset').value;
    if (!email) {
      alert('Please enter your email');
      return;
    }

    await resetPassword(email);
  });
}

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
