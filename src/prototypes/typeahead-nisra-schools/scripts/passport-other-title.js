import domready from 'helpers/domready';

function setPassportOtherTitle() {
  const title = document.querySelector('.js-passport-title');
  const panel = document.querySelector('.js-passport-panel');

  if (title) {
    const questionToFetch = title.getAttribute('data-passport-answers');
    const question = JSON.parse(sessionStorage.getItem(questionToFetch));
    const answer = question.inputs.filter(input => input.checked === true);
    const otherAnswer = question.inputs.find(input => input.id === 'other');
    title.innerHTML = title.innerHTML.replace('{x}', answer.length > 1 ? otherAnswer.value.toLowerCase() : '');
    panel.innerHTML = panel.innerHTML.replace('{x}', answer.length > 1 ? otherAnswer.value.toLowerCase() : '');
  }
}

domready(setPassportOtherTitle);
