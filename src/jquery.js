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

Fn.prototype.unwrap = function unwrap() {
  return this.element;
};

function root(selector) {
  return new Fn(selector);
}

module.exports = root;
