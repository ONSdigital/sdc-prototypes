import domready from 'helpers/domready';

function setCensusAddress() {
  const input = document.querySelector('.js-one-year-ago-census-address');

  if (input) {
    const questionKey = input.getAttribute('data-census-address');
    const address = JSON.parse(sessionStorage.getItem(questionKey));
    const label = document.querySelector(`label[for=${input.id}]`);
    const addressParts = [address.inputs[0].value, address.inputs[1].value].filter(value => value);

    label.innerHTML = addressParts.join(', ');
    input.value = questionKey;
  }
}

domready(setCensusAddress);
