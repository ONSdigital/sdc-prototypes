import domready from 'helpers/domready';

function hideFeedback() {
  var button = document.getElementById('feedback-btn'); // Assumes element with id='button'
  button.onclick = function() {
    var div = document.getElementsByClassName('question');
    if (div.style.display !== 'none') {
      div.style.display = 'none';
      button.style.display = 'none';
    } else {
      div.style.display = 'block';
      button.style.display = 'block';
    }
  };
}
domready(hideFeedback);
