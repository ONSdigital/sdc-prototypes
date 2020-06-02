import TypeaheadUI from '../input/typeahead.ui';
import AddressSetter from '../address-input/address-setter';

import domReady from 'helpers/domready';

const addressReplaceChars = [','];
const classAddress = 'js-fuse-address';
const baseClass = 'js-address-typeahead';

class FuseAddressInput {
  constructor(context) {
    this.context = context;
    this.form = context.closest('form');
    this.lang = 'en-gb';

    // State
    this.currentQuery = null;
    this.fetch = null;
    this.currentResults = [];
    this.errored = false;

    // Initialise address setter
    this.addressSetter = new AddressSetter(context);
    
    // Initialise typeahead
    this.typeahead = new TypeaheadUI({
      context: context.querySelector(`.${baseClass}`),
      onSelect: this.onAddressSelect.bind(this),
      onUnsetResult: this.addressSetter.onUnsetAddress(),
      onError: this.onError.bind(this),
      sanitisedQueryReplaceChars: addressReplaceChars,
      typeaheadData: context.getAttribute('typeahead-data'),
      resultLimit: 50,
      minChars: 5,
      suggestOnBoot: true,
      handleUpdate: true
    });

    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }


  onAddressSelect(selectedResult) {
    this.createAddressLines(selectedResult);
  }

  createAddressLines(selectedResult) {
    let values = (selectedResult[this.lang]).split(',');
    const addressLines = {
      addressLine1: values[0],
      addressLine2: values[1],
      addressLine3: values[2],
      townName: values[3],
      postcode: values[4]
    }
    this.addressSetter.setAddress(addressLines);
  }

  onError() {
    if (this.fetch) {
      this.fetch.abort();
    }

    // Prevent error message from firing twice
    if (!this.errored) {
      this.errored = true;
      console.log('error');
      setTimeout(() => {
        this.errored = false;
      });
    }
  }

  handleSubmit(event) {
    if (!this.manualMode && this.typeahead.input.value.trim() && !this.addressSelected) {
      event.preventDefault();

      window.DONT_SUBMIT = true;

      this.typeahead.showErrorPanel();
      this.typeahead.setAriaStatus('There is an error. Select an address to continue.');
    } else {
      window.DONT_SUBMIT = false;
    }
  }
}

function addressInput() {
  const addressInputs = [...document.querySelectorAll(`.${classAddress}`)];

  addressInputs.forEach(addressInput => new FuseAddressInput(addressInput));
}

domReady(() => setTimeout(addressInput, 10));
