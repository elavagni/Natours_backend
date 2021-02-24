import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51IJTkBHSTzMxTeKSQJYwGqLfOwabAePAQfLewxVYbJUhM110qqoZMDtCUlz9pQ73YYl59gNl0tWvp0HE1lQ1krpC00jFbX6jFe'
);

export const bookTour = async tourId => {
  try {
    //1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    //2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (error) {
    console.error(error);
    showAlert('error', error);
  }
};
