import { login, logout } from './login';
import { signup } from './signup';
import { updateSettings } from './updateSettings';
import { displayMap } from './mapbox';
import {bookTour} from './stripe'

// DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.getElementById('login');
const signinForm = document.getElementById('signup');
const userUpdateForm = document.querySelector('.form-user-data');
const passwordUpdateForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if (mapBox) {
  const locations = JSON.parse(document.getElementById('map').dataset.location);
  displayMap(locations);
}

  document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'logout') {
      logout();
    }
  });


if (loginForm) {
  document.getElementById('login').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signinForm) {
  document.getElementById('signup').addEventListener('submit', (e) => {
    console.log('Hello');
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    signup(name, email, password, confirmPassword);
  });
}

if(userUpdateForm){
  userUpdateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
    location.reload(true);
  });
}

if(passwordUpdateForm){
  
  passwordUpdateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.querySelector('.btn--update-password');
    btn.textContent= '....UPDATING'
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    await updateSettings({currentPassword, password, confirmPassword}, 'password');

    btn.textContent= 'SAVE PASSWORD'
    document.getElementById('password-current').value = ''
    document.getElementById('password').value = ''
    document.getElementById('password-confirm').value = ''
  });
}

if(bookBtn)
  bookBtn.addEventListener('click', async e => {
  e.target.textContent = 'Processing....'
  const {tourId} = e.target.dataset;
  await bookTour(tourId);
  

  })