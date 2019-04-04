import domready from 'helpers/domready';
import addressToDisplay from './address-to-display';

function setCensusAddress() {
  const input = document.querySelector('.js-one-year-ago-census-address');

  if (input) {
    const questionKey = input.getAttribute('data-census-address');
    const address = JSON.parse(sessionStorage.getItem(questionKey));
    const label = document.querySelector(`label[for=${input.id}]`);

    label.innerHTML = addressToDisplay(address.inputs);
    input.value = questionKey;
  }
}

domready(setCensusAddress);
