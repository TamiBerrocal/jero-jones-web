import { subscribe } from './api.js';

// Wires every newsletter form on the page: validates the email, calls the stub and swaps in the thank-you line.
export function initSignup() {
  for (const form of document.querySelectorAll('[data-signup]')) {
    const root = form.parentElement;
    const error = root.querySelector('[data-signup-error]');
    const done = root.querySelector('[data-signup-done]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = form.elements.email;

      if (!input.checkValidity()) {
        error.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }

      error.hidden = true;
      input.removeAttribute('aria-invalid');
      await subscribe(input.value);
      form.hidden = true;
      done.hidden = false;
    });
  }
}
