const callbacks = [];

export default function domready(callback) {
  callbacks.push(callback);
}

function onReady() {
  document.removeEventListener('onsDOMReady', onReady);
  callbacks.forEach(callback => callback());
}

// Checks if ONS Design System has already run DOM ready and if not waits for it to fire a DOM ready event
if (window.onsDOMReady) {
  onReady();
} else {
  document.addEventListener('onsDOMReady', onReady);
}
