class Radios {
  constructor(context) {
    this.inputs = [...context.querySelectorAll('.js-radio')];
    this.clearButton = [...document.querySelectorAll('.btn-clear')];
    this.submitButton = [...document.querySelectorAll('button[type="submit"]')];

    this.inputs.forEach(input => input.addEventListener('click', this.showClearBtn.bind(this)));
    this.clearButton.forEach(input => input.addEventListener('click', this.clearRadios.bind(this)));
  }

  showClearBtn() {
    this.clearButton.forEach(input => input.classList.remove('u-vh'));
    this.submitButton.forEach(input => input.classList.remove('u-mt-xl'));
    this.submitButton.forEach(input => input.classList.add('u-mt-no'));
  }

  clearRadios() {
    this.inputs.forEach(input => (input.checked = false));
    this.clearButton.forEach(input => input.classList.add('u-vh'));
    this.submitButton.forEach(input => input.classList.remove('u-mt-no'));
    this.submitButton.forEach(input => input.classList.add('u-mt-xl'));
  }
}

export default function radios() {
  [...document.querySelectorAll('.js-radios')].forEach(context => new Radios(context));
}
