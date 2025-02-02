import axios from 'axios';
import { showAlert } from './alert';
export const updateData = async (firstName, lastName, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://localhost:3000/api/v1/users/updateMe',
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Update was successful !');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
