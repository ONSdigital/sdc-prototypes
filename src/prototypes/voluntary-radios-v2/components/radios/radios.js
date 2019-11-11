class Radios {
  constructor(context) {
    this.inputs = [...context.querySelectorAll('.js-radio')];
    this.button = [...document.querySelectorAll('.btn-clear')];
    this.submitButton = [...document.querySelectorAll('button[type="submit"]')];
    this.otherField = [document.querySelector('#other-textbox')];
    this.otherFieldRadio = [...document.querySelectorAll('.voluntary')];
    this.inputs.forEach(input => input.addEventListener('click', this.showClearBtn.bind(this)));
    this.button.forEach(input => input.addEventListener('click', this.clearRadios.bind(this)));
    this.otherField.forEach(input => input.addEventListener('click', this.checkRadio.bind(this)));
    this.otherFieldRadio.forEach(input => input.addEventListener('click', this.checkRadio.bind(this)));
    this.button.forEach(input => input.classList.add('u-vh'));
  }

  showClearBtn() {
    this.button.forEach(button => button.classList.remove('u-vh'));
    this.otherField.forEach(input => (input.value = ''));
  }

  clearRadios(event) {
    event.preventDefault();
    this.inputs.forEach(input => (input.checked = false));
    this.otherField.forEach(input => (input.value = ''));
    this.button.forEach(input => input.classList.add('u-vh'));
  }

  checkRadio() {
    this.otherFieldRadio.forEach(input => (input.checked = true));
    this.button.forEach(input => input.classList.remove('u-vh'));
    this.otherField.forEach(input => input.focus());
  }
}

export default function radios() {
  [...document.querySelectorAll('.js-radios')].forEach(context => new Radios(context));
}
