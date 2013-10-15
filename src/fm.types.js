/**
 * @fileOverview This file has functions related to variable types.
 * @review isipka
 */

/**
 * Determine if a variable is set.
 * 
 * @static
 * @function 
 * @param v The variable to be checked.
 * @returns {boolean} 
 */
FM.isset = function(v) {
    return (typeof(v) != 'undefined');
}

/**
 * Determine if a variable is string.
 * 
 * @static
 * @function 
 * @param  v The variable to be checked.
 * @returns {boolean} 
 */
FM.isString = function(v) {
    return (typeof v == 'string' && v !== null);
}

/**
 * Determine if a variable is number.
 * 
 * @static
 * @function 
 * @param v The variable to be checked.
 * @returns {boolean} 
 */
FM.isNumber = function(v) {
    return !isNaN(parseFloat(v));
}
/**
 * Determine if a variable is number.
 * 
 * @static
 * @function 
 * @param v The variable to be checked.
 * @returns {boolean} 
 */
FM.isBoolean = function(v) {
    return (typeof v == 'boolean' && v !== null);
}

/**
 * Determine if a variable is function.
 * 
 * @static
 * @function 
 * @param v The variable to be checked.
 * @returns {boolean} 
 */
FM.isFunction = function(v) {
    return (typeof v == 'function' && v !== null);
}

/**
 * Determine if a variable is array.
 * 
 * @static
 * @function 
 * @param v The variable to be checked.
 * @returns {boolean} 
 */
FM.isArray = function(v) {
    if (!FM.isset(v) || !v) {
        return false;
    }
    
    if (v.constructor.toString().indexOf("Array") == -1) {
        return false;
    }

    return FM.isset(v.length);
}

/**
 * Determine if a variable is object.
 * 
 * @static
 * @function 
 * @param v The variable to be checked.
 * @returns {boolean} 
 */
FM.isObject = function(v) {
    return (typeof v == 'object' && v !== null);
}


/**
 * Count all elements in an array or object.
 * 
 * @static
 * @function 
 * @param {Object|Array} o The array or object to be checked.
 * @returns {number} Number of elements in array or object.
 */
FM.sizeOf = function(o) {
    if (!FM.isset(o) || o == null)
        return(-1);
    var i = 0;
    for (var id in o) {
        i++;
    }
    return(i);
}

// -- STRING ---------------------------------------------------------------
/**
 * Strip whitespace from the beginning and end of a string.
 * 
 * @static
 * @function 
 * @param {string} s The string that will be trimmed.
 * @returns {string} 
 */
FM.trim = function(s) {
    if (!FM.isset(s) || s == null)
        return('');
    var ss = '' + s;
    return ss.replace(/^\s+|\s+$/g, "");
}

/**
 * Strip whitespace from the beginning of a string.
 * 
 * @static
 * @function 
 * @param {string} s The string that will be trimmed.
 * @returns {string} 
 */
FM.ltrim = function(s) {
    if (!FM.isset(s) || s == null)
        return('');
    var ss = '' + s;
    return ss.replace(/^\s+/, "");
}


/**
 * Strip whitespace from the end of a string.
 * 
 * @static
 * @function 
 * @param {string} s The string that will be trimmed.
 * @returns {string} 
 */
FM.rtrim = function(s) {
    if (!FM.isset(s) || s == null)
        return('');
    var ss = '' + s;
    return ss.replace(/\s+$/, "");
}


/**
 * Determines whether the beginning of this string matches a specified string.
 * 
 * @static
 * @function 
 * @param {string} instr The string to be checked.
 * @param {string} fstr the prefix to be matched.
 * @returns {boolean} 
 */
FM.startsWith = function(instr, fstr) {
    return (instr ? instr.match("^" + fstr) == fstr : false);
}

/**
 * Determines whether the end of this string matches a specified string.
 * 
 * @static
 * @function 
 * @param {string} instr The string to be checked.
 * @param {string} fstr the sufix to be matched.
 * @returns {boolean} 
 */
FM.endsWith = function(instr, fstr) {
    return (instr ? instr.match(fstr + "$") == fstr : false);
}

/**
 * Encodes string to UTF-8.
 * 
 * @static
 * @function 
 * @param {string} s String to encode.
 * @returns {string} 
 */
FM.utf8_encode = function(s) {
    return unescape(encodeURIComponent(s));
}

/**
 *  Converts a string encoded with UTF-8 to system code page.
 * 
 * @static
 * @function 
 * @param {string} s String to decode.
 * @returns {string} 
 */
FM.utf8_decode = function(s) {
    return decodeURIComponent(escape(s));
}

/**
 *  Returns a string with backslashes before characters that need to be quoted. 
 *  These characters are single quote ('), double quote (") and backslash.
 * 
 * @static
 * @function 
 * @param {string} str The string to be escaped.
 * @returns {string} 
 */
FM.addslashes = function(str) {
    str = str.replace(/\\/g, '\\\\');
    str = str.replace(/\'/g, '\\\'');
    str = str.replace(/\"/g, '\\"');
    str = str.replace(/\0/g, '\\0');
    return str;
}

/**
 *  Un-quotes a quoted string
 * 
 * @static
 * @function 
 * @param {string} s The input string.
 * @returns {string} 
 */
FM.stripslashes = function(str) {
    str = str.replace(/\\'/g, '\'');
    str = str.replace(/\\"/g, '"');
    str = str.replace(/\\0/g, '\0');
    str = str.replace(/\\\\/g, '\\');
    return str;
}

/**
 * 
 * @ignore
 */
FM.tokenize = function(argsstr) {
    var i, instr;

    // napravi listu tokena
    var elm_array = [];
    var st_array = argsstr.split('"');

    instr = false;
    for (i = 0; i < st_array.length; i++) {
        // ako nisi u stringu
        if (!instr) {
            var e = st_array[i].split(/[\s,]+/);
            for (var j = 0; j < e.length; j++) {
                if (e[j] != "")
                    elm_array.push(e[j]);
            }
        } else {
            elm_array.push(st_array[i]);
        }

        instr = !instr;
    }

    return elm_array;
}


/**
 * Uppercase the first character of each word  in a input string except the first one.
 * The definition of a word is any string of characters that is immediately 
 * after a whitespace or minus sign.
 * 
 * @static
 * @function 
 * @param {string} input The input string.
 * @returns {string} 
 */
FM.camelCase = function(input) {
    return input.replace(/-([a-z])/ig, function(all, letter) {
        return letter.toUpperCase();
    });
}

/**
 * Uppercase the first character of each word in a string.
 * The definition of a word is any string of characters that is immediately 
 * after a whitespace or minus sign.
 * 
 * @static
 * @function 
 * @param {string} input The input string.
 * @returns {string} 
 */
FM.ucwords = function(input) {
    var words = input.split(/(\s|-)+/),
        output = [];

    for (var i = 0, len = words.length; i < len; i += 1) {
        output.push(words[i][0].toUpperCase() +
            words[i].toLowerCase().substr(1));
    }

    return output.join('');
}
