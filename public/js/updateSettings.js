import { showAlert } from './alerts';

import axios from 'axios';

export const updateData = async (name, email) => {
  try {
    const result = await axios({
      method: 'PATCH',
      url: 'http://localhost:3000/api/v1/users/updateMe',
      data: {
        name,
        email
      }
    });

    if (result.data.status === 'success') {
      showAlert('success', 'Data updated successfully');
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
