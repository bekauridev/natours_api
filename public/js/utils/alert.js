// export const hideAlert = () => {
//   const el = document.querySelector('.alert');
//   if (el) el.parentElement.removeChild(el);
// };

// /**
//  * Show the alert message
//  * @param {string} type - Type of alert (error, success)
//  * @param {string} msg - The message to be displayed
//  */
// export const showAlert = (type, msg) => {
//   hideAlert();
//   const markup = `<div class="alert alert--${type}">${msg}</div>`;
//   document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
//   window.setTimeout(() => {
//     document.querySelector('.alert').remove();
//   }, 3000);
// };

// Hide alert
export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.remove(); // Use `remove()` for cleaner deletion
};

/**
 * Show the alert message with a close button
 * @param {string} type - Type of alert (error, success)
 * @param {string} msg - The message to be displayed
 */
export const showAlert = (type, msg) => {
  hideAlert(); // Ensure no previous alert exists

  // Alert markup with close button (SVG)
  const markup = `
    <div class="alert alert--${type}">
      <span>${msg}</span>
      <button class="alert__close-btn" aria-label="Close alert">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x alert__icon" viewBox="0 0 16 16">
          <path d="M8 6.586l3.707-3.707a1 1 0 1 1 1.414 1.414L9.414 8l3.707 3.707a1 1 0 1 1-1.414 1.414L8 9.414l-3.707 3.707a1 1 0 1 1-1.414-1.414L6.586 8 2.879 4.293a1 1 0 1 1 1.414-1.414L8 6.586z"/>
        </svg>
      </button>
    </div>
  `;

  // Add alert to the DOM
  document.body.insertAdjacentHTML('afterbegin', markup);

  // Add event listener to close button
  const closeBtn = document.querySelector('.alert__close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideAlert);
  }

  // Auto-hide alert after 7 seconds if not manually closed
  setTimeout(() => {
    if (document.querySelector('.alert')) hideAlert();
  }, 7000);
};
