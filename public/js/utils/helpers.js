/**
 * Updates the state of the UI
 * @param {string} state - The state of the UI, can be 'loading', 'error' or 'default done'
 * @param {Array<HTMLElement>} disabled - An array of elements that should be disabled/enabled
 * @param {Array<HTMLElement>} btn - An array of button elements that should have their text changed
 * @param {string} [orgText='Submit'] - The original text of the button
 */
export const uiUpdate = (state, disabled, btn, orgText = 'Submit') => {
  switch (state) {
    case 'loading':
      disabled.forEach((el) => (el.disabled = true));
      btn.forEach((el) => (el.textContent = 'Loading...'));
      break;
    case 'error':
      disabled.forEach((el) => (el.disabled = false));
      btn.forEach((el) => (el.textContent = 'Retry'));
      break;
    default:
      disabled.forEach((el) => (el.disabled = false));
      btn.forEach((el) => (el.textContent = orgText));
  }
};

//

/**
 * Toggle active class if element exists
 * @param {HTMLElement | null} element - The element to toggle class on
 */
export const toggleActiveClass = (element) => {
  if (element instanceof HTMLElement) {
    element.classList.toggle('active');
  } else {
    // console.warn('toggleActiveClass: Invalid or undefined element', element);
  }
};
