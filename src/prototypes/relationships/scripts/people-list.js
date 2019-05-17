import template from '!nunjucks-loader!../views/partials/_people-list.njk';

class PeopleList {
  constructor(context) {
    this.context = context;

    this.people = JSON.parse(sessionStorage.getItem('people') || '[]');

    this.render();
  }

  render() {
    const params = {
      rows: this.people.map(this.mapPerson.bind(this))
    };

    console.log(params);

    console.log(template);

    const html = template.render(params);

  }

  mapPerson(person) {
    let title = person.display_name;
    let url = 'person';

    if (person.is_you) {
      title += ' (You)';
      url = 'your-name';
    }

    return {
      title,
      rowItems: [
        {
          icon: 'person',
          actions: [
            {
              text: 'Change',
              ariaLabel: `Change details for ${person.display_name}`,
              url: `/prototypes/relationships/${url}.html?person_id=${person.id}`
            }
          ]
        }
      ]
    };
  }
}

export default function peopleList() {
  [...document.querySelectorAll('.js-people-list')].forEach(context => new PeopleList(context));
}
