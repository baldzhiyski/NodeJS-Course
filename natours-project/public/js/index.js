import { login, logout } from '../js/login';
import { updateData } from '../js/updateSettings';
import '@babel/polyfill';

// Dom Elements
const loginForm = document.querySelector('.login-form');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

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
    const email = document.getElementById('email').value;
    const [firstName, lastName] = document
      .getElementById('name')
      .value.split(' ');

    updateData(firstName, lastName, email);
  });
}
