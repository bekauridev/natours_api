import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51QqFT2IHoJJYIEK1ulwvxt5UJV2SfErSCV6fwlDvatut1c8BAENSXRgDQwE55IWYp3IMSiVGcbg0YB7CBX2H8nGP00fubIKHCc'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from stripe
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + charge the customer
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert(
      'An error occurred while trying to book the tour. Please try again later.'
    );
  }
};
