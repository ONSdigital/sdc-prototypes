import 'helpers/previous-link';
import '../components/typeahead/typeahead';
import '../components/address-input/address-input';
import './questions-manager';
import SummaryManager from './summary-manager';
import summaryTemplate from '!nunjucks-loader!../views/partials/_summary.njk';
import './piping';
import './student-address-check';
import './address-initialiser';
import './one-year-ago-census-address';
import './address-confirmer';

const summaryPlaceholder = document.querySelector('.js-summary');

if (summaryPlaceholder) {
  new SummaryManager(summaryPlaceholder, summaryTemplate);
}
