import domready from 'helpers/domready';

function toggle() {
  $('input:radio[name="property-name"]').change(function() {
    if ($(this).is(':checked') && $(this).val() == 'house') {
      $('input:checkbox').removeAttr('checked');
    }
  });
}
domready(toggle);
