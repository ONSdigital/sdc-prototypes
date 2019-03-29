import domready from 'helpers/domready';

function pipeAnswers() {
  const pipingDestinations = [...document.querySelectorAll('.js-piped-answer')];

  pipingDestinations.forEach(pipeAnswer);
}

function pipeAnswer(destination) {
  const questionToFetch = destination.getAttribute('data-question-to-pipe');
  const question = JSON.parse(sessionStorage.getItem(questionToFetch));
  const answer = question.inputs.find(input => !input.id.includes('-code'));
  
  destination.innerHTML = destination.innerHTML.replace('{x}', answer.value);
}

domready(pipeAnswers);
