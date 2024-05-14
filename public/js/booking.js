import axios from 'axios';
import { showAlert } from './alerts';

export const saveEditBooking = async (bookingId, startDate) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/bookings/${bookingId}`,
      data: {
       startDate
      },
    });
    if(res.data.status === 'success') {
      showAlert('success','Booking updated successfully!');
      window.setTimeout(()=> {
        location.assign('/bookings');
      }, 1500);
    }
  } catch (err) {
    showAlert('error' ,err.response.data.message);
  }
};
export const deleteBooking = async (bookingId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/v1/bookings/${bookingId}`,
    });
    if(res.data.status === 'success') {
      showAlert('success','Booking Deleted!');
      window.setTimeout(()=> {
        location.assign('/bookings');
      }, 1500);
    }
  } catch (err) {
    showAlert('error' ,err.response.data.message);
  }
};

