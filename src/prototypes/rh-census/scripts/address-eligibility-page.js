import domready from 'helpers/domready';

function actionChanger() {
  const pathname = window.location.pathname;

  if (pathname.includes('/address.html')) {
    const form = document.querySelector('form');
    const originalAction = form.action;
    const selectedFromLookupInput = document.querySelector('.js-address-from-lookup');
    const lookupAction = pathname.replace('/address.html', '/no-js-address-lookup.html');

    selectedFromLookupInput.addEventListener('change', () => {
      if (selectedFromLookupInput.value === 'true') {
        form.action = originalAction;
      } else {
        form.action = lookupAction;
      }
    });
  }
}

domready(actionChanger);
