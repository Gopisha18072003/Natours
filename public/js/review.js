import axios from 'axios';
import { showAlert } from './alerts';

export const editReview = async (review, rating, reviewId, userId) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${userId}/reviews/${reviewId}`,
      data: {
        review,
        rating
      },
    });
    if(res.data.status === 'success') {
      showAlert('success','Review updated successfully!');
      window.setTimeout(()=> {
        location.assign('/my-reviews');
      }, 1500);
    }
  } catch (err) {
    showAlert('error' ,err.response.data.message);
  }
};

export const createReview = async (review, rating, userId, tourId) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/reviews/`,
      data: {
        review,
        rating,
        tour: tourId,
        user: userId
      },
    });
    if(res.data.status === 'success') {
      showAlert('success','Review saved successfully!');
      window.setTimeout(()=> {
        location.assign('/my-reviews');
      }, 1500);
    }
  } catch (err) {
    showAlert('error' ,'You have aleady reviewed this tour');
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/reviews/${reviewId}`,
    });
    if(res.data.status === 'success') {
      showAlert('success','Review deleted successfully!');
      window.setTimeout(()=> {
        location.assign('/my-reviews');
      }, 1500);
    }
  } catch (err) {
    showAlert('error' ,'No review found');
  }
};


