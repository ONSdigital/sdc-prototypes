import 'helpers/previous-link';
import '../components/typeahead/typeahead';
import '../components/address-input/address-input';
import './questions-manager';
import SummaryManager from './summary-manager';
import summaryTemplate from '!nunjucks-loader!@ons/design-system/0.1.14/components/summary/_template.njk';


const form = document.getElementsByTagName('FORM')[0];
const otherCheckbox = document.getElementById('other');
const ethnicGroupInputs = [...document.querySelectorAll('input[name="ethnic-group"]')];

function handleSubmit() {
  if (otherCheckbox) {
    const originalAction = form.getAttribute('data-original-action') || form.getAttribute('action');
    const otherAction = otherCheckbox.getAttribute('data-other-url');

    form.action = otherCheckbox.checked ? otherAction : originalAction;
    form.setAttribute('data-original-action', originalAction);

    if (!otherCheckbox.checked) {
      sessionStorage.removeItem(otherAction);
    }
  }

  const selectedEthnicGroupInput = ethnicGroupInputs.find(input => input.checked);
  const unselectedEthnicGroupInputs = ethnicGroupInputs.filter(input => !input.checked);

  if (selectedEthnicGroupInput) {
    form.action = selectedEthnicGroupInput.getAttribute('data-action-url');
  }

  unselectedEthnicGroupInputs.forEach(input => {
    const action = input.getAttribute('data-action-url');
    sessionStorage.removeItem(action);
  });
}

form.addEventListener('submit', handleSubmit);

const summaryPlaceholder = document.querySelector('.js-summary');

if (summaryPlaceholder) {
  new SummaryManager(summaryPlaceholder, summaryTemplate);
}
