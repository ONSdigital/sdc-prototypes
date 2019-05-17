import domready from 'helpers/domready';
import addressToDisplay from './address-to-display';

function studentAddressCheck() {
  const destination = document.querySelector('.js-student-address-check');

  if (destination) {
    const key = destination.getAttribute('data-census-address');
    const address = JSON.parse(sessionStorage.getItem(key));

    const params = {
      id: 'student-address-check',
      name: 'student-address-check',
      radios: [ 
        {
          id: 'home',
          label: {
            text: addressToDisplay(address.inputs)
          },
          value: key
        }
      ]
    };

    const countryKey = destination.getAttribute('data-address-country');
    const savedAddressCountry = sessionStorage.getItem(countryKey);

    if (savedAddressCountry) {
      const question = JSON.parse(savedAddressCountry);
      const answer = question.inputs.find(input => input.label);

      params.radios.push({
        id: 'country',
        label: {
          text: `Address in ${answer.value}`
        },
        value: `Address in {pipe}${countryKey}{/pipe}`
      });
    }

    const addressKey = destination.getAttribute('data-address');
    const savedAddress = sessionStorage.getItem(addressKey);

    if (savedAddress) {
      const address = JSON.parse(savedAddress);

      params.radios.push({
        id: 'address',
        label: {
          text: addressToDisplay(address.inputs)
        },
        value: addressKey
      });
    }

    params.radios.push({
      id: 'other',
      label: {
        text: 'Another address'
      },
      value: destination.getAttribute('data-student-address'),
      attributes: {
        'data-action-url': destination.getAttribute('data-student-address')
      }
    });

    const radios = params.radios.map(radio => {
      const attributes = [];

      for (const key in radio.attributes) {
        if (radio.attributes.hasOwnProperty(key)) {
          attributes.push(`${key}="${radio.attributes[key]}"`);
        }
      }

      return `<div class="field__item">
        <div class="radio">
          <input class="radio__input" name="${params.name}" id="${radio.id}" value="${radio.value}" aria-labeledby="${radio.id}-label" type="radio" ${attributes.join(' ')}>
          <label id="${radio.id}-label" aria-hidden="true" class="radio__label" for="${radio.id}">${radio.label.text}</label>
        </div>
      </div>`;
    });

    const html = `
      <div class="field__items">
        ${radios.join('<br>')}
      </div>
    `;

    destination.innerHTML = html;
  }
}

domready(studentAddressCheck);
