import domready from 'helpers/domready';

domready(() => {
  let previousURL;
  const queryStringPreviousURL = new URLSearchParams(window.location.search).get('previous');

  if (queryStringPreviousURL) {
    previousURL = queryStringPreviousURL;
  } else {
    const savedData = sessionStorage.getItem(window.location.pathname);

    if (savedData) {
      previousURL = JSON.parse(savedData).previousURL;
    }
  }


  if (previousURL) {
    const previousLinks = [...document.querySelectorAll('.js-previous')];

    previousLinks.forEach(link => {
      const originalPreviousURL = link.getAttribute('href');
      link.setAttribute('href', previousURL);
      link.setAttribute('data-original-href', originalPreviousURL);
    });
  }
});
