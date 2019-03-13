import domready from 'helpers/domready';

domready(() => {
  const previousURL = new URLSearchParams(window.location.search).get('previous');

  if (previousURL) {
    const previousLinks = [...document.querySelectorAll('.js-previous')];

    previousLinks.forEach(link => link.setAttribute('href', previousURL));
  }
});
