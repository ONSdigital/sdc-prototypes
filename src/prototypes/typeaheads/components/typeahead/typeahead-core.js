// https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.0pattern/combobox-autocomplete-list.html

import AbortableFetch from 'helpers/abortable-fetch';
import formBodyFromObject from 'helpers/form-body-from-object';
import { sanitiseTypeaheadText } from './typeahead-helpers';

const classTypeaheadLabel = 'js-typeahead-label';
const classTypeaheadInput = 'js-typeahead-input';
const classTypeaheadInstructions = 'js-typeahead-instructions';
const classTypeaheadListbox = 'js-typeahead-listbox';
const classTypeaheadAriaStatus = 'js-typeahead-aria-status';
const classTypeaheadErrorPanel = 'js-typeahead-error-panel';

const classTypeaheadOption = 'typeahead__option';
const classTypeaheadOptionFocused = `${classTypeaheadOption}--focused`;
const classTypeaheadOptionNoResults = `${classTypeaheadOption}--no-results u-fs-s`;
const classTypeaheadOptionMoreResults = `${classTypeaheadOption}--more-results u-fs-s`;
const classTypeaheadHasResults = 'typeahead--has-results';
const classPanelOff = 'panel--off';

const KEYCODE = {
  BACK_SPACE: 8,
  RETURN: 13,
  ENTER: 14,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46,
  V: 86
};

export default class TypeaheadCore {
  constructor({ context, apiUrl, onSelect, onUnsetResult, onError, minChars, resultLimit, sanitisedQueryReplaceChars = [], suggestionFunction, suggestOnBoot }) {
    // DOM Elements
    this.context = context;
    this.label = context.querySelector(`.${classTypeaheadLabel}`);
    this.input = context.querySelector(`.${classTypeaheadInput}`);
    this.listbox = context.querySelector(`.${classTypeaheadListbox}`);
    this.instructions = context.querySelector(`.${classTypeaheadInstructions}`);
    this.ariaStatus = context.querySelector(`.${classTypeaheadAriaStatus}`);
    this.errorPanel = context.querySelector(`.${classTypeaheadErrorPanel}`);

    // Suggestion URL
    this.apiUrl = apiUrl || context.getAttribute('data-api-url');

    // Callbacks
    this.onSelect = onSelect;
    this.onUnsetResult = onUnsetResult;
    this.onError = onError;

    // Settings
    this.content = JSON.parse(context.getAttribute('data-content'));
    this.listboxId = this.listbox.getAttribute('id');
    this.minChars = minChars || 2;
    this.resultLimit = resultLimit || null;
    this.suggestOnBoot = suggestOnBoot;

    if (suggestionFunction) {
      this.fetchSuggestions = suggestionFunction;
    }

    // State
    this.ctrlKey = false;
    this.deleting = false;
    this.query = '';
    this.sanitisedQuery = '';
    this.previousQuery = '';
    this.results = [];
    this.resultOptions = [];
    this.foundResults = 0;
    this.numberOfResults = 0;
    this.highlightedResultIndex = 0;
    this.settingResult = false;
    this.resultSelected = false;
    this.blurring = false;
    this.blurTimeout = null;
    this.sanitisedQueryReplaceChars = sanitisedQueryReplaceChars;
    this.lang = document.documentElement.getAttribute('lang').toLowerCase();

    // Temporary fix as runner doesn't use full lang code
    if (this.lang === 'en') {
      this.lang = 'en-gb';
    }

    // Modify DOM
    this.label.setAttribute('for', this.input.getAttribute('id'));
    this.input.setAttribute('aria-autocomplete', 'list');
    this.input.setAttribute('aria-controls', this.listbox.getAttribute('id'));
    this.input.setAttribute('aria-describedby', this.instructions.getAttribute('id'));
    this.input.setAttribute('autocomplete', this.input.getAttribute('data-autocomplete'));
    this.context.classList.add('typeahead--initialised');

    // Bind event listeners
    this.bindEventListeners();

    if (this.suggestOnBoot) {
      this.handleChange();
    }
  }

  bindEventListeners() {
    this.input.addEventListener('keydown', this.handleKeydown.bind(this));
    this.input.addEventListener('keyup', this.handleKeyup.bind(this));
    this.input.addEventListener('input', this.handleChange.bind(this));
    this.input.addEventListener('focus', this.handleFocus.bind(this));
    this.input.addEventListener('blur', this.handleBlur.bind(this));

    this.listbox.addEventListener('mouseover', this.handleMouseover.bind(this));
    this.listbox.addEventListener('mouseout', this.handleMouseout.bind(this));
  }

  handleKeydown(event) {
    this.ctrlKey = ((event.ctrlKey || event.metaKey) && event.keyCode !== KEYCODE.V);

    switch (event.keyCode) {
      case KEYCODE.UP: {
        event.preventDefault();
        this.navigateResults(-1);
        break;
      }
      case KEYCODE.DOWN: {
        event.preventDefault();
        this.navigateResults(1);
        break;
      }
      case KEYCODE.ENTER:
      case KEYCODE.RETURN: {
        event.preventDefault();
        break;
      }
    }
  }

  handleKeyup(event) {
    switch (event.keyCode) {
      case KEYCODE.UP:
      case KEYCODE.DOWN: {
        event.preventDefault();
        break;
      }
      case KEYCODE.ENTER:
      case KEYCODE.RETURN: {
        this.selectResult();
        break;
      }
      case KEYCODE.LEFT:
      case KEYCODE.RIGHT: {
        break;
      }
    }

    this.ctrlKey = false;
  }

  handleChange() {
    if (!this.blurring && this.input.value.trim()) {
      this.getSuggestions();
    } else {
      this.abortFetch();
    }
  }

  handleFocus() {
    clearTimeout(this.blurTimeout);
    this.getSuggestions(true);
  }

  handleBlur() {
    clearTimeout(this.blurTimeout);
    this.blurring = true;

    this.blurTimeout = setTimeout(() => {
      this.blurring = false;
    }, 300);
  }

  handleMouseover() {
    const focusedItem = this.resultOptions[this.highlightedResultIndex];

    if (focusedItem) {
      focusedItem.classList.remove(classTypeaheadOptionFocused);
    }
  }

  handleMouseout() {
    const focusedItem = this.resultOptions[this.highlightedResultIndex];

    if (focusedItem) {
      focusedItem.classList.add(classTypeaheadOptionFocused);
    }
  }

  navigateResults(direction) {
    let index = 0;

    if (this.highlightedResultIndex !== null) {
      index = this.highlightedResultIndex + direction;
    }

    if (index < this.numberOfResults) {
      if (index < 0) {
        index = null;
      }

      this.setHighlightedResult(index);
    }
  }

  getSuggestions(force) {
    if (!this.settingResult) {
      const query = this.input.value;
      const sanitisedQuery = sanitiseTypeaheadText(query, this.sanitisedQueryReplaceChars);
      
      if (sanitisedQuery !== this.sanitisedQuery || (force && !this.resultSelected)) {
        this.unsetResults();
        this.setAriaStatus();

        this.query = query;
        this.sanitisedQuery = sanitisedQuery;
       
        if(this.sanitisedQuery.length >= this.minChars) {
          this.fetchSuggestions(this.sanitisedQuery)
            .then(this.handleResults.bind(this))
            .catch(error => {
              if (error.name !== 'AbortError' && this.onError) {
                this.onError(error);
              }
            });
        } else {
          this.clearListbox();
        }
      }
    }
  }

  fetchSuggestions(sanitisedQuery) {
    return new Promise((resolve, reject) => {
      const query = {
        query: sanitisedQuery,
        lang: this.lang
      };

      this.abortFetch();

      const body = formBodyFromObject(query);

      this.fetch = new AbortableFetch(this.apiUrl, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
      });

      this.fetch.send()
        .then(async response => {
          const data = await response.json();

          const results = data.results;

          results.forEach(result => {
            result.sanitisedText = sanitiseTypeaheadText(result[this.lang], this.sanitisedQueryReplaceChars);

            if (this.lang !== 'en-gb') {
              const english = result['en-gb'];
              const sanitisedAlternative =  sanitiseTypeaheadText(english, this.sanitisedQueryReplaceChars);

              if (sanitisedAlternative.match(sanitisedQuery)) {
                result.alternatives = [english];
                result.sanitisedAlternatives = [sanitisedAlternative];
              }
            } else {
              result.alternatives = [];
              result.sanitisedAlternatives = [];
            }
          });

          resolve({
            results,
            totalResults: data.totalResults
          });
        })
        .catch(reject);
    });
  }

  abortFetch() {
    if (this.fetch && this.fetch.status !== 'DONE') {
      this.fetch.abort();
    }
  }

  unsetResults() {
    this.results = [];
    this.resultOptions = [];
    this.resultSelected = false;

    if (this.onUnsetResult) {
      this.onUnsetResult();
    } 
  }

  clearListbox(preventAriaStatusUpdate) {
    this.listbox.innerHTML = '';
    this.context.classList.remove(classTypeaheadHasResults);
    this.input.removeAttribute('aria-activedescendant');
    this.input.removeAttribute('aria-expanded');

    if (!preventAriaStatusUpdate) {
      this.setAriaStatus();
    }
  }

  handleResults(result) {
    this.foundResults = result.totalResults;
    this.results = result.results;
    this.numberOfResults = Math.max(this.results.length, 0);

    if (!this.deleting || (this.numberOfResults && this.deleting)) {
      if (this.numberOfResults.length === 1 && this.results[0].sanitisedText === this.sanitisedQuery) {
        this.clearListbox(true);
        this.selectResult(0);
      } else {
        this.listbox.innerHTML = '';
        this.resultOptions = this.results.map((result, index) => {
          let ariaLabel = result[this.lang];
          let innerHTML = this.emboldenMatch(ariaLabel, this.query);

          if (Array.isArray(result.sanitisedAlternatives)) {
            const alternativeMatch = result.sanitisedAlternatives.find(alternative => alternative !== result.sanitisedText && alternative.includes(this.sanitisedQuery));

            if (alternativeMatch) {
              const alternativeText = result.alternatives[result.sanitisedAlternatives.indexOf(alternativeMatch)];
              innerHTML += ` <small>(${this.emboldenMatch(alternativeText, this.query)})</small>`;
              ariaLabel += `, (${alternativeText})`;
            }
          }

          const listElement = document.createElement('li');
          listElement.className = classTypeaheadOption;
          listElement.setAttribute('id', `${this.listboxId}__option--${index}`);
          listElement.setAttribute('role', 'option');
          listElement.setAttribute('aria-label', ariaLabel);
          listElement.innerHTML = innerHTML;

          listElement.addEventListener('click', () => {
            this.selectResult(index);
          });

          this.listbox.appendChild(listElement);

          return listElement;
        });

        if (this.numberOfResults < this.foundResults) {
          const listElement = document.createElement('li');
          listElement.className = `${classTypeaheadOption} ${classTypeaheadOptionMoreResults} u-fs-b`;
          listElement.setAttribute('aria-hidden', 'true');
          listElement.innerHTML = this.content.more_results;
          this.listbox.appendChild(listElement);
        }

        this.setHighlightedResult(null);

        this.input.setAttribute('aria-expanded', this.numberOfResults);
        this.context.classList[this.numberOfResults ? 'add' : 'remove'](classTypeaheadHasResults);
      }
    }

    if (this.numberOfResults === 0 && this.content.no_results) {
      this.listbox.innerHTML = `<li class="${classTypeaheadOption} ${classTypeaheadOptionNoResults}">${this.content.no_results}</li>`;
      this.input.setAttribute('aria-expanded', true);
    }
  }

  setHighlightedResult(index) {
    this.highlightedResultIndex = index;

    if (this.setHighlightedResult === null) {
      this.input.removeAttribute('aria-activedescendant');
    } else if (this.numberOfResults) {
      this.resultOptions.forEach((option, optionIndex) => {
        if (optionIndex === index) {
          option.classList.add(classTypeaheadOptionFocused);
          option.setAttribute('aria-selected', true);
          this.input.setAttribute('aria-activedescendant', option.getAttribute('id'));
        } else {
          option.classList.remove(classTypeaheadOptionFocused);
          option.removeAttribute('aria-selected');
        }
      });

      this.setAriaStatus();
    }
  }

  setAriaStatus(content) {
    if (!content) {
      const queryTooShort = this.sanitisedQuery.length < this.minChars;
      const noResults = this.numberOfResults === 0;

      if (queryTooShort) {
        content = this.content.aria_min_chars;
      } else if (noResults) {
        content = `${this.content.aria_no_results}: "${this.query}"`;
      } else if (this.numberOfResults === 1) {
        content = this.content.aria_one_result;
      } else {
        content = this.content.aria_n_results.replace('{n}', this.numberOfResults);

        if (this.resultLimit && this.foundResults > this.resultLimit) {
          content += ` ${this.content.aria_limited_results}`;
        }
      }
    }

    this.ariaStatus.innerHTML = content;
  }

  selectResult(index) {
    if (this.results.length) {
      this.settingResult = true;

      const result = this.results[index || this.highlightedResultIndex || 0];

      // TODO: This condition should be removed if we go with the internal address lookup API, or made configurable if we use a third party API
      if (result.type !== 'Postcode') {
        this.input.value = result[this.lang];
        this.query = result[this.lang];
      }

      this.resultSelected = true;

      this.onSelect(result).then(() => {
        this.settingResult = false;
        // this.input.setAttribute('autocomplete', 'false');
      });

      let ariaAlternativeMessage = '';

      if (!result.sanitisedText.includes(this.sanitisedQuery) && result.sanitisedAlternatives) {
        const alternativeMatch = result.sanitisedAlternatives.find(alternative => alternative.includes(this.sanitisedQuery));

        if (alternativeMatch) {
          ariaAlternativeMessage = `, ${this.content.aria_found_by_alternative_name}: ${alternativeMatch}`;
        }
      }

      const ariaMessage = `${this.content.aria_you_have_selected}: ${result[this.lang]}${ariaAlternativeMessage}.`;

      this.clearListbox();
      this.setAriaStatus(ariaMessage);
    }
  }

  emboldenMatch(string, query) {
    query = query.toLowerCase().trim();
  
    if (string.toLowerCase().includes(query)) {
      const queryLength = query.length;
      const matchIndex = string.toLowerCase().indexOf(query);
      const matchEnd = matchIndex + queryLength;
      const before = string.substr(0, matchIndex);
      const match = string.substr(matchIndex, queryLength);
      const after = string.substr(matchEnd, string.length - matchEnd);
  
      return `${before}<em>${match}</em>${after}`;
    } else {
      return string;
    }
  }

  showErrorPanel() {
    this.setErrorPanelVisibility(true);
  }

  hideErrorPanel() {
    this.setErrorPanelVisibility(false);
  }

  setErrorPanelVisibility(visible) {
    if (this.errorPanel) {
      this.errorPanel.classList[visible ? 'remove' : 'add'](classPanelOff);
    }
  }
}
