const bslLink = document.querySelector('.js-bsl-activate');

bslLink.addEventListener('click', activateBSL.bind(this));
function activateBSL() {
  window.sessionStorage.setItem('bsl', true);
}

const bsl = window.sessionStorage.getItem('bsl');

if (bsl) {
  const button = document.querySelector('.js-bsl-btn');
  const buttonInner = button.querySelector('.btn__inner');
  const videoWrap = document.querySelector('.bsl-video');
  const video = document.querySelector('.bsl-video__video');

  const form = document.getElementsByTagName('form')[0];
  const formInputs = [...form.getElementsByTagName('input')];
  let open = true;

  form.action = form.action + '?bsl';

  videoWrap.classList.remove('u-d-no');
  button.addEventListener('click', toggleVideo.bind(this));
  formInputs.forEach(input => {
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    if (vw < 960) {
      input.addEventListener('focus', toggleVideo.bind(this));
    }
  });

  function toggleVideo(event) {
    event.preventDefault();
    if (open === true || event.type === 'focus') {
      video.classList.add('u-d-no');
      videoWrap.classList.add('bsl-video--closed');
      buttonInner.classList.add('icon--bsl-btn--closed');
      buttonInner.textContent = 'Show BSL';
      open = false;
    } else {
      video.classList.remove('u-d-no');
      videoWrap.classList.remove('bsl-video--closed');
      buttonInner.classList.remove('icon--bsl-btn--closed');
      buttonInner.textContent = 'Hide BSL';
      open = true;
    }
  }
}
