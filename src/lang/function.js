/** section: Language
 * class Function
 *  
 *  Extensions to the built-in `Function` object.
**/
Object.extend(Function.prototype, (function() {
  
  var slice = Array.prototype.slice;
  
  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }
  
  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }
  
  /**
   *  Function#argumentNames() -> Array
   *
   *  Reads the argument names as stated in the function definition and returns
   *  the values as an array of strings (or an empty array if the function is
   *  defined without parameters).
  **/
  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  /**
   *  Function#bind(object[, args...]) -> Function
   *  - object (Object): The object to bind to.
   *
   *  Wraps the function in another, locking its execution scope to an object
   *  specified by `object`.
  **/
  function bind(context) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = slice.call(arguments, 1);
    if (args.length) {
      return function() {
        return __method.apply(context, arguments.length ? merge(args, arguments) : args);
      };
    }
    return function() {
      return arguments.length 
        ? __method.apply(context, arguments) 
        : __method.call(context);
    }
  }

  /** related to: Function#bind
   *  Function#bindAsEventListener(object[, args...]) -> Function
   *  - object (Object): The object to bind to.
   *
   *  An event-specific variant of [[Function#bind]] which ensures the function
   *  will recieve the current event object as the first argument when
   *  executing.
  **/
  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    if (args.length) {
      return function(event) {
        var a = update([event || window.event], args);
        return __method.apply(context, a);
      }
    }
    return function(event) {
      return __method.call(context, event || window.event);
    }
  }

  /**
   *  Function#curry(args...) -> Function
   *  Partially applies the function, returning a function with one or more
   *  arguments already “filled in.”
   *
   *  Function#curry works just like [[Function#bind]] without the initial
   *  scope argument. Use the latter if you need to partially apply a function
   *  _and_ modify its execution scope at the same time.
  **/
  function curry() {
    if (!arguments.length) return this;
    var __method = this, args = slice.call(arguments, 0);
    return function() {
      return __method.apply(this, arguments.length ? merge(args, arguments) : args)
    };
  }

  /**
   *  Function#delay(seconds[, args...]) -> Number
   *  - seconds (Number): How long to wait before calling the function.
   *
   *  Schedules the function to run after the specified amount of time, passing
   *  any arguments given.
   *
   *  Behaves much like `window.setTimeout`. Returns an integer ID that can be
   *  used to clear the timeout with `window.clearTimeout` before it runs.
   *
   *  To schedule a function to run as soon as the interpreter is idle, use
   *  [[Function#defer]].
  **/
  function delay(timeout) { 
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000;
    var fn = args.length
      ? function() { return __method.apply(__method, args); }
      : function() { return __method.call(__method); }
    return window.setTimeout(fn, timeout);
  }

  /**
   *  Function#defer(args...) -> Number
   *  Schedules the function to run as soon as the interpreter is idle.
   *
   *  A “deferred” function will not run immediately; rather, it will run as soon
   *  as the interpreter’s call stack is empty.
   *
   *  Behaves much like `window.setTimeout` with a delay set to `0`. Returns an
   *  ID that can be used to clear the timeout with `window.clearTimeout` before
   *  it runs.
  **/
  function defer() {
    return arguments.length
      ? this.delay.apply(this, update([0.01], arguments))
      : this.delay(0.01)
  }

  /**
   *  Function#wrap(wrapperFunction) -> Function
   *  - wrapperFunction (Function): The function to act as a wrapper.
   *
   *  Returns a function “wrapped” around the original function.
   *
   *  `Function#wrap` distills the essence of aspect-oriented programming into
   *  a single method, letting you easily build on existing functions by
   *  specifying before and after behavior, transforming the return value, or
   *  even preventing the original function from being called.
  **/
  function wrap(wrapper) {
    var __method = this;
    return function() {
      return arguments.length
        ? wrapper.apply(this, update([__method.bind(this)], arguments))
        : wrapper.call(this, __method.bind(this));
    };
  }

  /**
   *  Function#methodize() -> Function
   *  Wraps the function inside another function that, at call time, pushes
   *  `this` to the original function as the first argument.
   *
   *  Used to define both a generic method and an instance method.
  **/
  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return (this._methodized = function() {
      return arguments.length
        ? __method.apply(null, update([this], arguments))
        : __method(this);
    });
  }
  
  return {
    argumentNames:       argumentNames,
    bind:                bind,
    bindAsEventListener: bindAsEventListener,
    curry:               curry,
    delay:               delay,
    defer:               defer,
    wrap:                wrap,
    methodize:           methodize
  };
})());