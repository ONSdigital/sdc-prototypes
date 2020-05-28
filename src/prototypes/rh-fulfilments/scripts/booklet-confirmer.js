import domready from 'helpers/domready';

function bookletConfirmer() {
  const context = document.querySelector('.js-booklet-confirm');

  if (context) {
    const key = context.getAttribute('data-booklet-input-url');
    const data = sessionStorage.getItem(key);

    if (data) {
      const booklet = JSON.parse(data)
        .inputs.filter(input => !input.isTypeahead)
        .map(input => input.value)
        .filter(value => value);

      context.innerHTML = context.innerHTML.replace('{x}', booklet);
    }
  }
}

domready(bookletConfirmer);
