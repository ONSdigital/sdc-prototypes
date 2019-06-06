import domReady from 'helpers/domready';

import UACEntry from './components/uac-entry/uac-entry.dom';
import './components/address-input/address-input';
import './scripts/questions-manager';
import './scripts/address-confirmer';
import './scripts/piping';

domReady(() => {
  UACEntry();
});
