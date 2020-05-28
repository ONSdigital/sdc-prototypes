import domready from 'helpers/domready';

function mobileFormatter() {
  const context = document.querySelector('.js-mobile-number');

  if (context) {
    const key = context.getAttribute('data-mobile-input-url');
    const data = sessionStorage.getItem(key);

    if (data) {
      const mobile = JSON.parse(data)
        .inputs.filter(input => !input.isTypeahead)
        .map(input => input.value)
        .filter(value => value);

      var formatted =
        '+44 (0)' + mobile.toString().substr(1, 2) + ' ' + mobile.toString().substr(3, 4) + ' ' + mobile.toString().substr(7, 4);

      context.innerHTML = context.innerHTML.replace('{x}', formatted);
    }
  }
}

domready(mobileFormatter);
