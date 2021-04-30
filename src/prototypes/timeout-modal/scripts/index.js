import domReady from 'helpers/domready';

class TimeoutWarning {
  constructor(context) {
    this.context = context;
    this.lastFocusedEl = null;
    this.continueButton = context.querySelector('.js-continue-btn');
    this.overLayClass = 'timeout-warning-overlay';
    this.fallBackElement = document.querySelector('.timeout-warning-fallback');
    this.timers = [];
    this.countdown = context.querySelector('.js-timer');
    this.accessibleCountdown = context.querySelector('.js-timer-acc');

    this.idleMinutesBeforeTimeOut = context.getAttribute('data-server-timeout-time')
      ? context.getAttribute('data-server-timeout-time')
      : 0.3;
    this.minutesTimeOutDialogVisible = context.getAttribute('data-show-Dialog') ? context.getAttribute('data-show-Dialog') : 0.2;
    this.timeOutRedirectUrl = context.getAttribute('data-redirect-url');
    this.timeUserLastInteractedWithPage = '';
    this.idleTime = null;
    this.milliSecondsBeforeTimeOut = this.idleMinutesBeforeTimeOut * 60000;

    this.initialise();
  }

  initialise() {
    if (!this.context) {
      return;
    }

    if (!this.dialogSupported()) {
      return;
    }

    this.countIdleTime();

    this.continueButton.addEventListener('click', this.closeDialog.bind(this));
    this.context.addEventListener('keydown', this.escClose.bind(this));
    window.addEventListener('focus', this.checkIfShouldHaveTimedOut.bind(this));
  }

  dialogSupported() {
    if (typeof HTMLDialogElement === 'function') {
      return true;
    } else {
      try {
        window.dialogPolyfill.registerDialog(this.context);
        return true;
      } catch (error) {
        this.fallBackElement.classList.add('u-db');
        return false;
      }
    }
  }

  countIdleTime() {
    window.onload = this.resetIdleTime.bind(this);
    window.onmousemove = this.resetIdleTime.bind(this);
    window.onmousedown = this.resetIdleTime.bind(this);
    window.onclick = this.resetIdleTime.bind(this);
    window.onscroll = this.resetIdleTime.bind(this);
    window.onkeypress = this.resetIdleTime.bind(this);
    window.onkeyup = this.resetIdleTime.bind(this);
  }

  resetIdleTime() {
    clearTimeout(this.idleTime);
    this.idleTime = setTimeout(this.openDialog.bind(this), this.milliSecondsBeforeTimeOut);

    // TO DO: Client/server interaction
    // setLastActiveTimeOnServer();
    if (window.localStorage) {
      if (!this.isDialogOpen()) {
        window.localStorage.setItem('timeUserLastInteractedWithPage', new Date());
      }
    }
  }

  openDialog() {
    const shouldDialogOpen = this.getLastInteractiveTimeInSeconds() > this.idleMinutesBeforeTimeOut * 60;
    if (shouldDialogOpen) {
      document.querySelector('body').classList.add(this.overLayClass);
      this.saveLastFocusedEl();
      this.makePageContentInert();
      this.context.showModal();

      this.startUiCountdown();

      if (window.history.pushState) {
        window.history.pushState('', '');
      }

      // this.disableBackButtonWhenOpen();
    } else {
      this.closeDialog();
      this.resetIdleTime();
    }
  }

  startUiCountdown() {
    this.clearTimers();
    const module = this;
    const countdown = this.countdown;
    const accessibleCountdown = this.accessibleCountdown;
    const minutes = this.minutesTimeOutDialogVisible;

    let seconds = 60 * minutes;
    let timerRunOnce = false;
    let timers = this.timers;
    let secondsLapsed = 0;

    countdown.innerHTML = minutes + ' minute' + (minutes > 1 ? 's' : '');

    (function runTimer() {
      const minutesLeft = parseInt(seconds / 60, 10);
      const secondsLeft = parseInt(seconds % 60, 10);
      const timerExpired = minutesLeft < 1 && secondsLeft < 1;

      const minutesText = minutesLeft > 0 ? minutesLeft + ' minute' + (minutesLeft > 1 ? 's' : '') : '';
      const secondsText = secondsLeft >= 1 ? secondsLeft + ' second' + (secondsLeft > 1 ? 's' : '') : '';
      let atMinutesNumberAsText = '';
      let atSecondsNumberAsText = '';

      try {
        atMinutesNumberAsText = this.numberToWords(minutesLeft);
        atSecondsNumberAsText = this.numberToWords(secondsLeft);
      } catch (e) {
        atMinutesNumberAsText = minutesLeft;
        atSecondsNumberAsText = secondsLeft;
      }

      const atMinutesText = minutesLeft > 0 ? atMinutesNumberAsText + ' minute' + (minutesLeft > 1 ? 's' : '') + '' : '';
      const atSecondsText = secondsLeft >= 1 ? ' ' + atSecondsNumberAsText + ' second' + (secondsLeft > 1 ? 's' : '') + '' : '';

      let text =
        'To protect your data, your progress will be saved and you will be signed out in <span class="u-fw-b">' +
        minutesText +
        secondsText +
        '</span>.';
      let atText = 'To protect your data, your progress will be saved and you will be signed out in ' + atMinutesText;
      if (atSecondsText) {
        if (minutesLeft > 0) {
          atText += ' and';
        }
        atText += atSecondsText + '.';
      } else {
        atText += '.';
      }

      if (timerExpired) {
        module.redirect();
      } else {
        seconds--;
        secondsLapsed++;

        if (module.getLastInteractiveTimeInSeconds() < secondsLapsed) {
          module.closeDialog();
          module.resetIdleTime();
        } else {
          countdown.innerHTML = text;

          if (minutesLeft < 1 && secondsLeft < 20) {
            accessibleCountdown.setAttribute('aria-live', 'assertive');
          }

          if (!timerRunOnce) {
            accessibleCountdown.innerHTML = atText;
            timerRunOnce = true;
          } else if (secondsLeft % 15 === 0) {
            accessibleCountdown.innerHTML = atText;
          }

          timers.push(setTimeout(runTimer, 1000));
        }
      }
    })();
  }

  saveLastFocusedEl() {
    this.lastFocusedEl = document.activeElement;
    if (!this.lastFocusedEl || this.lastFocusedEl === document.body) {
      this.lastFocusedEl = null;
    } else if (document.querySelector) {
      this.lastFocusedEl = document.querySelector(':focus');
    }
  }

  setFocusOnLastFocusedEl() {
    if (this.lastFocusedEl) {
      this.lastFocusedEl.focus();
    }
  }

  makePageContentInert() {
    if (document.querySelector('.page')) {
      document.querySelector('.page').inert = true;
      document.querySelector('.page').setAttribute('aria-hidden', 'true');
    }
  }

  removeInertFromPageContent = function() {
    if (document.querySelector('.page')) {
      document.querySelector('.page').inert = false;
      document.querySelector('.page').setAttribute('aria-hidden', 'false');
    }
  };

  isDialogOpen() {
    return this.context['open'];
  }

  closeDialog() {
    // TO DO: Client/server interaction
    // setLastActiveTimeOnServer();

    if (this.isDialogOpen()) {
      document.querySelector('body').classList.remove(this.overLayClass);
      this.context.close();
      this.setFocusOnLastFocusedEl();
      this.removeInertFromPageContent();
      this.clearTimers();
    }
  }

  clearTimers() {
    for (let i = 0; i < this.timers.length; i++) {
      clearTimeout(this.timers[i]);
    }
  }

  disableBackButtonWhenOpen() {
    window.addEventListener('popstate', function() {
      if (this.isDialogOpen()) {
        this.closeDialog();
      } else {
        window.history.go(-1);
      }
    });
  }

  escClose = function(event) {
    if (this.isDialogOpen() && event.keyCode === 27) {
      this.closeDialog();
    }
  };

  checkIfShouldHaveTimedOut() {
    // TO DO - client/server interaction
    // GET last interactive time from server before timing out user
    if (window.localStorage) {
      let secondsOfIdleTime = this.idleMinutesBeforeTimeOut * 60 + this.minutesTimeOutDialogVisible * 60;
      if (this.getLastInteractiveTimeInSeconds() > secondsOfIdleTime) {
        this.redirect();
      } else {
        window.localStorage.setItem('timeUserLastInteractedWithPage', new Date());
      }
    }
  }

  getLastInteractiveTimeInSeconds() {
    let timeUserLastInteractedWithPage = new Date(window.localStorage.getItem('timeUserLastInteractedWithPage'));
    let secondsSinceLastInteraction = Math.abs((timeUserLastInteractedWithPage - new Date()) / 1000);
    return secondsSinceLastInteraction;
  }

  redirect() {
    window.location.replace(this.timeOutRedirectUrl);
  }

  // Example function for sending last active time of user to server
  setLastActiveTimeOnServer() {
    //   const xhttp = new XMLHttpRequest()
    //   xhttp.onreadystatechange = function () {
    //     if (this.readyState === 4 && this.status === 200) {
    //       let timeUserLastInteractedWithPage = new Date();
    //     }
    //   }
    //
    //   xhttp.open('POST', 'somewhere', true);
    //   xhttp.send();
  }

  numberToWords() {
    let string = n.toString();
    let units;
    let tens;
    let scales;
    let start;
    let end;
    let chunks;
    let chunksLen;
    let chunk;
    let ints;
    let i;
    let word;
    let words = 'and';

    if (parseInt(string) === 0) {
      return 'zero';
    }

    /* Array of units as words */
    units = [
      '',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen'
    ];

    /* Array of tens as words */
    tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    /* Array of scales as words */
    scales = [
      '',
      'thousand',
      'million',
      'billion',
      'trillion',
      'quadrillion',
      'quintillion',
      'sextillion',
      'septillion',
      'octillion',
      'nonillion',
      'decillion',
      'undecillion',
      'duodecillion',
      'tredecillion',
      'quatttuor-decillion',
      'quindecillion',
      'sexdecillion',
      'septen-decillion',
      'octodecillion',
      'novemdecillion',
      'vigintillion',
      'centillion'
    ];

    /* Split user arguemnt into 3 digit chunks from right to left */
    start = string.length;
    chunks = [];
    while (start > 0) {
      end = start;
      chunks.push(string.slice((start = Math.max(0, start - 3)), end));
    }

    /* Check if function has enough scale words to be able to stringify the user argument */
    chunksLen = chunks.length;
    if (chunksLen > scales.length) {
      return '';
    }

    /* Stringify each integer in each chunk */
    words = [];
    for (i = 0; i < chunksLen; i++) {
      chunk = parseInt(chunks[i]);

      if (chunk) {
        /* Split chunk into array of individual integers */
        ints = chunks[i]
          .split('')
          .reverse()
          .map(parseFloat);

        /* If tens integer is 1, i.e. 10, then add 10 to units integer */
        if (ints[1] === 1) {
          ints[0] += 10;
        }

        /* Add scale word if chunk is not zero and array item exists */
        if ((word = scales[i])) {
          words.push(word);
        }

        /* Add unit word if array item exists */
        if ((word = units[ints[0]])) {
          words.push(word);
        }

        /* Add tens word if array item exists */
        if ((word = tens[ints[1]])) {
          words.push(word);
        }

        /* Add hundreds word if array item exists */
        if ((word = units[ints[2]])) {
          words.push(word + ' hundred');
        }
      }
    }
    return words.reverse().join(' ');
  }
}

const timeoutMod = document.querySelector('.js-timeout-warning');

domReady(new TimeoutWarning(timeoutMod));
