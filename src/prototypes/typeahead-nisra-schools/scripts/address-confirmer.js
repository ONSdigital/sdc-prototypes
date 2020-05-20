import domready from 'helpers/domready';

function addressConfirmer() {
  const context = document.querySelector('.js-address-confirm');

  if (context) {
    const key = context.getAttribute('data-address-input-url');
    const data = sessionStorage.getItem(key);

    if (data) {
      const address = JSON.parse(data)
        .inputs.filter(input => !input.isTypeahead)
        .map(input => input.value)
        .filter(value => value);

      context.innerHTML = address.join('<br>');
    }
  }
}

domready(addressConfirmer);
