import domready from 'helpers/domready';

function hideFeedback() {
  if ($('#feedback-btn').length > 0) {
    //it doesn't exist

    var button = document.getElementById('feedback-btn'); // Assumes element with id='button'
    button.onclick = function() {
      var div = document.getElementById('question');
      var thanks = document.getElementById('thanks');
      if (div.style.display !== 'none') {
        div.style.display = 'none';
        button.style.display = 'none';
        thanks.style.display = 'block';
      }
    };
  }
}
domready(hideFeedback);
