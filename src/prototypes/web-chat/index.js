const trigger = document.querySelector('.js-activate-web-chat');
const widget = document.querySelector('.js-web-chat');

trigger.addEventListener('click', e => {
  e.preventDefault();
  widget.classList.add('web-chat-form--open');
});
