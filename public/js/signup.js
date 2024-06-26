import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (name, email, password, confirmPassword) => {
    try {
      const res = await axios({
        method: 'POST',
        url: '/api/v1/users/sign-up',
        data: {
          name,
          email,
          password,
          confirmPassword
        },
      });
      if(res.data.status === 'success') {
        showAlert('success', 'Account created successfully');
        window.setTimeout(()=> {
          location.assign('/');
        }, 1500);
      }
    } catch (err) {
      showAlert('error',err.response.data.message);
    }
  };
  

  