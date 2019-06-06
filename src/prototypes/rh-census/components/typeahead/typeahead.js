import domReady from 'helpers/domready';
import TypeaheadCore from '../typeahead/typeahead-core';

class Typeahead {
  constructor(context) {
    this.context = context;
    this.typeahead = new TypeaheadCore({
      context,
      onSelect: this.onSelect.bind(this),
      onUnsetResult: this.onUnsetResult.bind(this)
    });

    this.code = context.querySelector('.js-typeahead-code');
  }

  onSelect(result) {
    return new Promise(resolve => {
      this.code.value = result.code;

      resolve();
    });
  }

  onUnsetResult() {
    this.code.value = '';
  }
}

function typeaheads() {
  const typeaheads = [...document.querySelectorAll('.js-typeahead')];

  typeaheads.forEach(typeahead => new Typeahead(typeahead));
}

domReady(typeaheads);
