import TypeaheadCore from '../typeahead/typeahead-core';
import { sanitiseTypeaheadText } from '../typeahead/typeahead-helpers';

import domReady from 'helpers/domready';
import triggerChange from 'helpers/trigger-change-event';
import AbortableFetch from 'helpers/abortable-fetch';
import formBodyFromObject from 'helpers/form-body-from-object';
import dice from 'dice-coefficient';
import { sortBy } from 'sort-by-typescript';

const lookupURL = 'https://api.addressy.com/Capture/Interactive/Find/v1.10/json3.ws';
const retrieveURL = 'https://api.addressy.com/Capture/Interactive/Retrieve/v1.10/json3.ws';
const key = 'ha14-fy33-nr14-ej83';
const addressReplaceChars = [','];

const classAddress = 'js-address';
const classOrganisation = 'js-address-organisation';
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

    // State
    this.manualMode = true;
    this.currentQuery = null;
    this.fetch = null;
    this.currentResults = [];
    this.errored = false;

    // Initialise typeahead
    this.typeahead = new TypeaheadCore({
      context: context.querySelector(`.${classTypeahead}`),
      onSelect: this.onAddressSelect.bind(this),
      onUnsetResult: this.onUnsetAddress.bind(this),
      suggestionFunction: this.suggestAddresses.bind(this),
      onError: this.onError.bind(this),
      sanitisedQueryReplaceChars: addressReplaceChars,
      resultLimit: 10,
      minChars: 2
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

  findAddress(text, id) {
    return new Promise((resolve, reject) => {
      const query = {
        key,
        text,
        countries: 'gb',
        language: 'en-gb'
      };

      if (id) {
        query.container = id;
      }

      const body = formBodyFromObject(query);

      this.fetch = new AbortableFetch(lookupURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
      });

      this.fetch
        .send()
        .then(async response => {
          const data = (await response.json()).Items;

          if (data.length === 1 && data[0].Type === 'Postcode') {
            this.findAddress(text, data[0].Id)
              .then(resolve)
              .catch(reject);
          } else {
            resolve(this.mapFindResults(data));
          }
        })
        .catch(reject);
    });
  }

  mapFindResults(results) {
    const mappedResults = results.map(result => {
      let text;

      if (result.Type === 'Postcode') {
        text = `${result.Text} ${result.Description}`;
      } else {
        text = `${result.Text}, ${result.Description}`;
      }

      const sanitisedText = sanitiseTypeaheadText(text, addressReplaceChars);

      let queryIndex = sanitisedText.indexOf(this.currentQuery);

      if (queryIndex < 0) {
        queryIndex = Infinity;
      }

      const querySimilarity = dice(sanitisedText, this.currentQuery);

      return {
        value: result.Id,
        type: result.Type,
        'en-gb': text,
        sanitisedText,
        querySimilarity,
        queryIndex
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
        key,
        id
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
          const data = (await response.json()).Items.find(item => item.Language === 'ENG');

          resolve(data);
        })
        .catch(reject);
    });
  }

  onAddressSelect(selectedResult) {
    return new Promise((resolve, reject) => {
      const result = this.currentResults.find(currentResult => currentResult.value === selectedResult.value);

      if (result.type !== 'Address') {
        this.findAddress(null, result.value)
          .then(results => {
            this.typeahead.handleResults(results);
            resolve();
          })
          .catch(reject);
      } else {
        this.retrieveAddress(result.value)
          .then(data => {
            this.setAddress(data, resolve);
          })
          .catch(reject);
      }
    });
  }

  setAddress(data, resolve) {
    this.clearManualInputs(false);

    if (data.Company && this.organisation) {
      this.organisation.value = data.Company;
    }

    this.line1.value = data.Line1;
    this.line2.value = data.Line2;
    this.town.value = data.City;
    this.county.value = data.AdminAreaName;

    this.postcode.value = data.PostalCode;

    this.triggerManualInputsChanges();
    this.toggleMode(false);
    resolve();
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

  onError() {
    if (this.fetch) {
      this.fetch.abort();
    }

    // Prevent error message from firing twice
    if (!this.errored) {
      this.errored = true;

      setTimeout(() => {
        alert('There was error looking up your address. Please enter your address manually');

        this.setManualMode(true);

        this.errored = false;
      });
    }
  }
}

function addressInput() {
  const addressInputs = [...document.querySelectorAll(`.${classAddress}`)];

  addressInputs.forEach(addressInput => new AddressInput(addressInput));
}

domReady(() => setTimeout(addressInput, 10));
