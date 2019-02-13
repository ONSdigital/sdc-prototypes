const buttons = [...document.querySelectorAll('.js-previous')];

buttons.forEach(button => button.setAttribute('href', document.referrer));
