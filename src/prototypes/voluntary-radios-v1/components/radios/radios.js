class Radios {
  constructor(context) {
    this.inputs = [...context.querySelectorAll('.js-radio')];
    this.button = [...document.querySelectorAll('.btn-clear')];
    this.submitButton = [...document.querySelectorAll('button[type="submit"]')];
    this.inputs.forEach(input => input.addEventListener('click', this.showClearBtn.bind(this)));
    this.button.forEach(input => input.addEventListener('click', this.clearRadios.bind(this)));
    this.button.forEach(input => input.classList.add('btn--disabled'));
  }

  showClearBtn() {
    this.button.forEach(button => button.classList.remove('btn--disabled'));
  }

  clearRadios(event) {
    event.preventDefault();
    this.inputs.forEach(input => (input.checked = false));
    this.button.forEach(input => input.classList.add('btn--disabled'));
  }
}

export default function radios() {
  [...document.querySelectorAll('.js-radios')].forEach(context => new Radios(context));
}
