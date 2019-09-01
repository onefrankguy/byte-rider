let animations = [];

function Fn(selector) {
  if (selector instanceof Fn) {
    return selector;
  }

  this.element = selector;

  if (typeof selector === 'string') {
    if (selector.indexOf('#') === 0) {
      this.element = document.getElementById(selector.slice(1));
    }
  }

  return this;
}

Fn.prototype.addClass = function addClass(value) {
  if (this.element && this.element.classList && value) {
    this.element.classList.add(value);
  }

  return this;
};

Fn.prototype.removeClass = function removeClass(value) {
  if (this.element && this.element.classList) {
    this.element.classList.remove(value);
  }

  return this;
};

Fn.prototype.toggleClass = function toggleClass(value) {
  if (this.element && this.element.classList) {
    this.element.classList.toggle(value);
  }
};

Fn.prototype.html = function html(value) {
  if (this.element) {
    this.element.innerHTML = value;
  }

  return this;
};

Fn.prototype.offset = function offset() {
  const result = {
    left: window.scrollX,
    top: window.scrollY,
    width: 0,
    height: 0,
  };

  if (this.element) {
    const rect = this.element.getBoundingClientRect();
    result.left += rect.left;
    result.top += rect.top;
    result.width = rect.width;
    result.height = rect.height;
  }

  return result;
};

Fn.prototype.left = function left(value) {
  if (this.element) {
    if (value === undefined) {
      return parseInt(this.element.style.left, 10);
    }
    this.element.style.left = `${value}px`;
  }

  return this;
};

Fn.prototype.top = function top(value) {
  if (this.element) {
    if (value === undefined) {
      return parseInt(this.element.style.top, 10);
    }
    this.element.style.top = `${value}px`;
  }

  return this;
};

Fn.prototype.css = function css(property, value) {
  if (this.element && this.element.style) {
    if (value === undefined) {
      return this.element.style[property];
    }
    this.element.style[property] = value;
  }

  return this;
};

Fn.prototype.on = function on(event, callback) {
  if (this.element) {
    this.element.addEventListener(event, callback, false);
  }
};

Fn.prototype.off = function off(event, callback) {
  if (this.element) {
    this.element.removeEventListener(event, callback, false);
  }
};

Fn.prototype.click = function click(start, end) {
  const that = this;

  if (this.element) {
    if ('ontouchstart' in document.documentElement === false) {
      this.element.onmousedown = function onmousedown(mouseDownEvent) {
        if (start) {
          start(that, mouseDownEvent);
        }
        document.onmousemove = function onmousemove(e) {
          e.preventDefault();
        };
        document.onmouseup = function onmouseup(e) {
          if (end) {
            end(that, e);
          }
          document.onmousemove = undefined;
          document.onmouseup = undefined;
        };
      };
    } else {
      this.element.ontouchstart = function ontouchstart(touchStartEvent) {
        if (start) {
          start(that, touchStartEvent);
        }
        document.ontouchmove = function ontouchmove(e) {
          e.preventDefault();
        };
        document.ontouchend = function ontouchend(e) {
          if (end) {
            end(that, e);
          }
          document.ontouchmove = undefined;
          document.ontouchend = undefined;
        };
      };
    }
  }

  return this;
};

Fn.prototype.animate = function animate(klass, complete) {
  const self = this;

  function onTransitionEnd() {
    animations = animations.filter((a) => (
      a.element !== self
        && a.callback !== onTransitionEnd
        && a.klass !== klass
    ));

    self.off('webkitTransitionEnd', onTransitionEnd);
    self.off('otransitionend', onTransitionEnd);
    self.off('transitionend', onTransitionEnd);
    self.removeClass(klass);

    if (complete) {
      complete();
    }
  }

  if (this.element) {
    animations.push({ element: self, callback: onTransitionEnd, klass });
    this.on('webkitTransitionEnd', onTransitionEnd);
    this.on('otransitionend', onTransitionEnd);
    this.on('transitionend', onTransitionEnd);
    this.addClass(klass);
  }
};

Fn.prototype.unwrap = function unwrap() {
  return this.element;
};

function root(selector) {
  return new Fn(selector);
}

module.exports = root;
