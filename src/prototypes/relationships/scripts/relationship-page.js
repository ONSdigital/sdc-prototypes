import relationship from '../components/relationship/relationship';
import { possessiveSetter } from './helpers';

class RelationshipPage {
  constructor(context) {
    this.context = context;

    this.form = document.querySelector('form');
    this.title = context.querySelector('.question__title');
    this.relationshipComponent = context.querySelector('.js-relationship-page-relationship');
    this.display = context.querySelector('.js-relationship-page-display');

    this.people = JSON.parse(sessionStorage.getItem('people') || '[]');

    if (!this.people.length) {
      window.location.href = '/';
    }

    if (this.isLastPerson()) {
      this.form.action = this.context.getAttribute('data-complete-url');
    }
    
    this.personA = this.getPersonA();
    this.personB = this.getPersonB();
    this.setTitleAndDisply();

    relationship();

    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  getPersonA() {
    return this.people.find(person => !person.relationships || person.relationships.length !== this.people.length - 1);
  }

  getPersonB() {
    return this.people.find(person => person.id !== this.personA.id && !person.relationships.find(relationship => relationship.id === this.personA.id));
  }

  setTitleAndDisply() {
    let title;
    let display;

    if (this.personA.is_you) {
      title = `${this.personB.display_name} is your <em>&hellip;</em>`;
      display = title;

      this.relationshipComponent.setAttribute('data-title-related', `${this.personB.display_name} is your <em>{x}</em>`);
      this.relationshipComponent.setAttribute('data-title-unrelated', `${this.personB.display_name} is <em>unrelated</em> to you`);

      this.relationshipComponent.setAttribute('data-display-related', `${this.personB.display_name} is your <em>{x}</em>`);
      this.relationshipComponent.setAttribute('data-display-unrelated', `${this.personB.display_name} is <em>unrelated</em> to you`);
    } else {
      title = `Thinking of ${this.personA.display_name}, ${this.personB.display_name} is their <em>&hellip;</em>`;
      display = possessiveSetter(`${this.personA.display_name} is ${this.personB.display_name}{possessive} <em>&hellip;</em>`);
      this.relationshipComponent.setAttribute('data-title-related', `Thinking of ${this.personA.display_name}, ${this.personB.display_name} is their <em>{x}</em>`);
      this.relationshipComponent.setAttribute('data-title-unrelated', `Thinking of ${this.personA.display_name}, ${this.personB.display_name} is <em>unrelated</em> to ${this.personA.display_name}`);

      this.relationshipComponent.setAttribute('data-display-related', possessiveSetter(`${this.personB.display_name} is ${this.personA.display_name}{possessive} <em>{x}</em>`));
      this.relationshipComponent.setAttribute('data-display-unrelated', `${this.personB.display_name} is <em>unrelated</em> to ${this.personA.display_name}`);
    }

    this.title.innerHTML = title;
    this.display.innerHTML = display;
  }

  handleSubmit() {
    const selectedRelationship = this.context.querySelector('input[type=radio]:checked');

    if (selectedRelationship) {
      if (this.isLastPerson()) {
        sessionStorage.removeItem('people');
      } else {
        this.personA.relationships.push({
          id: this.personB.id,
          relationship: selectedRelationship.getAttribute('id')
        });
  
        this.personB.relationships.push({
          id: this.personA.id,
          relationship: selectedRelationship.getAttribute('id')
        });
  
        sessionStorage.setItem('people', JSON.stringify(this.people));
      }
    }
  }

  isLastPerson() {
    return this.people.filter(person => person.relationships.length !== this.people.length - 1).length === 2;
  }
}

export default function relationshipPage() {
  [...document.querySelectorAll('.js-relationship-page')].forEach(context => new RelationshipPage(context));
}
