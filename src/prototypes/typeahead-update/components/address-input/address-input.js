import TypeaheadUI from '../input/typeahead.ui';
import { sanitiseTypeaheadText } from '../input/typeahead.helpers';

import domReady from 'helpers/domready';
import triggerChange from 'helpers/trigger-change-event';
import AbortableFetch from 'helpers/abortable-fetch';

const baseURL = 'https://whitelodge-ai-api.census-gcp.onsdigital.uk/addresses/eq';
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
    this.lang = document.documentElement.getAttribute('lang').toLowerCase();
  
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
      resultLimit: 50,
      minChars: 5,
      suggestOnBoot: true,
      handleUpdate: true
    });    

    this.searchButtonContainer.classList.remove('u-d-no');

    // Bind Event Listeners
    this.searchButton.addEventListener('click', this.toggleMode.bind(this));
    this.manualButton.addEventListener('click', this.toggleMode.bind(this));

    this.user = 'equser';
    this.password = '$4c@ec1zLBu';
    // this.user = process.env.AIMS_USER;
    // this.password = process.env.AIMS_PASSWORD;
    // console.log(this.user);
    this.auth = btoa(this.user + ':' + this.password);
    this.headers = new Headers({
      'Authorization': 'Basic ' + this.auth,
    });


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
    return new Promise((resolve, reject) => {
      const queryUrl = lookupURL + text + '&limit=100';
      this.fetch = new AbortableFetch(queryUrl, {
        method: 'GET',
        headers: this.headers
      });
      this.fetch
        .send()
        .then(async response => {
          const data = (await response.json()).response.addresses;
          resolve(this.mapFindResults(data, text));
        })
        .catch(reject);
    });
  }

  mapFindResults(results, input) {
    let updatedResults, mappedResults;
    let groups = results[0] && results[0].bestMatchAddress ? this.postcodeSearch(results, input) : null;

    if (groups) {
      mappedResults = groups.map(({ address, count, postcode }) => {
        const countAdjust = count - 1;
        const addressText = countAdjust === 1 ? 'address' : 'addresses';
        return {
          'en-gb': countAdjust === 0 ? address : address + ' <span class="group-text">(' + countAdjust + ' more ' + addressText + ')</span>',
          postcode
        };
      });
      this.currentResults = mappedResults.sort();

    } else if (results[0]) {

      if (results[0] && results[0].bestMatchAddress) {
        updatedResults = results.map(({ uprn, bestMatchAddress }) => ({ uprn: uprn, address: bestMatchAddress }));

      } else if (results[0] && results[0].formattedAddress) {
        updatedResults = results.map(({ uprn, formattedAddress }) => ({ uprn: uprn, address: formattedAddress }));
      }  

      mappedResults = updatedResults.map(({ uprn, address }) => {
        const sanitisedText = sanitiseTypeaheadText(address, addressReplaceChars);
        return {
          'en-gb': address,
          sanitisedText,
          uprn
        };
      });
      this.currentResults = mappedResults.sort();

    } else {
      this.currentResults = results;
    }

    return {
      results: this.currentResults,
      totalResults: this.currentResults.length
    };
  }

  retrieveAddress(id) {
    return new Promise((resolve, reject) => {
      const queryUrl = retrieveURL + id + '?addresstype=paf';
      this.fetch = new AbortableFetch(queryUrl, {
        method: 'GET',
        headers: this.headers
      });

      this.fetch
        .send()
        .then(async response => {
          const data = await response.json();
          resolve(data);
        })
        .catch(reject);
    });
  }

  postcodeSearch(results, input) {
    const postcodeRegex = /([A-Za-z]{1,2}\d{1,2})(\s?(\d?\w{2}))?/;
    const testForPostcode = postcodeRegex.test(input);
    
    if (testForPostcode) {
      const addressesByPostcode = new Map();
  
      results.forEach(address => {
        const postcode = address.bestMatchAddress.match(postcodeRegex);

        if (!addressesByPostcode.has(postcode[0]))
          addressesByPostcode.set(postcode[0], []);
        addressesByPostcode.get(postcode[0]).push(address);
      });
  
  
      const groups = Array.from(addressesByPostcode)
        .map(([postcode, addresses]) => ({
          address:  addresses[0].bestMatchAddress,
          count:    addresses.length,
          postcode: postcode,
        }));
      
      return groups;
    }
  }

  onAddressSelect(selectedResult) {
    return new Promise((resolve, reject) => {
      if (selectedResult.uprn) {
        this.retrieveAddress(selectedResult.uprn)
          .then(data => {
            this.setAddress(data, resolve);
          })
          .catch(reject);
      } else if (selectedResult.postcode) {
        const event = new Event('input', {
          'bubbles': true,
          'cancelable': true
        });
        this.typeahead.input.value = selectedResult.postcode;
        this.typeahead.input.focus();
        this.typeahead.input.dispatchEvent(event);

      }
    });
  }

  setAddress(data, resolve) {
    this.clearManualInputs(false);
    const value = data.response.address;
    this.line1.value = value.addressLine1;
    this.line2.value = value.addressLine2;
    this.county.value = value.addressLine3;
    this.town.value = value.townName;
    this.postcode.value = value.postcode;

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

  addressInputs.forEach(addressInput => new AddressInput(addressInput));
}

domReady(() => setTimeout(addressInput, 10));
