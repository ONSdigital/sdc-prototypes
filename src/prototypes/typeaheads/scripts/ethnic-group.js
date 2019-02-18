const form = document.getElementsByTagName('FORM')[0];
const inputs = [...document.querySelectorAll('input[name="ethnic-group"]')];

inputs.forEach(input => input.addEventListener('click', () => {
  form.action = input.getAttribute('data-action-url');
}));
