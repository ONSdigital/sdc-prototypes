import domready from 'helpers/domready';
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

    const legend = document.querySelector('.field__legend');

    if (legend) {
      this.legend = legend.innerText;
    }

    const previousLink = document.querySelector('.js-previous');

    if (previousLink) {
      this.previousURL = previousLink.getAttribute('href');
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
      this.form.setAttribute('data-original-action', question.originalAction);

      question.inputs.forEach(input => {
        const inputElement = document.getElementById(input.id);

        switch (inputElement.type) {
          case 'checkbox':
          case 'radio': {
            inputElement.checked = input.value;
            break;
          }
          default: {
            inputElement.value = input.value;
          }
        }
      });
    }
  }

  handleSubmit(event) {
    event.preventDefault();

    // Wait until next event loop cycle to allow any modifications to the form to complete
    setTimeout(() => {
      if (this.form.action === `${window.location.origin}/`) {
        this.clearFormData();
      } else {
        const question = {
          title: this.title,
          legend: this.legend,
          inputs: [],
          action: this.form.action,
          originalAction: this.form.getAttribute('data-original-action'),
          previousURL: this.previousURL
        };

        this.inputs.forEach(input => {
          let value;

          switch (input.type) {
            case 'checkbox':
            case 'radio': {
              value = input.checked;
              break;
            }
            default: {
              value = input.value;
            }
          }

          const id = input.id;
          const labelElement = document.querySelector(`label[for="${id}"]`);

          let label;

          if (labelElement) {
            label = labelElement.innerHTML.match(/([A-Za-z\s])*(?![^<]*>|[^<>]*<\/)/)[0].trim();
          }

          question.inputs.push({
            id: input.id,
            value,
            label
          });
        });

        window.sessionStorage.setItem(this.url, JSON.stringify(question));
      }

      window.location = this.form.action;
    });
  }

  clearFormData() {
    Object.keys(sessionStorage).filter(key => key.includes(this.rootURL)).forEach(key => sessionStorage.removeItem(key));
  }
}



// Allow previous links to be updated first
domready(() => setTimeout(() => new QuestionManager()));
