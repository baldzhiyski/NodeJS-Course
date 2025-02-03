import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfilly!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    console.log(res);
  } catch (e) {
    if (e.response && e.response.data.message.includes('Invalid token')) {
      showAlert('error', 'Session expired. Redirecting to home page...');
      setTimeout(() => {
        location.assign('/'); // Redirect to home page
      }, 1500);
    } else {
      showAlert('error', e.response.data.message);
    }
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout', // Call your logout API endpoint if needed
    });

    // If the logout was successful, clear the token and reload or redirect
    if (res.data.status === 'success') {
      // Optionally, show a success message
      showAlert('success', 'Logging out ...');

      // Redirect to the homepage or login page
      location.assign('/'); // Redirecting to homepage instead of reloading
    }
  } catch (error) {
    showAlert('error', 'Error logging out! Please try again...');
  }
};
