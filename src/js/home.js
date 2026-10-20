import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/home.css';
import { subscribe } from './api.js';

const form = document.querySelector('[data-signup]');
const error = document.querySelector('[data-signup-error]');
const done = document.querySelector('[data-signup-done]');

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
