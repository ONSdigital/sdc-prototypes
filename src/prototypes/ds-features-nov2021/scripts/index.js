import './questions-manager';
import './piping';
import './previous-link';
import '../components/autosuggest/autosuggest.dom';
import SummaryManager from './summary-manager';
import summaryTemplate from '!nunjucks-loader!../views/partials/_summary.njk';

const summaryPlaceholder = document.querySelector('.js-summary');

if (summaryPlaceholder) {
  new SummaryManager(summaryPlaceholder, summaryTemplate);
}
