import domready from 'helpers/domready';
import formBodyFromObject from 'helpers/form-body-from-object';
import AbortableFetch from 'helpers/abortable-fetch';
import { sortBy } from 'sort-by-typescript';

const lookupURL = 'https://api.addressy.com/Capture/Interactive/Find/v1.10/json3.ws';
const retrieveURL = 'https://api.addressy.com/Capture/Interactive/Retrieve/v1.10/json3.ws';
const key = 'ab49-ty54-ke29-bu23';

class NoJSAddressLookup {
  constructor(context) {
    window.DONT_SUBMIT = true;
    this.context = context;

    this.addressSource = context.getAttribute('data-address-from');
    this.addressData = JSON.parse(sessionStorage.getItem(this.addressSource));

    this.template = context.querySelector('.field__item');
    this.form = document.querySelector('form');
    this.button = this.form.querySelector('button');
    this.playback = context.querySelector('.js-no-js-address-lookup-playback');
    this.numberOfResults = context.querySelector('.js-no-js-address-lookup-results');

    this.form.addEventListener('submit', this.handleSubmit.bind(this));

    this.line1 = this.getInput('line-1').value;
    this.postcode = this.getInput('postcode').value;

    this.playback.innerHTML = [this.line1, this.postcode].filter(value => !!value).join('<br>');

    const searchString = `${this.line1} ${this.postcode}`
      .trim()
      .replace(/ /g, ' ')
      .trim()
      .toLowerCase();

    this.lookupAddress(searchString);
  }

  lookupAddress(searchString, id) {
    const query = {
      key,
      text: searchString,
      countries: 'gb',
      language: 'en-gb'
    };

    if (id) {
      query.container = id;
    }

    const body = formBodyFromObject(query);

    const fetch = new AbortableFetch(lookupURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    fetch.send().then(response => this.handleLookup(searchString, response));
  }

  async handleLookup(searchString, response) {
    const results = (await response.json()).Items;

    if (results.length === 1) {
      if (results[0].Type === 'Postcode') {
        this.lookupAddress(searchString, results[0].Id);
      } else {
        this.getAddress(results[0].Id);
      }
    } else {
      this.renderResults(results);
    }
  }

  renderResults(results) {
    const inputs = results
      .sort(sortBy('Text'))
      .filter(result => result.Type === 'Address')
      .map(result => {
        const clone = template.cloneNode(true);
        const input = clone.querySelector('.radio__input');
        const label = clone.querySelector('.radio__label');

        input.id = result.Id;
        input.value = result.Id;
        label.setAttribute('for', result.Id);
        label.innerHTML = result.Text;

        return clone;
      });

    const destination = this.context.querySelector('.field__items');

    destination.innerHTML = '';

    inputs.forEach(input => {
      destination.append(input);
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    const selectedInput = this.context.querySelector('input[type=radio]:checked');

    if (selectedInput) {
      this.getAddress(selectedInput.id);
    } else {
      alert('Select an option');
    }
  }

  getAddress(id) {
    const query = {
      key,
      id
    };

    const body = formBodyFromObject(query);

    const fetch = new AbortableFetch(retrieveURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    fetch.send().then(async response => {
      const data = (await response.json()).Items.find(item => item.Language === 'ENG');

      this.setAddress(data);
    });
  }

  renderResults(results) {
    const inputs = results
      .sort(sortBy('Text'))
      .filter(result => result.Type === 'Address')
      .map(result => {
        const clone = this.template.cloneNode(true);
        const input = clone.querySelector('.radio__input');
        const label = clone.querySelector('.radio__label');

        input.id = result.Id;
        input.value = result.Id;
        label.setAttribute('for', result.Id);
        label.innerHTML = result.Text;

        return clone;
      });

    const destination = this.context.querySelector('.field__items');

    destination.innerHTML = '';

    inputs.forEach(input => {
      destination.append(input);
    });

    this.numberOfResults.innerHTML = this.numberOfResults.innerHTML.replace('{x}', inputs.length);

    this.button.disabled = false;
  }

  getAddress(id) {
    this.button.disabled = true;

    const query = {
      key,
      id
    };

    const body = formBodyFromObject(query);

    const fetch = new AbortableFetch(retrieveURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    fetch.send().then(async response => {
      const data = (await response.json()).Items.find(item => item.Language === 'ENG');

      this.setAddress(data);
    });
  }

  setAddress(data) {
    this.getInput('line-1').value = data.Line1;
    this.getInput('line-2').value = data.Line2;
    this.getInput('town').value = data.City;
    this.getInput('county').value = data.AdminAreaName;
    this.getInput('postcode').value = data.PostalCode;

    sessionStorage.setItem(this.addressSource, JSON.stringify(this.addressData));

    window.location.href = this.form.action;
  }

  getInput(id) {
    return this.addressData.inputs.find(input => input.id.includes(id));
  }
}

function initialise() {
  const context = document.querySelector('.js-no-js-address-lookup');

  if (context) {
    new NoJSAddressLookup(context);
  }
}

domready(initialise);
