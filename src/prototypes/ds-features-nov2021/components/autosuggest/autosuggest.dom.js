import domready from 'helpers/domready';

async function initialiseAutosuggests() {
  const autosuggests = [...document.querySelectorAll('.ons-js-autosuggest')];

  if (autosuggests.length) {
    const Autosuggest = (await import('./autosuggest')).default;

    autosuggests.forEach(autosuggest => new Autosuggest(autosuggest));
  }
}

domready(initialiseAutosuggests);
