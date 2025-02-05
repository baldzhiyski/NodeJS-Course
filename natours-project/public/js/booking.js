import axios from 'axios';
import { showAlert } from './alert';
export const bookTour = async (tourId) => {
  try {
    console.log('Starting process !');
    const res = await axios.post(`/api/v1/bookings/checkout-session/${tourId}`);
    if (res.data.status === 'success') {
      showAlert('success', 'Booking was successful!');
      location.assign('/my-tours');
    }
  } catch (err) {
    showAlert('error', 'This tour is already booked !');
  }
};
