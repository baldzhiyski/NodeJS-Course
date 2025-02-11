import axios from 'axios';
import { showAlert } from './alert';
export async function toggleFavorite(button) {
  const tourId = button.dataset.tourId;
  const isActive = button.classList.contains('active'); // Check if the button is currently active

  try {
    const response = await axios({
      method: 'POST',
      url: '/api/v1/users/favourites',
      data: { tourId, favorite: !isActive }, // Correctly send data using 'data'
      headers: {
        'Content-Type': 'application/json', // Ensure content is sent as JSON
      },
    });

    if (response.data.status === 'success') {
      if (isActive) {
        button.classList.remove('active'); // If it's active, remove the class
      } else {
        button.classList.add('active'); // If it's not active, add the class
      }
      showAlert('success', response.data.message); // Show success alert
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.message); // Handle errors properly
  }
}
