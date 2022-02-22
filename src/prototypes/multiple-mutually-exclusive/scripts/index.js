let checkboxes = document.querySelectorAll('.checkbox__input');
let radios = document.querySelectorAll('.radio__input');

radios.forEach(function(el) {
  el.addEventListener('change', function(e) {
    let checked = el.value === 'checked';

    checkboxes.forEach(function(el) {
      el.checked = checked;
    });
  });
});
