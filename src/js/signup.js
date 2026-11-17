import { subscribe } from './api.js';

const SEND_ERROR = 'No pude anotarte. Probá de nuevo en un rato.';

// Wires every newsletter form on the page: validates the email, saves it and swaps in the thank-you line.
// `data-signup="home"` / `"quien"` tells the backend which page the signup came from.
export function initSignup() {
  for (const form of document.querySelectorAll('[data-signup]')) {
    const root = form.parentElement;
    const error = root.querySelector('[data-signup-error]');
    const done = root.querySelector('[data-signup-done]');
    const button = form.querySelector('[type="submit"]');
    const invalidText = error.textContent;

    const showError = (text) => {
      error.textContent = text;
      error.hidden = false;
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = form.elements.email;

      if (!input.checkValidity()) {
        showError(invalidText);
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }

      error.hidden = true;
      input.removeAttribute('aria-invalid');
      button.disabled = true;
      try {
        await subscribe(input.value, form.dataset.signup || 'web');
        form.hidden = true;
        done.hidden = false;
      } catch (err) {
        console.error(err);
        showError(SEND_ERROR);
      } finally {
        button.disabled = false;
      }
    });
  }
}
