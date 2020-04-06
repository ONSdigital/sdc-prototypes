import TypeaheadUI from '../input/typeahead.ui';
import { sanitiseTypeaheadText } from '../input/typeahead.helpers';

import domReady from 'helpers/domready';
import triggerChange from 'helpers/trigger-change-event';
import AbortableFetch from 'helpers/abortable-fetch';
import formBodyFromObject from 'helpers/form-body-from-object';
import dice from 'dice-coefficient';
import { sortBy } from 'sort-by-typescript';  

const baseURL = 'https://whitelodge-ai-api.ai.census-gcp.onsdigital.uk/addresses/eq';
const lookupURL = `${baseURL}?input=`;
const retrieveURL = `${baseURL}/uprn/`;
const addressReplaceChars = [','];

const classAddress = 'js-address';
const baseClass = 'js-address-typeahead';
const classOrganisation = 'js-address-organisation';
const classLine1 = 'js-address-line-1';
const classLine2 = 'js-address-line-2';
const classTown = 'js-address-town';
const classCounty = 'js-address-county';
const classPostcode = 'js-address-postcode';
const classSearchButtonContainer = 'js-address-search-btn-container';
const classSearchButton = 'js-address-search-btn';
const classManualButton = 'js-address-manual-btn';

class AddressInput {
  constructor(context) {
    this.context = context;
    this.organisation = context.querySelector(`.${classOrganisation}`);
    this.line1 = context.querySelector(`.${classLine1}`);
    this.line2 = context.querySelector(`.${classLine2}`);
    this.town = context.querySelector(`.${classTown}`);
    this.county = context.querySelector(`.${classCounty}`);
    this.postcode = context.querySelector(`.${classPostcode}`);
    this.manualInputs = [this.line1, this.line2, this.town, this.county, this.postcode];
    this.searchButtonContainer = context.querySelector(`.${classSearchButtonContainer}`);
    this.searchButton = context.querySelector(`.${classSearchButton}`);
    this.manualButton = context.querySelector(`.${classManualButton}`);
    this.form = context.closest('form');

    // State
    this.manualMode = true;
    this.currentQuery = null;
    this.fetch = null;
    this.currentResults = [];
    this.errored = false;
    this.addressSelected = false;

    // Initialise typeahead
    this.typeahead = new TypeaheadUI({
      context: context.querySelector(`.${baseClass}`),
      onSelect: this.onAddressSelect.bind(this),
      onUnsetResult: this.onUnsetAddress.bind(this),
      suggestionFunction: this.suggestAddresses.bind(this),
      onError: this.onError.bind(this),
      sanitisedQueryReplaceChars: addressReplaceChars,
      resultLimit: 10,
      minChars: 5,
      suggestOnBoot: true
    });    

    this.searchButtonContainer.classList.remove('u-d-no');

    // Bind Event Listeners
    this.searchButton.addEventListener('click', this.toggleMode.bind(this));
    this.manualButton.addEventListener('click', this.toggleMode.bind(this));

    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

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

    if (manual) {
      this.typeahead.input.value = '';
    }

    this.manualMode = manual;
  }

  suggestAddresses(query) {
    return new Promise((resolve, reject) => {
      if (this.currentQuery === query && this.currentQuery.length && this.currentResults.length) {
        resolve({
          results: this.currentResults,
          totalResults: this.currentResults.length
        });
      } else {
        this.currentQuery = query;
        this.currentResults = [];

        if (this.fetch && this.fetch.status !== 'DONE') {
          this.fetch.abort();
        }

        this.reject = reject;
        this.findAddress(query)
          .then(resolve)
          .catch(reject);
      }
    });
  }

  findAddress(text) {
    const queryUrl = lookupURL + text;
    const user = 'equser';
    const password = '$4c@ec1zLBu';
    const auth = btoa(user + ':' + password);
    const headers = new Headers({
      'Authorization': 'Basic ' + auth
    });
    return new Promise((resolve, reject) => {
      this.fetch = new AbortableFetch(queryUrl, {
        'method': 'GET',
        'credentials': 'include',
        'mode': 'cors',
        'headers': headers
      });
      this.fetch
        .send()
        .then(response => {
          const data = response.json();
          console.log(data);
          resolve(this.mapFindResults(data));
        })
        .catch(reject);
    });
  }
  mapFindResults(results) {
    const mappedResults = results.map(({ uprn, text }) => {
      const sanitisedText = sanitiseTypeaheadText(text, addressReplaceChars);

      let queryIndex = sanitisedText.indexOf(this.currentQuery);

      if (queryIndex < 0) {
        queryIndex = Infinity;
      }

      const querySimilarity = dice(sanitisedText, this.currentQuery);

      return {
        'en-gb': text,
        sanitisedText,
        querySimilarity,
        queryIndex,
        uprn
      };
    });

    this.currentResults = mappedResults.sort(sortBy('queryIndex', '-querySimilarity', 'sanitisedText'));

    return {
      results: this.currentResults,
      totalResults: this.currentResults.length
    };
  }

  retrieveAddress(id) {
    return new Promise((resolve, reject) => {
      const query = {
        q: id
      };

      const body = formBodyFromObject(query);

      this.fetch = new AbortableFetch(retrieveURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
      });

      this.fetch
        .send()
        .then(async response => {
          const data = await response.json();
          console.log(data);
          resolve(data);
        })
        .catch(reject);
    });
  }

  onAddressSelect(selectedResult) {
    return new Promise((resolve, reject) => {
      this.retrieveAddress(selectedResult.uprn)
        .then(data => {
          this.setAddress(data, resolve);
        })
        .catch(reject);
    });
  }

  setAddress(data, resolve) {
    this.clearManualInputs(false);
    this.line1.value = data.address.field1;
    this.line2.value = data.address.field2;
    if (data.address.field4 && !data.address.field6) {
      this.town.value = data.address.field3;
      if (!data.address.field5) {
        this.postcode.value = data.address.field4;
      } else {
        this.county.value = data.address.field4;
        this.postcode.value = data.address.field5;
      }
    } else if (data.address.field6) {
      this.line1.value = data.address.field1 + ' ' + data.address.field2;
      this.line2.value = data.address.field3;
      this.town.value = data.address.field4;
      this.county.value = data.address.field5;
      this.postcode.value = data.address.field6;
    } else {
      this.postcode.value = data.address.field3;
    }

    this.triggerManualInputsChanges();

    this.addressSelected = true;

    this.setManualMode(true, false);

    resolve();
  }

  clearManualInputs(triggerChange = true) {
    this.manualInputs.forEach(input => {
      input.value = '';
    });

    if (triggerChange) {
      this.triggerManualInputsChanges();
    }

    this.addressSelected = false;
  } 

  triggerManualInputsChanges() {
    this.manualInputs.forEach(triggerChange);
  }

  onUnsetAddress() {
    this.clearManualInputs();
  }

  onError() {
    if (this.fetch) {
      this.fetch.abort();
    }

    // Prevent error message from firing twice
    if (!this.errored) {
      this.errored = true;

      setTimeout(() => {
        alert('There was error looking up your address. Enter your address manually');

        this.setManualMode(true);

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

  addressInputs.forEach(addressInput => new AddressInput(addressInput));
}

domReady(() => setTimeout(addressInput, 10));
