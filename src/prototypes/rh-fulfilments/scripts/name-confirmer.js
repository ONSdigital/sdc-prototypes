import domready from 'helpers/domready';

function nameConfirmer() {
  const context = document.querySelector('.js-name-confirm');

  if (context) {
    const key = context.getAttribute('data-name-input-url');
    const data = sessionStorage.getItem(key);

    if (data) {
      const name = JSON.parse(data)
        .inputs.filter(input => !input.isTypeahead)
        .map(input => input.value)
        .filter(value => value);

      context.innerHTML = name.join(' ');
    }
  }
}

domready(nameConfirmer);
