import { login, logout } from './login';
import { signup } from './signup';
import { updateSettings } from './updateSettings';
import { displayMap } from './mapbox';
import {bookTour} from './stripe'
import {showAlert} from './alerts'
import {editReview, createReview, deleteReview} from './review'

// DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.getElementById('login');
const signinForm = document.getElementById('signup');
const userUpdateForm = document.querySelector('.form-user-data');
const passwordUpdateForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const reviewEditForm = document.getElementById('edit-review');
const createReviewForm = document.getElementById('create-review');
const deleteReviewBtn = document.querySelector('.reviews__delete');

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
    // console.log('Hello');
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

  const alertMessage = document.querySelector('body').dataset.alert;
  if(alertMessage) showAlert('success', alertMessage, 20)

  

    document.querySelectorAll('.side-nav li').forEach(element => {
      element.addEventListener('click', e => handleNavClick(element));
    });
    
    function handleNavClick(clickedElement) {
      document.querySelectorAll('.side-nav li').forEach(element => {
        element.classList.remove('side-nav--active');
      });
      clickedElement.classList.add('side-nav--active');
    }

if(reviewEditForm) {
    document.getElementById('edit-review').addEventListener('submit', async (e) => {
      e.preventDefault();
      document.getElementById('save-edit').textContent = 'Saving....'
      const {userId, reviewId} = e.target.dataset;
      const review = document.getElementById('saved-review').value;
      const rating = document.getElementById('saved-rating').value;
      await editReview(review, rating, reviewId, userId);
  });
}

if(createReviewForm) {
    createReviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      document.getElementById('save-review').textContent = 'Saving....'
      const {userId, tourId} = e.target.dataset;
      const review = document.getElementById('review').value;
      const rating = document.getElementById('rating').value;
      await createReview(review, rating, userId, tourId);
  });
}

if(deleteReviewBtn) {
  deleteReviewBtn.addEventListener('click', async (e) => {
    const {reviewId} = e.target.dataset;
    console.log(reviewId)
    await deleteReview(reviewId);
  })

}