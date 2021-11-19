import './scripts/questions-manager';
import './scripts/piping';
import './scripts/previous-link';
import SummaryManager from './scripts/summary-manager';
import summaryTemplate from '!nunjucks-loader!./views/partials/_summary.njk';

const summaryPlaceholder = document.querySelector('.js-summary');

if (summaryPlaceholder) {
  new SummaryManager(summaryPlaceholder, summaryTemplate);
}
