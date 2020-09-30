import domReady from 'helpers/domready';

function loadBSL() {
  const bslLink = [...document.querySelectorAll('.js-bsl-link')];

  bslLink.forEach(link => {
    link.addEventListener('click', setBSL.bind(this));
  });

  function setBSL() {
    window.sessionStorage.setItem('bsl', true);
  }

  const bsl = window.sessionStorage.getItem('bsl');

  if (bsl) {
    const header = document.querySelector('.header');
    const button = document.querySelector('.js-bsl-btn');
    const buttonInner = button.querySelector('.btn__inner');
    const removeLink = document.querySelector('.js-remove-bsl');
    const videoWrap = document.querySelector('.bsl-video');
    const video = videoWrap.querySelector('.bsl-video__video');
    const form = document.getElementsByTagName('form')[0];
    const formInputs = [...form.getElementsByTagName('input')];
    let open = true;

    initialiseBSL();
    window.addEventListener('resize', setPageOffset.bind(this));

    function setPageOffset() {
      const videoHeight = videoWrap.offsetHeight;
      header.style.padding = videoHeight + 'px 0 0 0';
      header.style.background = '#000';
    }

    function initialiseBSL() {
      videoWrap.classList.remove('u-d-no');

      button.addEventListener('click', toggleVideo.bind(this));

      formInputs.forEach(input => {
        const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        if (vw < 960) {
          input.addEventListener('focus', toggleVideo.bind(this));
        }
      });

      removeLink.addEventListener('click', removeBSL.bind(this));

      setPageOffset();
    }

    function toggleVideo(event) {
      event.preventDefault();
      open === true || event.type === 'focus' ? hide() : show();
    }

    function hide() {
      video.classList.add('u-d-no');
      videoWrap.classList.add('bsl-video--closed');
      buttonInner.classList.add('icon--bsl-btn--closed', 'icon--bsl-show-white');
      buttonInner.classList.remove('icon--bsl-hide');
      buttonInner.textContent = 'Show BSL';
      open = false;
      setPageOffset();
    }

    function show() {
      video.classList.remove('u-d-no');
      videoWrap.classList.remove('bsl-video--closed');
      buttonInner.classList.add('icon--bsl-hide');
      buttonInner.classList.remove('icon--bsl-btn--closed', 'icon-bsl-show-white');
      buttonInner.textContent = 'Hide BSL';
      open = true;
      setPageOffset();
    }

    function removeBSL() {
      window.sessionStorage.removeItem('bsl');
    }
  }
}

domReady(loadBSL);
