const urlParams = new URLSearchParams(window.location.search);
const bsl = urlParams.has('bsl');

if (bsl) {
  const button = document.querySelector('.js-bsl-btn');
  const buttonInner = button.querySelector('.btn__inner');
  const videoWrap = document.querySelector('.bsl-video');
  const video = document.querySelector('.bsl-video__video');

  const form = document.getElementsByTagName('form')[0];
  let open = true;

  form.action = form.action + '?bsl';

  videoWrap.classList.remove('u-d-no');
  button.addEventListener('click', toggleVideo.bind(this));

  function toggleVideo(e) {
    e.preventDefault();
    if (open === true) {
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
