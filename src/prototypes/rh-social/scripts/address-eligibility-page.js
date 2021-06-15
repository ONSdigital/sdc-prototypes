import domready from 'helpers/domready';

function actionChanger() {
  const pathname = window.location.pathname;

  if (pathname.includes('/address.html')) {
    const form = document.querySelector('form');
    const originalAction = form.action;
    const selectedFromLookupInput = document.querySelector('.js-address-from-lookup');
    const lookupAction = pathname.replace('/address.html', '/no-js-address-lookup.html');
    const urlParams = new URLSearchParams(window.location.search);

    selectedFromLookupInput.addEventListener('change', () => {
      if (selectedFromLookupInput.value === 'true') {
        form.action = originalAction;
      } else {
        form.action = lookupAction;
      }
    });

    if (urlParams.get('no-js') === 'true') {
      sessionStorage.setItem('no-js', true);
    }

    if (urlParams.get('no-js') === 'false') {
      sessionStorage.removeItem('no-js');
    }
    if (sessionStorage.getItem('no-js')) {
      const manualButton = document.querySelector('.js-address-manual-btn');

      setTimeout(() => {
        if (document.querySelector('.js-address-from-lookup').value === 'true') {
          manualButton.click();
        }

        document.querySelector('.js-address-search-btn-container').classList.add('u-d-no');
      }, 50);
    }
  }
}

domready(actionChanger);
