import { getQueryStringParams } from 'querystring-helpers';
import UUID from 'uuid/v4';
import { sortBy } from 'sort-by-typescript';

class Person {
  constructor(context) {
    this.form = document.querySelector('form');
    this.inputs = [...context.querySelectorAll('.input')];
    this.people = JSON.parse(sessionStorage.getItem('people') || '[]');
    this.isYou = context.hasAttribute('data-you');

    this.form.addEventListener('submit', this.handleSubmit.bind(this));

    this.reloadPerson();
  }

  reloadPerson() {
    const params = getQueryStringParams();

    if (params.person_id) {
      this.person = this.people.find(person => person.id === params.person_id);

      this.inputs.forEach(input => {
        input.value = this.person[input.id];
      });
    }
  }

  handleSubmit(event) {
    if (!this.person) {
      this.person = {
        id: UUID(),
        sort_order: this.people.length,
        is_you: this.isYou,
        relationships: [],
      };
    }

    const nameParts = [];

    this.inputs.forEach(input => {
      const value = input.value.trim();

      this.person[input.id] = value;

      if (value) {
        nameParts.push(value);
      }
    });

    this.person.display_name = nameParts.join(' ');

    const newPeople = this.people.filter(person => person.id !== this.person.id);

    newPeople.push(this.person);

    sessionStorage.setItem('people', JSON.stringify(newPeople.sort(sortBy('sort_order'))));
  }
}

export default function person() {
  [...document.querySelectorAll('.js-person')].forEach(context => new Person(context));
}
