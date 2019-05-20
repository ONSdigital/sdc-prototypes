const ordinals = [
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth',
  'eleventh',
  'twelfth',
  'thirteenth',
  'fourteenth',
  'fifteenth',
  'sixteenth',
  'seventeenth',
  'eighteenth',
  'nineteenth',
  'twentieth',
  'twentyfirst',
  'twentysecond',
  'twentythird',
  'twentyfourth',
  'twentyfifth',
  'twentysixth',
  'twentyseventh',
  'twentyeighth',
  'twentyninth',
  'thirtieth'
];

class PeopleCheck {
  constructor(context) {
    this.context = context;
    this.form = document.querySelector('form');
    this.originalAction = this.form.getAttribute('action');
    this.radios = [...context.querySelectorAll('input[type=radio]')];

    this.radios.forEach(radio => {
      radio.addEventListener('change', this.handleChange.bind(this));
    });

    this.setYesRadioLabel();
  }

  setYesRadioLabel() {
    const nextIndex = JSON.parse(sessionStorage.getItem('people') || '[]').length - 1;

    const label = this.context.querySelector(`[for=${this.radios[0].getAttribute('id')}]`);

    label.innerHTML = label.innerHTML.replace('second', ordinals[nextIndex]);
  }

  handleChange(event) {
    const action = event.target.getAttribute('data-action');

    this.form.setAttribute('action', action || this.originalAction);
  }
}

export default function peopleCheck() {
  [...document.querySelectorAll('.js-people-check')].forEach(context => new PeopleCheck(context));
}
