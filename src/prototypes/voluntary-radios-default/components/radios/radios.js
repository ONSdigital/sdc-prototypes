class Radios {
  constructor(context) {
    this.inputs = [...context.querySelectorAll('.js-radio')];
    this.button = [...document.querySelectorAll('.btn-clear')];
    this.submitButton = [...document.querySelectorAll('button[type="submit"]')];
    this.inputs.forEach(input => input.addEventListener('click', this.showClearBtn.bind(this)));
    this.button.forEach(input => input.addEventListener('click', this.clearRadios.bind(this)));
  }

  showClearBtn() {
    console.log(this.inputs);
    console.log(this.button);
    console.log(this.submitButton);
    this.button.forEach(button => button.classList.remove('btn--disabled'));
    // this.submitButton.forEach(input => input.classList.remove('u-mt-xl'));
    // this.submitButton.forEach(input => input.classList.add('u-mt-xs'));
  }

  clearRadios() {
    this.inputs.forEach(input => (input.checked = false));
    this.button.forEach(input => input.classList.add('btn--disabled'));
    console.log(this.submitButton);
    // this.submitButton.forEach(input => input.classList.remove('u-mt-xs'));
    // this.submitButton.forEach(input => input.classList.add('u-mt-xl'));
  }
}

export default function radios() {
  [...document.querySelectorAll('.js-radios')].forEach(context => new Radios(context));
}
