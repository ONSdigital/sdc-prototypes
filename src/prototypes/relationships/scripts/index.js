import domReady from 'helpers/domready';

import person from './person';
import peopleList from './people-list';
import peopleCheck from './people-check';
import relationshipPage from './relationship-page';

domReady(() => {
  person();
  peopleList();
  peopleCheck();
  relationshipPage();
});
