import axios from 'axios';
import { showAlert } from './alerts';

export const deleteTour = async (tourId) => {
    try {
        const res = await axios({
          method: 'DELETE',
          url: `/api/v1/tours/${tourId}`,
        });
        if(res.data.status === 'success') {
          showAlert('success','Tour Deleted!');
          window.setTimeout(()=> {
            location.assign('/tours');
          }, 1500);
        }
      } catch (err) {
        showAlert('error' ,err.response.data.message);
      }
}