import axios from 'axios';
import { showAlert } from './alerts';
export const bookTour = async (tourId) => {
  try {
   
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);
 
    
    //await stripe.redirectToCheckout({
    //  sessionId: session.data.session.id,
    //});
 
    //works as expected
    window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};