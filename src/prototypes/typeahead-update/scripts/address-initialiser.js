import domready from 'helpers/domready';

function initialise() {
  const button = document.querySelector('.js-set-dummy-address');

  if (button) {
    button.addEventListener('click', handleClick);
  }
}

function handleClick() {
  document.querySelector('.js-address-line-1').value = '23';
  document.querySelector('.js-address-line-2').value = 'Example Street';
  document.querySelector('.js-address-town').value = 'Example Town';
  document.querySelector('.js-address-county').value = 'Example County';
  document.querySelector('.js-address-postcode').value = 'AA9 9AA';
}

domready(initialise);
