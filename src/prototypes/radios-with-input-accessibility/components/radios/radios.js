class Radios {
  constructor(context) {
    this.inputs = [...context.querySelectorAll('.js-radio')];

    this.inputs.forEach(input => input.addEventListener('change', this.setExpandedAttributes.bind(this)));

    this.setExpandedAttributes();
  }

  setExpandedAttributes() {
    this.inputs.forEach(input => input.setAttribute('aria-expanded', input.checked));
  }
}

export default function radios() {
  [...document.querySelectorAll('.js-radios')].forEach(context => new Radios(context));
}
