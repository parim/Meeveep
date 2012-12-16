/**
 * Utilities, polyfills and fallbacks
 */

/**
 * Array.forEach() polyfill
 * @param {Function} callback The function to call for each element of the array
 */
Array.prototype.forEach = Array.prototype.forEach || function(callback, thisObject) {
    var i, that = this;
    thisObject = thisObject || window;
    
    if('function' !== (typeof callback)) {
        return;
    }
    
    for ( i = 0; i < that.length; i++ ) {
        callback.call(thisObject, that[i], i, that);
    }
};

/**
 * Get the first found position of an element in the array
 * @param {Object} Something to search for in the array
 * @param {Number} fromIndex (optional) A zero-based index to start searching from
 * @return {Number} Returns the zero-based index of the first occurence of
 *  <code>searchElement</code> in this array or <code>-1</code> if not found.
 */
Array.prototype.indexOf = Array.prototype.indexOf || function(searchElement, fromIndex) {
    fromIndex = parseInt(fromIndex) || 0;
    
    for ( var i = fromIndex; i < this.length; i++ ) {
        if ( this[i] === searchElement ) {
            return i;
        }
    }
    
    return -1;
};

/**
 * Get an array of all the elements this array has in common with another array
 * @param {Array} array The array to check intersect this one with
 * @return {Array} Returns a new array containing all elements found in this array
 *  and the supplied array.
 */
Array.prototype.intersect = Array.prototype.intersect || function(array) {
    var intersect = [], i;

    if(array instanceof Array) {
        for ( i = 0; i < array.length; i++ ) {
            if ( this.indexOf(array[i]) >= 0 ) {
                intersect.push(array[i]);
            }
        }
    }

    return intersect;
};

/**
 * Get the difference between this array and the specified array
 * @param {Array} array The array to compare against
 * @return {Array} A new array containing the differences in the two arrays
 */
Array.prototype.difference = Array.prototype.difference || function(array) {
    var i, el,
        intersect = this.intersect(array),
        combined = this.union(array);

    for ( i = 0; i < intersect.length; i++ ) {
        el = intersect[i];
        
        delete combined[combined.indexOf(el)];
    }

    return combined.unique();
};

/**
 * Get the (unique) union of this array and other arrays
 * @param {Array} ...array Any number of arrays
 * @return {Array} A new array containing all the unique elements in all the arrays
 */
Array.prototype.union = Array.prototype.union || function (array) {
    var union = [],
        args = this.slice.apply(arguments);

    combine = function(element) {
        union.push(element);
    };
        
    this.forEach(combine);
    
    args.forEach(function(array) {
        if(array instanceof Array) {
            array.forEach(combine);
        }
    });
    
    return union.unique();
};

/**
 * Get all the unique elements in this array
 * @return {Array} A new array containing all the unique elements in this array
 */
Array.prototype.unique = Array.prototype.unique || function () {
    var unique = [];
    
    this.forEach(function(element) {
        if(unique.indexOf(element) === -1) {
            unique.push(element);
        }
    });
    
    return unique;
};

/**
 * Subtract the an array from this one
 * @param {Array} array The array to subtract from this one. To subtract multiple
 *  arrays, use chained calls.
 * @return {Array} A new array containing only the elements of this array that
 *  is not present in the provided array.
 */
Array.prototype.subtract = Array.prototype.subtract || function( array ) {
    var intersect = this.intersect(array);
    
    return this.difference(intersect);
}



$(function () {
    // Declare utility functions
    (function () {
        // Extend the functionality of functions
        $.extend(true, Function.prototype, {
            /**
             * Call a function after delaying some milliseconds
             * @param {Number} msec The number of milliseconds to delay
             * @param {Object} that The object to bind the <code>this</code> variale to
             * @param {mixed} ..args Any other arguments passed in will be passed to the function
             * @return {Number} Returns the ID of the timeout, which can be used to prevent
             *      the function from executing
             */
            defer: function (msec, that) {
                var args = Array.prototype.slice.call(arguments, 2),
                    me = this,
                    id = window.setTimeout(function () {
                        me.apply(that || window, args);
                    }, msec);
                
                return id;
            },
            
            /**
             * Prevent the function from executing as scheduled
             * @param {Number} timeId The ID returned by Function.defer or window.setTimeout
             */
            undefer: function (timeId) {
                window.clearTimeout(timeId);
            },
            
            /**
             * Schedule the function to execute at a regular interval
             * @param {Number} msec The time interval in milliseconds between
             *      automatic executions
             * @param {Object} that The object to bind <code>this</code> variable to
             * @param {mixed} ..args Any other arguments passed in will be passed to the function
             * @return {Number} Returns the ID of the interval that can be used with
             *      Function.unschedule or window.setTimeout
             */
             schedule: function (msec, that) {
                var args = Array.prototype.slice.call(arguments, 2),
                    me = this,
                
                id = window.setInterval(function () {
                    me.apply(that || window, args);
                }, msec);
                
                return id;
             },
            
            /**
             * Prevent the function from executing as scheduled
             * @param {Number} timeId The ID returned by Function.defer or window.setTimeout
             */
            unschedule: function (timeId) {
                window.clearTimeout(timeId);
            },
            
            /**
             * Creates a function mask for this function, which can be passed as
             * a callback function
             * @param {Object} that The object that <code>this</code> variable will be
             *      bound to
             * @param {mixed} ..args Any other argument will be passed back to this
             *      function
             */
            callback: function (that) {
                var args = Array.prototype.slice.call(arguments, 1),
                    me = this;
                
                return function () {
                    me.apply(that || this, args);
                };
            }
        });
        
        /**
         * String.printf helper functions
         */
        var printfMap = {
            /**
             * Formats input as string. <code>precision</code> signifies the maximum number of characters.
             */
            s: function (arg) {
                var value = arg.value.toString(),
                    padStr = arg.zeroPad ? '0' : (arg.padString || ' ');
                
                // Check for width...
                if(arg.precision) {
                    value = value.truncate(arg.precision);
                }
                
                if(arg.width) {
                    value = value.pad(arg.width, padStr);
                }
                
                return value;
            },
            
            /**
             * Formats input as a decimal digit. The padding character defaults to 0.
             * Precision is ignored. Uses <code>parseInt</code>.
             */
            d: function (arg) {
                var value = parseInt(arg.value, 10),
                    sign = ((value >= 0 && arg.sign) ? '+' : '');
                
                if(isNaN(value)) {
                    value = 0;
                }
                
                // Add padding
                if(arg.width) {
                    value = value.toString().pad(arg.width, arg.padString || 0);
                }
                
                // Add sign and return
                return sign + value.toString();
            },
            
            /**
             * Treats input as integer, but formats it as a binary number.
             */
            b: function (arg) {
                var value = this.d(arg);
                
                return parseInt(value, 10).toString(2);
            },
            
            /**
             * Treats input as integer, but formats it as an octal number.
             */
            o: function (arg) {
                var value = this.d(arg);
                
                return parseInt(value, 10).toString(8);
            },
            
            /**
             * Treats input as integer, but formats it as a hexadecimal number with lower case.
             */
            x: function (arg) {
                var value = this.d(arg);
                
                return parseInt(value, 10).toString(16).toLowerCase();
            },
            
            /**
             * The upper case version of <code>%x</code>
             */
            X: function (args) {
                return this.x(args).toUpperCase();
            },
            
            /**
             * Formats input as float. <code>width</code> is the minimum length of the final output, including any decimal points.
             */
            f: function (arg) {
                var value = parseFloat(arg.value) || 0,
                    sign = ((value >= 0 && arg.sign) ? '+' : ''),
                    precision = arg.precision,
                    
                    // Get the floated part of the number...
                    integer = (value < 0 ? Math.ceil(value) : Math.floor(value)),
                    floatedNumber = Math.abs(value - integer),
                    
                    // Furure variables...
                    divisor, divided, normalized;
                
                // Apply precision
                if(precision) {
                    // Make sure the floated number is up to the precision digits
                    floatedNumber = floatedNumber.toString().pad(precision, 0, 'right');
                    floatedNumber = floatedNumber * Math.pow(10, floatedNumber.toString().length - 2);
                    
                    divisor = Math.pow(10, floatedNumber.toString().length - precision);
                    divided = floatedNumber / divisor;
                    normalized = Math.round(divided);
                    
                    if(normalized >= Math.pow(10, precision)) {
                        // A number was carried
                        integer += 1;
                    }
                    
                    value = integer.toString() + '.' + normalized.toString().truncate(precision);
                }
                
                // Add padding
                if(arg.width) {
                    value = value.toString().pad(arg.width, arg.padString || 0);
                }
                
                // Add sign and return
                return sign + value.toString();
            },
            
            /**
             * Treats input as integer, but returns the ASCII character with that character code.
             * Uses <code>parseInt</code>.
             */
            c: function (args) {
                return String.fromCharCode(parseInt(args.value, 10));
            },
            
            /**
             * Treats the input as Number and outputs it as scientific notation.
             * Ignores width.
             */
            e: function (args) {
                var value = parseFloat(args.value),
                    sign = ((value >= 0 && args.sign) ? '+' : '');
                
                if(isNaN(value)) {
                    value = 0;
                }
                
                if(isNaN(parseInt(args.precision, 10))) {
                    // no precision...
                    value = value.toExponential();
                } else {
                    value = value.toExponential(args.precision);
                }
                
                if('E' === args.format) {
                    value = value.replace('e', 'E');
                }
                
                return sign + value.toString();
            },
            
            /**
             * The same as <code>%e</code>, but the exponent is specified using capital E.
             */
            E: function (args) {
                return this.e(args);
            },
            
            /**
             * Returns the shorter of %e and %f
             */
            g: function (args) {
                var e = this.e(args),
                    f = this.f(args);
                
                return (e.length <= f.length) ? e : f;
            },
            
            /**
             * Returns the shorter of %E and %f
             */
            G: function (args) {
                var E = this.E(args),
                    f = this.f(args);
                
                return (E.length <= f.length) ? E : f;
            }
        };
        
        // Extend the functionality of strings
        $.extend(true, String.prototype, {
            /**
             * Tries to convert the string to an integer. Uses <code>parseInt</code>.
             * @param {Number} dadix The radix to use for parsing
             * @return {Number} Returns an integer extracted from the string
             */
            parseInt: function (radix) {
                return parseInt(this, radix);
            },
            
            /**
             * Tries to convert the string to a floating point number. Uses <code>parseFloat</code>.
             * @return Returns a float extracted from the string
             */
            parseFloat: function () {
                return parseFloat(this);
            },
            
            /**
             * Formats the string, replacing placeholders with specified values
             * @param ..args The arguments to use in formatting the string. The first argument will be
             *      used to replace all occurences of {0}, argument n-1 will be used to replace all
             *      occurences of {n}. Throws an error if an argument could not be found for a specified
             *      index.
             * @return {String} Returns a new string with placeholders replaced.
             */
            format: function () {
                var args = arguments;
                
                return this.replace(/\{(\d+)\}/g, function (a, i) {
                    if('undefined' === typeof args[i]) {
                        throw new Error('Value for index {0} is undefined'.format(i));
                    }
                    
                    return args[i];
                });
            },
            
            /**
             * Formats the string using a function similar to C's prinft function.
             * The format closely follows PHP's printf formats.
             * @param ..args The arguments to use for filling in the placeholders.
             *      Throws error if an argument cannot be found for a placeholder.
             */
            printf: function () {
                var args = arguments,
                    regexp = new RegExp('%([\\+])?(?:\'(.))?(0)?(\\d+)?(?:\\.(\\d+))?([a-z%])', 'gi'),
                    count = 0;
                
                return this.replace(regexp, function (a, sign, padString, zeroPad, width, precision, format) {
                    if('%' === format) {
                        return format;
                    }
                    
                    var cnt = count++,
                    arg = {
                        sign: ('+' === sign),
                        padString: padString,
                        zeroPad: ("0" === zeroPad),
                        width: width,
                        precision: precision,
                        format: format,
                        value: args[cnt]
                    };
                    
                    if(typeof args[cnt] === 'undefined' || args[cnt] === null) {
                        throw new Error('Not enough parameters');
                    }
                    
                    if(typeof printfMap[format] === 'function') {
                        // Function exists
                        return printfMap[format](arg);
                    }
                    
                    throw new Error('Invalid formatter {0}'.format(a));
                });
            },
            
            /**
             * Pad the string to a minimum length
             * @param {Number} width The minimum width to pad the string
             * @param {String} padString (optional) The string to use in padding. Defaults
             *      to space.
             */
            pad: function (width, padString, padType) {
                // Check if we need to pad at all
                if(this.length >= width) {
                    return this;
                }
                
                // Check for catastrophic data types
                if(typeof padString === 'undefined' || null === padString) {
                    padString = ' ';
                }
                
                // In case a non-string value was supplied...
                padString = padString.toString();
                
                // Check for empty string
                if(padString.length < 1) {
                    padString = ' ';
                }
                
                // Make sure we have only a single character
                padString = padString.substr(0, 1);
                
                // Calculate the number of strings we need to pad by
                var padLength = width - this.length;
                
                return 'right' === padType ? this + padString.repeat(padLength) : padString.repeat(padLength) + this;
            },
            
            /**
             * Truncate the string to a minimum width and append <code>appendString</code>
             * if anything was trincated.
             * @param {Number} width The maximum width of the string
             * @param {String} appendString (optional) The string to append, if and only if
             *      some string was truncated. This string is not counted in the <code>width</code>
             * @return {String} Returns a new string with a maximum width of <code>width</code>
             */
            truncate: function (width, appendString, rightJustify) {
                if(this.length > width) {
                    var start = rightJustify ? this.length - width : 0;
                    return this.substr(start, width) + (typeof appendString === 'undefined' ? '' : appendString);
                }
                
                return this;
            },
            
            /**
             * Repeats this string multiple times
             * @param {Number} count The number of times to repeat the string
             * @return {String} Returns the string repeated <code>count</count> times
             */
            repeat: function (count) {
                count = Math.max(count || 0, 0);
                return new Array(count + 1).join(this.valueOf());
            },
            
            /**
             * Trim the specified string from both ends of this string
             * @param {String} char The character to trim off the ends of this string. Defaults to space.
             */
            trim: function (char) {
                if('string' !== typeof char) {
                    char = '\\s';
                }
                
                return this.replace(new RegExp('^{0}*'.format(char)), '').replace(new RegExp('{0}*$'.format(char)), '');
            },
            
            rtrim: function (char) {
                if('string' !== typeof char) {
                    char = '\\s';
                }
                
                return this.replace(new RegExp('{0}*$'.format(char)), '');
            },
            
            ltrim: function (char) {
                if('string' !== typeof char) {
                    char = '\\s';
                }
                
                return this.replace(new RegExp('^{0}*'.format(char)), '');
            },
            
            itrim: function (char) {
                if('string' !== typeof char) {
                    char = '\\s';
                }
                
                return this.replace(new RegExp('^{0}*'.format(char)), '')
                            .replace(new RegExp('{0}*$'.format(char)), '')
                            .replace(new RegExp('{0}+'.format(char), 'g'), char);
            }
        });
    }());
});



function addCommas(nStr)
{
  nStr += '';
  x = nStr.split('.');
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
}