const button = document.querySelector('.js-bsl-btn');
if (button) {
  const buttonInner = button.querySelector('.btn__inner');
  const video = document.querySelector('.bsl-video__video');
  let open = true;
  button.addEventListener('click', toggleVideo.bind(this));

  function toggleVideo(e) {
    e.preventDefault();
    if (open === true) {
      video.classList.add('u-d-no');
      buttonInner.textContent = 'Show BSL';
      open = false;
    } else {
      video.classList.remove('u-d-no');
      buttonInner.textContent = 'Hide BSL';
      open = true;
    }
  }
}
