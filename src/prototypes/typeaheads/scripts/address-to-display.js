export default function addressToDisplay(inputs) {
  const values = inputs.filter(input => !input.isTypeahead).map(input => input.value).filter(value => value).slice(0, 2);

  return values.join(', ');
}
