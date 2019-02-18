import TypeaheadCore from '../typeahead/typeahead-core';

import domReady from 'helpers/domready';
import triggerChange from 'helpers/trigger-change-event';
import Fetch from 'helpers/abortable-fetch';

const lookupURL = 'https://preprod-address-lookup-api.eq.ons.digital/address_api/';
const addressReplaceChars = [','];

const classAddress = 'js-address';
const classLine1 = 'js-address-line-1';
const classLine2 = 'js-address-line-2';
const classTown = 'js-address-town';
const classCounty = 'js-address-county';
const classPostcode = 'js-address-postcode';
const classSearchButtonContainer = 'js-address-search-btn-container';
const classSearchButton = 'js-address-search-btn';
const classManualButton = 'js-address-manual-btn';
const classTypeahead = 'js-address-typeahead';

class AddressInput {
  constructor(context) {
    this.context = context;
    this.line1 = context.querySelector(`.${classLine1}`);
    this.line2 = context.querySelector(`.${classLine2}`);
    this.town = context.querySelector(`.${classTown}`);
    this.county = context.querySelector(`.${classCounty}`);
    this.postcode = context.querySelector(`.${classPostcode}`);
    this.manualInputs = [this.line1, this.line2, this.town, this.county, this.postcode];
    this.searchButtonContainer = context.querySelector(`.${classSearchButtonContainer}`);
    this.searchButton = context.querySelector(`.${classSearchButton}`);
    this.manualButton = context.querySelector(`.${classManualButton}`);

    // State
    this.manualMode = true;
    this.currentQuery = null;
    this.fetch = null;
    this.currentResults = [];

    // Initialise typeahead
    this.typeahead = new  TypeaheadCore({
      context: context.querySelector(`.${classTypeahead}`),
      onSelect: this.onAddressSelect.bind(this),
      onUnsetResult: this.onUnsetAddress.bind(this),
      suggestionFunction: this.suggestAddresses.bind(this),
      onError: this.onError.bind(this),
      sanitisedQueryReplaceChars: addressReplaceChars,
      resultLimit: 10,
      minChars: 5
    });

    this.searchButtonContainer.classList.remove('u-d-no');

    // Bind Event Listeners
    this.searchButton.addEventListener('click', this.toggleMode.bind(this));
    this.manualButton.addEventListener('click', this.toggleMode.bind(this));

    if (!(this.line1.value || this.line2.value || this.town.value || this.county.value || this.county.value)) {
      this.toggleMode();
    }
  }

  toggleMode(clearInputs = true) {
    this.setManualMode(!this.manualMode, clearInputs);
  }

  setManualMode(manual, clearInputs) {
    this.context.classList[manual ? 'remove' : 'add']('address-input--search');

    if (clearInputs) {
      this.typeahead.unsetResults();
    }
    
    this.manualMode = manual;
  }

  suggestAddresses(query) {
    return new Promise((resolve, reject) => {
      if (this.currentQuery === query && this.currentQuery.length && this.currentResults.length) {
        resolve(this.currentResults);
      } else {
        this.currentQuery = query;
        this.currentResults = [];

        if (this.fetch && this.fetch.status !== 'DONE') {
          this.fetch.abort();
        }

        this.reject = reject;

        this.fetch = new Fetch(`${lookupURL}?q=${encodeURIComponent(query)}`, {
          credentials: 'include',
          cache: 'force-cache'
        });

        this.fetch.send().then(response => {
          response.json().then(data => {
            const mappedResults = data.addresses.map(address => {
              const sanitisedText = sanitiseTypeaheadText(address, addressReplaceChars);
              let queryIndex = sanitisedText.indexOf(query);

              if (queryIndex < 0) {
                queryIndex = 9999;
              }

              const querySimilarity = dice(sanitisedText, query);

              return {
                value: address,
                text: address,
                sanitisedText,
                querySimilarity,
                queryIndex
              };
            });

            this.currentResults = orderBy(mappedResults, ['queryIndex', 'querySimilarity'], ['asc', 'desc']);

            resolve(this.currentResults);
          }).catch(reject);
        }).catch(reject);
      }
    });
  }

  onAddressSelect(result) {
    return new Promise(resolve => {
      const addressParts = result.value.split(', ');

      this.clearManualInputs(false);

      switch (addressParts.length) {
        case 3: {
          this.line1.value = addressParts[0];
          this.town.value = addressParts[1];
          this.postcode.value = addressParts[2];
          break;
        }
        case 4: {
          this.line1.value = addressParts[0];
          this.line2.value = addressParts[1];
          this.town.value = addressParts[2];
          this.postcode.value = addressParts[3];
          break;
        }
        case 5: {
          this.line1.value = `${addressParts[0]}, ${addressParts[1]}`;
          this.line2.value = addressParts[2];
          this.town.value = addressParts[3];
          this.postcode.value = addressParts[4];
          break;
        }
      }

      this.triggerManualInputsChanges();
      this.toggleMode(false);

      resolve();
    });
  }

  clearManualInputs(triggerChange = true) {
    this.manualInputs.forEach(input => {
      input.value = '';
    });

    if (triggerChange) {
      this.triggerManualInputsChanges();
    }
  }

  triggerManualInputsChanges() {
    this.manualInputs.forEach(triggerChange);
  }

  onUnsetAddress() {
    this.clearManualInputs();
  }

  onError(error) {
    console.log(error);
    alert('There was error looking up your address. Please enter your address manually');
    this.setManualMode(true);
  }
}

function addressInput() {
  const addressInputs = [...document.querySelectorAll(`.${classAddress}`)];

  addressInputs.forEach(addressInput => new AddressInput(addressInput));
}

domReady(addressInput);
