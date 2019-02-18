import 'helpers/questions-manager';
import '../components/typeahead/typeahead';
import '../components/address-input/address-input';

const form = document.getElementsByTagName('FORM')[0];
const otherCheckbox = document.getElementById('other');
const ethnicGroupInputs = [...document.querySelectorAll('input[name="ethnic-group"]')];

function handleSubmit() {
  if (otherCheckbox) {
    const originalAction = form.getAttribute('data-original-action') || form.getAttribute('action');
    const otherAction = otherCheckbox.getAttribute('data-other-url');

    form.action = otherCheckbox.checked ? otherAction : originalAction;
    form.setAttribute('data-original-action', originalAction);
  }

  const selectedEthnicGroupInput = ethnicGroupInputs.find(input => input.checked);

  if (selectedEthnicGroupInput) {
    form.action = selectedEthnicGroupInput.getAttribute('data-action-url');
  }
}

form.addEventListener('submit', handleSubmit);

