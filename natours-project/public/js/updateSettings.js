import axios from 'axios';
import { showAlert } from './alert';
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updatePassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
      location.assign('/account');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
export const resetPassword = async (email) => {
  try {
    const res = await axios.post('/api/v1/users/forgotPassword', { email });

    if (res.status === 200) {
      showAlert('success', 'Reset link sent! Check your email.');
    } else {
      showAlert('error', `Error: ${res.data.message}`);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Something went wrong.');
  }
};
