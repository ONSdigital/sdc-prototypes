import domReady from 'helpers/domready';

import person from './person';
import peopleList from './people-list';

domReady(() => {
  person();
  peopleList();
});
