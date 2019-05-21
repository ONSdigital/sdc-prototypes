import domready from 'helpers/domready';
import { getBaseURL, setQueryStringParams, getQueryStringParams } from 'querystring-helpers';
class QuestionManager {
  constructor() {
    this.url = window.location.pathname;
    this.rootURL = window.location.pathname.split('/').filter(part => !part.includes('.html')).join('/');

    const lastCharIndex = this.url.length - 1;

    if (this.url.charAt(lastCharIndex) === '/') {
      this.url = this.url.slice(0, lastCharIndex);
    }

    this.title = [...document.getElementsByTagName('H1')].find(h1 => !h1.classList.contains('header__title')).innerText;
    this.inputs = [
      ...document.getElementsByTagName('INPUT'),
      ...document.getElementsByTagName('TEXTAREA'),
      ...document.getElementsByTagName('SELECT')
    ];

    this.form = document.getElementsByTagName('FORM')[0];
    this.hideFromSummary = this.form.classList.contains('js-question-no-summary');
    this.actionChangingInputs = [...this.form.querySelectorAll('input[data-action-url]')];

    const legend = document.querySelector('.field__legend');

    if (legend) {
      this.legend = legend.innerText;
    }

    const previousLink = document.querySelector('.js-previous');

    if (previousLink) {
      this.previousURL = previousLink.getAttribute('href');
      this.originalPreviousURL = previousLink.getAttribute('data-original-href');
    }

    this.form.addEventListener('submit', this.handleSubmit.bind(this));

    if (!this.url.includes('.html') && !document.referrer.includes(this.rootURL)) {
      this.clearFormData();
    }

    this.setValues();
  }

  setValues() {
    const savedQuestion = window.sessionStorage.getItem(this.url);

    if (savedQuestion) {
      const question = JSON.parse(savedQuestion);
      this.form.action = question.action;

      if (question.originalAction) {
        this.form.setAttribute('data-original-action', question.originalAction);
      }

      question.inputs.forEach(input => {
        const inputElement = document.getElementById(input.id);

        if (inputElement) {
          switch (inputElement.type) {
            case 'checkbox':
            case 'radio': {
              inputElement.checked = input.checked;
              break;
            }
            default: {
              inputElement.value = input.value;
            }
          }
        }
      });
    }
  }

  handleSubmit(event) {
    event.preventDefault();

    // Wait until next event loop cycle to allow any modifications to the form to complete
    setTimeout(() => {
      if (!window.DONT_SUBMIT) {
        if (this.form.action === `${window.location.origin}/`) {
          this.clearFormData();
        } else {
          let question = {
            title: this.title,
            legend: this.legend,
            inputs: [],
            previousURL: this.previousURL,
            originalPreviousURL: this.originalPreviousURL,
            url: this.url,
            hideFromSummary: this.hideFromSummary
          };

          let action, originalAction;

          this.inputs.forEach(input => {
            const checked = input.checked;
            let value;

            const id = input.id;
            const labelElement = document.querySelector(`label[for="${id}"]`);

            let label, isTypeahead;

            if (labelElement) {
              label = [...labelElement.childNodes].filter(node => node.nodeType === 3 && node.textContent.trim())[0].textContent.trim();
            }

            switch (input.type) {
              case 'checkbox':
              case 'radio': {
                const inputAction = input.getAttribute('data-action-url');

                if (checked) {
                  value = input.value || label;

                  if (inputAction) {
                    originalAction = this.form.getAttribute('data-original-action') || this.form.getAttribute('action');
                    action = inputAction;
                    this.addAnswer(inputAction);
                  } else {
                    this.addAnswer(this.form.action);
                  }
                } else {
                  if (inputAction && inputAction !== this.previousURL) {
                    this.removeAnswer(inputAction);
                  }
                }
                break;
              }
              default: {
                value = input.value;

                isTypeahead = input.classList.contains('js-typeahead-input');
              }
            }

            question.inputs.push({
              id: input.id,
              value,
              checked,
              label,
              isTypeahead
            });
          });

          question = {
            ...question,
            action: this.form.action
          };

          if (originalAction) {
            this.form.setAttribute('data-original-action', originalAction);
            this.form.action = action;
            question.originalAction = originalAction;
          } else if (!action && this.form.hasAttribute('data-original-action')) {
            this.form.action = this.form.getAttribute('data-original-action');
            this.form.removeAttribute('data-original-action');
          }

          if (this.form.action.replace(window.location.origin, '') !== this.previousURL) {
            window.sessionStorage.setItem(this.url, JSON.stringify(question));
          }
        }

        const isEditing = new URLSearchParams(window.location.search).get('edit');

        if (isEditing) {
          const key = getBaseURL(this.form.action).replace(window.location.origin, '');

          if (sessionStorage.getItem(key)) {
            window.location = `${this.rootURL}/summary.html`;
          } else {
            window.location = setQueryStringParams({ edit: true }, this.form.action);
          }
        } else {
          window.location = this.form.action;
        }
      }
    });
    
  }

  clearFormData() {
    this.getSavedQuestionnaireItemKeys().forEach(key => sessionStorage.removeItem(key));
  }

  getSavedQuestionnaireItemKeys() {
    return Object.keys(sessionStorage).filter(key => key.includes(this.rootURL));
  }

  getSavedQuestionnaireItems() {
    return this.getSavedQuestionnaireItemKeys().map(item => JSON.parse(sessionStorage.getItem(item)));
  }

  removeAnswer(answerURL) {
    const savedItems = this.getSavedQuestionnaireItems();
    const itemsToRemove = [answerURL];

    this.findRelatedAnswers(answerURL, savedItems, itemsToRemove);

    itemsToRemove.forEach(item => sessionStorage.removeItem(item));

    const updatedSavedItems = this.getSavedQuestionnaireItems();

    updatedSavedItems.forEach(item => {
      if (itemsToRemove.includes(item.previousURL)) {
        item.previousURL = item.originalPreviousURL;

        sessionStorage.setItem(item.url, JSON.stringify(item));
      }
    });
  }

  findRelatedAnswers(answerURL, savedItems, relatedAnswers) {
    const match = savedItems.find(item => !item.originalPreviousURL && item.previousURL === answerURL);

    if (match) {
      const url = match.url;

      relatedAnswers.push(url);
      this.findRelatedAnswers(url, savedItems, relatedAnswers);
    }
  }

  addAnswer(answerUrl) {
    const urlParams = getQueryStringParams(answerUrl);

    if (urlParams.previous) {
      const nextQuestion = getBaseURL(answerUrl).replace(window.origin, '');
      const savedItem = sessionStorage.getItem(nextQuestion);

      if (savedItem) {
        const data = JSON.parse(savedItem);

        const updatedData = {
          ...data,
          originalPreviousURL: data.originalPreviousURL || data.previousURL,
          previousURL: urlParams.previous
        };

        sessionStorage.setItem(nextQuestion, JSON.stringify(updatedData));
      }
    }
  }
}

// Allow previous links to be updated first
domready(() => setTimeout(() => new QuestionManager()));
