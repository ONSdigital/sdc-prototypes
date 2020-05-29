// UTILITY
function Util() {}

/*
  Class manipulation functions
*/

Util.hasClass = function(el, className) {
  if (el.classList) return el.classList.contains(className);
  else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  if (el.classList) el.classList.add(classList[0]);
  else if (!Util.hasClass(el, classList[0])) el.className += ' ' + classList[0];
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  if (el.classList) el.classList.remove(classList[0]);
  else if (Util.hasClass(el, classList[0])) {
    var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
    el.className = el.className.replace(reg, ' ');
  }
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
  if (bool) Util.addClass(el, className);
  else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for (var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/*
  DOM manipulation
*/

Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if (selector.nodeType) {
    return elem === selector;
  }

  var qa = typeof selector === 'string' ? document.querySelectorAll(selector) : selector,
    length = qa.length,
    returnArr = [];

  while (length--) {
    if (qa[length] === elem) {
      return true;
    }
  }

  return false;
};

// Animate height of an element
Util.setHeight = function(start, to, element, duration, cb) {
  var change = to - start,
    currentTime = null;

  var animateHeight = function(timestamp) {
    if (!currentTime) currentTime = timestamp;
    var progress = timestamp - currentTime;
    var val = parseInt((progress / duration) * change + start);
    element.style.height = val + 'px';
    if (progress < duration) {
      window.requestAnimationFrame(animateHeight);
    } else {
      cb();
    }
  };

  // Set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start + 'px';
  window.requestAnimationFrame(animateHeight);
};

// Smooth Scroll
Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if (!scrollEl) start = window.scrollY || document.documentElement.scrollTop;

  var animateScroll = function(timestamp) {
    if (!currentTime) currentTime = timestamp;
    var progress = timestamp - currentTime;
    if (progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final - start, duration);
    element.scrollTo(0, val);
    if (progress < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/*
  Focus utility classes
*/

// Move focus to an element
Util.moveFocus = function(element) {
  if (!element) element = document.getElementsByTagName('body')[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex', '-1');
    element.focus();
  }
};

// Misc
Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if ('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function(g) {
      return g[1].toUpperCase();
    });
    return jsProperty in document.body.style;
  }
};

// Merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/

Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function(obj) {
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        // If deep merge and property is an object, merge properties
        if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          extended[prop] = extend(true, extended[prop], obj[prop]);
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for (; i < length; i++) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if (!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
};

/*
	Polyfills
*/

// Closest() method
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;
    if (!document.documentElement.contains(el)) return null;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

// Custom Event() constructor
if (typeof window.CustomEvent !== 'function') {
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

/*
	Animation curves
*/

Math.easeInOutQuad = function(t, b, c, d) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

/*
  JS Utility Classes
*/

(function() {

  // Make focus ring visible only for keyboard navigation (i.e., tab key)
  var focusTab = document.getElementsByClassName('js-tab-focus');

  function detectClick() {
    if (focusTab.length > 0) {
      resetFocusTabs(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
  }

  function detectTab(event) {
    if (event.keyCode !== 9) return;
    resetFocusTabs(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
  }

  function resetFocusTabs(bool) {
    var outlineStyle = bool ? '' : 'none';
    for (var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  }

  window.addEventListener('mousedown', detectClick);
})();


// FILTERS

(function() {
  var Filter = function(opts) {
    this.options = Util.extend(Filter.defaults, opts); // Used to store custom filter/sort functions
    this.element = this.options.element;
    this.elementId = this.element.getAttribute('id');
    this.items = this.element.querySelectorAll('.js-filter__item');
    this.controllers = document.querySelectorAll('[aria-controls="' + this.elementId + '"]'); // Controllers wrappers
    this.fallbackMessage = document.querySelector('[data-fallback-gallery-id="' + this.elementId + '"]');
    this.filterString = []; // Combination of different filter values
    this.sortingString = ''; // Sort value - will include order and type of argument (e.g., number or string)

    // Store info about sorted/filtered items
    this.filterList = []; // List of boolean for each this.item -> true if still visible , otherwise false
    this.sortingList = []; // List of new ordered this.item -> each element is [item, originalIndex]

    // Store grid info for animation
    this.itemsGrid = []; // Grid coordinates
    this.itemsInitPosition = []; // Used to store coordinates of this.items before animation
    this.itemsIterPosition = []; // Used to store coordinates of this.items before animation - intermediate state
    this.itemsFinalPosition = []; // Used to store coordinates of this.items after filtering

    // Animation off
    this.animateOff = this.element.getAttribute('data-filter-animation') == 'off';

    // Used to update this.itemsGrid on resize
    this.resizingId = false;

    // Default acceleration style - improve animation
    this.accelerateStyle = 'will-change: transform, opacity; transform: translateZ(0); backface-visibility: hidden;';

    // Handle multiple changes
    this.animating = false;
    this.reanimate = false;

    initFilter(this);
  };

  function initFilter(filter) {
    resetFilterSortArray(filter, true, true); // Init array filter.filterList/filter.sortingList
    createGridInfo(filter); // Store grid coordinates in filter.itemsGrid
    initItemsOrder(filter); // Add data-orders so that we can reset the sorting

    // Events handling - filter update
    for (var i = 0; i < filter.controllers.length; i++) {
      filter.filterString[i] = ''; // Reset filtering

      // Get proper filter/sorting string based on selected controllers
      (function(i) {
        filter.controllers[i].addEventListener('change', function(event) {
          if (event.target.tagName.toLowerCase() == 'select') {
            
            // Select elements
            !event.target.getAttribute('data-filter')
              ? setSortingString(filter, event.target.value, event.target.options[event.target.selectedIndex])
              : setFilterString(filter, i, 'select');
          } else if (
            event.target.tagName.toLowerCase() == 'input' &&
            (event.target.getAttribute('type') == 'radio' || event.target.getAttribute('type') == 'checkbox')
          ) {
            
            // Input (radio/checkboxed) elements
            !event.target.getAttribute('data-filter')
              ? setSortingString(filter, event.target.getAttribute('data-sort'), event.target)
              : setFilterString(filter, i, 'input');
          } else {
            
            // Generic inout element
            !filter.controllers[i].getAttribute('data-filter')
              ? setSortingString(filter, filter.controllers[i].getAttribute('data-sort'), filter.controllers[i])
              : setFilterString(filter, i, 'custom');
          }

          updateFilterArray(filter);

        });

        filter.controllers[i].addEventListener('click', function(event) {
          
          // Return if target is select/input elements
          var filterEl = event.target.closest('[data-filter]');
          var sortEl = event.target.closest('[data-sort]');
          if (!filterEl && !sortEl) return;
          if (filterEl && (filterEl.tagName.toLowerCase() == 'input' || filterEl.tagName.toLowerCase() == 'select')) return;
          if (sortEl && (sortEl.tagName.toLowerCase() == 'input' || sortEl.tagName.toLowerCase() == 'select')) return;
          if (sortEl && Util.hasClass(sortEl, 'js-filter__custom-control')) return;
          if (filterEl && Util.hasClass(filterEl, 'js-filter__custom-control')) return;

          // This will be executed only for a list of buttons -> no inputs
          event.preventDefault();
          resetControllersList(filter, i, filterEl, sortEl);
          sortEl ? setSortingString(filter, sortEl.getAttribute('data-sort'), sortEl) : setFilterString(filter, i, 'button');
          updateFilterArray(filter);
        });
      })(i);
    }

    // Handle resize - update grid coordinates in filter.itemsGrid
    window.addEventListener('resize', function() {
      clearTimeout(filter.resizingId);
      filter.resizingId = setTimeout(function() {
        createGridInfo(filter);
      }, 300);
    });

    // Check if there are filters/sorting values already set
    checkInitialFiltering(filter);

    // Reset filtering results if filter selection was changed by an external control (e.g., form reset)
    filter.element.addEventListener('update-filter-results', function(event) {
      
      // Reset filters first
      for (var i = 0; i < filter.controllers.length; i++) filter.filterString[i] = '';
      filter.sortingString = '';
      checkInitialFiltering(filter);
    });
  }

  function checkInitialFiltering(filter) {
    for (var i = 0; i < filter.controllers.length; i++) {
      
      // Check if there’s a selected option
      // Buttons list
      var selectedButton = filter.controllers[i].getElementsByClassName('js-filter-selected');
      if (selectedButton.length > 0) {
        var sort = selectedButton[0].getAttribute('data-sort');
        sort
          ? setSortingString(filter, selectedButton[0].getAttribute('data-sort'), selectedButton[0])
          : setFilterString(filter, i, 'button');
        continue;
      }

      // Input list
      var selectedInput = filter.controllers[i].querySelectorAll('input:checked');
      if (selectedInput.length > 0) {
        var sort = selectedInput[0].getAttribute('data-sort');
        sort ? setSortingString(filter, sort, selectedInput[0]) : setFilterString(filter, i, 'input');
        continue;
      }

      // Select item
      if (filter.controllers[i].tagName.toLowerCase() == 'select') {
        var sort = filter.controllers[i].getAttribute('data-sort');
        sort
          ? setSortingString(filter, filter.controllers[i].value, filter.controllers[i].options[filter.controllers[i].selectedIndex])
          : setFilterString(filter, i, 'select');
        continue;
      }

      // Check if there’s a generic custom input
      var radioInput = filter.controllers[i].querySelector('input[type="radio"]'),
        checkboxInput = filter.controllers[i].querySelector('input[type="checkbox"]');
      if (!radioInput && !checkboxInput) {
        var sort = filter.controllers[i].getAttribute('data-sort');
        var filterString = filter.controllers[i].getAttribute('data-filter');
        if (sort) setSortingString(filter, sort, filter.controllers[i]);
        else if (filterString) setFilterString(filter, i, 'custom');
      }
    }

    updateFilterArray(filter);
  }

  function setSortingString(filter, value, item) {
    
    // Get sorting string value-> sortName:order:type
    var order = item.getAttribute('data-sort-order') ? 'desc' : 'asc';
    var type = item.getAttribute('data-sort-number') ? 'number' : 'string';
    filter.sortingString = value + ':' + order + ':' + type;
  }

  function setFilterString(filter, index, type) {
    
    // Get filtering array -> [filter1:filter2, filter3, filter4:filter5]
    if (type == 'input') {
      var checkedInputs = filter.controllers[index].querySelectorAll('input:checked');
      filter.filterString[index] = '';
      for (var i = 0; i < checkedInputs.length; i++) {
        filter.filterString[index] = filter.filterString[index] + checkedInputs[i].getAttribute('data-filter') + ':';
      }
    } else if (type == 'select') {
      if (filter.controllers[index].multiple) {
        
        // Select with multiple options
        filter.filterString[index] = getMultipleSelectValues(filter.controllers[index]);
      } else {
        
        // Select with single option
        filter.filterString[index] = filter.controllers[index].value;
      }

    } else if (type == 'button') {
      var selectedButtons = filter.controllers[index].querySelectorAll('.js-filter-selected');
      filter.filterString[index] = '';
      for (var i = 0; i < selectedButtons.length; i++) {
        filter.filterString[index] = filter.filterString[index] + selectedButtons[i].getAttribute('data-filter') + ':';
      }
    } else if (type == 'custom') {
      filter.filterString[index] = filter.controllers[index].getAttribute('data-filter');
    }
  }

  function resetControllersList(filter, index, target1, target2) {
    
    // For a <button>s list -> toggle js-filter-selected + custom classes
    var multi = filter.controllers[index].getAttribute('data-filter-checkbox'),
      customClass = filter.controllers[index].getAttribute('data-selected-class');

    customClass = customClass ? 'js-filter-selected ' + customClass : 'js-filter-selected';
    if (multi == 'true') {
      
      // Multiple options can be on
      target1
        ? Util.toggleClass(target1, customClass, !Util.hasClass(target1, 'js-filter-selected'))
        : Util.toggleClass(target2, customClass, !Util.hasClass(target2, 'js-filter-selected'));
    } else {
      
      // Only one element at the time
      // Remove the class from all siblings
      var selectedOption = filter.controllers[index].querySelector('.js-filter-selected');
      if (selectedOption) Util.removeClass(selectedOption, customClass);
      target1 ? Util.addClass(target1, customClass) : Util.addClass(target2, customClass);
    }
  }

  function updateFilterArray(filter) {
    
    // Sort/filter strings have been updated -> so you can update the gallery
    if (filter.animating) {
      filter.reanimate = true;
      return;
    }
    filter.animating = true;
    filter.reanimate = false;
    createGridInfo(filter); // Get new grid coordinates
    sortingGallery(filter); // Update sorting list
    filteringGallery(filter); // Update filter list
    resetFallbackMessage(filter, true); // Toggle fallback message
    if (reducedMotion || filter.animateOff) {
      resetItems(filter);
    } else {
      updateItemsAttributes(filter);
    }
  }

  function sortingGallery(filter) {
    
    // Use sorting string to reorder gallery
    var sortOptions = filter.sortingString.split(':');
    if (sortOptions[0] == '' || sortOptions[0] == '*') {
      
      // No sorting needed
      restoreSortOrder(filter);
    } else {
      
      // Need to sort
      if (filter.options[sortOptions[0]]) {
        
        // Custom sort function -> user takes care of it
        filter.sortingList = filter.options[sortOptions[0]](filter.sortingList);
      } else {
        filter.sortingList.sort(function(left, right) {
          var leftVal = left[0].getAttribute('data-sort-' + sortOptions[0]),
            rightVal = right[0].getAttribute('data-sort-' + sortOptions[0]);
          if (sortOptions[2] == 'number') {
            leftVal = parseFloat(leftVal);
            rightVal = parseFloat(rightVal);
          }
          if (sortOptions[1] == 'desc') return leftVal <= rightVal ? 1 : -1;
          else return leftVal >= rightVal ? 1 : -1;
        });
      }
    }
  }

  function filteringGallery(filter) {
    
    // Use filtering string to reorder gallery
    resetFilterSortArray(filter, true, false);

    // We can have multiple filters
    for (var i = 0; i < filter.filterString.length; i++) {
      
      // Check if multiple filters inside the same controller
      if (filter.filterString[i] != '' && filter.filterString[i] != '*' && filter.filterString[i] != ' ') {
        singleFilterGallery(filter, filter.filterString[i].split(':'));
      }
    }
  }

  function singleFilterGallery(filter, subfilter) {
    if (!subfilter || subfilter == '' || subfilter == '*') return;

    // Check if we have custom options
    var customFilterArray = [];
    for (var j = 0; j < subfilter.length; j++) {
      if (filter.options[subfilter[j]]) {
        
        // Custom function
        customFilterArray[subfilter[j]] = filter.options[subfilter[j]](filter.items);
      }
    }

    for (var i = 0; i < filter.items.length; i++) {
      var filterValues = filter.items[i].getAttribute('data-filter').split(' ');
      var present = false;
      for (var j = 0; j < subfilter.length; j++) {
        if (filter.options[subfilter[j]] && customFilterArray[subfilter[j]][i]) {
          
          // Custom function
          present = true;
          break;
        } else if (subfilter[j] == '*' || filterValues.indexOf(subfilter[j]) > -1) {
          present = true;
          break;
        }
      }
      filter.filterList[i] = !present ? false : filter.filterList[i];
    }
  }

  function updateItemsAttributes(filter) {
    
    // Set items before triggering the update animation
    // Get offset of all elements before animation
    storeOffset(filter, filter.itemsInitPosition);

    // Set height of container
    filter.element.setAttribute(
      'style',
      'height: ' + parseFloat(filter.element.offsetHeight) + 'px; width: ' + parseFloat(filter.element.offsetWidth) + 'px;'
    );

    for (var i = 0; i < filter.items.length; i++) {
      
      // Remove u-hidden class from items now visible and scale to zero
      if (Util.hasClass(filter.items[i], 'u-hidden') && filter.filterList[i]) {
        filter.items[i].setAttribute('data-scale', 'on');
        filter.items[i].setAttribute('style', filter.accelerateStyle + 'transform: scale(0.5); opacity: 0;');
        Util.removeClass(filter.items[i], 'u-hidden');
      }
    }

    // Get new elements offset
    storeOffset(filter, filter.itemsIterPosition);

    // Translate items so that they are in the right initial position
    for (var i = 0; i < filter.items.length; i++) {
      if (filter.items[i].getAttribute('data-scale') != 'on') {
        filter.items[i].setAttribute(
          'style',
          filter.accelerateStyle +
            'transform: translateX(' +
            parseInt(filter.itemsInitPosition[i][0] - filter.itemsIterPosition[i][0]) +
            'px) translateY(' +
            parseInt(filter.itemsInitPosition[i][1] - filter.itemsIterPosition[i][1]) +
            'px);'
        );
      }
    }

    animateItems(filter);
  }

  function animateItems(filter) {
    var transitionValue =
      'transform ' + filter.options.duration + 'ms cubic-bezier(0.455, 0.03, 0.515, 0.955), opacity ' + filter.options.duration + 'ms';

    // Get new index of items in the list
    var j = 0;
    for (var i = 0; i < filter.sortingList.length; i++) {
      var item = filter.items[filter.sortingList[i][1]];

      if (Util.hasClass(item, 'u-hidden') || !filter.filterList[filter.sortingList[i][1]]) {
        
        // Item is hidden or was previously hidden -> final position equal to first one
        filter.itemsFinalPosition[filter.sortingList[i][1]] = filter.itemsIterPosition[filter.sortingList[i][1]];
        if (item.getAttribute('data-scale') == 'on') j = j + 1;
      } else {
        filter.itemsFinalPosition[filter.sortingList[i][1]] = [filter.itemsGrid[j][0], filter.itemsGrid[j][1]];

        // Left/top
        j = j + 1;
      }
    }

    setTimeout(function() {
      for (var i = 0; i < filter.items.length; i++) {
        if (filter.filterList[i] && filter.items[i].getAttribute('data-scale') == 'on') {
          
          // Scale up item
          filter.items[i].setAttribute(
            'style',
            filter.accelerateStyle +
              'transition: ' +
              transitionValue +
              '; transform: translateX(' +
              parseInt(filter.itemsFinalPosition[i][0] - filter.itemsIterPosition[i][0]) +
              'px) translateY(' +
              parseInt(filter.itemsFinalPosition[i][1] - filter.itemsIterPosition[i][1]) +
              'px) scale(1); opacity: 1;'
          );
        } else if (filter.filterList[i]) {
          
          // Translate item
          filter.items[i].setAttribute(
            'style',
            filter.accelerateStyle +
              'transition: ' +
              transitionValue +
              '; transform: translateX(' +
              parseInt(filter.itemsFinalPosition[i][0] - filter.itemsIterPosition[i][0]) +
              'px) translateY(' +
              parseInt(filter.itemsFinalPosition[i][1] - filter.itemsIterPosition[i][1]) +
              'px);'
          );
        } else {
          
          // Scale down item
          filter.items[i].setAttribute(
            'style',
            filter.accelerateStyle + 'transition: ' + transitionValue + '; transform: scale(0.5); opacity: 0;'
          );
        }
      }
    }, 50);

    // Wait for the end of transition of visible elements
    setTimeout(function() {
      resetItems(filter);
    }, filter.options.duration + 100);
  }

  function resetItems(filter) {
    
    // Animation was off or animation is over -> reset attributes
    for (var i = 0; i < filter.items.length; i++) {
      filter.items[i].removeAttribute('style');
      Util.toggleClass(filter.items[i], 'u-hidden', !filter.filterList[i]);
      filter.items[i].removeAttribute('data-scale');
    }

    for (var i = 0; i < filter.items.length; i++) {
     
      // Reorder
      filter.element.appendChild(filter.items[filter.sortingList[i][1]]);
    }

    filter.items = [];
    filter.items = filter.element.querySelectorAll('.js-filter__item');
    resetFilterSortArray(filter, false, true);
    filter.element.removeAttribute('style');
    filter.animating = false;
    if (filter.reanimate) {
      updateFilterArray(filter);
    }

    resetFallbackMessage(filter, false);

    // Toggle fallback message
    // Emit custom event - end of filtering
    filter.element.dispatchEvent(new CustomEvent('filter-selection-updated'));
  }

  function resetFilterSortArray(filter, filtering, sorting) {
    for (var i = 0; i < filter.items.length; i++) {
      if (filtering) filter.filterList[i] = true;
      if (sorting) filter.sortingList[i] = [filter.items[i], i];
    }
  }

  function createGridInfo(filter) {
    var containerWidth = parseFloat(window.getComputedStyle(filter.element).getPropertyValue('width')),
      itemStyle,
      itemWidth,
      itemHeight,
      marginX,
      marginY,
      colNumber;

    // Get offset first visible element
    for (var i = 0; i < filter.items.length; i++) {
      if (!Util.hasClass(filter.items[i], 'u-hidden')) {
        (itemStyle = window.getComputedStyle(filter.items[i])),
          (itemWidth = parseFloat(itemStyle.getPropertyValue('width'))),
          (itemHeight = parseFloat(itemStyle.getPropertyValue('height'))),
          (marginX = parseFloat(itemStyle.getPropertyValue('margin-left')) + parseFloat(itemStyle.getPropertyValue('margin-right'))),
          (marginY = parseFloat(itemStyle.getPropertyValue('margin-bottom')) + parseFloat(itemStyle.getPropertyValue('margin-top'))),
          (colNumber = parseInt((containerWidth + marginX) / (itemWidth + marginX)));
        filter.itemsGrid[0] = [filter.items[i].offsetLeft, filter.items[i].offsetTop]; // Left, top
        break;
      }
    }

    for (var i = 1; i < filter.items.length; i++) {
      var x = i < colNumber ? i : i % colNumber,
        y = i < colNumber ? 0 : Math.floor(i / colNumber);
      filter.itemsGrid[i] = [filter.itemsGrid[0][0] + x * (itemWidth + marginX), filter.itemsGrid[0][1] + y * (itemHeight + marginY)];
    }
  }

  function storeOffset(filter, array) {
    for (var i = 0; i < filter.items.length; i++) {
      array[i] = [filter.items[i].offsetLeft, filter.items[i].offsetTop];
    }
  }

  function initItemsOrder(filter) {
    for (var i = 0; i < filter.items.length; i++) {
      filter.items[i].setAttribute('data-init-sort-order', i);
    }
  }

  function restoreSortOrder(filter) {
    for (var i = 0; i < filter.items.length; i++) {
      filter.sortingList[parseInt(filter.items[i].getAttribute('data-init-sort-order'))] = [filter.items[i], i];
    }
  }

  function resetFallbackMessage(filter, bool) {
    if (!filter.fallbackMessage) return;
    var show = true;
    for (var i = 0; i < filter.filterList.length; i++) {
      if (filter.filterList[i]) {
        show = false;
        break;
      }
    }
    if (bool) {
      
      // Reset visibility before animation is triggered
      if (!show) Util.addClass(filter.fallbackMessage, 'u-hidden');
      return;
    }
    Util.toggleClass(filter.fallbackMessage, 'u-hidden', !show);
  }

  function getMultipleSelectValues(multipleSelect) {
    
    // Get selected options of a <select multiple> element
    var options = multipleSelect.options,
      value = '';
    for (var i = 0; i < options.length; i++) {
      if (options[i].selected) {
        if (value != '') value = value + ':';
        value = value + options[i].value;
      }
    }
    return value;
  }

  Filter.defaults = {
    element: false,
    duration: 400
  };

  window.Filter = Filter;

  // Init Filter object
  var filterGallery = document.getElementsByClassName('js-filter'),
    reducedMotion = Util.osHasReducedMotion();
  if (filterGallery.length > 0) {
    for (var i = 0; i < filterGallery.length; i++) {
      var duration = filterGallery[i].getAttribute('data-filter-duration');
      if (!duration) duration = Filter.defaults.duration;
      new Filter({ element: filterGallery[i], duration: duration });
    }
  }
})();


// ADVANCED FILTERS
(function() {
  
  // The Adv Filter object is used to handle:

  // - number of results
  // - form reset
  // - filtering sections label (to show a preview of the option selected by the users)

  var AdvFilter = function(element) {
   
    this.element = element;
    this.form = this.element.getElementsByClassName('js-adv-filter__form');
    this.resultsList = this.element.getElementsByClassName('js-adv-filter__gallery')[0];
    this.resultsCount = this.element.getElementsByClassName('js-adv-filter__results-count');
    this.showCount = this.element.getElementsByClassName('js-adv-filter__show-results');

    initAdvFilter(this);

  };

  function initAdvFilter(filter) {
    if (filter.form.length > 0) {
      
      // Reset form
      filter.form[0].addEventListener('reset', function(event) {
        setTimeout(function() {
          resetFilters(filter);
          resetGallery(filter);
        });
      });

      // Update section labels on form change
      filter.form[0].addEventListener('change', function(event) {
        var section = event.target.closest('.js-adv-filter__item');
        if (section) resetSelection(filter, section);
        else if (Util.is(event.target, '.js-adv-filter__form')) {
          
          // Reset the entire form lables
          var sections = filter.form[0].getElementsByClassName('js-adv-filter__item');
          for (var i = 0; i < sections.length; i++) resetSelection(filter, sections[i]);
        }
      });
    }

    // Reset results count
    if (filter.resultsCount.length > 0) {
      filter.resultsList.addEventListener('filter-selection-updated', function(event) {
        updateResultsCount(filter);
      });
    }
  }

  function resetFilters(filter) {
    
    // Check if there are custom form elemets - reset appearance
    // Custom select
    var customSelect = filter.element.getElementsByClassName('js-select');
    if (customSelect.length > 0) {
      for (var i = 0; i < customSelect.length; i++) customSelect[i].dispatchEvent(new CustomEvent('select-updated'));
    }

    // Custom slider
    var customSlider = filter.element.getElementsByClassName('js-slider');
    if (customSlider.length > 0) {
      for (var i = 0; i < customSlider.length; i++) customSlider[i].dispatchEvent(new CustomEvent('slider-updated'));
    }
  }

  function resetSelection(filter, section) {
    
    // Change label value based on input types
    var labelSelection = section.getElementsByClassName('js-adv-filter__selection');
    if (labelSelection.length == 0) return;

    // Select
    var select = section.getElementsByTagName('select');
    if (select.length > 0) {
      labelSelection[0].textContent = getSelectLabel(section, select[0]);
      return;
    }

    // Input number
    var number = section.querySelectorAll('input[type="number"]');
    if (number.length > 0) {
      labelSelection[0].textContent = getNumberLabel(section, number);
      return;
    }

    // Input range
    var slider = section.querySelectorAll('input[type="range"]');
    if (slider.length > 0) {
      labelSelection[0].textContent = getSliderLabel(section, slider);
      return;
    }

    // Radio/checkboxes
    var radio = section.querySelectorAll('input[type="radio"]'),
      checkbox = section.querySelectorAll('input[type="checkbox"]');
    if (radio.length > 0) {
      labelSelection[0].textContent = getInputListLabel(section, radio);
      return;
    } else if (checkbox.length > 0) {
      labelSelection[0].textContent = getInputListLabel(section, checkbox);
      return;
    }
  }

  function getSelectLabel(section, select) {
    if (select.multiple) {
      var label = '',
        counter = 0;
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].selected) {
          label = label + '' + select.options[i].text;
          counter = counter + 1;
        }
        if (counter > 1) label = section.getAttribute('data-multi-select-text').replace('{n}', counter);
      }
      return label;
    } else {
      return select.options[select.selectedIndex].text;
    }
  }

  function getNumberLabel(section, number) {
    var counter = 0;
    for (var i = 0; i < number.length; i++) {
      if (number[i].value != number[i].min) counter = counter + 1;
    }
    if (number.length > 1) {
      
      // Multiple input number in this section
      if (counter > 0) {
        return section.getAttribute('data-multi-select-text').replace('{n}', counter);
      } else {
        return section.getAttribute('data-default-text');
      }
    } else {
      if (number[0].value == number[0].min) return section.getAttribute('data-default-text');
      else return section.getAttribute('data-number-format').replace('{n}', number[0].value);
    }
  }

  function getSliderLabel(section, slider) {
    var label = '',
      labelFormat = section.getAttribute('data-number-format');
    for (var i = 0; i < slider.length; i++) {
      if (i != 0) label = label + ' - ';
      label = label + labelFormat.replace('{n}', slider[i].value);
    }
    return label;
  }

  function getInputListLabel(section, inputs) {
    var counter = 0;
    label = '';
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].checked) {
        var labelElement = inputs[i].parentNode.getElementsByTagName('label');
        if (labelElement.length > 0) label = labelElement[0].textContent;
        counter = counter + 1;
      }
    }
    if (counter > 1) return section.getAttribute('data-multi-select-text').replace('{n}', counter);
    else if (counter == 0) return section.getAttribute('data-default-text');
    else return label;
  }

  function resetGallery(filter) {
    
    // Emit change event + reset filtering
    filter.form[0].dispatchEvent(new CustomEvent('change'));
    filter.resultsList.dispatchEvent(new CustomEvent('update-filter-results'));
  }



  function updateResultsCount(filter) {
   
    var resultItems = filter.resultsList.children, counter = 0;

    for (var i = 0; i < resultItems.length; i++) {
      if (isVisible(resultItems[i])) counter = counter + 1;
    }

    filter.resultsCount[0].textContent = counter; // Update results count
    filter.showCount[0].textContent = counter; // Update show count

  }



  function isVisible(element) {
    return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
  }

  // Initialize the AdvFilter objects
  var advFilter = document.getElementsByClassName('js-adv-filter');
  if (advFilter.length > 0) {
    for (var i = 0; i < advFilter.length; i++) {
      (function(i) {
        new AdvFilter(advFilter[i]);
      })(i);
    }
  }

  // Remove the code below if you want to use a custom filtering function (e.g., you need to fetch your results from a database)

  // The code below is used for filtering of page content (animation of DOM elements, no fetching results from database).
  // It uses the Filter component - you can modify the custom filtering functions based on your needs.

  var gallery = document.getElementById('adv-filter-gallery');

  if (gallery) {
    new Filter({
      element: gallery,

      // This is your gallery element
      priceRange: function(items) {
        
        // This is the price custom function
        var filteredArray = [],
          minVal = document.getElementById('slider-min-value').value,
          maxVal = document.getElementById('slider-max-value').value;
        for (var i = 0; i < items.length; i++) {
          var price = parseInt(items[i].getAttribute('data-price'));
          filteredArray[i] = price >= minVal && price <= maxVal;
        }
        return filteredArray;
      },
      indexValue: function(items) {
        
        // This is the index custom function
        var filteredArray = [],
          value = document.getElementById('index-value').value;
        for (var i = 0; i < items.length; i++) {
          var index = parseInt(items[i].getAttribute('data-sort-index'));
          filteredArray[i] = index >= value;
        }
        return filteredArray;
      }
    });
  }
})();


// TOGGLE FILTERS
(function() {

  var filters = document.getElementsByClassName('js-adv-filter');

  if (filters.length > 0) {
    
    var filtersTrigger = filters[0].getElementsByClassName('js-adv-filter__trigger')[0];
    var filtersClose = filters[0].getElementsByClassName('js-adv-filter__close')[0];
    var filtersShow = filters[0].getElementsByClassName('js-adv-filter__show')[0];
    var filtersPanel = filters[0].getElementsByClassName('js-adv-filter__panel')[0];
    var body = document.getElementsByTagName('body')[0];

    // Detect click on filters trigger
    filtersTrigger.addEventListener('click', function(event) {
      event.preventDefault();
      toggleFilters(!Util.hasClass(filtersPanel, 'adv-filter__panel--is-visible'));
    });

    // Detect click on update
    filtersShow.addEventListener('click', function(event) {
      event.preventDefault();
      filtersTrigger.click();
    });

    // Detect click on close
    filtersClose.addEventListener('click', function(event) {
      event.preventDefault();
      filtersTrigger.click();
    });

    // Listen for key events
    window.addEventListener('keyup', function(event) {
     
      // Listen for ESC key
      if ((event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape')) {

        // Close filter panel on mobile if open
        if (filtersTrigger.getAttribute('aria-expanded') == 'true' && isVisible(filtersTrigger)) {
          filtersTrigger.click();
        }
      }

    });

    // Listen for resize
    var resizingId = false;

    window.addEventListener('resize', function() {
      clearTimeout(resizingId);
      resizingId = setTimeout(doneResizing, 500);
    });

    function doneResizing() {
      if (!isVisible(filtersTrigger)) toggleFilters(false);
    }

    function isVisible(element) {
      return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
    }

    // Toggle filters visibility on small devices
    function toggleFilters(bool) {
      Util.toggleClass(filtersPanel, 'adv-filter__panel--is-visible', bool);
      Util.toggleClass(body, 'no-scroll', bool);
      filtersTrigger.setAttribute('aria-expanded', bool);
    }
  }

})();
