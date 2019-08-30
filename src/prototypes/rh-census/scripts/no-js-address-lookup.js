import domready from 'helpers/domready';
import formBodyFromObject from 'helpers/form-body-from-object';
import AbortableFetch from 'helpers/abortable-fetch';
import { sortBy } from 'sort-by-typescript';
import dice from 'dice-coefficient';

const lookupURL = 'https://api.addressy.com/Capture/Interactive/Find/v1.10/json3.ws';
const retrieveURL = 'https://api.addressy.com/Capture/Interactive/Retrieve/v1.10/json3.ws';
const key = 'ha14-fy33-nr14-ej83';

class NoJSAddressLookup {
  constructor(context) {
    window.DONT_SUBMIT = true;
    this.context = context;

    this.addressSource = context.getAttribute('data-address-from');
    this.addressData = JSON.parse(sessionStorage.getItem(this.addressSource));

    this.template = context.querySelector('.field__item');
    this.form = document.querySelector('form');
    this.button = this.form.querySelector('button');
    this.numberOfResults = context.querySelector('.js-no-js-address-lookup-results');

    this.form.addEventListener('submit', this.handleSubmit.bind(this));

    this.postcode = this.getInput('postcode').value;

    const searchString = `${this.postcode}`
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
        // const address = await this.getAddress(results[0].Id);
        // debugger;
        this.getAddress(results[0].Id);
      }
    } else {
      this.processResults(results);
    }
  }

  async processResults(results) {
    results = results.filter(result => result.Type === 'Address');

    const sanitisedLine1 = this.getInput('line-1')
      .value.toLowerCase()
      .trim()
      .replace(/  +/g, ' ');

    if (sanitisedLine1) {
      results = results.map(result => {
        const sanitisedText = result.Text.split(',')[0]
          .toLowerCase()
          .trim()
          .replace(/  +/g, ' ');

        const exactMatch = sanitisedLine1 === sanitisedText;

        let score = 0;
        let contains = false;

        if (!exactMatch) {
          contains = sanitisedText.includes(sanitisedLine1);
        }

        if (!exactMatch && !contains) {
          score = dice(sanitisedText, sanitisedLine1);
        }

        return {
          ...result,
          exactMatch,
          contains,
          score
        };
      });

      const exactMatch = results.find(result => result.exactMatch);

      if (exactMatch) {
        await this.getAddress(exactMatch.Id);
        return;
      } else if (!!results.find(result => result.contains)) {
        results = results.filter(result => result.contains).sort(sortBy('Text'));
      } else if (!!results.find(result => result.score > 0.8)) {
        results = results.filter(result => result.score > 0.8).sort(sortBy('-score', 'Text'));
      } else {
        results = results.sort(sortBy('Text'));
      }
    }

    // console.table(results.map(result => ({ Text: result.Text, score: result.score })));

    this.renderResults(results);
  }

  renderResults(results) {
    const inputs = results.map(result => {
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

  async getAddress(id) {
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

    const response = await fetch.send();
    const address = (await response.json()).Items.find(item => item.Language === 'ENG');

    this.setAddress(address);
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

  handleSubmit(event) {
    event.preventDefault();

    const selectedInput = this.context.querySelector('input[type=radio]:checked');

    if (selectedInput) {
      this.getAddress(selectedInput.id);
    } else {
      alert('Select an option');
    }
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
