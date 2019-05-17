import UACEntry from './uac-entry';

export default function initialise() {
  [...document.querySelectorAll('.js-uac-entry')].forEach(element => new UACEntry(element));
}
