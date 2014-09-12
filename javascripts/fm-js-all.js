if(typeof(window.console) == 'undefined') {
    /** @ignore */
    window.console = new function() {
        /** @ignore */
        this.log = function() {}
    };
}


if(typeof(FM) == 'undefined') {
/**
 * @fileOverview This file has core FM functions.
 * @review isipka
 */

/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */

/**
 * FM is the name of the namespace that contains all of the core methods and objects.
 * 
 * @namespace 
 */
FM = {};


/**
 * FM version.
 * 
 * @static
 * @type string
 */
FM.version = '0.1';


/**
 * Generate a unique ID.
 * 
 * @static
 * @function 
 * @returns {string} New ID.
 */
FM.generateNewID = function() {
    return '_' + new Date().getTime() + "_" + Math.floor(Math.random() * 1000000);
}

/**
 * 
 * @ignore
 */
FM._uuidData = {
    count: 0,
    msec: 0,
    nsec: 0
};

FM.generateUUID = function() {
    var msec = new Date().getTime();
    var clockseq = Math.floor(Math.random() * 1000000) & 0x3fff;
    
    // simulate finer time resolution with cont
    FM._uuidData.count +=1;
    var nsec = FM._uuidData.count;
    
    // Time since last uuid creation (in msecs)
    var dt = (msec - FM._uuidData.msec) + (nsec - FM._uuidData.nsec)/10000;
    if (dt < 0) {
      clockseq = clockseq + 1;
    }    
    return '_' +  + "_" + Math.floor(Math.random() * 1000000);
}

/**
 * For each element in <i>ar</i> 
 * call function <i>doFn(id,elm)</i> 
 * until end of list or <i>false</i> is returned.
 * 
 * @static
 * @function 
 * @param {Object} [ar={}] 
 * @param {function} [doFn=function(){}]
 * 
 */
FM.forEach = function(ar, doFn) {
    ar = FM.isset(ar) ? ar : {};
    for (var aname in ar) {
        if (!doFn(aname, ar[aname]))
            return(aname);
    }
    return null;
}

/**
 * Returns new array orobject without <i>index</i> element. 
 * 
 * @static
 * @function 
 * @param {Array|Object} arr  
 * @param {string|number} index
 * 
 */
FM.removeArrayElement = function(arr, index) {
    var newarr = [];

    for (var ai in arr) {
        if (ai != index)
            newarr.push(arr[ai]);
    }

    return newarr;
}


/**
 * Serialize given object. If object has <i>serialize()</i>method, 
 * this method will be called, othervise 
 * generates JSON representing <i>obj</i> object. 
 * 
 * @static
 * @function 
 * @param {Object} [obj=null] Object to serialize.  
 * @param {string} [def=""] Default response in case of serialization error. 
 * 
 */
FM.serialize = function(obj, def) {
    def = FM.isset(def) ? def : '';
    if (!FM.isset(obj) || !obj)
        return def;

    try {
        return FM.isFunction(obj.serialize) ? obj.serialize() : JSON.stringify(obj);
    } catch (e) {
        FM.log(null, e, FM.logLevels.error, 'FM.serialize');
    }
    return def;
}

/**
 * Unserialize given object. If <i>unsMethod</i> method is passed to function, 
 * this method will be called, othervise 
 * JSON parsing will occur.
 * 
 * @static
 * @function 
 * @param {string} str String to deserialize.  
 * @param {Object} [def=null] Default object to return in case of deserialization error. 
 * @param {Function} [unsMethod=null] Deserialization method. 
 * 
 */
FM.unserialize = function(str, def,unsMethod) {
    def = FM.isset(def) ? def : null;
    if (!FM.isset(str) || !str)
        return def;
    unsMethod = FM.isFunction(unsMethod) ? unsMethod : JSON.parse;
    try {
        return unsMethod(str);
    } catch (e) {
        FM.log(null, e, FM.logLevels.error, 'FM.unserialize');
    }
    return def;
}


/**
 * 
 * @ignore
 */
FM.getElementFromFmId = function(id, pos, del) {
    del = typeof del !== 'undefined' ? del : '::';
    return id.split(del)[pos];
}



/**
 * 
 * @ignore
 */
FM._T = function() {
    if (arguments.length < 1)
        return('');

    if (false /*T_messages_loaded */) {
        // nadji hash i prevedeni string
        var hash = md5(arguments[0]);
        var str;

        if (isset(T_messages[hash])) {
            str = T_messages[hash];
        } else {
            str = arguments[0];
            if (T_missing_messages == null)
                T_missing_messages = {};
            T_missing_messages[hash] = str;
        }
    } else {
        str = arguments[0];
    }

    // ubaci podatke
    for (var i = 1; i < arguments.length; i++) {
        str = str.replace("[:" + i + "]", arguments[i]);
    }

    // kraj
    return(str);
}

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
    return !isNaN(parseFloat(v)) && isFinite(v);
}
/**
 * Determine if a string variable holding number.
 * 
 * @static
 * @function 
 * @param v The variable to be checked.
 * @returns {boolean} 
 */
FM.isNumeric = function(v) {
    return !isNaN(parseFloat(v)) && isFinite(v);
}

/**
 * Determine if a variable is of boolean type.
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

/**
 * @fileOverview This file has functions related to object attributes.
 * @review isipka r0
 */

/**
 * Check if an object has the attribute.
 * 
 * @static
 * @function 
 * @param {Object} options Object.
 * @param {string} key Attribute name.
 * @returns {boolean}
 */
FM.isAttr = function(options, key) {
    if (!FM.isset(options) || !options || !FM.isset(key))
        return false;

    var akeys = key.split(".");
    var ar = options;
    var val = null;
    for (var i = 0; i < akeys.length; i++) {
        var k = akeys[i].toString();
        if (!FM.isObject(ar) || !FM.isset(ar[k]))
            return false;
        ar = ar[k];
    }
    return true;
}

/**
 * Get the attribute value from an object.
 * 
 * @static
 * @function 
 * @param {Object} options Object with attributes.
 * @param {string} key Attribute name.
 * @param {...} [defv=""] Default value of attribute.
 * @returns {...} Value of attribute or default value.
 */
FM.getAttr = function(options, key, defv) {
    if (!options)
        return options;

    if (FM.isset(key)) {
        var akeys = key.split(".");
        var ar = options;
        var val = null;
        for (var i = 0; i < akeys.length; i++) {
            var k = akeys[i].toString();
            if (
                (!FM.isObject(ar) && !FM.isFunction(ar)) || !FM.isset(ar[k]) || ar[k] == null || (FM.isString(ar[k]) && ar[k] == '')
                ) {
                return(FM.isset(defv) ? defv : '');
            }
            ar = ar[k];
            val = ar;
        }

        return val == null ? (FM.isset(defv) ? defv : '') : val;
    } else {
        return FM.cloneObject(options);
    }
}

/**
 * Set the attribute value for an object.
 * 
 * @static
 * @function 
 * @param {Object} options Object with attributes.
 * @param {Object} undoList Undo list (or<i>null</i>).
 * @param {string} key Attribute name.
 * @param {string|number|...} val Value of attribute.
 * @returns {boolean} <i>true</i> if value of attribute is changed, otherwise <i>false</i>.
 */
FM.setAttr = function(options, undoList, key, val) {
    var i, k, aname;
    var dirty = false;

    if (!options)
        return dirty;

    if (!FM.isString(key)) {
        for (k in val) {
            if (FM.isFunction(val[k]) || !key || FM.isset(options[k])) {
                dirty = dirty | FM.setAttr(options, undoList, k, val[k]);
            }
        }
        return dirty;
    }

    var akeys = key.split(".");
    var ar = options;

    for (i = 0; i < akeys.length - 1; i++) {
        k = akeys[i].toString();
        if (
            !FM.isObject(ar) || !FM.isset(ar[k]) || ar[k] == null || (FM.isString(ar[k]) && ar[k] == '')
            ) {
            return dirty;
        }
        ar = ar[k];
    }
    aname = akeys[akeys.length - 1].toString();
    if (!FM.isObject(ar))
        return dirty;

    if (FM.isset(ar[aname]) && ar[aname] === val)
        return dirty;
    if (undoList && FM.isset(options[akeys[0].toString()]) && !FM.isset(undoList[akeys[0].toString()])) {
        undoList[akeys[0].toString()] = options[akeys[0].toString()];
    }
    ar[aname] = val;
    dirty = true;
    return dirty;
}

/**
 * @ignore
 * 
 */
FM.resolveAttrValue = function(options, attrName, def, context) {
    options = FM.isset(options) && options && FM.isObject(options) ? options : {};
    context = FM.isset(context) && context && FM.isObject(context) ? context : {};
    var v = FM.getAttr(options, attrName, def);

    // eval ?
    if (FM.isString(v) && FM.startsWith(v, '@')) {

        v = v.substring(FM.startsWith(v, '@@') ? 2 : 1);
        context._fn = function() {
            return eval(v);
        }
        try {
            var retv = context._fn();
        } catch (e) {
            FM.log(context, e, FM.logLevels.error, 'FM.resolveAttrValue');

            return undefined;
        }
        v = retv;
    }

    return v;
}

/**
 * @ignore
 * 
 */
FM.resolveAttrName = function(options, attrName, def, context) {
    options = options && FM.isObject(options) ? options : {};
    context = context && FM.isObject(context) ? context : {};
    var v = attrName;

    // eval ?
    if (FM.isString(attrName) && FM.startsWith(attrName, '@')) {
        v = attrName.substring(FM.startsWith(attrName, '@@') ? 2 : 1);
        
        context._fn = function() {
            var estr = "";
            for(var cprop in context) {
                estr += "; var " + cprop + "= this." + cprop;
            }
            eval(estr);
            return eval(v);
        }
        try {
            var retv = context._fn();
        } catch (e) {
            FM.log(context, e, FM.logLevels.error, 'FM.resolveAttrName');
            return undefined;
        }
        v = retv;
    } else {
        v = FM.getAttr(options, attrName, def);
    }

    return v;
}

/**
 * @fileOverview This file has functions related to HTML.
 * @review isipka
 */

/**
 * @ignore
 * 
 */
FM.nodeToHtml = function(node) {
    var el = document.createElement("p");
    el.appendChild(node);
    var retc = el.innerHTML;
    el.removeChild(node);
    return retc;
}

/**
 * BAd method name (returning attribute vačue instead node)
 * @ignore
 * 
 */
FM.findNodeWithAttr = function(node, attrName) {
    while (FM.isset(node) && node && !FM.isset(node[attrName])) {
        node = node.parentNode;
    }
    return(
        FM.isset(node) && node ? node[attrName] : null
        );
}

/**
 * @ignore
 * 
 */
FM.getNodeWithId = function(id) {
    var jo = $('#' + id);
    if (jo.length < 1)
        return null;
    return jo[0];
}

/**
 * @ignore
 *
 */
FM.cancelEventPropagation = function() {
    e = window.event;
    //IE9 & Other Browsers
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    //IE8 and Lower
    else {
        e.cancelBubble = true;
    }
}

/**
 * Delete cookie <i>name</i> on choosen domain.
 * 
 * @static
 * @function 
 * @param {string} name Name of the cookie.
 * @param {string} [domain] Cookie domain.
 * 
 */
FM.deleteCookie = function(name, domain) {
    FM.saveCookie(name, "", 0, domain);
    //document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
}

/**
 * Set cookie.
 * 
 * @static
 * @function 
 * @param {string} name Name of the cookie.
 * @param {...} value Value of the cookie.
 * @param {number} [expiredays=3650] The time the cookie expires. 
 * @param {string} [domain] Cookie domain.
 * 
 */
FM.saveCookie = function(name, value, expiredays, domain) {
    var daysahead, expires = null;

    if (FM.isset(expiredays)) {
        daysahead = parseInt(expiredays);
        if (daysahead <= 0)
            daysahead = 3650; // 10 godina = zauvijek
    } else {
        daysahead = 3650; // 10 godina = zauvijek
    }
    expires = new Date();
    expires.setDate(expires.getDate() + daysahead);

    if (!FM.isset(value) || value == null)
        value = {};

    document.cookie =
        name + "=" +
        escape(FM.isString(value) ? value : FM.arrayToUrl(value)) +
        (FM.isset(domain) && domain ? ";domain=" + domain : "") +
        "; path=/" +
        ((expires == null) ? "" : "; expires=" + expires.toGMTString())
        ;

    return document.cookie;
}


/**
 * Get cookie value.
 * 
 * @static
 * @function 
 * @param {string} name Name of the cookie.
 * @param {boolean} [asstring=false] Don't deserialize cookie value.
 * @param {string} [domain] Cookie domain.
 * 
 */
FM.loadCookie = function(name, asstring) {
    var dc = document.cookie;
    var cname = name + "=";
    var cbegin, cend, retstr = "";

    asstring = FM.isset(asstring) ? asstring == true : false;

    if (dc.length > 0) {
        cbegin = dc.indexOf(cname);
        if (cbegin != -1) {
            cbegin += cname.length;
            cend = dc.indexOf(";", cbegin);
            if (cend == -1)
                cend = dc.length;
            retstr = unescape(dc.substring(cbegin, cend));
        }
    }

    return asstring ? retstr : FM.urlToArray(retstr);
}

/**
 * HTML escape string.
 * 
 * @static
 * @function 
 * @param {string} str String to escape.
 * @returns {string} Escaped string.
 * 
 */
FM.escapeStr = function(str) {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#039;");
    return str;
}

/**
 * HTML unescape string.
 * 
 * @static
 * @function 
 * @param {string} str String to unescape.
 * @returns {string} Unescaped string.
 * 
 */
FM.unescapeStr = function(str) {
    str = str.replace(/&amp;/g, "&");
    str = str.replace(/&gt;/g, ">");
    str = str.replace(/&lt;/g, "<");
    str = str.replace(/&quot;/g, "\"");
    str = str.replace(/&#039;/g, "'");
    return str;
}

/**
 * URL encode string.
 * 
 * @static
 * @function 
 * @param {string} s String to encode.
 * @returns {string} Encoded string.
 * 
 */
FM.urlEncode = function(s) {
    return encodeURIComponent(s).replace(/\%20/g, '+').replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/\~/g, '%7E');
}

/**
 * URL decode string.
 * 
 * @static
 * @function 
 * @param {string} s String to decode.
 * @returns {string} Decoded string.
 * 
 */
FM.urlDecode = function(s) {
    return decodeURIComponent(s.replace(/\+/g, '%20').replace(/\%21/g, '!').replace(/\%27/g, "'").replace(/\%28/g, '(').replace(/\%29/g, ')').replace(/\%2A/g, '*').replace(/\%7E/g, '~'));
}

/**
 * Encode all array elements or object properties as URL query arguments.
 * 
 * @static
 * @function 
 * @param {Array|Object} params Array or object to encode.
 * @returns {string} Encoded string.
 * 
 */
FM.arrayToUrl = function(params) {
    var ret = "";
    var first = true;
    for (var vname in params) {
        if (first != true)
            ret = ret + '&';
        ret = ret + vname + '=' + FM.urlEncode(params[vname]);
        first = false;
    }

    return ret;
}

/**
 * Decode URL encoded parameters to object properties.
 * 
 * @static
 * @function 
 * @param {string} url.
 * @returns {Object}
 * 
 */
FM.urlToArray = function(url) {
    //location.queryString = {};
    var arr = {};

    var pairs = url.split("&");

    for (var i = 0; i < pairs.length; i++) {
        var keyval = pairs[ i ].split("=");
        arr[ keyval[0] ] = FM.isset(keyval[1]) ? FM.urlDecode(keyval[1]) : '';
    }

    return arr;
}

/**
 * Determine if a string is URL.
 * 
 * @static
 * @function 
 * @param {string} s The string to be checked.
 * @returns {boolean} 
 */
FM.isURL = function(s) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s);
}


/* -- FM.PageInfo virtual object -------------------------------------------- */

/**
 * Class holding page info. 
 * It has no constructor, but is instantiated as an object literal.
 *
 * @class
 * @name FM.PageInfo
 * 
 */

/**
 * Host name.
 * 
 * @name host
 * @property
 * @type string
 * @memberOf FM.PageInfo
 */

/**
 * Page URL.
 * 
 * @name url
 * @property
 * @type string
 * @memberOf FM.PageInfo
 */

/**
 * Page path.
 * 
 * @name path
 * @property
 * @type string
 * @memberOf FM.PageInfo
 */

/**
 * Page name.
 * 
 * @name name
 * @property
 * @type string
 * @memberOf FM.PageInfo
 */

/**
 * Page anchor.
 * 
 * @name hash
 * @property
 * @type string
 * @memberOf FM.PageInfo
 */

/**
 * Page query string.
 * 
 * @name query
 * @property
 * @type string
 * @memberOf FM.PageInfo
 */

/* -------------------------------------------------------------------------- */
/**
 * Return requested page information, or object containing all informations.
 * 
 * @static
 * @function 
 * @param {string} [attr] The name of attrribute to return.
 * @param {string} [def] Default return value.
 * @returns {string|FM.PageInfo} 
 */
FM.getPageInfo = function(attr,def) {

    var hash = FM.isset(window.location.hash) && window.location.hash ?
        window.location.hash : ''
    ;
    if(FM.startsWith(hash, "#")) {
        hash = hash.substring(1);
    }

    var pnamearr = window.location.pathname.split("/");
    var fullname = pnamearr.length > 0 ? pnamearr[pnamearr.length - 1] : window.location.pathname;
    
    var i = fullname.lastIndexOf(".");
    var name = i > -1 ?
        fullname.substring(0, i) :
        fullname
    ;

    var pi = {
        query: window.location.search != '' ? window.location.search.substring(1) : '',
        protocol: FM.getAttr(window.location,'protocol',''),
        name: name,
        fullname: fullname,
        host: window.location.host != '' ?
            window.location.protocol + "//" + window.location.host +
            (window.location.port == '' ? '' : ":" + window.location.port) : '',
        url: window.location.href,
        path: window.location.pathname,
        hash: hash
    };

    return(FM.isset(attr) && attr ? FM.getAttr(pi,attr,def) : pi);
}
 
/**
 * Return requested query parameter value, or object containing all query name - value pairs.
 * 
 * @static
 * @function 
 * @param {string} [attr] The name of attrribute to return.
 * @param {string} [def] Default return value.
 * @returns {...|Object} 
 */
FM.getPageArgs = function(attr, def) {
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        pair[0] = FM.urlDecode(pair[0]);
        pair[1] = FM.isset(pair[1]) ? FM.urlDecode(pair[1]) : '';

        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], pair[1]];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(pair[1]);
        }
    }
   
    return FM.isset(attr) && attr ? FM.getAttr(query_string, attr, def) : query_string;
}

/**
 * Return combined result of FM.getPageArgs and FM.getPageInfo functions. 
 * FM.PageInfo is embeded as <i>_page</i> property in result of FM.getPageArgs function call.
 * <b>This function is deprecated. Please use FM.getPageArgs and FM.getPageInfo functions.</b>
 * 
 * 
 * @deprecated

 * @static
 * @function 
 * @see FM.getPageArgs
 * @see FM.getPageInfo
 * @returns {...|Object} 
 */
FM.getArgs = function(attr, def) {
    var pi = FM.getPageInfo();
    var args = FM.getPageArgs();
    args._page = pi;
    
    return(FM.isset(attr) && attr ? FM.getAttr(args,attr,def) : args);    
}


/**
 * Disable full screen.
 * 
 * @static
 * @function 
 */
FM.cancelFullscreen = function() {
    if (document.cancelFullScreen) {
        document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    }
}

/**
 * Show DOM node in full screen mode.
 * 
 * @static
 * @function 
 * @param {string|DOM node} elmid DOM node or id of DOM node.
 */
FM.expandToFullSCreen = function(elmid) {
    var elem = FM.isString(elmid) ? document.getElementById(elmid) : elmid;
    if (elem.requestFullScreen) {
        elem.requestFullScreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullScreen) {
        elem.webkitRequestFullScreen();
    }
}


/**
 * Returns browser defined language code.
 * 
 * @static
 * @function 
 * @returns {string}
 */
FM.getPreferedLanguage = function() {
    return FM.getlocale().split('-')[0];
}

/**
 * Returns browser defined locale string.
 * 
 * @static
 * @function 
 * @returns {string}
 */
FM.getlocale = function() {
    var larr = (window.navigator.userLanguage || window.navigator.language).split('-');
    return  larr[0].toLowerCase() + (larr.length > 1 ? "-" + larr[1].toUpperCase() : "");
}

FM.CultureInfos = {
    "en-US": {
        dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
        
    },
    "en-GB": {
        dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
        
    },
    "cs-CZ": {
        dayNames: [
            "ne", "po", "út", "st", "čt", "pá", "so",
            "neděle", "pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota"
        ],
        monthNames: [
            "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII",
            "leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"
        ]

    },
    "hr-HR": {
        dayNames: [
            "ned", "pon", "uto", "sri", "čet", "pet", "sub",
            "nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"
        ],
        monthNames: [
            "sij", "vlj", "ožu", "tra", "svi", "lip", "srp", "kol", "ruj", "lis", "stu", "pro",
            "siječanj", "veljača", "ožujak", "travanj", "svibanj", "lipanj", "srpanj", "kolovoz", "rujan", "listopad", "studeni", "prosinac"
        ]
    }
}
/**
 * @fileOverview This file has functions related to date and time.
 * @review isipka r0
 */

// -- dates --------------------------------------------------------------------
/**
 * 
 * @ignore
 * @deprecated
 */
FM.dateTimeDivider = ' ';

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 * 
 * http://blog.stevenlevithan.com/archives/date-time-format
 */

/**
 * Basic date and time function.
 * Derived from <a href="https://github.com/slevithan">Steven Levithan</a> date formating function.
 * 
 * @static
 * @function 
 * @param {Date|string=new Date()} [date] The Date class instance or string representing date.
 * @param {string} [mask=FM.dateFormat.masks.default] Format mask to use.
 * @param {boolean} [utc=false] Format UTC values.
 * @see <a href="http://blog.stevenlevithan.com/archives/date-time-format">Steven Levithan blog article</a> for full list of options.
 */
FM.dateFormat = function(date, mask, utc) {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function(val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len)
            val = "0" + val;
        return val;
    };
    var dF = FM.dateFormat;

    if (date && !FM.isObject(date) && FM.isNumeric(date)) {
        date = parseInt(date);
    }

    // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
    if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
        mask = date;
        date = undefined;
    }

    // Passing date through Date applies Date.parse, if necessary
    date = date ? new Date(date) : new Date;
    if (isNaN(date))
        throw SyntaxError("invalid date");

    mask = String(dF.masks[mask] || mask || dF.masks["default"]);

    // Allow setting the utc argument via the mask
    if (mask.slice(0, 4) == "UTC:") {
        mask = mask.slice(4);
        utc = true;
    }

    var _ = utc ? "getUTC" : "get",
        d = date[_ + "Date"](),
        D = date[_ + "Day"](),
        m = date[_ + "Month"](),
        y = date[_ + "FullYear"](),
        H = date[_ + "Hours"](),
        M = date[_ + "Minutes"](),
        s = date[_ + "Seconds"](),
        L = date[_ + "Milliseconds"](),
        o = utc ? 0 : date.getTimezoneOffset(),
        flags = {
        d: d,
        dd: pad(d),
        ddd: dF.i18n.dayNames[D],
        dddd: dF.i18n.dayNames[D + 7],
        m: m + 1,
        mm: pad(m + 1),
        mmm: dF.i18n.monthNames[m],
        mmmm: dF.i18n.monthNames[m + 12],
        yy: String(y).slice(2),
        yyyy: y,
        h: H % 12 || 12,
        hh: pad(H % 12 || 12),
        H: H,
        HH: pad(H),
        M: M,
        MM: pad(M),
        s: s,
        ss: pad(s),
        l: pad(L, 3),
        L: pad(L > 99 ? Math.round(L / 10) : L),
        t: H < 12 ? "a" : "p",
        tt: H < 12 ? "am" : "pm",
        T: H < 12 ? "A" : "P",
        TT: H < 12 ? "AM" : "PM",
        Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
        o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
        S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
    };

    return mask.replace(token, function($0) {
        return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
    });
}



/**
 * Predefined date and time formats.
 * 
 * @namespace 
 * @memberOf FM.dateFormat
 * 
 * @property {string} default "ddd mmm dd yyyy HH:MM:ss"
 * @property {string} shortDate "m/d/yy"
 * @property {string} shortDateTime "m/d/yy HH:MM:ss"
 * @property {string} mediumDate "mmm d, yyyy",
 * @property {string} mediumDateTime "mmm d, yyyy HH:MM:ss",
 * @property {string} longDate "mmmm d, yyyy",
 * @property {string} longDateTime "mmmm d, yyyy HH:MM:ss",
 * @property {string} fullDate "dddd, mmmm d, yyyy",
 * @property {string} fullDateTime "dddd, mmmm d, yyyy HH:MM:ss",
 * @property {string} shortTime "h:MM TT",
 * @property {string} mediumTime "h:MM:ss TT",
 * @property {string} longTime "h:MM:ss TT Z",
 * @property {string} isoDate "yyyy-mm-dd",
 * @property {string} isoTime "HH:MM:ss",
 * @property {string} isoDateTime "yyyy-mm-dd'T'HH:MM:ss",
 * @property {string} fmDateTime "yyyy-mm-dd HH:MM:ss",
 * @property {string} fmUtcDateTime "UTC:yyyy-mm-dd HH:MM:ss",
 * @property {string} fmDate "yyyy-mm-dd",
 * @property {string} fmUtcDate "UTC:yyyy-mm-dd",
 * @property {string} fmTime "HH:MM:ss",
 * @property {string} fmUtcTime "UTC:HH:MM:ss",
 * @property {string} isoUtcDateTime "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
 */
FM.dateFormat.masks = {
    "default": "ddd mmm dd yyyy HH:MM:ss",
    shortDate: "m/d/yy",
    mediumDate: "mmm d, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    isoDate: "yyyy-mm-dd",
    fmDate: "yyyy-mm-dd",
    fmUtcDate: "UTC:yyyy-mm-dd",

    shortDateTime: "m/d/yy HH:MM:ss",
    mediumDateTime: "mmm d, yyyy HH:MM:ss",
    longDateTime: "mmmm d, yyyy HH:MM:ss",
    fullDateTime: "dddd, mmmm d, yyyy HH:MM:ss",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",
    fmDateTime: "yyyy-mm-dd HH:MM:ss",
    fmUtcDateTime: "UTC:yyyy-mm-dd HH:MM:ss",
    
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoTime: "HH:MM:ss",
    fmTime: "HH:MM:ss",
    fmUtcTime: "UTC:HH:MM:ss"
};


/**
 * Internationalization strings
 * 
 * @ignore
 */
FM.dateFormat.i18n =
    FM.isset(FM.CultureInfos[FM.getlocale()]) ?
    FM.CultureInfos[FM.getlocale()] : 'en-US'
    ;




/**
 * Format date using FM.dateFormat.masks.fmDateTime or FM.dateFormat.masks.fmUtcDateTime mask.
 * 
 * @param {string|number|Date} [dat=new Date()] Date to format.
 * @param {boolean} [utc=false] Format UTC values.
 * @param {string} [format="fmUtcDateTime"] Format mask.
 * @returns {string} Returns empty string on error.
 * @see FM.dateFormat.masks
 */
FM.dateToString = function(dat, utc, format) {
    dat = FM.isset(dat) ? dat : new Date();

    try {
        format = FM.isset(format) ? format : (utc ? 'fmUtcDateTime' : 'fmDateTime');
        var s = FM.dateFormat(dat, format);
        return s;
    } catch (e) {
        return '';
    }
}


/**
 * Check if value representing date is parsable.
 * 
 * @param {string|number} sdate Value to check.
 * @returns {boolean} 
 * @see FM.dateFormat.masks
 */
FM.isDateString = function(sdate) {
    if (!FM.isString(sdate) && !FM.isNumeric(sdate)) {
        return false;
    }

    try {
        var ds = FM.dateFormat(sdate);
        var d = new Date(ds);
        return d ? true : false;
    } catch (e) {
        return false;
    }
}


/**
 * Parse date.
 * 
 * @param {string|number} sdate Value to parse.
 * @param {boolean} [utc=false] Date string represents UTC values.
 * @returns {Date} Returns null on error.
 * @see FM.dateFormat.masks
 */
FM.parseDateString = function(sdate, utc) {
    if (!FM.isset(sdate) || sdate == null || sdate == '') {
        return(null);
    }
    if(FM.isNumeric(sdate)) {
        try {
            return new Date(FM.isString(sdate) ? parseInt(sdate) : sdate);
        } catch(e){
            return null;
        }
    }
    try {
        var s = FM.dateFormat((utc && !FM.startsWith(sdate, "UTC:") ? 'UTC:' : '') + sdate);
        var d = new Date(s);
        return d;
    } catch (e) {
        return null;
    }
}

/**
 * Parse local date.
 * This function is shortcut for <i>FM.parseDateString(sdate,false)</i>.
 * 
 * @param {string|number} sdate Value to parse.
 * @returns {Date} Returns null on error.
 * @see FM.parseDateString
 */
FM.parseLocalDateString = function(sdate) {
    return FM.parseDateString(sdate, false);
}


/**
 * Parses UTC date, converts it to Date object and returns local date string.
 * 
 * @param {string|number} sdate UTC date string to parse.
 * @param {string} [format="fmDateTime"] Format mask.
 
 * @returns {string}.
 * @see FM.parseDateString
 */
FM.srv2locDate = function(sdate, format) {
    return(FM.dateToString(FM.parseDateString(sdate, true), false, format));
}

/**
 * Parses local date, converts it to Date object and returns UTC date string.
 * 
 * @param {string|number} sdate UTC date string to parse.
 * @param {string} [format="fmUtcDateTime"] Format mask.
 * @returns {string}.
 * @see FM.parseDateString
 */
FM.loc2srvDate = function(sdate, format) {
    return(FM.dateToString(FM.parseDateString(sdate, false), true, format));
}

/**
 * Returns current date and time string in <i>FM.dateFormat.masks.fmDateTime</i> format.
 * 
 * @param {string} [format="fmDateTime"] Format mask.
 * @returns {string}.
 * @see FM.dateFormat.masks.fmDateTime
 */
FM.locNow = function(format) {
    return(FM.dateToString(new Date(), false, format));
}

/**
 * Returns current UTC date and time string in <i>FM.dateFormat.masks.fmDateTime</i> format.
 * 
 * @param {string} [format="fmUtcDateTime"] Format mask.
 * @returns {string}.
 * @see FM.dateFormat.masks.fmDateTime
 */
FM.srvNow = function(format) {
    return(FM.dateToString(new Date(), true, format));
}

/**
 * Returns time difference in seconds between two dates.
 * 
 * @param {Date} d1 From date.
 * @param {Date} d2 To date.
 * @returns {number} On error returns <i>false</i>.
 */
FM.timeBetween = function(d1, d2) {
    if (
        !FM.isset(d1) || !d1 || !FM.isset(d1.getTime) ||
        !FM.isset(d2) || !d2 || !FM.isset(d2.getTime)
        ) {
        return false;
    }
    // Calculate the difference in milliseconds
    return (d2.getTime() / 1000 - d1.getTime() / 1000);
}


/**
 * Returns time difference between two dates in descriptive sentence.
 * Examples:
 *  "3 seconds ago", "3 minutes ago", "3 hours ago", "Yesterday", "3 days ago",
 *  "In 3 seconds", "In 3 minutes", "In 3 hours", "Tomorow", "In 3 days"
 * 
 * @param {Date} d1 From date.
 * @param {Date} d2 To date.
 * @returns {string} On error returns empty string.
 */
FM.strTimeBetween = function(d1, d2) {
    var dif = FM.timeBetween(d1, d2);
    if (dif == false) {
        return '';
    }
    var dif_abs = Math.abs(dif);


    // The number of milliseconds in one day
    var ONE_DAY = 24;
    var ONE_HOUR = 60;
    var ONE_MINUTE = 60;

    var ret;


    if (dif < 60) {
        ret = FM._T(dif > 0 ? "[:1] seconds ago" : "In [:1] seconds", dif_abs);
    } else { // ONE_MINUTE
        dif_abs = Math.round(dif_abs / ONE_MINUTE);
        if (dif_abs < 60) {
            ret = FM._T(dif > 0 ? "[:1] minutes ago" : "In [:1] minutes", dif_abs);
        } else { // ONE_HOUR
            dif_abs = Math.round(dif_abs / ONE_HOUR);
            if (dif_abs < 24) {
                ret = FM._T(dif > 0 ? "[:1] hours ago" : "In [:1] hours", dif_abs);
            } else { // ONE_DAY
                dif_abs = Math.round(dif_abs / ONE_DAY);

                if (dif_abs == 1) {
                    ret = FM._T(dif > 0 ? "Yesterday" : "Tomorow", dif_abs);
                }
                else {
                    ret = FM._T(dif > 0 ? "[:1] days ago" : "In [:1] days", dif_abs);
                }
            }
        }
    }


    // kraj
    return(ret);
}

/**
 * @ignore
 */
FM.dateLocalFormat = function(d) {
    if (!FM.isset(d) || d == null || d == '')
        return('');

    try {
        var s = d.toLocaleString();
    } catch (err) {
        alert(err)
    }
    ;
    var i = s.indexOf("GMT");
    if (i >= 0)
        s = s.substr(0, i);
    return(s);
}


/**
 * @ignore
 */
FM.startOfHistory = function() {
    return FM.dateFormat(new Date(0), 'fmUtcDateTime');
}

/**
 * @ignore
 */
FM.endOfHistory = function() {
    return FM.dateFormat(new Date(2524608000000), 'fmUtcDateTime');
}


/**
 * Returns the number of seconds between midnight of January 1, 1970 and the specified date.
 * 
 * @param {Date} date Date.
 * @returns {number}
 */
FM.timestamp = function(date) {
    return FM.l_timestamp(date) / 1000;
}

/**
 * Returns the number of milliseconds between midnight of January 1, 1970 and the specified date.
 * 
 * @param {Date} date Date.
 * @returns {number}
 */
FM.l_timestamp = function(date) {
    return Math.round((FM.isset(date) ? date : new Date()).getTime());
}



/**
 * @fileOverview This file has functions related to encoding data.
 * @review isipka
 */

/**
 * Calculate the md5 hash of a string.
 * Derived from <a href="http://phpjs.org/functions/md5/">php.js</a> md5 function.
 * @static
 * @function 
 * @param {string} str The input string.
 * @returns {string} 
 */
FM.md5 = function(str) {
    // Calculate the md5 hash of a string
    //
    // version: 1008.1718
    // discuss at: http://phpjs.org/functions/md5
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: utf8_encode
    // *     example 1: md5('Kevin van Zonneveld');
    // *     returns 1: '6e658d4bfcb59cc13f96c14450ac40b9'
    var xl;

    var rotateLeft = function(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    };

    var addUnsigned = function(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    };

    var _F = function(x, y, z) {
        return (x & y) | ((~x) & z);
    };
    var _G = function(x, y, z) {
        return (x & z) | (y & (~z));
    };
    var _H = function(x, y, z) {
        return (x ^ y ^ z);
    };
    var _I = function(x, y, z) {
        return (y ^ (x | (~z)));
    };

    var _FF = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _GG = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _HH = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _II = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var convertToWordArray = function(str) {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = new Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };

    var wordToHex = function(lValue) {
        var wordToHexValue = "", wordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            wordToHexValue_temp = "0" + lByte.toString(16);
            wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
        }
        return wordToHexValue;
    };

    var x = {},
    k, AA, BB, CC, DD, a, b, c, d,
    S11 = 7, S12 = 12, S13 = 17, S14 = 22,
    S21 = 5, S22 = 9, S23 = 14, S24 = 20,
    S31 = 4, S32 = 11, S33 = 16, S34 = 23,
    S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    str = this.utf8_encode(str);
    x = convertToWordArray(str);
    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    xl = x.length;
    for (k = 0; k < xl; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = _FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
        d = _FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
        c = _FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
        b = _FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
        a = _FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
        d = _FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
        c = _FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
        b = _FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
        a = _FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
        d = _FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
        c = _FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = _FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = _FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = _FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = _FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = _FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = _GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
        d = _GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
        c = _GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = _GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
        a = _GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
        d = _GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = _GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = _GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
        a = _GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
        d = _GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = _GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
        b = _GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
        a = _GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = _GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
        c = _GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
        b = _GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = _HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
        d = _HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
        c = _HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = _HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = _HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
        d = _HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
        c = _HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
        b = _HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = _HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = _HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
        c = _HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
        b = _HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
        a = _HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
        d = _HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = _HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = _HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
        a = _II(a, b, c, d, x[k + 0], S41, 0xF4292244);
        d = _II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
        c = _II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = _II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
        a = _II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = _II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
        c = _II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = _II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
        a = _II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
        d = _II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = _II(c, d, a, b, x[k + 6], S43, 0xA3014314);
        b = _II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = _II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
        d = _II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = _II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
        b = _II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }

    var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

    return temp.toLowerCase();
}

// -- base64 ---------------------------------------------------------------
/**
 * Decodes string encoded with MIME base64.
 * Derived from <a href="http://phpjs.org/functions/base64_decode/">php.js</a> base64 decode function.
 * @static
 * @function 
 * @param {string} input The input string.
 * @returns {string} 
 */
FM.base64_decode=function (data) {
    // http://kevin.vanzonneveld.net
    // +   original by: Tyler Akins (http://rumkin.com)
    // +   improved by: Thunder.m
    // +      input by: Aman Gupta
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   bugfixed by: Pellentesque Malesuada
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
    // *     returns 1: 'Kevin van Zonneveld'
    // mozilla has this native
    // - but breaks in 2.0.0.12!
    //if (typeof this.window['atob'] === 'function') {
    //    return atob(data);
    //}
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    dec = "",
    tmp_arr = [];

    if (!data) {
        return data;
    }

    data += '';

    do { // unpack four hexets into three octets using index points in b64
        h1 = b64.indexOf(data.charAt(i++));
        h2 = b64.indexOf(data.charAt(i++));
        h3 = b64.indexOf(data.charAt(i++));
        h4 = b64.indexOf(data.charAt(i++));

        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

        o1 = bits >> 16 & 0xff;
        o2 = bits >> 8 & 0xff;
        o3 = bits & 0xff;

        if (h3 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1);
        } else if (h4 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1, o2);
        } else {
            tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
        }
    } while (i < data.length);

    dec = tmp_arr.join('');

    return dec;
}
/**
 * Decodes string encoded with MIME base64.
 * Derived from <a href="http://phpjs.org/functions/base64_decode/">php.js</a> base64 decode function.
 * @static
 * @function 
 * @param {string} input The input string.
 * @returns {string} 
 */

/**
 *  Encodes string with MIME base64.
 *  Derived from <a href="http://phpjs.org/functions/base64_encode/">php.js</a> base64 encode function.
 * 
 * @static
 * @function 
 * @param {string} data The input string.
 * @returns {string} 
 */
FM.base64_encode = function(data) {
    // http://kevin.vanzonneveld.net
    // +   original by: Tyler Akins (http://rumkin.com)
    // +   improved by: Bayron Guevara
    // +   improved by: Thunder.m
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Pellentesque Malesuada
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Rafał Kukawski (http://kukawski.pl)
    // *     example 1: base64_encode('Kevin van Zonneveld');
    // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
    // mozilla has this native
    // - but breaks in 2.0.0.12!
    //if (typeof this.window['btoa'] === 'function') {
    //    return btoa(data);
    //}
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    enc = "",
    tmp_arr = [];

    if (!data) {
        return data;
    }

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1 << 16 | o2 << 8 | o3;

        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    var r = data.length % 3;

    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}
/**
 * @fileOverview This file has functions related to teplates.
 * @review isipka
 */


/**
 * Apply <i>attrs</i> to template.
 * 
 * @static
 * @function 
 * @param {Object} attrs Object with properties to apply.
 * @param {string} template Template text.
 * @param {boolean} [escapeValues=true] If set to <i>true</i> all values will be escaped before applyinig to template.
 * @param {boolean} [encodeValues=false] If set to <i>true</i> all values will be encoded before applyinig to template.
 * @param {string} [prefix=""] Prefix of bind variables in template.
 * 
 * @returns {string} 
 */
FM.applyTemplate = function(attrs, template, escapeValues, encodeValues, prefix) {
    var templ = FM.isset(template) && template ? template : "";
    var pref = FM.isset(prefix) && prefix ? "" + prefix + "." : "";
    var val;
    var me = this;

    // ako imas dmobject
    if (attrs) {
        FM.forEach(attrs, function(name, value) {
            if (!FM.isset(value) || !value)
                value = '';
            if (!FM.isFunction(value) && !FM.isObject(value) && !FM.isArray(value)) {
                if (FM.isset(encodeValues) && encodeValues == true) {
                    val = FM.urlEncode(value.toString());
                } else {
                    val = value;
                }
                if (FM.isset(escapeValues) && escapeValues != false) {
                    val = FM.escapeStr(val);
                }

                templ = templ.replace(new RegExp("\\[\\:" + pref + name + "\\]", "g"), val);
            } else if ((FM.isObject(value) || FM.isArray(value)) && (pref.split(".").length - 1 < 2)) {
                templ = FM.applyTemplate(value, templ, escapeValues, encodeValues, pref + name);
            }
            return true;
        });
    }

    // kraj
    return(templ);
}

/**
 * @fileOverview This file has functions related to validation.
 * @review isipka
 */
/**
 * Determine if a variable containing e-mail address.
 * 
 * @static
 * @function 
 * @param email The variable to be checked.
 * @returns {boolean} 
 */
FM.validateEmail = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}




/**
 * @fileOverview This file has functions related to OOP.
 * @review isipka
 */

/**
 * @ignore
 * 
 */
FM._findClassWithMethod = function(o, m) {
    while (
        FM.isset(o) && o &&
        (FM.getAttr(o, 'constructor.prototype.' + m, null) == FM.getAttr(o, '_parent.constructor.prototype.' + m, null))
        ) {
        o = o._parent;
    }
    return FM.isset(o) && o ? o : null;

}

/**
 * @ignore
 * 
 */
FM._super_stack = function(me, method, on) {
    var mStack = FM.getAttr(me, '_parent_call_stack', []);

    if (on) {
        // only class with same method can call super
        var startcls = FM._findClassWithMethod(
            mStack.length == 0 || mStack[mStack.length - 1].m != method ?
            me :
            mStack[mStack.length - 1].oext,
            method
            );


        mStack[mStack.length] = {
            o: startcls,
            m: method,
            oext: FM._findClassWithMethod(startcls._parent, method)
        };
        me._parent_call_stack = mStack;
        return mStack;

        // new stack
        if (mStack.length == 0 || mStack[mStack.length - 1].m != method) {
            mStack[mStack.length] = {
                o: me, //FM._findClassWithMethod(me._parent,method), 
                m: method
            };

        } else { // old stack
            mStack[mStack.length] = {
                o: mStack[mStack.length - 1].o, //FM._findClassWithMethod(mStack[mStack.length-1].o._parent,method), 
                m: method
            }
        }
    } else {
        mStack = Array.prototype.slice.call(mStack, 0, mStack.length - 1);
    }

    me._parent_call_stack = mStack;
    return mStack;
}

/**
 * @ignore
 * 
 */
FM._super = function() {
    var me = arguments[0]
    var callArgs = arguments[1];
    var method = callArgs[0];

    var mStack = FM._super_stack(me, method, true);
    try {
        // nadji klasu od koje polazis
        var fnThis = mStack && mStack.length > 0 && mStack[mStack.length - 1].oext ?
            FM._findClassWithMethod(mStack[mStack.length - 1].oext, method) :
            null
            ;

        //if(fnThis) var retc = fnThis[method].apply(me, Array.prototype.slice.call(callArgs, 1));
        var retc = fnThis ?
            fnThis[method].apply(me, Array.prototype.slice.call(callArgs, 1))
            : undefined;

        // makni stack
        FM._super_stack(me, method, false);

        return retc;
    } catch (e) {
        // makni stack
        FM._super_stack(me, method, false);
        return undefined;
    }


}

/**
 * @ignore
 * 
 */
FM.loadScript = function(url, cbfn) {
    $.getScript(url, function() {
        if (FM.isFunction(cbfn)) {
            cbfn();
        }
    });
}

/**
 * @ignore
 * 
 */
FM.extend = function(oDest, oSrc, isclass) {
    isclass = FM.isset(isclass) && isclass;
    oDest = oDest ? oDest : {};
    oSrc = oSrc ? oSrc : {};

    for (var property in oSrc) {
        oDest[property] = oSrc[property];
    }

    if (FM.isset(isclass) && isclass == true) {
        oDest._super = function() {
            return FM._super(this, arguments);
        }
    }

    return oDest;
}

/**
 * Create new FM class.
 * 
 * @param {string} name Name of new class.
 * @param {FM.Object} [ext=null] FM class to extend.
 * @returns {function}
 */
FM.defineClass = function(name, ext) {
    name = FM.isset(name) && FM.isString(name) && name != '' ? name : 'Undefined';
    ext = FM.isset(ext) && FM.isFunction(ext) ? ext : null;
    var cls = function() {
        if (this._init)
            this._init.apply(this, arguments);
    };

    FM.extendClass(cls, ext);
    cls.className = name;

    return cls;
}

/**
 * @ignore
 * 
 */
FM.extendClass = function(oDest, oSrc) {
    if (oSrc) {
        for (var property in oSrc.prototype) {
            oDest.prototype[property] = oSrc.prototype[property];
        }
        oDest.prototype._parent = oSrc.prototype;
    } else {
        oDest.prototype._parent = null;
    }

    oDest.prototype._super = function() {
        return FM._super(this, arguments);
    }

    return oDest;
}

/**
 * @ignore
 * 
 */
FM.stringPtrToObject = function(objptr, lm, app) {
    var akeys = objptr.split(".");
    if (akeys.length < 1)
        return null;

    var parent = akeys[0] == 'APP' ? app : (
        akeys[0] == 'LM' ? lm : window
        );
    var startIndex = parent == window ? 0 : 1;

    for (var i = startIndex; i < akeys.length; i++) {
        if (!FM.isset(parent[akeys[i]]))
            return null;
        parent = parent[akeys[i]];
    }

    return parent;
}

/**
 * @ignore
 * 
 */
FM.cloneObject = function(obj) {
    if (!FM.isset(obj) || !FM.isObject(obj))
        return obj;
    return FM.extend({}, obj);
}

/**
 * @fileOverview This file has functions related to logging.
 * @review isipka
 */

/**
 * Log levels enumeration.
 * 
 * @namespace 
 * @memberOf FM
 * 
 */
FM.logLevels = {
    /** 
    * @description Debug log level. 
    */
    debug: 0,   
    /** 
     * @description Info log level. 
    */
    info: 1,    
    /** 
     * @description Warn log level. 
    */
    warn: 2,    
    /** 
     * @description Error log level. 
    */
    error: 3,   
    /** 
     * @description Fatal log level. 
    */
    fatal: 99   
}

/**
 * Log levels names enumeration.
 * 
 * @namespace 
 * @memberOf FM
 * 
 */
FM.logLevelNames = {
    /** 
    * @description Debug log level. 
    */
    0: 'DEBUG',
    /** 
     * @description Info log level. 
    */
    1: 'INFO',
    /** 
     * @description Warn log level. 
    */
    2: 'WARN',
    /** 
     * @description Error log level. 
    */
    3: 'ERROR',
    /** 
     * @description Fatal log level. 
    */
    99: 'FATAL'
}


/**
 * @ignore
 * 
 */
FM.logDefaultLevel = FM.logLevels.warn;

/**
 *  Set default log level.
 * 
 * @static
 * @function 
 * @param {number} level Log level.
 */
FM.setLogLevel = function(level) {
    FM.logDefaultLevel = level;
}

/**
 *  Get default log level.
 * 
 * @static
 * @function 
 * @returns {number} 
 */
FM.getLogLevel = function() {
    return FM.logDefaultLevel;
}


/**
 * 
 * @ignore
 */
FM.getLogId = function(oObj) {
    return oObj && FM.isset(oObj.getClassName) ? oObj.getClassName() : '<anonymous>';
}

/**
 *  Get log level name for given level.
 * 
 * @static
 * @function 
 * @param {number} level The log level.
 * @returns {string} 
 */
FM.getLogTypeName = function(level) {
    return FM.isset(FM.logLevelNames[level]) ? FM.logLevelNames[level] : FM.logLevelNames[FM.logLevels.info];
}

/**
 * @ignore
 */
FM.logObjectMsgToArray = function(obj) {
    if (!FM.isset(obj) || !obj)
        return [];
    if (FM.isset(obj.length))
        return obj;
    if (FM.isset(obj.toLogArray))
        return(obj.toLogArray());
    var ar = ['('];
    for (var id in obj) {
        ar.push(
            '  ' + id + ":" + (obj[id] === null ? 'null' : (
            FM.isset(obj[id].getClassName) ? obj[id].getClassName() :
            (
                FM.isFunction(obj[id]) ? "function() {...}" :
                (
                    FM.isArray(obj[id]) ? "[...]" :
                    (
                        FM.isObject(obj[id]) ? "{...}" :
                        (
                            obj[id]
                            )
                        )
                    )
                )
            ))
            );
    }
    ar.push(")");
    return ar;
}


/**
 * 
 * @ignore
 */
FM.getStackTraceStr = function(err) {
    err = FM.isset(err) ? err : new Error();

    return err.stack ? err.stack : "";
}

/*
 * 
 * @ignore
 */
FM.getStackTrace = function(err) {
    var strace = FM.getStackTraceStr(err);
    return strace.split("\n").slice(3); //strace.length > 2 ? strace.slice(2) : [];
}

/*
 * 
 * @ignore
 */
FM.getCallerInfo = function(shift) {
    var strace = FM.getStackTrace();
    var pos1, pos2, name, file;
    var lin = "<anonymous>";

    shift = FM.isset(shift) ? shift : 0;
    // mi smo na 1
    if (strace.length < 2 + shift)
        return lin;

    lin = strace[1 + shift];
    pos1 = lin.indexOf("at ");
    if (pos1 < 0)
        return lin;

    lin = lin.substr(pos1 + 3);
    pos1 = lin.indexOf("(");
    pos2 = lin.indexOf(")");
    if (pos1 > -1 && pos2 > -1) {
        name = lin.substr(0, pos1);
        file = lin.substr(pos1 + 1, pos2 - pos1 - 1);
        pos1 = file.lastIndexOf("/");
        if (pos1 > -1) {
            file = file.substring(pos1 + 1);
        }
        lin = name + "(" + file + ")";
    }
    return(lin);
}


/**
 *  Log a message.
 * 
 * @static
 * @function  
 * @param {FM.Object|null} oObj Context.
 * @param {string|Object|...} msg Variable to be logged.
 * @param {number} [level] Log level.
 * @param {string} [callerinfo] Description of context.
 */
FM.log = function(oObj, msg, level, callerinfo) {
    var minlevel =
        oObj && FM.isset(oObj.getLogLevel) && oObj.getLogLevel() != null ?
        oObj.getLogLevel() : FM.getLogLevel()
        ;
    if (!FM.isset(level))
        level = FM.logLevels.info;
    if (level < minlevel)
        return false;
    if (FM.isset(callerinfo) && callerinfo.indexOf('.') < 0) {
        callerinfo = FM.getLogId(oObj) + '.' + callerinfo;
    } else if (!FM.isset(callerinfo)) {
        callerinfo = FM.getLogId(oObj) +
            '.' +
            (FM.isset(FM.log.caller.name) && FM.log.caller.name != '' ? FM.log.caller.name : '<unknown>');
    }

    // console method
    var lfname = FM.getLogTypeName(level).toLowerCase();
    lfname = FM.isset(console[lfname]) ? lfname : "log";
    
    // display message
    console[lfname](
        "[" + FM.getLogTypeName(level) + "]:" +
        (FM.isset(callerinfo) ? callerinfo : "Unknown") + " " +  
        (msg && !FM.isString(msg) ? '' : msg)
        );

    if (FM.isObject(msg) || FM.isArray(msg)) {
        console.dir(msg);
    }
    return true;
}

/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */

/**
 * The ob.object is the base class of FM framework. It provides support for:
 * <ul>
 * <li>events</li>
 * <li>attributes</li> 
 * <li>properties</li>
 * <li>logging</li>
 * </ul>
 * 
 * <h3>Events</h3>
 * Every ob.object instance can fire events to all of its dependent observers (registered listeners).
 * <br/>
 * Whenever an <code>ob.object</code> instance calls the @link ob.Object#fireEvent method it acts as a subject, and
 * the event gets propagated to all of the dependent observers. An observer instance reacts to that event if it has
 * event processing enabled (@see ob.Object#isEnabled)
 * and an instance method named <i>exactly</i> as the value of the eventName variable of the @link ob.Object#fireEvent method. 
 * <br/>
 * The event consists of the event data instance and the subject instance. An object instance gets registered
 * as an observer by invoking the @link ob.Object#addListener method on the subject instance - the object instance
 * whose events it wants to be notified of.
 * <br/>
 * This is an observer pattern implementation using the described FM events arhitecture.
 * (@see <a href="http://en.wikipedia.org/wiki/Observer_pattern">Observer pattern @ wikipedia</a>)
 * <br/>
 * <code>var subject = new FM.Object();<br/>
 *  var observer = new FM.Object();<br/>
 *
 *   subject.addListener(observer);<br/>
 *   observer.onEventName = function(subject,eventData) {<br/>
 *   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;alert("onEventName: subject with ID " + subject.getID()+ " sent message: " + eventData["message"]);<br/>
 *   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br/>
 *   subject.fireEvent("onEventName", {"message":"hello"});<br/>
 * </code>
 *  <br/>
 * <h3>State and elementary CRUD support</h3>
 * Every <code>ob.object</code> instance has an instance ID which is generated by the FM framework and unique across environments. (@TODO explain better)
 * <br/>
 * Every <code>ob.object</code> instance has a data model, which consists of:
 * <ul>
 * <li>data model ID</li>
 * <li>attributes</li>
 * <li>properties</li>
 * <li>state</li>
 * </ul>
 * 
 * The data model ID is instance ID by default implementation. <br/>
 * Both attributes and properties are technically plain old Javascript properties, but there exists a thin layer of abstraction which 
 * reflects in the fact that both properties and attributes must <i>exclusively</i> be mutated (changed) via their corresponding setter methods.<br/>
 * 
 * Attributes form the data in the data model. Properties are the metadata of the data model, and the default ones describe the synchronicity of the actual data in the data model with the actual data in some data source.
 * The default <code>ob.object</code> properties: 
 * <ul>
 * <li><code>dirty</code> - set to <code>false</code> upon instantiation</li>
 * <li><code>timestamp</code> - gets populated with current time upon instantiation</li>
 * <li><code>fetched</code> - set to <code>true</code> upon instantiation</li>
 * </ul> 
 * Whenever a property gets mutated via the @link ob.Object#setProperty method, an <code>onChange</code> event gets fired by default behavior, but it can be done silently.<br/>
 * <br/>
 * Whenever an attribute gets mutated via the @link ob.Object#setAttr method its:
 * <ul>
 * <li><code>dirty</code> property gets set to <code>true</code></li>
 * <li>the <code>timestamp</code> property gets updated</li>
 * <li>by default behavior, <code>onChange</code> event gets fired, but it can be done silently</li>
 * </ul>
 * Attributes (the data model) can be defined in a strict manner, by providing an array of attributes' names in the constructor. Such strict data model won't allow adding of new attributes:
 * 
 * 
 * 
 * <br/>
 * 
 * @class FM.Object
 * @param {object|string|function} attrs List of attributes' name and value pairs. 
 *  This parameter can be an object instance, string evaluation to object instance(__KAKO_OVO_RADI-evaluacija stringa je transparentna za programera?) or a function returning object instances.
 * @param {object} [flds] restricted model definition - string array of allowed attributes' names.
 * 
 */
FM.Object = FM.defineClass('Object');


FM.Object.prototype._init = function(attrs, flds) {
    // properties    
    this.objectSubClass = "Objects";
    this.id = null;
    this.objectLogLevel = null;

    this.enabled = true;
    this.listenersArr = {};
    this.undoList = {};
    this.options = {};
    this.strictOptions = false;

    // properties
    this.prop = {
        dirty: false,
        timestamp: new Date().getTime(),
        fetched: true 
    },
    this.setAttr(false, FM.isset(flds) ? flds : {}, false);
    this.strictOptions = FM.isset(flds) ? true : false;
    if (FM.isset(attrs) && attrs) {
        if (FM.isString(attrs))
            attrs = FM.stringPtrToObject(attrs);
        if (FM.isFunction(attrs))
            attrs = attrs();
        this.setAttr(this.strictOptions, attrs, false);
    }

    this.setChanged(false, false);
}

/**
 * Returns the name of the class.
 * 
 * @public     
 * @function 
 * @returns {string} 
 */
FM.Object.prototype.getClassName = function() {
    var o = this;

    while (o && !FM.isset(o.constructor.className)) {
        o = o._parent ? o._parent : null;
    }
    return(o ? o.constructor.className : '');
}


/**
 * Returns subclass name.
 * 
 * @public     
 * @function 
 * @returns {string} 
 */
FM.Object.prototype.getSubClassName = function() {
    return this.objectSubClass;
}


/**
* Get instance ID.
* 
* @public     
* @function 
* @returns {string} 
*/
FM.Object.prototype.getID = function() {
    if (this.id == null)
        this.id = FM.generateNewID();
    return(this.id);
}

/**
 * Returns the ID of the data model of this instance.
 * 
 * @public     
 * @function 
 * @returns {string} 
 */
FM.Object.prototype.getDataID = function() {
    return(this.getID());
}


/**
 * Add listener.
 * 
 * @public     
 * @function 
 * @param {FM.Object|Object} oListener FM.Object to register as listener or object with event functions.
 *  Object must be of form {<eventName1>: function(sender,evdata) {}, <eventName2>: funtion(sender,evdata) {}, ,,,}. 
 *  FM.Object must implement these functions inside class.   
 * @param {Object} [config] Additional options.
 */
FM.Object.prototype.addListener = function(oListener, config) {
    // definicija listenera
    var lstnrdef = {
        listener: oListener,
        config: FM.isset(config) ? config : {},
        iscallback: !FM.isset(oListener.onEvent)
    };

    // if the listener is not object
    if (!FM.isset(oListener.getID)) {
        var lid = '_CB_' + FM.generateNewID();
        /** @ignore */
        oListener.getID = function() {
            return lid;
        }
    }
    this.listenersArr[oListener.getID()] = lstnrdef;
}

/**
 * Remove listener.
 * 
 * @public     
 * @function 
 * @param {FM.Object|object} oListener Listener to remove.
 * @returns <i>true</i> if listener is found and removed.
 */
FM.Object.prototype.removeListener = function(oListener) {
    if (!FM.isset(oListener) || !oListener || !FM.isset(oListener.getID))
        return false;

    var nlist = {};
    var objId = oListener.getID();
    if (!objId)
        return false;

    for (var id in this.listenersArr) {
        if (objId != id)
            nlist[id] = this.listenersArr[id];
    }

    this.listenersArr = nlist;

    return true;
}

/**
 * Remove all listeners,
 * 
 * @public     
 * @function 
 */
FM.Object.prototype.removeAllListeners = function() {
    this.listenersArr = {};
    return true;
}


/**
 * Event function.
 * 
 * @public     
 * @function 
 * @param {FM.Object} sender Sender of event
 * @param {string} ev Event
 * @param {...} [data] Event data.
 */
FM.Object.prototype.onEvent = function(sender, ev, data, calledlist) {
    var cl = FM.isset(calledlist) ? calledlist : {};
    if (!this.isEnabled() || ev == "onEvent") {
        return false;
    }

    if (FM.isset(this[ev])) {
        this[ev](sender, data);
        cl[this.getID()] = '1';
        FM.setAttr(cl, '_executed', '1');
    }

    return cl;
}

/**
 * Send event to all listeners.
 * 
 * @public     
 * @function 
 * @param {string} ev Event to send.
 * @param {...} [evdata] Event data.
 * 
 */
FM.Object.prototype.fireEvent = function(ev, evdata, calledlist) {
    var cl = FM.isset(calledlist) ? calledlist : {};
    if (FM.getAttr(cl, '_executed', '0') == '1')
        return cl;

    cl[this.getID()] = '0';

    // obicni listeneri
    var larr = this.listenersArr;
    for (var id in larr) {
        var ldef = larr[id];
        if (!FM.isset(cl[id])) {
            cl[id] = "0";
            try {
                if (ldef.iscallback) {
                    if (FM.isFunction(ldef.listener[ev])) {
                        ldef.listener[ev](this, evdata);
                        cl[ldef.listener.getID()] = '1';
                        FM.setAttr(cl, '_executed', '1');
                    }
                } else {
                    cl = ldef.listener.onEvent(this, ev, FM.isset(evdata) ? evdata : {}, cl);
                }
            } catch (err) {
                FM.log(null, err, FM.logLevels.error, 'Object.fireEvent');
            }
        }
    }

    // kraj
    return cl;
}

/**
 * Check if attribute exists.
 * 
 * @public     
 * @function 
 * @param {string} key Attribute name.
 * @returns {boolean} 
 */
FM.Object.prototype.isAttr = function(key) {
    return FM.isAttr(this.options, key);
}

/**
 * Get attribute value.
 * 
 * @static
 * @function 
 * @param {string} key Attribute name.
 * @param {...} [defv=""] Default value of attribute.
 * @returns {...} Value of attribute or default value.
 */
FM.Object.prototype.getAttr = function(key, defv) {
    return FM.getAttr(this.options, key, defv);
}

/**
 * Set attribute value.
 * 
 * @static
 * @function 
 * @param {string} key Attribute name.
 * @param {string|number|...} val Value of attribute.
 * @param {boolean} [callevent=false] Fire <i>onChange</i> event.
 * @returns {boolean} <i>true</i> if value of attribute is changed, otherwise <i>false</i>.
 */
FM.Object.prototype.setAttr = function(key, val, callevent) {
    if (FM.setAttr(this.options, this.undoList, key, val)) {
        this.setProperty('dirty', true);
        this.setProperty('timestamp', new Date().getTime());
        if (FM.isset(callevent) && callevent == true)
            this.fireEvent("onChange", this);
    }
}

/**
 * @ignore
 */
FM.Object.prototype.d = function(key, defv) {
    return this.getAttr(key, defv);
}

/**
 * @ignore
 */
FM.Object.prototype.s = function(key, val, callevent) {
    return this.setAttr(key, val, callevent);
}

/**
 * Check if <i>key</i> attribute is changed.
 * 
 * @public
 * @function 
 * @param {string} [key] Attribute name. If <i>key</i> is undefined this method
 *  check for any attribute change.
 * @returns {boolean} 
 */
FM.Object.prototype.isChanged = function(key) {
    if (FM.isset(key)) {
        if (FM.isset(this.undoList[key]))
            return true;
        return false;
    }
    return this.getProperty('dirty');
}

/**
 * Set FM object <i>changed</i> property,
 * <i>dirty</i> property will be set to new value.
 * 
 * @public
 * @function 
 * @param {boolean} v true or false
 * @param {boolean} [callevent=false] Fire <i>onChange</i> event after object update.
 */
FM.Object.prototype.setChanged = function(v, callevent) {
    this.setProperty('dirty', v == true);
    if (!this.getProperty('dirty'))
        this.undoList = {};
    if (FM.isset(callevent) && callevent == true)
        this.fireEvent("onChange", this);
}

/**
 * Discard object attribute changes, <i>onChange</i> event is fired.
 * 
 * @public
 * @function 
 */
FM.Object.prototype.discardChanges = function() {
    for (var option in this.undoList) {
        this.setAttr(option, this.undoList[option]);
    }
    this.setChanged(false, true);
}

/**
 * @ignore
 */
FM.Object.prototype.resolveAttrValue = function(attrName, def, context) {
    return FM.resolveAttrValue(this.options, attrName, def, context);
}

/**
 * Return an unique string based on object attributes.
 * 
 * @public
 * @function
 * @returns {string}
 */
FM.Object.prototype.getDataHash = function() {
    var dataHash = '';
    for (var dataName in this.getAttr()) {
        var dataValue = this.d(dataName, '');

        dataHash += dataHash == '' ? dataValue : ',' + dataValue;
    }
    return FM.md5(dataHash);
}

/**
 * Return object with all changed attributes and their old values.
 * 
 * @public     
 * @function 
 * @returns {Object}
 */
FM.Object.prototype.getChangedAttrList = function() {
    return FM.cloneObject(this.undoList);
}

/**
 * Get property value.
 * 
 * @function 
 * @param {string} key Property name.
 * @param {string} [defv=""] Default value of property.
 * @returns {..} Value of property or default value.
 */
FM.Object.prototype.getProperty = function(key, defv) {
    return FM.getAttr(this.prop, key, defv);
}

/**
 * Set property value.
 * 
 * @static
 * @function
 * @param {string} key Property name
 * @param {string} val Value of property
 * @param {boolean} [callevent=true] Fire <i>onChange</i> event after update.
 */
FM.Object.prototype.setProperty = function(key, val, callevent) {
    if (FM.setAttr(this.prop, null, key, val)) {
        if (FM.isset(callevent) && callevent == true)
            this.fireEvent("onChange", this);
    } else {
        return false;
    }
    return true;
}


/** 
 * For each object attribute call function <i>doFn(id,elm)</i> 
 * until end of list or <i>false</i> is returned. 
 * 
 * @public
 * @function 
 * @param {function} [doFn={}]
 */
FM.Object.prototype.forEachAttr = function(doFn) {
    return FM.forEach(this.options, doFn);
}

/**
 * @ignore
 * 
 */
FM.Object.prototype.resolvePropertyValue = function(attrName, def, context) {
    return FM.resolveAttrValue(this.prop, attrName, def, context);
}


/** 
 * For each object property call function <i>doFn(id,prop)</i> 
 * until end of list or <i>false</i> is returned. 
 * 
 * @public
 * @function 
 * @param {function} [doFn={}]
 */
FM.Object.prototype.forEachProperty = function(doFn) {
    return FM.forEach(this.prop, doFn);
}

/**
 * Enable event processing.
 * 
 * @public
 * @function 
 */
FM.Object.prototype.enable = function() {
    this.enabled = true;
}

/**
 * Disable event processing.
 * 
 * @public
 * @function 
 */
FM.Object.prototype.disable = function() {
    this.enabled = false;
}


/**
 * Determine if event processing is enabled.
 * 
 * @public
 * @function 
 * @return {boolean} 
 */
FM.Object.prototype.isEnabled = function() {
    return this.enabled;
}

/**
 *  Log a message with desired level and caller function name (context).
 * 
 * @link FM.logLevels
 * @public
 * @function  
 * @param {string|Object|...} msg Variable to be logged.
 * @param {number} [level] Log level.
 * @param {string} [callerinfo] Description of context.
 */
FM.Object.prototype.log = function(msg, level, callerinfo) {
    FM.log(this, msg, level, callerinfo);
}

/**
 * Set global log level.
 * 
 * @link FM.logLevels
 * @public
 * @function 
 * @param {string|number} level Log level
 */
FM.Object.prototype.setLogLevel = function(level) {
    if (FM.isString(level)) {
        if (FM.isset(FM.logLevels[level.toLowerCase()])) {
            this.objectLogLevel = FM.logLevels[level.toLowerCase()];
        }
    } else {
        this.objectLogLevel = level;
    }
}

/**
 * Get global log level.
 * 
 * @link FM.logLevels
 * @public
 * @function 
 */
FM.Object.prototype.getLogLevel = function() {
    return this.objectLogLevel;

}

/**
 * Dispose instance.
 * 
 * @public
 * @function 
 */
FM.Object.prototype.dispose = function() {
    this.removeAllListeners();
}

/**
* Ajax class. 
* 
* @class FM.UtAjax
* @extends FM.Object
* @param {object} config Options
* 
* Valid options:
*
* cache: true/false
* url: url,
* method: POST/GET/...
* contentType: application/x-www-form-urlencoded
* auth {
*  username: '',
*  password:''
* }
* responseFormat: JSON/TEXT
* params: { // _body: za for post body
*  a: true, 
*  b:true
*  } 
* headers:{}
 
*/    

FM.UtAjax = FM.defineClass('UtAjax',FM.Object);

// methods
FM.UtAjax.prototype._init = function(config) {            
    this._super("_init",config);
    this.objectSubClass = "Ajax";

    this.http = null;
    this.lastStatusCode = "0";
}

FM.UtAjax.prototype.send = function(args) {
    var url = this.getAttr('url','');
    var params = this.getAttr('params',{});
    var headers = this.getAttr('headers',{});
    
    var pline = "";
    
    if(FM.isObject(args)) {
        var val;
        for(var pname in args) {
            if(FM.isset(params[pname])) {
                val = FM.getAttr(args,pname,'');
                if(pname === "_body" && this.getAttr("method","POST") == 'POST') {
                    pline = val;
                    break;
                } else {
                    pline = pline + (pline == "" ? "" : "&") + pname + "=" + encodeURIComponent(val);
                }
            }
        }
    }
    
    this.http = this.executeCall(url, pline, headers);

    return true;
}     

FM.UtAjax.prototype.getLastStatus = function() {
    return this.lastStatusCode;
}

FM.UtAjax.prototype.executeCall = function(url, params, headers) {
    var ajaxOptions = {
        global: false,
        cache: this.getAttr("cache","false").toLowerCase() == 'true',
        accepts: {},
        beforeSend: function(jqXHR, settings) {
            return this.fireEvent("onAjaxStateStart",params);            
        },
        error: function(jqXHR,textStatus,errorThrown) {
            this.lastStatusCode = textStatus;
            return this.fireEvent("onAjaxStateError", errorThrown);
        },
        success: function(data,textStatus, jqXHR) {
            this.lastStatusCode = textStatus;
            return this.fireEvent(
                "onAjaxStateEnd", data
            );
        },
        url: url,
        type: this.getAttr("method","POST").toLowerCase(),
        contentType: this.getAttr('contentType',"application/x-www-form-urlencoded"),
        context: this,
        data: params,
        headers: headers,
        username: this.getAttr('auth.username',''),
        password: this.getAttr('auth.password',''),
        dataType: this.getAttr('responseFormat','TEXT').toLowerCase() 
    };
    
    return $.ajax(ajaxOptions);
}

/**
* Timer class. 
* 
* @class FM.UtTimer
*/

FM.UtTimer = FM.defineClass('UtTimer',FM.Object);

FM.UtTimer.minPeriod = 1;
FM.UtTimer.timeoutHandle = null;
FM.UtTimer.jobsList = [];
FM.UtTimer.suspended = false;


FM.UtTimer.__checklist__ = function() {
    if(!FM.UtTimer.isQueueSuspended()) {
        var nlist = [];
        for(var i=0; i < FM.UtTimer.jobsList.length; i++) {
            var job = FM.UtTimer.jobsList[i];
            if(
                job.executecount != 0 && !job.isSuspended() &&
                job.lastRun + job.period * 1000 < new Date().getTime()
            ) {
                job.lastRun = new Date().getTime();
                job.executecount--;
                if(job.executecount != 0) nlist.push(job);
                job.fireEvent(job.event, job.evdata);
            } else {
                if(job.executecount != 0) nlist.push(job);
            }
        }
        FM.UtTimer.jobsList = nlist;

        if(FM.UtTimer.jobsList.length > 0) {
            FM.UtTimer.timeoutHandle = setTimeout(
                "FM.UtTimer.__checklist__()",
                FM.UtTimer.minPeriod * 1000
            );
        }else {
            FM.UtTimer.timeoutHandle = null;
        }
    } else { // za svaki slucaj
        FM.UtTimer.timeoutHandle = null;
    }
}

FM.UtTimer.removeFromQueue = function(job) {
    var nlist = [];
    for(var i=0; i < FM.UtTimer.jobsList.length; i++) {
        if(FM.UtTimer.jobsList[i] != job) {
            nlist.push(FM.UtTimer.jobsList[i]);
        }
    }
    FM.UtTimer.jobsList = nlist;    
}

FM.UtTimer.addToQueue = function(job) {
    FM.UtTimer.jobsList.push(job);
    if(!FM.UtTimer.timeoutHandle) {
        FM.UtTimer.__checklist__();
    }    
}

FM.UtTimer.isQueueSuspended = function() {
    return FM.UtTimer.suspended;
}

FM.UtTimer.suspendQueue = function() {
    FM.UtTimer.suspended = true;
}

FM.UtTimer.resumeQueue = function() {
    FM.UtTimer.suspended = false;
    FM.UtTimer.__checklist__();
}

/**
* Timer job class. 
* 
* @class FM.UtTimerJob
* @extends FM.Object
* @param {String} event Event to send
* @param {any} evdata Data to send with event
* @param {number} period Period in seconds
* @param {number} number of times to execute
*/    
FM.UtTimerJob = FM.defineClass('UtTimerJob',FM.Object);

FM.UtTimerJob.prototype._init = function(event,evdata,period,executecount) {
    this._super("_init",evdata);
    
    this.objectSubClass = "TimerJob";

    this.event = event;
    this.evdata = evdata;
    this.period = period < FM.UtTimer.minPeriod ? FM.UtTimer.minPeriod : period;
    this.executecount = FM.isset(executecount) ? executecount : -1;
    this.suspended = false;
    this.started = false;
    this.lastRun = 0;
}

FM.UtTimerJob.prototype.start = function() {
    this.started = true;
    FM.UtTimer.addToQueue(this);
}

FM.UtTimerJob.prototype.stop = function() {
    this.started = false;
    FM.UtTimer.removeFromToQueue(this);
}

FM.UtTimerJob.prototype.isStarted = function() {
    return this.started;
}

FM.UtTimerJob.prototype.isSuspended = function() {
    return this.suspended;
}

FM.UtTimerJob.prototype.suspend = function() {
    this.suspended = true;
}

FM.UtTimerJob.prototype.resume = function() {
    if(!this.isStarted()) this.start();
    this.suspended = false;
}

FM.UtTimerJob.prototype.dispose = function() {
    FM.UtTimer.suspendQueue();
    
    this.suspend();
    this.stop();
    this.removeAllListeners();
}



/** @fileoverview http://social.msdn.microsoft.com/Forums/en-US/9944e069-7af7-4854-8773-9b4269d49df2/why-registry-pattern-is-antipattern-and-what-is-alternative-for-it*/
/**
* Registry class. 
* 
* @class FM.UtRegistry
* @extends FM.Object
* @param {object} opt Options
*/    

FM.UtRegistry = FM.defineClass('UtRegistry',FM.Object);

FM.UtRegistry.prototype._init = function(opt) {            
    this.cookieName = '';
    this.registry = null;

    this._super("_init",opt);
    this.objectSubClass = "Registry";

    this.cookieName = this.getAttr('cookieName','fmRegistry');
    this.registry = null;
}

FM.UtRegistry.prototype.set = function(pkey,val) {
    if(this.registry == null) {
        var cookie = FM.loadCookie(this.cookieName);
        if(FM.isset(cookie.reg)) this.registry = FM.unserialize(cookie.reg);
        if(this.registry == null || !FM.isObject(this.registry)) this.registry = {};
    }
    pkey = FM.trim(pkey);
    if(FM.startsWith(pkey, "/")) {
        pkey = pkey.substr(1);
    }
    if(FM.endsWith(pkey, "/")) {
        pkey = pkey.substr(0,pkey.length -1);
    }
    var keyArr = pkey.split('/');
    var keyIndex = keyArr.length -1;
    var cur = this.registry;
    FM.forEach(keyArr,function(i,k) {       
       var c = FM.isset(cur[k]) ? cur[k] : null;       
       if(!c || !FM.isObject(c) || i == keyIndex) {
           cur[k] = i != keyIndex ? {} : val;
       }
       cur = cur[k];
       return true;
    });
    FM.saveCookie(this.cookieName,{reg: FM.serialize(this.registry)});

    return true;
}

FM.UtRegistry.prototype.get = function(pkey,defv) {
    if(this.registry == null) {
        var cookie = FM.loadCookie(this.cookieName);
        if(FM.isset(cookie.reg)) this.registry = FM.unserialize(cookie.reg);
        if(this.registry == null || !FM.isObject(this.registry)) this.registry = {};
    }
    
    pkey = FM.trim(pkey);
    if(FM.startsWith(pkey, "/")) {
        pkey = pkey.substr(1);
    }
    if(FM.endsWith(pkey, "/")) {
        pkey = pkey.substr(0,pkey.length -1);
    }
    pkey = pkey.replace(/\//g,'.');
    var val = FM.getAttr(this.registry,pkey,defv);

    return val;
}

FM.UtRegistry.prototype.remove = function(pkey) {
    if(this.registry == null) {
        var cookie = FM.loadCookie(this.cookieName);
        if(FM.isset(cookie.reg)) this.registry = FM.unserialize(cookie.reg);
        if(this.registry == null || !FM.isObject(this.registry)) this.registry = {};
    }

    var ndef = FM.UtRegistry.findKey(this.registry,pkey);
    if(!ndef.node) return false;

    var nnode = {};
    for(var en in ndef.node) {
        if(en != ndef.keyName) {
            nnode[en] = ndef.node[en];
        }
    }

    if(ndef.parent) ndef.parent[ndef.nodeKey] = nnode;
    else this.registry = nnode;

    FM.saveCookie(this.cookieName,{reg: FM.serialize(this.registry)});
    return true;
}

FM.UtRegistry.prototype.findKey = function(key,force) {
    return FM.UtRegistry.findKey(this.registry,key,force);
}

// static
FM.UtRegistry.findKey = function(reg,key,force) {
    
    var retc = {found: false, node: null, nodeKey: '', parent: null, keyName: '', keyValue: null};
    force = FM.isset(force) && force == true ? true: false;

    if(!FM.isset(reg) || !reg || !FM.isObject(reg)) return retc;
    if(!FM.isset(key) || !key || key == '') return retc;

    var apath_f = key.split("/");
    var apath = [];
    for(var k=0; k < apath_f.length; k++) {
        if(apath_f[k] != null && apath_f[k] != '') {
            apath.push(apath_f[k]);
        }
    }
    if(apath.length < 1) return retc;

    var ndirs = apath.length -1;

    retc.keyName = apath[apath.length -1];
    retc.node = reg;
    for(var i = 0; i < ndirs; i++) {
        var nname = apath[i];
        if(!FM.isset(retc.node[nname]) || !FM.isObject(retc.node[nname])) {
            if(force) retc.node[nname] = {};
            else return retc;
        }
        retc.parent = retc.node;
        retc.nodeKey = nname;
        retc.node = retc.node[nname];
    }

    if(FM.isset(retc.node[retc.keyName])) {
        retc.found = true;
        retc.keyValue = retc.node[retc.keyName];
    }

    return retc;
}


/**
 * Templates factory class. 
 * 
 * @class FM.UtTemplate
 * @extends FM.Object
 * @param {object} opt Options
 */
FM.UtTemplate = FM.defineClass('UtTemplate', FM.Object);
FM.UtTemplate.loadedTemplates = {};

FM.UtTemplate.prototype._init = function(attrs) {
    this._super("_init", attrs);
    this.objectSubClass = "Template";
}

FM.UtTemplate.getTemplateArgs = function(attrlist) {
    var params = {};
    FM.forEach(attrlist, function(i, v) {
        if (FM.startsWith(i, "data-fmml-template-attr-")) {
            params[i.substring(24)] = v;
        }
        return true;
    });

    return params;
}

FM.UtTemplate.getTemplate = function(app, attrlist, tname, cbfn) {
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {
    };
    attrlist = FM.isset(attrlist) && attrlist && FM.isObject(attrlist) ? attrlist : {};
    var params = FM.UtTemplate.getTemplateArgs(attrlist);

    FM.UtTemplate.fetchTemplate(app, tname, function(isok, templ) {
        if (isok) {
            callbackFn(true, FM.applyTemplate(params, templ, false, false));
        } else {
            callbackFn(false, templ);
        }
    });
}

FM.UtTemplate.getLoadedTemplate = function(app, name) {
    var list = FM.UtTemplate.loadedTemplates;

    app = FM.isset(app) && app ? app : null;
    var appCls = app ? app.getSubClassName() : null;
    var appCfg = appCls && FM.isset(list[appCls]) ? list[appCls] : null;

    var obj = null;
    if (appCfg && FM.isset(appCfg[name])) {
        obj = appCfg[name];
    } else if (app && FM.isArray(app.applicationObjectsSpace)) {
        FM.forEach(app.applicationObjectsSpace, function(i, ns) {
            if (FM.isset(list[ns]) && FM.isset(list[ns][name])) {
                obj = list[ns][name];
                return false;
            }
            return true;
        });
    }

    if (!obj && FM.isset(list['GLOBAL']) && FM.isset(list['GLOBAL'][name])) {
        obj = list['GLOBAL'][name];
    }

    // check in DOM
    if (!obj) {
        var templNode = $("[data-fmml-template-def='" + name + "']");
        if (templNode.length > 0) {
            obj= $(templNode[0]).html();
        }
    }

    return obj;
}

FM.UtTemplate.addTemplate = function(tname, tdata, appCls) {
    appCls = FM.isset(appCls) && FM.isString(appCls) && appCls != '' ? appCls : 'GLOBAL';
    if (!FM.isset(tdata) || !tdata)
        return false;
    if (!FM.isset(tname) || !tname || tname == '')
        return false;
    if (!FM.isset(FM.UtTemplate.loadedTemplates[appCls])) {
        FM.UtTemplate.loadedTemplates[appCls] = {};
    }
    FM.UtTemplate.loadedTemplates[appCls][tname] = tdata;
    return true;
}

FM.UtTemplate.fetchTemplate = function(app, tname, cbfn) {
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {
    };
    var templData = FM.UtTemplate.getLoadedTemplate(app, tname);
    if (templData) {
        callbackFn(true, templData);
        return;
    }

    var res = tname.replace(/\./g, '/');
    res = '/' + res.replace('/html', '.html');
    var dmlist = new FM.DmList({
        fm_templates_path: app.getAttr(
            "fm_templates_path",
            FM.getAttr(
            FM, "templates_path",
            FM.getAttr(
            window, "FM_TEMPLATES_PATH",
            "/resources/templates"
            )
            )
            )
    }, 'getTemplate', app);
    var lurl = dmlist.getProperty('config.url', '');
    lurl += res;
    dmlist.setProperty('config.url', lurl);
    FM.log(app, "Loading template " + lurl + " ...", FM.logLevels.debug);

    var lstnr = {
        onListEnd: function(sender, data) {
            var oData = null;
            FM.forEach(data.Added, function(id, obj) {
                oData = obj;
                return false;
            });
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            if (oData) {
                FM.UtTemplate.addTemplate(tname, oData.getAttr("value", ""), app.getSubClassName());
                callbackFn(true, oData.getAttr("value"));
            } else {
                callbackFn(false, new FM.DmGenericError({
                    messageId: -1,
                    text: 'Data error: invalid response.'
                }));
            }
            return true;
        },
        onListError: function(sender, data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            callbackFn(false, new FM.DmGenericError({
                messageId: -1,
                text: data
            }));
            return true;
        }
    };
    dmlist.addListener(lstnr);
    dmlist.getData();
}




/**
* Translations class. 
* 
* @class FM.UtTranslations
* @extends FM.Object
* @param {object} opt Options
*/    
FM.UtTranslations = FM.defineClass('UtTranslations',FM.Object);
FM.UtTranslations.className = "UtTranslations";


FM.UtTranslations.prototype._init = function(attrs) {
    this._super("_init",attrs);
    
    // properties
    this.translationsLoaded = false;
    this.loadedTranslations = {};
    this.missingTranslations = {};
    this.objectSubClass = "UtTranslations";
}
    
FM.UtTranslations.fetchTranslations = function(app,cbfn) {
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {};
    var dmlist = new FM.DmList({},'getTranslations',app);     
    var lstnr = {
        onListEnd: function(sender,data) {
            FM.UtTranslations.translationsLoaded = true;
            
            FM.forEach(data.Added,function(id, obj) {
                // obj is generic value
                var dataid = FM.md5(obj.getAttr('value.text',''));
                
                FM.UtTranslations.loadedTranslations[dataid] = {
                    id: dataid,
                    text: obj.getAttr('text',''),
                    translation: obj.getAttr('translation','')
                };
                return true;
            });
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            callbackFn(true);
            return true;
        },
        onListError: function(sender,data) {
            FM.UtTranslations.translationsLoaded = true;
            
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            callbackFn(false,new FM.DmGenericError({
                messageId: -1,
                text: data
            }));
            return true;
        }
    };
    dmlist.addListener(lstnr);
    dmlist.getData();    
}
    
_T = function() { // text,app, params
    if(arguments.length < 2) return('');

    // nadji hash i prevedeni string
    var hash = FM.md5(arguments[0]);
    var str;
    
    if(FM.isset(FM.UtTranslations.loadedTranslations[hash])) {
        str = FM.UtTranslations.loadedTranslations[hash].translation;
    } else {
        str = arguments[0];
        FM.UtTranslations.missingTranslations[hash]=arguments[0];
    }

    // ubaci podatke
    for(var i = 2; i < arguments.length; i++)  {
        str = str.replace("[:" + i + "]", arguments[i]);
    }

    // kraj
    return(str);    
}





/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */


/**
* Basic DM class. Provide groups. 
* 
* @class FM.DmObject
* @extends FM.Object
* @memberOf FM
* @param {object} attrs list of attribute name and values
* @param {object} [flds] allowed attributes
*/    
FM.DmObject = FM.defineClass('DmObject',FM.Object);


// methods
FM.DmObject.prototype._init = function(attrs,flds) {            
    this.objectGroups = {};
    this.defaultGroup = '';               

    this._super("_init",attrs,flds);
    this.objectSubClass = "Object";
}

/**
 * Returns data ID of data model. 
 * Data ID is usulay value of some attribute with unique value.
 * 
 * @public     
 * @function 
 * @returns {string} 
 */
FM.DmObject.prototype.getDataID = function() {
    return this.getID();
}

/**
 * Add object to group. 
 * 
 * @public     
 * @function 
 * @param {string} gname Group name.
 * @param {boolean} [callevent=false] Fire <i>onChange</i> event.
 * @returns {boolean} Returns <i>true</i> if object is successfully added to gruop. 
 */
FM.DmObject.prototype.addGroup = function(gname,callevent) {
    if(!FM.isset(gname) || !gname || gname == '') return false;

    this.objectGroups[gname] = {
        name: gname
    }

    if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    return true;
}

/**
 * Remove object from group. 
 * 
 * @public     
 * @function 
 * @param {string} gname Group name.
 * @param {boolean} [callevent=false] Fire <i>onChange</i> event.
 * @returns {boolean} Returns <i>true</i> if object is successfully removed. 
 */
FM.DmObject.prototype.removeGroup = function(gname,callevent) {
    if(!FM.isset(gname) || !gname || !FM.isset(this.objectGroups[gname])) return false;
    var newglist = {};            
    FM.forEachAttr(this.objectGroups,function(name,value) {
        if(name != gname) {
            newglist[name] = value;
        }
        return true;
    });

    this.objectGroups = newglist;
    if(this.defaultGroup == gname) this.defaultGroup = '';
    if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    return true;
}

/**
 * Check if object is in named group.
 * 
 * @public     
 * @function 
 * @param {string} gname Group name.
 * @returns {boolean} 
 */
FM.DmObject.prototype.isInGroup = function(gname) {
    return (
        FM.isset(gname) && gname && FM.isset(this.objectGroups[gname]) ?
        true : false
        );
}

/**
 * Remove object from all groups. 
 * 
 * @public     
 * @function 
 * @param {boolean} [callevent=false] Fire <i>onChange</i> event.
 * @returns {boolean} Returns <i>true</i> if object is successfully removed. 
 */
FM.DmObject.prototype.removeAllGroups = function(callevent) {
    this.objectGroups = {};
    this.defaultGroup = '';
    if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    return true;
}


/**
 * Get list of all groups object belongs to.
 * 
 * @public     
 * @function 
 * @returns {Object} 
 */
FM.DmObject.prototype.getGroups = function() {
    return FM.cloneObject(this.objectGroups);
}

/**
 * Returns object group count.
 * 
 * @public     
 * @function 
 * @returns {number} 
 */
FM.DmObject.prototype.getGroupsCount = function() {
    return FM.sizeOf(this.objectGroups);
}

/** 
 * For each object group call function <i>doFn(groupName,groupObject)</i> 
 * until end of list or <i>false</i> is returned.    
 * 
 * @public
 * @function 
 * @param {function} [doFn={}]
 */
FM.DmObject.prototype.forEachGroup = function(doFn) {
    return FM.forEach(this.objectGroups,doFn);
}


/** 
 * Set default object group.
 * 
 * @public
 * @function 
 * @param {string} gname Group name.
 * @returns {boolean}
 */
FM.DmObject.prototype.setDefaultGroup = function(s,callevent) {
    s = FM.isset(s) && s ? s : '';
    if(s == '' || FM.isset(this.objectGroups[s])) {
        this.defaultGroup = s;
        if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
        return true;
    }            
    return false;
}

/**
 * Returns default group.
 * 
 * @public     
 * @function 
 * @returns {Object} 
 */
FM.DmObject.prototype.getDefaultGroup = function() {
    if(this.defaultGroup != '') {
        return FM.getAttr(this.objectGroups,this.defaultGroup,null);
    }

    // ako nema def ili nije vidljiv
    var defgrp = null;
    FM.forEach(this.objectGroups,function(name,value) {
        // prvi u listi
        defgrp = value;
        return false;
    }); 
    return defgrp;
}        
// == static ===================================================================
/**
 * @ignore
 */
FM.DmObject.subClassTypes = {
    GLOBAL: {}
}; 

/**
* Returns DmObject class function for <b>sctype</b> subclass type.
* @static
* @function    
* @param {object} app Application.
* @param {String} sctype Subclass type.
* @return {function} Class function.
*/   
FM.DmObject.getConfiguration = function(app,sctype) {
    var list = FM.DmObject.subClassTypes;

    app = FM.isset(app) && app ? app : null;
    var appCls = app ? app.getSubClassName() : null;
    var appCfg = appCls && FM.isset(list[appCls]) ? list[appCls] : null;
        
    var obj = null;
    if(appCfg && FM.isset(appCfg[sctype])) {
        obj = appCfg[sctype];
    } else if(app && FM.isArray(app.applicationObjectsSpace)) {
        FM.forEach(app.applicationObjectsSpace,function(i,ns) {
            if(FM.isset(list[ns]) && FM.isset(list[ns][sctype])) {
                obj = list[ns][sctype];
                return false;
            }
            return true;
        });
    }
    
    if(!obj && FM.isset(list['GLOBAL'][sctype])) {
        obj = list['GLOBAL'][sctype];
    }
    
    return obj;
}

/**
* Returns new instance of chosen <b>sctype</b> subclass type.
* 
* @static
* @public
* @function    
* @param {object} app Application.
* @param {String} sctype Subclass type.
* @return {object} Class function.
*/   
FM.DmObject.newObject = function(app,sctype, oAttrs) {    
    var clsFn = FM.DmObject.getConfiguration(app,sctype);
    return clsFn ? new clsFn(oAttrs) : null;
}

/**
* Returns application registered subclass type function.
* 
* @static
* @public
* @function    
* @param {string} [sctype="Object"] Subclass type.
* @param {string} [scapp="GLOBAL"] Application subclass type.
* @return {function} Class function or <i>FM.DmObject</i> if <i>sctype</i> 
*  is ommited, empty string or null.
*/   
FM.DmObject.getSubClassType = function(sctype,scapp) {
    if(!FM.isset(sctype) || sctype == '') {
        return FM.DmObject;
    } 
    scapp = FM.isset(scapp) && scapp != '' ? scapp : 'GLOBAL';
    if(!FM.isset(FM.DmObject.subClassTypes[scapp])) {
        return null;
    }
    
    var appcfg = FM.DmObject.subClassTypes[scapp];
    
    return FM.isset(appcfg[sctype]) ? appcfg[sctype] : null;
}

/**
* Register application subclass type.
* 
* @static
* @public
* @function    
* @param {string} sctype Subclass type.
* @param {function} clsFn DM Class to register.
* @param {string} [scapp="GLOBAL"] Application subclass.
*/   
FM.DmObject.addSubClassType = function(sctype, clsFn,scapp) {
    scapp = FM.isset(scapp) && FM.isString(scapp) && scapp != '' ? scapp : 'GLOBAL';
    if(!FM.isset(FM.DmObject.subClassTypes[scapp])) {
        FM.DmObject.subClassTypes[scapp]= {};
    }
    
    FM.DmObject.subClassTypes[scapp][sctype] = clsFn;
}


FM.DmObject.addSubClassType('Object',FM.DmObject,'GLOBAL');

/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */

/**
* Generic value DM class.
* 
* @class FM.DmGenericValue
* @extends FM.DmObject
* @memberOf FM
* @param {object} attrs list of attribute name and values.
* @param {string} attrs.value Value attribute.
*/    

FM.DmGenericValue = FM.defineClass('DmGenericValue',FM.DmObject);

// methods
FM.DmGenericValue.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        value: ""
    });
    this.objectSubClass = "GenericValue";
}
        
/**
 * Returns data ID of data model. 
 * 
 * @public     
 * @function 
 * @returns {string} 
 */
FM.DmGenericValue.prototype.getDataID = function() {
    return this.getID();
}

FM.DmObject.addSubClassType('GenericValue',FM.DmGenericValue,'GLOBAL');

/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */

/**
* Text translation DM class.
* 
* @class FM.DmTranslation
* @extends FM.DmObject
* @memberOf FM
* @param {object} attrs list of attribute name and values
* @param {string} attrs.text Original text.
* @param {string} attrs.translation Text translation.
*/    

FM.DmTranslation = FM.defineClass('DmTranslation',FM.DmObject);

// methods
FM.DmTranslation.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        text: '',
        translation: ''
    });
    this.objectSubClass = "Translation";
}

/**
 * Returns data ID of data model (<i>text</i> attribute value). 
 * 
 * @public     
 * @function 
 * @returns {string} 
 */
FM.DmTranslation.prototype.getDataID = function() {
    return this.getAttr("text",'');
}

FM.DmObject.addSubClassType('Translation',FM.DmTranslation,'GLOBAL');

/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */

/**
* Generic error DM class.
* 
* @class FM.DmGenericError
* @extends FM.DmObject
* @memberOf FM
* @param {object} attrs list of supported attribute names and values:
* @param {string} attrs.messageId Error ID.
* @param {string} attrs.text Error message.
* 
*/
FM.DmGenericError = FM.defineClass('DmGenericError',FM.DmObject);

// methods
FM.DmGenericError.prototype._init = function(attrs) {
    this._super("_init", attrs, {messageId: "0",text: "No error"});
    this.objectSubClass = "GenericError";
}

/**
 * Returns data ID of data model. 
 * 
 * @public     
 * @function 
 * @returns {string} 
 */
FM.DmGenericError.prototype.getDataID = function() {
    return this.getID();
}

/**
 * Returns <i>messageId</i> attribute value.
 * 
 * @returns {string}
 */
FM.DmGenericError.prototype.getErrorCode = function() {
    return this.getAttr('messageId','0');
}

/**
 * Set <i>messageId</i> attribute value.
 * 
 * @param {string} ec Error code.
 */
FM.DmGenericError.prototype.setErrorCode = function(ec) {
    this.setAttr('messageId',ec);
}

/**
 * Returns <i>text</i> attribute value.
 * 
 * @returns {string}
 */
FM.DmGenericError.prototype.getErrorText = function() {
    return this.getAttr('text','');
}

/**
 * Set <i>text</i> attribute value.
 * 
 * @param {string} ec Error code.
 */
FM.DmGenericError.prototype.setErrorText = function(text) {
    return this.setAttr('text',text);
}

/**
 * Check if error is occured. 
 * Object is in error state when <i>messageId</i> is not equal '0'.
 * 
 * @returns {boolean}
 */
FM.DmGenericError.prototype.isError = function() {
    var errCode = this.getErrorCode();
    
    return errCode !== '' && errCode !== '0';
}


FM.DmObject.addSubClassType('GenericError',FM.DmGenericError,'GLOBAL');

/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */
/** 
 * DM list holds FM.DmObject's.
 * 
 * @class FM.DmList
 * @extends FM.DmObject
 * @memberOf FM
 * @param {object} attrs List of attribute names and values.
 * @param {object|string} config List configuration object, 
 *  list configuration name or string evaluating to configuration object.
 *  
 * @param {string} [config.listname] Name of list configration. Automaticaly set by
 *  FM.DmList.addConfiguration.
 * @param {boolean} [config.isstatic=false] Static lists newer requests data.
 * @param {boolean} [config.cache=false] Cached lists only once requests data.
 * @param {array} [config.data] Predefined data for static list type 
 * @param {string} [config.url] URL to fetch data from.
 * @param {string} [config.method] HTTP method for AJAX call.
 * @param {string} [config.contentType='application/x-www-form-urlencoded'] HTTP content type for AJAX call.
 * @param {object} [config.headers] HTTP headers to send with AJAX call.
 * @param {string} [config.responseFormat='TEXT'] TEXT or JSON.
 * @param {object} [config.params={}] object containing list of AJAX call arguments (that mus't be valid list attributes).
 *  The value of property dasn't metter. 
 * @param {object} [config.auth] Object containing username and password properties.
 * @param {string} [config.responseClass='Object'] Class name to expect in response.
 * @param {function|string} [config.getFetchArguments] Function (or string evaluating to function) 
 *  returning object with fetch arguments and accepting object 
 *  {dmList: <list>, getMore: true|false} as argument.
 * @param {function|string} [config.isErrorResponse] Function (or string evaluating to function) 
 *  for checking responsefor errors (returns true or false)
 *  and accepting object {dmList: <list>, utAjax: oAjax, response: response} as argument.
 * @param {function|string} [config.errorParser] Function (or string evaluating to function) 
 *  responsible for parsing response to some error class instance (GenericError usualy) 
 *  and accepting object {dmList: <list>, utAjax: oAjax, response: response} as argument.
 * @param {function|string} [config.responseParser] Function (or string evaluating to function) 
 *  responsible for parsing part of response to DM object.
 *  and accepting object {dmList: <list>, response: <response>, raw: <complete response>} as argument.
 * @param {string} [config.listType='collection'] Determines if AJAX call return single, collection or none of objects.
 * @param {string} [config.dataProperty] AJAX response JSON data property containing requested objects.
 * @param {string} [config.validResponseCodes] List of valid HTTP responses separated by comas.
 * @param {string} [config.pageAttribute] FM.DmList attribute acting as fetch argument for requested page number.
 * @param {string} [config.pageSizeAttribute] FM.DmList attribute acting as fetch argument for page size.
 * @param {string} [config.fromRowAttribute] FM.DmList attribute acting as fetch argument for first row to fetch.
 * @param {string} [config.numRowsAttribute] FM.DmList attribute acting as fetch argument for response size.
 *  
 * @param {FM.AppObject} app application object.
 */
FM.DmList = FM.defineClass('DmList', FM.DmObject);


FM.DmList.prototype._init = function(attrs, config, app) {
    this.objectsList = {};
    this.listIndex = [];
    this.setApp(app);

    // ajax
    this.lastFetchTime = null;
    this.lastFetchEndTime = null;
    this.lastFetchArgs = null;
    this.lastFetchedArgs = null;

    this._super("_init", attrs);
    this.objectSubClass = "List";

    // list configuration
    config = FM.isset(config) && config ? config : null;
    if (FM.isString(config)) {
        if (FM.DmList.getConfiguration(this.app, config)) {
            config = FM.cloneObject(FM.DmList.getConfiguration(this.app, config));
        } else {
            config = FM.stringPtrToObject(config);
        }
    }

    this.setProperty('config', config && FM.isObject(config) ? config : {}, false);

    // static predefined list
    var data = this.getProperty('config.data', null);
    if (data && FM.isArray(data)) {
        this._addPredefinedData(data);
    }

}

/**
 * Returns object application instance.
 * 
 * @returns {FM.AppObject}
 * 
 */
FM.DmList.prototype.getApp = function() {
    return this.app;
}

/**
 * @ignore
 * 
 */
FM.DmList.prototype.setApp = function(a) {
    this.app = FM.isset(a) && a ? a : null;
}

/**
 * @ignore
 * 
 */
FM.DmList.prototype._addPredefinedData = function(data) {
    var clsName = this.getProperty('config.responseClass', 'Object');
    var responseObjectType = FM.DmObject.getConfiguration(this.getApp(), clsName);
    if (!responseObjectType) {
        responseObjectType = FM.stringPtrToObject(clsName);
    }
    if (!FM.isFunction(responseObjectType))
        responseObjectType = FM.DmObject;
    var added = [];
    for (var i = 0; i < data.length; i++) {
        added.push(new responseObjectType(data[i]));
    }

    if (this.isStaticList()) { // Ako je static lista
        var staticlist = this.getStaticList(); // uzmi cache za tip liste

        if (FM.isset(staticlist)) {
            staticlist[this.getDataHash()] = {Added: added, Updated: {}, Removed: {}};
        }
    }

    return this.refreshList(
        {Added: added, Updated: {}, Removed: {}}, false
        );
}

// -- func AJAX --------------------------------------------------------
/**
 * Returns arguments of last AJAX call.
 * 
 * @public
 * @function
 * @returns {object}
 */
FM.DmList.prototype.getLastFetchArgs = function() {
    return this.lastFetchArgs;
}

/**
 * Returns arguments of last successful AJAX call.
 * 
 * @public
 * @function
 * @returns {object}
 */
FM.DmList.prototype.getLastFetchedArgs = function() {
    return this.lastFetchedArgs;
}

/**
 * Prepare arguments for AJAX call.
 * 
 * @public
 * @function
 * @param {boolean} [getMore=false] Add data to list or refresh complete list.
 * 
 * @returns {object} List of arguments.
 */
FM.DmList.prototype.getDataArgs = function(getMore) {
    var args = {};
    getMore = FM.isset(getMore) && getMore == true;
    this.setProperty('clearBeforeAdd', !getMore);


    // ako imamo fn pozivamo nju, inace saljemo sve atribute  
    var fnFetchArgs = this.getProperty('config.getFetchArguments', null);
    if (fnFetchArgs && FM.isString(fnFetchArgs)) {
        fnFetchArgs = FM.stringPtrToObject(fnFetchArgs);
    }
    if (fnFetchArgs && FM.isFunction(fnFetchArgs)) {
        args = fnFetchArgs({dmList: this, getMore: getMore});
    } else { // ako nemamo fn stavljamo atribute
        this.forEachAttr(function(pname, value) {
            if (!FM.isFunction(value)) {
                args[pname] = value;
            }
            return true;
        });

        // paging
        if (getMore) {
            var fromPageAttr = this.getProperty('config.pageAttribute', '');
            if (fromPageAttr != '') {
                args[fromPageAttr] = parseInt(this.getAttr(fromPageAttr, '0')) + 1;
                var pageSizeAttr = this.getProperty('config.pageSizeAttribute', '');
                if (pageSizeAttr != '') {
                    args[pageSizeAttr] = parseInt(this.getAttr(pageSizeAttr, '20'));
                }
            } else {
                var fromRowAttr = this.getProperty('config.fromRowAttribute', '');
                if (fromRowAttr != '') {
                    args[fromRowAttr] = this.getListSize();
                    var numRowsAttr = this.getProperty('config.numRowsAttribute', '');
                    if (numRowsAttr != '') {
                        args[numRowsAttr] = parseInt(this.getAttr(numRowsAttr, '20'));
                    }
                }
            }
        }
    }

    // serijaliziraj argumente
    FM.forEach(args, function(name, value) {
        if (FM.isArray(value) || FM.isObject(value)) {
            args[name] = FM.serialize(value);
        }
        return true;
    });


    // kraj
    this.lastFetchArgs = args;
    return(args);
}


/**
 * Fired on start of AJAX call.
 * 
 * @event
 * @public
 * @param {FM.UtAjax} oAjax Source of event (usualy FM.UtAjax class instance).
 * @param {object} oArgs Ajax call arguments
 */
FM.DmList.prototype.onAjaxStateStart = function(oAjax, oArgs) {
    this.log("Starting fetch ...", FM.logLevels.info, 'onAjaxStateStart');
    this.fireEvent("onListStart", new FM.DmObject(oArgs));
}

/**
 * Fired after successfull AJAX call.
 * 
 * @event
 * @public
 * @param {FM.UtAjax} oAjax Source of event (usualy FM.UtAjax class instance).
 * @param {object} response Ajax call response.
 */
FM.DmList.prototype.onAjaxStateEnd = function(oAjax, response) {
    this.log("Fetch completed.", FM.logLevels.info, 'onAjaxStateEnd');
    oAjax.removeListener(this);

    this.lastFetchEndTime = new Date().getTime();

    var isErrorResponse = this._resFn(
        this.getProperty('config.isErrorResponse', FM.DmList._isErrorResponseDef),
        {dmList: this, utAjax: oAjax, response: response}
    );

    if (isErrorResponse) {
        var errObj = this._resFn(
            this.getProperty('config.errorParser', FM.DmList._errorParserDef),
            {dmList: this, utAjax: oAjax, response: response}
        );

        if (!errObj) {
            return this.onAjaxStateError(oAjax, "Error parsing invalid response");
            errObj = new FM.DmGenericError({
                messageId: "1",
                text: "Error parsing response"
            });
        }
        return this.fireEvent("onListError", errObj);
    }

    return this.addResponseToList(response);
}

/**
 * Fired on AJAX call error.
 * 
 * @event
 * @public
 * @param {FM.UtAjax} oAjax Source of event (usualy FM.UtAjax class instance).
 * @param {string} errTxt Error description.
 */
FM.DmList.prototype.onAjaxStateError = function(oAjax, errTxt) {
    var errObj = new FM.DmGenericError({
        messageId: "-1",
        text: !FM.isset(errTxt) || !errTxt ? "Error fetching data from server" : errTxt
    });

    this.log(
        errObj.getErrorText(),
        FM.logLevels.warn, 'onAjaxStateError'
        );

    oAjax.removeListener(this);

    this.lastFetchEndTime = new Date().getTime();
    this.fireEvent("onListError", errObj);
}

/**
 * @ignore
 */
FM.DmList.prototype._checkResponseStatus = function(oAjax) {
    if (!FM.isset(oAjax) || !oAjax) {
        return true;
    }

    var respCodesStr = FM.trim(this.getAttr('config.validResponseCodes', ''));
    var responseCodes =
        respCodesStr === '' ? [] :
        this.getAttr('config.validResponseCodes', '').split(",")
        ;

    if (FM.sizeOf(responseCodes) == 0) {
        return true;
    }

    var i;
    for (i = 0; i < FM.sizeOf(responseCodes); i++) {
        if (FM.trim(responseCodes[i]) == oAjax.lastStatusCode)
            return true;
    }

    return false;
}


/**
 * Get data from server.
 * <i>FM.DmList.onListStart</i> and <i>FM.DmList.onListEnd</i> or <i>FM.DmList.onListError</i> 
 * events will be fired on start and completition of AJAX call.
 *  
 * @public
 * @function    
 * @param {boolean} [getMore=false] Add data to list or refresh complete list.
 */
FM.DmList.prototype.getData = function(getMore) {
    if (this.isStaticList()) { // Ako je static lista
        var staticlist = this.getStaticList(); // uzmi cache za tip liste

        if (staticlist) {
            var cache =
                FM.isset(staticlist[this.getDataHash()]) ?
                staticlist[this.getDataHash()] : null
                ; // uzmi iz cachea rezultate za tocno ovu listu (get parametri ili def - 0)

            if (cache) {
                return this.refreshList(cache); // refresh list with cached data    
            }
        }
    }

    // ako nema url-a ne radimo fetch
    if (this.getProperty('config.url', '') == '') {
        this.fireEvent(
            "onListEnd",
            {
                Removed: {},
                Added: {},
                Updated: {}
            });
        return true;
    }

    // args za fetch
    var args = this.getDataArgs(getMore);

    // call            
    if (args) {
        this._ajaxCall(args);
    }

    // end
    return true;
}

/** 
 * Add FM.DmObject to list.
 * 
 * @public
 * @function    
 * @param {DmObject} inmember DmObject to add
 * @param {string} [mid=inmember.getDataID()] Object data ID.
 * @param {boolean} [callevent=false] Send <i>onListEnd</i> event.
 * @param {string} [groupName=null]. 
 */
FM.DmList.prototype.addToList = function(inmember, mid, callevent, groupName) {
    var addlst = [];

    // ako je lista objekata a ne objekt
    if (FM.isArray(inmember)) {
        addlst = inmember;
    } else {
        if (FM.isset(inmember.getDataID))
            addlst.push(inmember);
    }

    return this.refreshList({Added: addlst, Updated: [], Removed: []}, false, groupName, false, callevent);

    // kraj
    return true;
}

/**
 * Remove FM.DmObject from list,
 * 
 * @public
 * @function    
 * @param {string|object} id Id of FM.DmObject to remove 
 *  or object with list od DmObjects to remove.
 * @param {boolean} [callevent=false] Send <i>onListEnd</i> event.
 * @param {string} [groupName=null]. 
 */
FM.DmList.prototype.removeFromList = function(id, callevent, groupName) {
    var rmlist = {};
    var oOldObj;

    // ako je lista objekata ili objekt a ne id objekta
    if (FM.isObject(id)) {
        if (!FM.isset(id.getDataID)) {
            rmlist = id;
        } else {
            rmlist[id.getDataID()] = id;
        }
    } else if (FM.isString(id)) { // string id
        oOldObj = this.get(id);
        if (oOldObj) {
            rmlist[oOldObj.getDataID()] = oOldObj;
        }
    }

    var nlist = {};
    var nlistIndex = [];
    var myrmlist = [];
    this.forEachListElement(
        function(index, iObj) {
            var odataid = iObj.getDataID();
            if (!FM.isset(rmlist[odataid])) {
                nlist[odataid] = iObj;
            } else {
                myrmlist.push(iObj);
            }
            return true;
        }
    );
    this.objectsList = nlist;
    FM.forEach(this.listIndex, function(i, id) {
        if (FM.isset(nlist[id])) {
            nlistIndex.push(id);
        }
        return true;
    });
    this.listIndex = nlistIndex;
    if (callevent != false) {
        this.fireEvent(
            "onListEnd",
            {
                Removed: myrmlist,
                Added: [],
                Updated: []
            });
    }

    return myrmlist;
}

/**
 * Remove all list members with <i>attr</i> attribute value equal to <i>value</i>.
 * 
 * @public
 * @function    
 * @param {string} attr Attribute name.
 * @param {string} value Attribute value.
 * @param {boolean} [callevent=false] Send <i>onListEnd</i> event.
 * @param {string} [groupName=null]. 
 */
FM.DmList.prototype.removeFromListByAttr = function(attr, value, callevent, groupid) {
    var rmlist = {};

    this.forEachListElement(
        function(index, iObj) {
            if (iObj.getAttr(attr) == value.toString()) {
                rmlist[index] = iObj;
            }
            return true;
        }
    );
    return this.removeFromList(rmlist, callevent, groupid);
}

/**
 * Empty list.
 * 
 * @public
 * @function    
 * @param {boolean} [callevent=false] Send <i>onListEnd</i> event.
 * @param {string} [groupName=null]. 
 */
FM.DmList.prototype.clearList = function(callevent, groupid) {
    return this.removeFromList(FM.cloneObject(this.objectsList), callevent, groupid);
}

/**
 * Dispose list.
 * 
 * @public
 * @function    
 */
FM.DmList.prototype.dispose = function() {
    this.clearList(false);

    // event
    this.fireEvent("onListDispose", {});

    // props & listeners
    this.removeListener();
    this.options = {};
    this.prop = {};

    // list
    this.objectsList = {};
    this.listIndex = [];

    // ajax
    this.lastFetchTime = null;
    this.lastFetchEndTime = null;
    this.lastFetchArgs = null;
    this.lastFetchedArgs = null;
}

/**
 * Get FM.DmObject from list by data ID or attribute name-value pair.
 * 
 * @public
 * @function    
 * @param {string} key Data ID of DmObject to remove or attribute value.
 * @param {string} [aname=FM.DmObject#getDataID()] Attribute name.
 * @returns {FM.DmObject} 
 */
FM.DmList.prototype.get = function(key, aname) {
    // ako je aname def onda je par name/value attributa a ne dataid
    if (FM.isset(aname) && aname && aname != '') {
        return this.findByAttr(aname, key);
    }

    // drito u listu pod dataid-u
    key = key.toString();
    if (key && key != '' && FM.isset(this.objectsList[key])) {
        return this.objectsList[key];
    }

    // nije nadjen
    return null;
}

/**
 * @ignore
 */
FM.DmList.prototype.c = function(key, aname) {
    return this.get(key, aname);
}


/**
 * Add group of FM.DmObject to list.
 * 
 * @name set&nbsp;
 * @memberOf FM.DmList#
 * @public
 * @function    
 * @param {boolean} onlyExisting Replace only. 
 * @param {FM.DmObject{}} lst List of FM.DmObject 's to add.
 * @param {String} [idattr] Attribute to use instead of data ID. 
 */

/**
 * Add FM.DmObject to list or replace object with same data ID with new one.
 * 
 * 
 * @public
 * @function    
 * @param {FM.DmObject} member FM.DmObject to add.
 * @param {string} [id=FM.DmObject#getDataID()] Id of FM.DmObject to add.
 */
FM.DmList.prototype.set = function(member, id, idattr) {
    if (FM.isBoolean(member)) {
        var onlyExisting = member;
        var olist = id;
        idattr = FM.isset(idattr) && idattr != null ? idattr : null;

        for (var k in olist) {
            var obj = olist[k];
            if (FM.isObject(obj) && FM.isset(obj.getDataID)) {
                var did = idattr ? obj.getAttr(idattr, '') : obj.getDataID();
                var oldObj = this.get(did);
                if (!onlyExisting || oldObj == null) {
                    this.set(obj, did);
                }
            }
        }
    } else {
        id = FM.isset(id) && id ? id : member.getDataID();

        if (!FM.isset(this.objectsList[id.toString()])) {
            this.listIndex.push(id.toString());
        }
        this.objectsList[id.toString()] = member;
    }
    return true;
}

/**
 * @ignore
 */
FM.DmList.prototype.l = function(member, id, idattr) {
    return this.set(member, id, idattr);
}

/**
 * Get list of all DM.Object 's.
 * 
 * @public
 * @function    
 * @returns {DM.Object{}} 
 */
FM.DmList.prototype.getList = function() {
    return this.objectsList;
}

/**
 * Find FM.DmObject 's in list.
 *  
 * @public
 * @function    
 * @param {string} aname Attribute name. 
 * @param {string} value Attribute value.
 * @param {boolean} [all=false] Return all objects (or only first that match criteria).
 * @param {object} [orderList] List index.
 *  
 * @returns {FM.DmObject|{}}
 */
FM.DmList.prototype.findByAttr = function(aname, value, all, orderList) {
    var getall = (FM.isset(all) ? all : false);
    var retarr = getall ? {} : null;

    var obj = this.forEachListElement(
        function(index, obj) {
            if (obj.getAttr(aname.toString()) == value) {
                if (getall) {
                    if (!retarr)
                        retarr = {};
                    retarr[index] = obj;
                } else {
                    retarr = obj;
                    return(false);
                }
            }
            return(true);
        }, orderList
        );

    return(retarr);
}

/**
 * Find list index of FM.DmObject with given attribute name-value pair. 
 * 
 * @public
 * @function    
 * @param {string} attrname Attribute name 
 * @param {string} attrval Attribute value
 * @returns {number} Returns -1 when no object is found.
 */
FM.DmList.prototype.findElementIndex = function(attrname, attrval) {
    var i = this.forEachListElement(
        function(index, obj) {
            if (obj.getAttr(attrname.toString()) == attrval.toString())
                return(false);
            return(true);
        },
        true
        );
    return(i);
}

/**
 * Returns list size.
 * 
 * @public
 * @function    
 * @param {function} [filterFn] Callback function for filtering (<i>filterFn(id,attr)</i>). 
 * @returns {number} 
 */
FM.DmList.prototype.getListSize = function(filterFn) {
    return FM.DmList.getListSize(this, filterFn);
}

/**
 * For each FM.DmObject in list call function <i>doFn(id,attr)</i> 
 * until end of list or <i>false</i> return value.    
 * 
 * @public
 * @function    
 * @param {function} doFn Callback function.
 * @param [boolean=false]} returnIndex Return index of DmObject instead DmObject itself
 * @param {boolean} doSort Sort index by orderAttribute (from config)
 * @return {string} In case of <i>false</i> return value of <i>doFn()</i> call 
 *  this function returns FM.DmObject (or data id of DmObject) otherwise null or -1
 */
FM.DmList.prototype.forEachListElement = function(doFn, returnIndex) {
    // pokreni
    var id, lobj, i;

    returnIndex = FM.isset(returnIndex) ? (returnIndex == true) : false;
    for (i = 0; i < this.listIndex.length; i++) {
        lobj = this.objectsList[this.listIndex[i]];
        if (FM.isset(lobj) && FM.isset(lobj.getID)) {
            if (!doFn(id, lobj))
                return(returnIndex ? id : lobj);
        }
    }

    // kraj
    return(returnIndex ? -1 : null);
}

/**
 * Create list filter.
 * 
 * @public
 * @function    
 * @param {function} callbackFn Callback for creating list
 * @param {object} startFilter Master filter
 * @returns {object} List filter
 */
FM.DmList.prototype.createListFilter = function(callbackFn, startFilter) {
    var lst = {};
    var cbFn = FM.isset(callbackFn) ? callbackFn : function() {
        return false;
    };
    var fltStart = FM.isset(startFilter) ? startFilter : null;

    this.forEachListElement(function(index, iObj) {
        if (!fltStart || FM.isset(fltStart[iObj.getDataID()])) {
            if (cbFn(iObj))
                lst[iObj.getDataID()] = iObj;
        }
        return true;
    });

    return(lst);
}


/**
 * Create list index.
 * 
 * @public
 * @function    
 * @param {string} attr Attribute name 
 * @param {string} attrtype Attribute type (STRING,DATE,NUMBER)
 * @param {boolean} asc Ascending
 * @param {object} filterTable list filter to use
 * @returns {object} List index
 */
FM.DmList.prototype.createListIndex = function(attr, attrtype, asc, filterTable) {
    var lst = [];
    this.forEachListElement(function(index, iObj) {
        if (!FM.isset(filterTable) || FM.isset(filterTable[iObj.getDataID()]))
            lst.push(iObj);
        return true;
    });

    var sortFn = function(a, b) {
        var at, bt;
        if (attrtype == 'DATE') {
            at = FM.parseDateString(a.getAttr(attr, ''), true);
            bt = FM.parseDateString(b.getAttr(attr, ''), true);
        } else if (attrtype == 'NUMBER') {
            at = parseFloat(a.getAttr(attr, '0'), true);
            bt = parseFloat(b.getAttr(attr, '0'), true);
        } else { // STRING
            at = a.getAttr(attr, '').toString();
            bt = b.getAttr(attr, '').toString();
        }

        return(
            at > bt ? 1 : (at == bt ? 0 : -1)
            );
    }

    lst.sort(sortFn);
    if (FM.isset(asc) && asc == false)
        lst.reverse();

    return(lst);
}


/**
 * Add  objects from AJAX call response to list. Fires <i>onListEnd</i> event.
 * 
 * @public
 * @function
 * @param {object} response AJAX response
 * @param {boolean} onlyExisting Replace only existing object 
 * @param {string} [groupName] Name od objects group
 * @param {boolean} protectDirty Don't change dirty objects
 */

FM.DmList.prototype.addResponseToList = function(response, onlyExisting, groupName, protectDirty) {
    response =
        FM.isset(response) && response ?
        response : null
        ;


    if (FM.isString(response)) {
        response = {value: response};
    }

    // init
    var added = [];
    var updated = [];

    // clear
    var removed = this.getProperty('clearBeforeAdd', false) ?
        this.clearList(false) : []
        ;
    this.setProperty('clearBeforeAdd', false);

    // add
    var responseParser = this.getProperty('config.responseParser', FM.DmList._parseResponseDef);
    var listType = this.getProperty('config.listType', "collection"); // collection|single

    // za svaki ili samo jednom
    var respCol = [];
    if (response && FM.isObject(response)) {
        var rlprop = this.getProperty('config.dataProperty', null);
        if (listType == 'single') {
            if (response) {
                respCol = [rlprop ? FM.getAttr(response, rlprop, null) : response];
            }
        } else if (listType == 'none') {
            respCol = [];
        } else {
            respCol = rlprop ? FM.getAttr(response, rlprop, null) : response;
            if (!FM.isObject(respCol) && !FM.isArray(respCol)) {
                respCol = [];
            }
        }
    }

    var lstObj = null;
    for (var respId = 0; respId < respCol.length; respId++) {
        lstObj = responseParser({dmList: this, response: respCol[respId], raw: response});
        if (!lstObj) {
            this.fireEvent("onListError", new FM.DmGenericError({
                messageId: -1,
                text: 'Data error: invalid response.'
            }));
            return false;
        }

        // osvjezimo listu
        // objekti se ne zamijenjuju, radi se update da ostanu reference na obj ok
        var oldObj = this.get(lstObj.getDataID());
        if (oldObj) {
            updated.push(lstObj);
        } else {
            added.push(lstObj);
        }
    }

    if (this.isStaticList()) { // Ako je static lista
        var staticlist = this.getStaticList(); // uzmi cache za tip liste

        if (FM.isset(staticlist)) {
            staticlist[this.getDataHash()] = {Added: added, Updated: updated, Removed: removed};
        }
    }

    return this.refreshList(
        {Added: added, Updated: updated, Removed: removed}, onlyExisting, groupName, protectDirty
        );
}


/**
 * Add objects to list. Fires <i>onListEnd</i> event.
 * 
 * @public
 * @function
 * @param {object} response List of updated, deleted and inserted objects (onListEnd format)
 * @param {boolean} onlyExisting Replace only existing object 
 * @param {string} groupName Name of objects group
 * @param {boolean} protectDirty Ignore changed objects
 * @param {boolean} callEvents Call events  (default is true)
 */
FM.DmList.prototype.refreshList = function(response, onlyExisting, groupName, protectDirty, callEvents) {
    var id, oValue, oOldValue;

    // def params
    onlyExisting = FM.isset(onlyExisting) && onlyExisting == true ? true : false;
    groupName = FM.isset(groupName) && groupName ? groupName : null;
    protectDirty = FM.isset(protectDirty) && protectDirty == true ? true : false;
    response =
        FM.isset(response) && response ?
        response : null
        ;
    callEvents = FM.isset(callEvents) && callEvents == false ? false : true;

    // init
    var retList = {
        listCount: 0,
        Removed: [],
        Added: [],
        Updated: []
    };

    // brisani
    if (FM.isset(response) && FM.isset(response.Removed)) {
        for (id = 0; id < response.Removed.length; id++) {
            oValue = response.Removed[id];
            oOldValue = this.get(oValue.getDataID());
            if (groupName) {
                // makni grupu
                if (oOldValue.isInGroup(groupName)) {
                    oOldValue.removeGroup(groupName);
                }
                // micemo ga samo ako je broj grupa 0
                if (oOldValue.getGroupsCount() < 1) {
                    this.removeFromList(oOldValue.getDataID(), false);
                    retList.Removed.push(oOldValue);
                    retList.listCount++;
                } else {
                    retList.Updated.push(oOldValue);
                    retList.listCount++;
                }
            } else {
                if (oOldValue) {
                    this.removeFromList(oOldValue.getDataID(), false);
                    retList.Removed.push(oOldValue);
                    retList.listCount++;
                }
            }
        }
    }

    // dodani
    if (FM.isset(response) && FM.isset(response.Added)) {
        this._refreshAdd(response.Added, retList, onlyExisting, groupName, protectDirty);
    }
    if (FM.isset(response) && FM.isset(response.Updated)) {
        this._refreshAdd(response.Updated, retList, onlyExisting, groupName, protectDirty);
    }


    // posalji evente za change
    for (id = 0; id < retList.Updated.length; id++) {
        oOldValue = retList.Updated[id];
        oOldValue.setChanged(false, true); // call ev
    }

    // ako je listType none uvijek posalji event
    if (this.getProperty('config.listType', "collection") == 'none') {
        callEvents = true;
    }
    // kraj
    if (callEvents)
        this.fireEvent("onListEnd", retList);

    // kraj
    return(true);
}


/**
 * Return the List configuration name
 * @public
 * @function    
 * @return {string} list name
 */
FM.DmList.prototype.getListConfigName = function() {
    return this.getProperty('config.listname', '');
}

/**
 * Return if the List is static (cacheable).
 * 
 * @public
 * @function    
 * @return {boolean} 
 */
FM.DmList.prototype.isStaticList = function() {
    return this.getProperty('config.isstatic', false) == true ? true : false;
}

/**
 * Return the static list data.
 * 
 * @public
 * @function    
 * @return {object} 
 */
FM.DmList.prototype.getStaticList = function() {
    var listconfig = FM.DmList.getConfiguration(this.getApp(), this.getListConfigName());

    if (listconfig) {
        if (!FM.isset(listconfig.staticlist) || !FM.isObject(listconfig.staticlist)) {
            listconfig.staticlist = {};
        }
        return listconfig.staticlist;
    }

    return null; //error
}

// -- private ------------------------------------------------------------------
/**
 * 
 * @ignore
 */
FM.DmList.prototype._resFn = function(value, args) {
    var is = value;
    if (FM.isString(is && is != 'JSON')) { // hack
        var isFn = FM.stringPtrToObject(is);
        if (isFn)
            is = isFn;
    }
    if (is && FM.isFunction(is)) {
        try {
            is = is(args);
        } catch (e) {
            this.log(e, FM.logLevels.error, 'DmList._resFn');
        }
    }

    return is;
}

/**
 * 
 * @ignore
 */
FM.DmList.prototype._ajaxCall = function(args) {
    var fnargs = {dmList: this, arguments: args};

    this.lastFetchTime = new Date().getTime();

    // resolve headers
    var hdrs = this._resFn(
        this.getProperty('config.headers', {}),
        fnargs
        );
    for (var hname in hdrs) {
        hdrs[hname] = FM.applyTemplate(
            args, hdrs[hname], false, true
            ).replace(/\s*\[\:.*?\]\s*/g, "");
    }

    var url = FM.applyTemplate(
        args,
        this._resFn(
        this.getProperty('config.url', ''),
        fnargs
        ),
        false, false
        ).replace(/\s*\[\:.*?\]\s*/g, "");


    var authArgs = this._resFn(
        this.getProperty('config.auth', {}), fnargs
        );

    // ajax config
    var utAjax = new FM.UtAjax({
        url: url,
        method: this._resFn(this.getProperty('config.method', ''), this),
        contentType: this._resFn(this.getProperty('config.contentType', 'application/x-www-form-urlencoded'), args),
        responseFormat: this._resFn(this.getProperty('config.responseFormat', 'TEXT'), args),
        validResponseCodes: this._resFn(this.getProperty('config.validResponseCodes', ''), args),
        params: this._resFn(this.getProperty('config.params', {}), args),
        headers: hdrs,
        cache: this._resFn(this.getProperty('config.cache', 'true'), this),
        auth: FM.getAttr(authArgs, 'username', '') == '' ? null : {
            username: FM.getAttr(authArgs, 'username', ''),
            password: FM.getAttr(authArgs, 'password', '')
        }
    });

    // add listener
    utAjax.addListener(this);

    // send
    utAjax.send(args);

    return true;
}

/**
 * 
 * @ignore
 */
FM.DmList.prototype._refreshAdd = function(list, retList, onlyExisting, groupid, protectDirty) {
    var id, oValue, oOldValue;

    for (id = 0; id < list.length; id++) {
        oValue = list[id];
        oOldValue = this.get(oValue.getDataID());
        if (!oOldValue || !onlyExisting) {
            if (oOldValue) { // vec postoji, ako nije editiran zamijenimo ga
                if (!oOldValue.isChanged() || !protectDirty) {
                    oValue.forEachAttr(function(name, value) {
                        oOldValue.setAttr(name, value, false); // ne zovi evente
                        return true;
                    });
                    if (groupid && !oOldValue.isInGroup(groupid)) {
                        oOldValue.addGroup(groupid);
                    }
                    retList.Updated.push(oOldValue);
                    retList.listCount++;
                }
            } else {
                if (groupid && !oValue.isInGroup(groupid)) {
                    oValue.addGroup(groupid);
                }
                this.set(oValue, oValue.getDataID());
                retList.Added.push(oValue);
                retList.listCount++;
            }
        }
    }
}

// == static ===================================================================
FM.DmList.configurations = {
    GLOBAL: {}
};

/**
 * Add new FM.DmList configuration.
 * 
 * @static
 * @function    
 * @param {String} name Name of configuration
 * @param {object} config Configuration
 * @param {String} appCls Application subclass
 */

FM.DmList.addConfiguration = function(name, config, appCls) {
    appCls = FM.isset(appCls) && FM.isString(appCls) && appCls != '' ? appCls : 'GLOBAL';
    if (!FM.isset(name) || !name || name == '')
        return false;
    if (!FM.isset(FM.DmList.configurations[appCls])) {
        FM.DmList.configurations[appCls] = {};
    }

    FM.DmList.configurations[appCls][name] = config;
    FM.DmList.configurations[appCls][name]['listname'] = name;
    return true;
}

/**
 * Returns DmList <b>config</b> configuration
 * @static
 * @function    
 * @param {object} app Application
 * @param {String} name Confiruation name
 * @return {object} list configuration or null if not found
 */
FM.DmList.getConfiguration = function(app, name) {
    var list = FM.DmList.configurations;

    var app = FM.isset(app) && app ? app : null;
    var appCls = app ? app.getSubClassName() : null;
    var appCfg = appCls && FM.isset(list[appCls]) ? list[appCls] : null;

    var obj = null;
    if (appCfg && FM.isset(appCfg[name])) {
        obj = appCfg[name];
    } else if (app && FM.isArray(app.applicationObjectsSpace)) {
        FM.forEach(app.applicationObjectsSpace, function(i, ns) {
            if (FM.isset(list[ns]) && FM.isset(list[ns][name])) {
                obj = list[ns][name];
                return false;
            }
            return true;
        });
    }

    if (!obj && FM.isset(list['GLOBAL'][name])) {
        obj = list['GLOBAL'][name];
    }

    return obj;
}

/**
 * Returns new DmList winth <b>config</b>  configuration
 * @static
 * @function    
 * @param {object} app Application instance
 * @param {object} attrs list of attributes
 * @param {String} name Configuation name
 * @return {FM.DmList} new DmList
 */
FM.DmList.newList = function(app, attrs, name) {
    var cfg = FM.DmList.getConfiguration(app, name);
    return cfg ? new FM.DmList(attrs, cfg, app) : null;
}

/**
 * For each DmObject in list call function <i>doFn(id,attr)</i> until end of list or <i>false</i> return value.    
 * @static
 * @function    
 * @param {object} list DmObject collection
 * @param {function} doFn Callback function
 * @param {boolean} returnIndex Return index of DmObject instead DmObject itself
 * @param {object} orderList List index 
 * @return {string} In case of <i>false</i> return value of <i>doFn()</i> call return DmObject (or data id of DmObject) otherwise null or -1
 */
FM.DmList.forEachListElement = function(list, doFn, returnIndex, orderList) {
    var id, lobj, i;

    returnIndex = FM.isset(returnIndex) ? (returnIndex == true) : false;
    orderList =
        FM.isset(orderList) && orderList && (FM.isArray(orderList) && orderList.length > 0) ?
        orderList : null;

    if (orderList) {
        for (i = 0; i < orderList.length; i++) {
            lobj = orderList[i];
            if (lobj && FM.isset(lobj.getDataID)) {
                id = lobj.getDataID();
                if (!doFn(id, lobj))
                    return(returnIndex ? id : lobj);
            }
        }
    } else {
        for (i = 0; i < list.length; i++) {
            lobj = list[i];
            if (FM.isset(lobj.getID)) {
                id = lobj.getDataID();
                if (!doFn(id, lobj))
                    return(returnIndex ? id : lobj);
            }
        }
    }
    return(returnIndex ? -1 : null);
}

/**
 * Get collection size.
 * 
 * @static
 * @function    
 * @param {object} list Collection
 * @param {function} filterFn Callback to filter collection
 * @returns {number} Number of elements in collection
 */
FM.DmList.getListSize = function(list, filterFn) {
    var n = 0;
    FM.DmList.forEachListElement(list, function(id, obj) {
        if (FM.isFunction(filterFn)) {
            if (filterFn(obj) == true) {
                n++;
            }
        } else {
            n++;
        }
        return true;
    });

    return n;
}

/**
 * 
 * @ignore
 */
FM.DmList._errorParserDef = function(options) {
    var errObj = null;
    var oAjax = FM.getAttr(options, 'utAjax', null);
    var oList = FM.getAttr(options, 'dmList');

    // status code
    if (!oList._checkResponseStatus(oAjax)) {
        errObj = new FM.DmGenericError({
            messageId: "1",
            text: "Invalid response code (" + oAjax.lastStatusCode + ")"
        });
    } else {
        errObj = new FM.DmGenericError({
            messageId: "1",
            text: "Error parsing response"
        });
    }

    return errObj;
}

/**
 * 
 * @ignore
 */
FM.DmList._isErrorResponseDef = function(options) {
    var oList = FM.getAttr(options, 'dmList');
    var oAjax = FM.getAttr(options, 'utAjax', null);
    return !oList._checkResponseStatus(oAjax);
}


/**
 * 
 * @ignore
 */
FM.DmList._parseResponseDef = function(options) {
    var oList = FM.getAttr(options, 'dmList');
    var oData = FM.getAttr(options, 'response', {});
    var clsName = oList.getProperty('config.responseClass', 'Object');
    var cls = FM.DmObject.getConfiguration(oList.getApp(), clsName);
    if (!cls) {
        cls = FM.stringPtrToObject(clsName);
    }
    if (!FM.isFunction(cls))
        return null;
    return new cls(oData);
}

/* =============================================================================
 * List configurations
 * 
 * Default for templates and translations
 * ========================================================================== */
// -- web UI templates ---------------------------------------------------------
FM.DmList.addConfiguration('getTemplate', {  
    url: "[:fm_templates_path]",
    method: 'GET',
    cache: 'true',
    contentType: 'application/x-www-form-urlencoded',
    params: {},
    headers: {},
    auth: null,        
    responseFormat: 'TEXT',
    validResponseCodes: '200',
    listType: 'single'
},'GLOBAL');

// -- web UI templates ---------------------------------------------------------
FM.DmList.addConfiguration('getTranslations', {  
    url: FM.getAttr(window,"FM_TRANSLATIONS_URL",""),
    method: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {},
    headers: {},
    auth: null,        
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'collection'
},'GLOBAL');

/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */
/**
* Basic controler class. Provide execution control methods and registry access.
* 
* @class FM.LmObject
* @extends FM.Object
* @memberOf FM
 * @param {FM.AppObject} app application object.
 * @param {object} [attrs] List of attributes.
 * 
*/    
FM.LmObject = FM.defineClass('LmObject',FM.Object);

FM.LmObject.prototype._init = function(app,opt) {            
    this.setExecuted(false);
    this.setApp(app);
    this.setDmObject();

    this._super("_init",opt); // all attributes are alowed
    this.objectSubClass = "Object";
}


/**
 * Run object.
 * 
 * @public
 * @function
 */
FM.LmObject.prototype.run = function() {
    this._super("run");
    this.setExecuted(true);
}

/**
 * Dispose object.
 * 
 * @public
 * @function 
 */
FM.LmObject.prototype.dispose = function() { 
    // reset
    this.setExecuted(false);
    this.setDmObject();
    this.setApp();            
    this._super("dispose");
}

/**
 * Check if object is running.
 * 
 * @public     
 * @function 
 * @returns {boolean} 
 */
FM.LmObject.prototype.isExecuted = function() {
    return this.executed;
}


/**
 * 
 * @ignore
 */
FM.LmObject.prototype.setExecuted = function(e) {
    this.executed = FM.isset(e) && e == true;
}

/**
 * Returns object application instance.
 * 
 * @returns {FM.AppObject}
 * 
 */
FM.LmObject.prototype.getApp = function() {
    return this.app;
}

/**
 * 
 * @ignore
 */
FM.LmObject.prototype.setApp = function(a) {
    this.app = FM.isset(a) && a ? a : null;
}

/**
 * Returns current DM object.
 * 
 * @public
 * @function
 * @returns {FM.DmObject}
 */
FM.LmObject.prototype.getDmObject = function() {
    return this.dmObject;
}

/**
 * Set DM object.
 * 
 * @param {FM.DmObject} o New DM object. 
 * @param {boolean} [addListener=false] Add listener to DM object. 
 * 
 * 
 */
FM.LmObject.prototype.setDmObject = function(o,addListener) {
    if(o && o === this.dmObject) return;
    
    if(this.dmObject) {
        this.dmObject.removeListener(this);
        if(this.getProperty('dmObjectCreated','true') === 'true') {
            this.dmObject.dispose();
        }
    }
    
    this.dmObject = FM.isset(o) && o ? o : null;
    if(this.dmObject && FM.isset(addListener) && addListener) {
        this.dmObject.addListener(this);
    }    
}

/**
 * Returns registry root key for this subclass,
 * Format of key is [/[app subclass|APP]/sClass/[my subclass]
 * 
 * @public
 * @function

 * @returns {String} 
 */
FM.LmObject.prototype.getRegistryRoot = function() {
    return  "/" + (this.app ? this.app.getSubClassName() : "APP") + 
            "/sClass" +
            "/" + this.getSubClassName()
    ;    
}


/**
 * Returns value for given key from registry,
 * 
 * @public
 * @function
 * @param {string} key Registry key.
 * @param {...} [dval=""] Default value.
 * @returns {String} 
 */
FM.LmObject.prototype.getRegistryValue = function(key,dval) {
    return this.app ? this.app.appRegistry.get(
         this.getRegistryRoot() +
         key,
         dval
     ) : dval;    
}


/**
 * Set value in for registry for given key,
 * 
 * @public
 * @function
 * @param {string} key Registry key.
 * @param {string} val Value.
 */
FM.LmObject.prototype.setRegistryValue = function(key,val) {
    if(this.app) this.app.appRegistry.set(
         this.getRegistryRoot() +
         key,
         val
     );        
}

/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */

/**
* Generic application class. 
* 
* @class FM.AppObject
* @extends FM.LmObject
* @memberOf FM
* @param {object} [opt={}] Options (application attributes).
*/
    
FM.AppObject = FM.defineClass('AppObject',FM.LmObject);

// methods
FM.AppObject.prototype._init = function(opt) {            
    this._super("_init",this,opt);
    this.objectSubClass = "Application";
    this.applicationObjectsSpace = [];
    this.strictApplicationObjectsSpace = this.getAttr("strict",false) == true;
    this.lastError = null;

    // registry
    this.appRegistry = null;
}

/**
 * Run application.
 * 
 * @public
 * @function
 */
FM.AppObject.prototype.run = function() {
    // err
    this.lastError = FM.DmObject.newObject(this,'GenericError', {});

    // registry
    this.appRegistry = new FM.UtRegistry();
    
    // start sys events
    var me = this;
    $(window).bind('hashchange.'+this.getID(), function () {
        me.fireEvent("onUrlHashChange",FM.getArgs('_page.hash',''));
    });
        
}


/**
 * Dispose application.
 * 
 * @public
 * @function
 */
FM.AppObject.prototype.dispose = function() {    
    $(window).unbind('hashchange.'+this.getID());
    this._super("dispose");    
}


/**
 * FM.DmList factory function. Function sets list property <i>appFactory.createdAt</i>
 * to current Unix timestamp with microseconds.
 * 
 * @public
 * @function
 * @param {object} [dmData={}] List attributes.
 * @param {object|string} dmConfig List configuration object, 
 *  list configuration name or string evaluating to configuration object.
 * @param {boolean} [addlstnr=true] Add application as DM list listener.
 *  
 */

FM.AppObject.prototype.dmListFactory = function(dmData,dmConfig,addlstnr) {
    var lst = new FM.DmList(dmData,dmConfig,this);
    if(lst) {
        if(!FM.isset(addlstnr) || addlstnr != false) lst.addListener(this);
        lst.setProperty('appFactory', {createdAt: FM.l_timestamp()});
    }
    return(lst);
}


/**
 * Dispose DM list.
 *
 * @public
 * @function 
 * @param {FM.DmList} lst
 */
FM.AppObject.prototype.dmListDispose = function(lst) {
    lst.dispose();
    return true;
}

/**
 * Process data bindings instructions in part of DOM. Usualy called after insertion od new elements
 * in DOM.
 * 
 * @public
 * @function
 * @param {node} [node] DOM node to start from. If ommitted processing will start from 
 *  document body.
 * 
 */
FM.AppObject.prototype.mlInit = function(node) {
    return FM.MlHost.initChildNodes(this, node);
}

/**
 * Create 'GenericError' DM object from string. 
 * Empty string indicates that there is no error.
 * 
 * @public
 * @function
 * @param {string|FM.DmGenericError} [oErr=''] Error message or 
 *  FM.DmGenericError class instance.
 * @returns {FM.DmGenericError}
 */
FM.AppObject.prototype.getErrorObject = function(oErr) {
    oErr = FM.isset(oErr) && oErr ? oErr : '';
    
    if(FM.isString(oErr)) {
        oErr = FM.DmObject.newObject(this,'GenericError', {
            messageId: oErr == '' ? '0' : '9999',
            text: oErr
        });
    }
    
    return oErr;
}

/**
 * Returns application error object.
 * 
 * @returns {FM.DmGenericError}
 */
FM.AppObject.prototype.getLastError = function() {
    return this.lastError;
}

/**
 * Set application error.
 * 
 * @param {string|FM.DmGenericError} [oErr=''] Error message or 
 *  FM.DmGenericError class instance.
 */
FM.AppObject.prototype.setLastError = function(oErr) {
    oErr = this.getErrorObject(oErr);
    if(!oErr) {
        return;
    }
    
    var me = this;
    this.lastError.forEachAttr(function(attr,value) {
        me.lastError.setAttr(attr,oErr.getAttr(attr,''));
        return true;
    });
    this.lastError.setChanged(true,true); // send event
    return;
}

/**
 * Creates DM list, executes list getData() method 
 * and returns first object in reponse if returnList is not equal true.
 * Return list itself if returnList is true.
 * 
 * @public
 * @function 
 * @param {string} listId DM list configuration name.
 * @param {boolean} returnList Return list instead first object.
 * @param {object} [attrs={}] DM list fetch arguments.
 * @param {function} cbfn Callback function in form
 * <i>function(isok,oResponse) {}</i>. 
 */
FM.AppObject.prototype.getCustomObject = function(listId,returnList,attrs,cbfn) {
    listId = FM.isset(listId) && listId && FM.isString(listId) ? listId : '';
    attrs  = FM.isset(attrs) && attrs && FM.isObject(attrs) ? attrs : {};
    var me = this;
    
    var dmlist = this.dmListFactory(attrs,listId,true);
    
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {};

    // if returnList == true return list
    if(returnList == true) {
        me.log("Returning created dmList.",FM.logLevels.info,'FM.AppObject.getCustomObject');
        callbackFn(true,dmlist);
        return;
    }
    
    // create listener 
    var lstnr = {
        onListEnd: function(sender,data) {
            // show some info in console
            me.log("End of dmList request.",FM.logLevels.info,'FM.AppObject.getCustomObject.onListEnd');
            // get first object from list
            var oData = null;
            FM.forEach(data.Added,function(id, obj) {
                oData = obj;
                return false; // exit from loop
            });
            
            sender.dispose(); // dispose dmlist
            
            // return data
            if(oData) {
                callbackFn(true,oData);
            } else {
                me.log("No data returned.",FM.logLevels.warn,'FM.AppObject.getCustomObject.onListEnd');
                callbackFn(false,null);
            }
            return true;
        },
        onListError: function(sender,data) {
            sender.dispose();
            me.log("Error fetching data." + FM.serialize(data && data.getAttr ?data.getAttr() : {}),FM.logLevels.error, 'FM.AppObject.getCustomObject.onListEnd');
            callbackFn(false,null);
            return true;
        }
    };
    // add listener to dmlist and wait for onListEnd or onListError event
    dmlist.addListener(lstnr);
    
    // fetch data from server
    dmlist.getData();
}

/**
 * Submits form defined on sender node. Form action will be overwrited 
 * (and evaluated before if necessary) with
 * <i>data-fmml-form-action</i> node attribute value if one is present.
 * 
 * @public
 * @function
 * @param {FM.MlHost|FM.MlObserver|FM.MlExtension} sender Class instance with <i>getNode</i> 
 * method. 
 * @param {...} oObj Data to send back to callback function as second parameter.
 * @param {function} [callbackFn] Callback function.
 */
FM.AppObject.prototype.submitForm = function(sender,oObj,callbackFn) {
    
    callbackFn = FM.isset(callbackFn) && callbackFn && FM.isFunction(callbackFn) ? callbackFn : function() {};
    sender = FM.isset(sender) && sender ? sender : null;
    oObj = FM.isset(oObj) && oObj ? oObj : null;
    if(!sender) {
        callbackFn(false,null);
        return;
    }
    
    var form = sender.getNode().form;
    if(form) {
        var action = $(form).attr('data-fmml-form-action');
        if(FM.startsWith(action, "@")) {
            action = sender.resolveAttrValue("-",action);
            form.action = action;
        }
        form.submit();
        callbackFn(true,oObj);
    } else {
        callbackFn(false,oObj);
    }
}

/**
 * Send HTML form request event.
 * 
 * @public
 * @event
 * 
 * @param {FM.MlHost|FM.MlObserver|FM.MlExtension} sender Class instance with <i>getNode</i> 
 * method. 
 * @param {object} [evdata] Event data: 
 * @param {...} [evdata.object] Data to send back to callback function as second parameter.
 * @param {function} [evdata.callback] Callback function.
 */
FM.AppObject.prototype.onSubmitForm = function(sender,evdata) {
    this.submitForm(
        sender,
        FM.getAttr(evdata,'object',null),
        FM.getAttr(evdata,'callback',null)
    );
}

/**
 * Returns application itself.
 * 
 * @returns {FM.AppObject}
 * 
 */
FM.AppObject.prototype.getApp = function() {
    return this;
}

/**
 * Returns registry root key for this subclass,
 * Format of key is [/[app subclass|APP]
 * 
 * @public
 * @function

 * @returns {String} 
 */
FM.AppObject.prototype.getRegistryRoot = function() {
    return  "/" + (this.app ? this.app.getSubClassName() : "APP");    
}

// static
/**
 * 
 * @ignore
 */
FM.AppObject.applicationInstances = {};

/**
 * Start new application instance. Note that only one instance of 
 * application class can exists in one page.
 * 
 * @public
 * @static
 * @function
 * @param {object} [args={}] Application configuration and options.
 * @param {string} [args.appClass='FM.AppObject'] Application class.
 * @param {object} [args.options={}] Options (application attributes).
 * @param {object|FM.Object} [evHandler] Optional event handler.
 * 
 * @returns {FM.AppObject}
 */
FM.AppObject.startApp = function(args,evHandler) {
    args = FM.isset(args) && args ? args :{};
    var appClsName = FM.getAttr(args,'appClass','FM.AppObject');
    
    // create new appCls or return app object
    var appCls = FM.getAttr(window,appClsName,FM.AppObject);
    if(!appCls) return null;
    var app = null;
    if(
        FM.isset(FM.AppObject.applicationInstances[appClsName]) && 
        FM.AppObject.applicationInstances[appClsName]
    ) {
        app = FM.AppObject.applicationInstances[appClsName];
    } else {
        app = new appCls(FM.getAttr(args,'options',{}));
    }
    if(!app) return null;
    
    FM.AppObject.applicationInstances[appClsName] = app;
    if(FM.isset(evHandler)) {
        app.addListener(evHandler);
    }
    app.run();
    return(app);
}

/**
 * Stop application instance. 
 * 
 * @public
 * @static
 * @function
 * @param {FM.AppObject} app Application to dispose.
 */
FM.AppObject.stopApp = function(app) {
    if(app) {
        FM.forEach(FM.AppObject.applicationInstances, function(i,v) {
            if(v == app) {
               FM.AppObject.applicationInstances[i] = null;
               return false;
            }
            return true;
        });
        
        return app.dispose();
    }
    
    return true;
}        


/**
* Generic test class. 
* 
* @class FM.TstGeneric
* @extends FM.Object
* @param {object} config Test configuration
*/    
FM.TstGeneric = function() {   
    this._init.apply(this, arguments); // new poziva _init()
}

FM.extendClass(FM.TstGeneric,FM.Object); 

// properties
FM.TstGeneric.prototype.objectSubClass = "";
FM.TstGeneric.prototype.testsList = null;
FM.TstGeneric.prototype.testsResults = null;

// methods
FM.TstGeneric.prototype._init = function(config) {            
    this._super("_init",config);
    this.objectSubClass = "TstGeneric";
    this.testsList = {};
    this.testsResults = {};
    this.runningTests = {};
}

FM.TstGeneric.prototype.run = function(test) {
    this.runningTests = {};
    this.testsResults = {};
    var tlist = {};    
    test = FM.isset(test) ? test : null;
    if(test) {
        this.log("Running tests [" + test + "] ...",FM.logLevels.info,this.getClassName());
        if(!FM.isset(this.testsList[test])) {
            this.log("Test [" + test + "] is not found!",FM.logLevels.error,this.getClassName());
            return false;
        }
        tlist[test] = true;        
    } else {
        this.log("Running all tests ...",FM.logLevels.info,this.getClassName());
        tlist = this.testsList;
    }

    for(var tname in tlist) {
        this.runningTests[tname] = false;
    }

    for(var tname in tlist) {
        this.log("Running test [" + tname + "] ...",FM.logLevels.info,this.getClassName());
        this[tname]();
    }
    
    return true;
}     

FM.TstGeneric.prototype.addResult = function(test,result) {
    this.testsResults[test] = result;
    this.runningTests[test] = true;
    
    for(var tname in this.runningTests) {
        if(!this.runningTests[tname]) return true;
    }
    return this.showResults();
}

FM.TstGeneric.prototype.showResults = function() {
    var cntok =0, cnterr = 0;
    this.print(" == Test results =================================================");
    for(var tname in this.testsResults) {
        if(this.testsResults[tname] == true) {
            this.print("Test [" + tname + "] is successfully finished.");
            cntok++;
        } else if(this.testsResults[tname] == false) {
            this.print("Test [" + tname + "] is in error!.");
            cnterr++;
        } else { // bilo sto osim true i false
            this.print("Test [" + tname + "] is invalid!.");
            cnterr++;
        }
    }
    this.print(" =================================================================");
    return true;
}


FM.TstGeneric.prototype.addTest = function(test) {
    if(FM.isset(this[test]) && FM.isFunction(this[test])) {
        this.testsList[test] = true;
        return true;
    }
    
    return false;
}

FM.TstGeneric.prototype.removeTest = function(test) {
    if(FM.isset(this.testsList[test])) {
        delete this.testsList[test];
        return true;
    }
    
    return false;
}

FM.TstGeneric.prototype.enableTest = function(test) {
    if(FM.isset(this.testsList[test])) {
        this.testsList[test] = true;
        return true;
    }
    
    return false;
}

FM.TstGeneric.prototype.disableTest = function(test) {
    if(FM.isset(this.testsList[test])) {
        this.testsList[test] = false;
        return true;
    }
    
    return false;
}

FM.TstGeneric.prototype.print = function(msg) {
    if(FM.isObject(msg) || FM.isArray(msg)) {
        console.dir(msg);
    } else {
        console.log(msg);
    }
}


// static
FM.TstGeneric.className = "TstGeneric";
FM.TstGeneric.fullClassName = 'tst.TstGeneric';


/**
* {@link FM.UtAjax} test class. 
* 
* @class FM.TstAjax
* @extends FM.TstGeneric
* @param {object} config Test configuration
*/    
FM.TstAjax = function() {   
    this._init.apply(this, arguments); // new poziva _init()
}

FM.extendClass(FM.TstAjax,FM.TstGeneric); 

// properties
FM.TstAjax.prototype.objectSubClass = "";


// methods
FM.TstAjax.prototype._init = function(config) {            
    this._super("_init",config);
    this.objectSubClass = "TstAjax";
    // popis testova
    this.addTest("tGet");
    this.addTest("tGetErr");
    this.addTest("tGetJSON");    
    this.addTest("tPostJSONparams");   
    this.addTest("tPutJSONparams");   
    this.addTest("tDeleteJSONparams");
}

FM.TstAjax.prototype.tGet = function() {
    this.log("tGet, Ajax GET/TEXT test started.",FM.logLevels.info,this.getClassName());
    
    var oAjax = new FM.UtAjax({
        url: 'http://10.76.150.104:9151/status', 
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'TEXT',
        validResponseCodes: '200',
        params: {},
        headers: {},
        auth: null
    });
    
    var me = this;
    oAjax.addListener({
        onAjaxStateStart: function(oAjax,oArgs) {
            me.log("tGet, onAjaxStateStart event:",FM.logLevels.info,me.getClassName());
            me.log(oArgs.getAttr("value"),FM.logLevels.info,me.getClassName());
        },
        onAjaxStateError: function(oAjax,oErr) {
            me.log("tGet, onAjaxStateError event:",FM.logLevels.info,me.getClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getClassName());
            me.addResult('tGet',false);
            
        },
        onAjaxStateEnd: function(oAjax,oData) {
            me.log("tGet, onAjaxStateEnd event:",FM.logLevels.info,me.getClassName());
            me.log(oData.getAttr("value"),FM.logLevels.info,me.getClassName());
            me.addResult('tGet',true);
        }        
    });    
    
    oAjax.send({});
}     

FM.TstAjax.prototype.tGetErr = function() {
    this.log("tGetErr, Ajax GET (invalid request) test started.",FM.logLevels.info,this.getClassName());
    
    var oAjax = new FM.UtAjax({
        url: 'http://www.index.hr', 
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'TEXT',
        validResponseCodes: '200',
        params: {},
        headers: {},
        auth: null
    });
    
    var me = this;
    oAjax.addListener({
        onAjaxStateStart: function(oAjax,oArgs) {
            me.log("tGetErr, onAjaxStateStart event:",FM.logLevels.info,me.getClassName());
            me.log(oArgs.getAttr("value"),FM.logLevels.info,me.getClassName());
        },
        onAjaxStateError: function(oAjax,oErr) {
            me.log("tGetErr, onAjaxStateError event:",FM.logLevels.info,me.getClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getClassName());
            me.addResult('tGetErr',true);
            
        },
        onAjaxStateEnd: function(oAjax,oData) {
            me.log("tGetErr, onAjaxStateEnd event:",FM.logLevels.info,me.getClassName());
            me.log(oData.getAttr("value"),FM.logLevels.info,me.getClassName());
            me.addResult('tGetErr',false);
        }        
    });    
    
    oAjax.send({});
}     

FM.TstAjax.prototype.tGetJSON = function() {
    this.log("tGetJSON, Ajax Get/JSON test started.",FM.logLevels.info,this.getClassName());
    
    var oAjax = new FM.UtAjax({
        url: 'http://www.hicegosum.com/findme-dev/api/users/563771418', 
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'JSON',
        validResponseCodes: '200',
        params: {},
        headers: {},
        auth: null
    });
    
    var me = this;
    oAjax.addListener({
        onAjaxStateStart: function(oAjax,oArgs) {
            me.log("tGetJSON, onAjaxStateStart event:",FM.logLevels.info,me.getClassName());
            me.log(oArgs.getAttr("value"),FM.logLevels.info,me.getClassName());
        },
        onAjaxStateError: function(oAjax,oErr) {
            me.log("tGetJSON, onAjaxStateError event:",FM.logLevels.info,me.getClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getClassName());
            me.addResult('tGetJSON',false);
            
        },
        onAjaxStateEnd: function(oAjax,oData) {
            me.log("tGetJSON, onAjaxStateEnd event:",FM.logLevels.info,me.getClassName());
            me.log(oData.getAttr("value"),FM.logLevels.info,me.getClassName());
            me.addResult('tGetJSON',true);
        }        
    });    
    
    oAjax.send({});
}     

FM.TstAjax.prototype.tPostJSONparams = function() {
    this.log("tPostJSONparams, Ajax Post/JSON/params test started.",FM.logLevels.info,this.getClassName());
    
    var oAjax = new FM.UtAjax({
        url: 'http://www.hicegosum.com/findme-dev/api/users', 
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'JSON',
        validResponseCodes: '200',
        params: {ids: true},
        headers: {},
        auth: null
    });
    
    var me = this;
    oAjax.addListener({
        onAjaxStateStart: function(oAjax,oArgs) {
            me.log("tPostJSONparams, onAjaxStateStart event:",FM.logLevels.info,me.getClassName());
            me.log(oArgs.getAttr("value"),FM.logLevels.info,me.getClassName());
        },
        onAjaxStateError: function(oAjax,oErr) {
            me.log("tPostJSONparams, onAjaxStateError event:",FM.logLevels.info,me.getClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getClassName());
            me.addResult('tPostJSONparams',false);
            
        },
        onAjaxStateEnd: function(oAjax,oData) {
            me.log("tPostJSONparams, onAjaxStateEnd event:",FM.logLevels.info,me.getClassName());
            me.log(oData.getAttr("value"),FM.logLevels.info,me.getClassName());
            me.addResult('tPostJSONparams',true);
        }        
    });    
    
    oAjax.send({ids: '563771418'});
}     


FM.TstAjax.prototype.tPutJSONparams = function() {
    this.log("tPutJSONparams, Ajax Put/JSON/params test started.",FM.logLevels.info,this.getClassName());
    
    var oAjax = new FM.UtAjax({
        url: 'http://www.hicegosum.com/findme-dev/api/users', 
        method: 'PUT',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'JSON',
        validResponseCodes: '200',
        params: {ids: true},
        headers: {},
        auth: null
    });
    
    var me = this;
    oAjax.addListener({
        onAjaxStateStart: function(oAjax,oArgs) {
            me.log("tPutJSONparams, onAjaxStateStart event:",FM.logLevels.info,me.getClassName());
            me.log(oArgs.getAttr("value"),FM.logLevels.info,me.getClassName());
        },
        onAjaxStateError: function(oAjax,oErr) {
            me.log("tPutJSONparams, onAjaxStateError event:",FM.logLevels.info,me.getClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getClassName());
            me.addResult('tPutJSONparams',false);
            
        },
        onAjaxStateEnd: function(oAjax,oData) {
            me.log("tPutJSONparams, onAjaxStateEnd event:",FM.logLevels.info,me.getClassName());
            me.log(oData.getAttr("value"),FM.logLevels.info,me.getClassName());
            me.addResult('tPutJSONparams',true);
        }        
    });    
    
    oAjax.send({ids: '563771418'});
}     

FM.TstAjax.prototype.tDeleteJSONparams = function() {
    this.log("tDeleteJSONparams, Ajax Delete/JSON/params test started.",FM.logLevels.info,this.getClassName());
    
    var oAjax = new FM.UtAjax({
        url: 'http://www.hicegosum.com/findme-dev/api/users', 
        method: 'DELETE',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'JSON',
        validResponseCodes: '200',
        params: {ids: true},
        headers: {},
        auth: null
    });
    
    var me = this;
    oAjax.addListener({
        onAjaxStateStart: function(oAjax,oArgs) {
            me.log("tDeleteJSONparams, onAjaxStateStart event:",FM.logLevels.info,me.getClassName());
            me.log(oArgs.getAttr("value"),FM.logLevels.info,me.getClassName());
        },
        onAjaxStateError: function(oAjax,oErr) {
            me.log("tDeleteJSONparams, onAjaxStateError event:",FM.logLevels.info,me.getClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getClassName());
            me.addResult('tDeleteJSONparams',false);
            
        },
        onAjaxStateEnd: function(oAjax,oData) {
            me.log("tDeleteJSONparams, onAjaxStateEnd event:",FM.logLevels.info,me.getClassName());
            me.log(oData.getAttr("value"),FM.logLevels.info,me.getClassName());
            me.addResult('tDeleteJSONparams',true);
        }        
    });    
    
    oAjax.send({ids: '563771418'});
}     

// static
FM.TstAjax.className = "TstAjax";
FM.TstAjax.fullClassName = 'tst.TstAjax';


/**
* {@link FM.DmList} test class. 
* 
* @class FM.TstDmList
* @extends FM.TstGeneric
* @param {object} config Test configuration
*/
FM.TstDmList = function() {   
    this._init.apply(this, arguments); // new poziva _init()
}

FM.extendClass(FM.TstDmList,FM.TstGeneric); 

// properties
FM.TstDmList.prototype.objectSubClass = "";


// methods
FM.TstDmList.prototype._init = function(config) {            
    this._super("_init",config);
    this.objectSubClass = "TstAjax";
    
    // popis testova
    this.addTest("tGet");
    this.addTest("tGetList");
    this.addTest("tPostJSONList");
}

FM.TstDmList.prototype.tGet = function() {
    this.log("tGet, DmList test started.",FM.logLevels.info,this.getClassName());
    
    var oList = new FM.DmList({},{
        url: 'http://10.76.150.104:9151/status', 
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'TEXT',
        validResponseCodes: '200',
        params: {},
        headers: {},
        auth: null,
        
        isErrorResponse: function(me,oAjax,response) {
            me.log("tGet, isErrorResponse?",FM.logLevels.info,me.getClassName());
            if(!response || !FM.isset(response.getAttr)  || response.getAttr("value","") != 'OK') return true;
            return false;            
        },
        listType: 'single',
        order:{
            orderAttribute: 'value',
            orderAttributeType: 'STRING',
            orderType: 'ASC'
        }                
    });
    
    var me = this;
    oList.addListener({
        onListStart: function(l,oArgs) {
            me.log("tGet, onListStart event:",FM.logLevels.info,me.getClassName());
            me.log(oArgs,FM.logLevels.info,me.getClassName());
        },
        onListError: function(l,oErr) {
            me.log("tGet, onListError event:",FM.logLevels.info,me.getClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getClassName());
            me.addResult('tGet',false);
            
        },
        onListEnd: function(l,oData) {
            me.log("tGet, onListEnd event:",FM.logLevels.info,me.getClassName());
            me.log(oData,FM.logLevels.info,me.getClassName());
            me.log("tGet, onListEnd list size:" + l.getListSize(),FM.logLevels.info,me.getClassName());
            me.addResult('tGet',true);
        }        
    });    
    
    oList.getData();
}     

FM.TstDmList.prototype.tGetList = function() {
    this.log("tGetList, DmList test started.",FM.logLevels.info,this.getClassName());
    
    var oList = new FM.DmList({
        uids: '563771418'
    },{
        url: 'http://www.hicegosum.com/findme-dev/api/users', 
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'JSON',
        validResponseCodes: '200',
        params: {
            uids: true
        },
        headers: {},
        auth: null,        
        isErrorResponse: function(me,oAjax,response) {            
            me.log("tGet, isErrorResponse?",FM.logLevels.info,me.getClassName());
            if(!response || !FM.isset(response.getAttr)) return true;
            
            var fetchResponse = response.getAttr("value",null);
            if(!fetchResponse || !FM.isObject(fetchResponse)) return true;
            if(FM.getAttr(fetchResponse,"error",false)) return true;
            
            return false;            
        },
        listType: 'collection',
        collectionProperty: 'Results.Users',
        order:{
            orderAttribute: 'uid',
            orderAttributeType: 'STRING',
            orderType: 'ASC'
        }                
    });
    
    var me = this;
    oList.addListener({
        onListStart: function(l,oArgs) {
            me.log("tGetList, onListStart event:",FM.logLevels.info,me.getClassName());
            me.log(oArgs,FM.logLevels.info,me.getClassName());
        },
        onListError: function(l,oErr) {
            me.log("tGetList, onListError event:",FM.logLevels.info,me.getClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getClassName());
            me.addResult('tGetList',false);
            
        },
        onListEnd: function(l,oData) {
            me.log("tGetList, onListEnd event:",FM.logLevels.info,me.getClassName());
            me.log(oData,FM.logLevels.info,me.getClassName());
            me.log("tGetList, onListEnd list size:" + l.getListSize(),FM.logLevels.info,me.getClassName());
            me.addResult('tGetList',true);
        }        
    });    
    
    oList.getData();
}

FM.TstDmList.prototype.tPostJSONList = function() {
    this.log("tPostJSONList, DmList test started.",FM.logLevels.info,this.getClassName());
    
    var oList = new FM.DmList({
        username: 'ivana',
        password: 'ivanaTest'
    },{
        url: 'http://10.76.150.104:9151/1/customerProfile/login', 
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'JSON',
        validResponseCodes: '200',
        params: {
            username: true,
            password: true
        },
        headers: {},
        auth: null,
        
        isErrorResponse: function(me,oAjax,response) {
            me.log("tPostJSONList, isErrorResponse?",FM.logLevels.info,me.getClassName());
            if(
                !response || 
                !FM.isset(response.getAttr) || 
                !FM.isObject(response.getAttr("value",null))
            ) return true;
                
            var creds = response.getAttr("value",null);
            if(!FM.isset(creds, "IbAuthCookie")) return true;
            
            return false;            
        },
        listType: 'single',
        order:{
            orderAttribute: 'value',
            orderAttributeType: 'STRING',
            orderType: 'ASC'
        }                
    });
    
    var me = this;
    oList.addListener({
        onListStart: function(l,oArgs) {
            me.log("tPostJSONList, onListStart event:",FM.logLevels.info,me.getClassName());
            me.log(oArgs,FM.logLevels.info,me.getClassName());
        },
        onListError: function(l,oErr) {
            me.log("tPostJSONList, onListError event:",FM.logLevels.info,me.getClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getClassName());
            me.addResult('tPostJSONList',false);
            
        },
        onListEnd: function(l,oData) {
            me.log("tPostJSONList, onListEnd event:",FM.logLevels.info,me.getClassName());
            me.log(oData,FM.logLevels.info,me.getClassName());
            me.log("tPostJSONList, onListEnd list size:" + l.getListSize(),FM.logLevels.info,me.getClassName());
            me.addResult('tPostJSONList',true);
        }        
    });    
    
    oList.getData();
}     


// static
FM.TstDmList.className = "TstDmList";
FM.TstDmList.fullClassName = 'tst.TstDmList';




/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */
/**
* Generic ML template class. 
* 
* @class FM.MlTemplate
* @memberOf FM
* @extends FM.LmObject
* @param {FM.AppObject} app Application object.
* @param {object} [attrs] DOM node attributes.
* @param {node} node DOM node.
 * List of DOM attributes (check inherited attributes too):
 * <table class="fm-mlattrs">
 *  <thead>
 *   <tr>
 *    <th>Name</th><th>description</th><th>Default</th>
 *   </tr>
 *  </thead>
 *  <tbody>
 *   <tr>
 *    <td>data-fmml-template-type</td>
 *    <td>Template type (only "route" is currently supported)</td>
 *    <td>[...], route</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-template</td>
 *    <td>Template name</td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-template-replace</td>
 *    <td>
 *      Replace DOM node instead of his content.
 *    </td>
 *    <td>[false], true</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-run-on-init</td>
 *    <td>
 *      Run template after creation.
 *    </td>
 *    <td>[true], false</td>
 *   </tr>
 *  </tbody>
 * </table>
 * 
 * @example 
    &lt;!-- example of HTML template (using rote template) --&gt;
    &lt;a href=&quot;#route1&quot;&gt;First template&lt;/a&gt;
    &lt;a href=&quot;#route2&quot;&gt;Second template&lt;/a&gt;
    &lt;p
        data-fmml-template=&quot;local.[:hash].html&quot;
        data-fmml-template-type=&quot;route&quot;
        data-fmml-template-attr-hash=&quot;@FM.getArgs(&#39;_page.hash&#39;,&#39;route1&#39;)&quot;
     &gt;
     &lt;/p&gt;
 */
FM.MlTemplate = FM.defineClass('MlTemplate',FM.LmObject);

// methods
FM.MlTemplate.prototype._init = function(app,attrs,node) {
    this._super("_init",app,attrs);
    this.objectSubClass = "Template";
    this.node = node;    
    this.lastTemplateName = '';
    
    // two way binding
    this.node.fmmlTemplate = this;    
    this.getApp().addListener(this);
    this.addListener(this.getApp());
}


/**
 * Dispose template.
 * 
 * @public
 * @function 
 */
FM.MlTemplate.prototype.dispose = function() {
    FM.MlHost.disposeChildNodes(this.getNode());
    this._super("dispose");
}


/**
 * Returns template DOM node.
 * 
 * @public
 * @function
 * @returns {node}
 */
FM.MlTemplate.prototype.getNode = function() {
    return this.node;
}


/**
 * 
 * @ignore
 */
FM.MlTemplate.prototype._applyTemplate = function() {
    var me = this;

    // t. args from node attributes
    var args = FM.UtTemplate.getTemplateArgs(this.getAttr());
    
    // add global arguments (from url query str)
    if(this.getAttr('data-fmml-use-global-args','false') == 'true') {            
        var globalArgs = FM.getArgs();
        FM.forEach(globalArgs, function(n,v) {
            if(!FM.isset(args,n)) {
                args[n]=v;
            }
            return true;
        });
    }
    
    // eval values
    var app = this.getApp();
    var oObj = this.getDmObject();
    FM.forEach(args, function(n,v) {
        if(FM.isString(v) && FM.startsWith(v,'@')) {                                    
            args[n] = FM.resolveAttrValue(null,"-",v,{
                A: app,
                D: oObj,
                T: me
            });
        }
        return true;
    });

    // template name
    var tname = this.getAttr('data-fmml-template','');
    tname = FM.applyTemplate(args, tname, false, false);
    if(tname != this.lastTemplateName) {            
        FM.UtTemplate.getTemplate(app,args,tname,function(isok,templ) {
            if(isok) {
                me.lastTemplateName = tname;
                var tmplnode = $(templ);
                var replaced = me.getAttr('data-fmml-template-replace','') == "true";
                if(replaced) {
                    $(me.getNode()).replaceWith(tmplnode);
                    me.node = tmplnode;
                    me.node.fmmlTemplate = me;
                } else {
                    $(me.getNode()).html(templ);
                }
                FM.MlHost.initChildNodes(me.getApp(),me.getNode(),oObj,!replaced);
            }
        });
    }
}

/**
 * Run template.
 * 
 * @public
 * @function
 * @param {FM.DmObject} [dmObj] Template DM object.
 */
FM.MlTemplate.prototype.run = function(dmObj) {    
    this._super("run"); 
    this.setDmObject(dmObj);
    
    this._applyTemplate();

}

/**
 * Fired when change on hash of window.location object attributes occurs.
 * If template type is <i>route</i> template will be applyed again.
 *  
 * @public
 * @event
 * @param {FM.AppObject} sender This event is sent from application.
 * @param {string} hash New location hash.
 */
FM.MlTemplate.prototype.onUrlHashChange = function(sender,hash) {
    if(sender == this.getApp() && this.getAttr('data-fmml-template-type') == 'route') {
        this._applyTemplate();
    }
}

/**
* Returns new instance of template.
* 
* @static
* @public
* @function    
* @param {FM.AppObject} app Current application.
* @param {object} attrs Template attributes.
* @param {node} attrs Template node.
* @param {FM.DmObject} [oObj=null] DM object to run template with.
* 
* @return {FM.MlTemplate} New template instance.
*/   
FM.MlTemplate.newTemplate = function(app,attrs,node,oObj) {
    var obj = new FM.MlTemplate(app,attrs,node);
    if(obj && obj.getAttr('data-fmml-run-on-init','true') != 'false') {
        obj.run(oObj); 
    }
    return obj;
}

/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * ovo je flow za kreiranje dmobjekta:
 * host:
1. param dmobj (ako je data-fmml-object-class ok ili '') [false]
	return 

2. data-fmml-object-ref = funkcija koja ce vratiti dmobjekt [true]
	return

3. data-fmml-master-host (dmobjekt master hosta) [false]
	return

4. attributi (data-fmml-object-attr-*) 
5. dodaj attribute iz dmobjekta linked hosta (data-fmml-linked-host)
6. id = id != '' ? id : true
  
7. data-fmml-list != '' && data-fmml-object-id != ''
    7a. data-fmml-object-class == 'List' - vraca listu
    7b. data-fmml-object-class != 'List' - vraca prvi nafetchan obj iz listu
	getCustomObject(...
            data-fmml-object-id|attrs if id=true
            ...
            )
	return

8. data-fmml-object-class != '' && data-fmml-object-id != ''
	host|app.get[data-fmml-object-class](data-fmml-object-id|attrs if id=true);
	true;

9. kreiraj objekt iz atributa

 * -----------------------------------------------------------------------------
 */

/**
 * Generic ML Host class.
 * 
 *  
 * @class FM.MlHost
 * @memberOf FM
 * @extends FM.LmObject
 * @param {FM.AppObject} app application object.
 * @param {object} [attrs] DOM node attributes.
 * @param {DOMnode} node DOM node. 
 * List of DOM attributes (check inherited attributes too):
 * <table class="fm-mlattrs">
 *  <thead>
 *   <tr>
 *    <th>Name</th><th>description</th><th>Default</th>
 *   </tr>
 *  </thead>
 *  <tbody>
 *   <tr>
 *    <td>data-fmml-run-maximized</td>
 *    <td>Run host node full screen</td>
 *    <td>[false],true</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-error-host</td>
 *    <td>DOM node id of error host</td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-linked-host</td>
 *    <td>
 *      DOM node id of linked host. 
 *      Attributes of linked host DM object are apended to list of attributes 
 *      defined with <i>data-fmml-object-attr-&lt;attr name&gt;</i>
 *      when creating new host DM object    
 *    </td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-master-host</td>
 *    <td>
 *      DOM node id of master host. 
 *      Master host DM object will be used as this host DM object too.
 *      If value is <i>true</i> host from first parent DOM node will be used.
 *    </td>
 *    <td>[id],true</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-run-on-update</td>
 *    <td>
 *      DOM node id of the host to run on <i>onChange</> event. 
 *      Current host DM object is sent as argument.
 *    </td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-object-destroy-on-dispose</td>
 *    <td>
 *      If <i>true</i> host DM object will be disposed on host dispose.
 *    </td>
 *    <td>Depends of the way host DM object is obtained.</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-object-ref</td>
 *    <td>
 *      Evaluate content of attribute as host DM object. 
 *    </td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-object-class</td>
 *    <td>
 *      Restrict host DM object to one with given class.
 *    </td>
 *    <td></td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-object-id</td>
 *    <td>
 *      if set to <i>true</i>, call fetch function with object containing all
 *      attributes defined with <i>data-fmml-object-attr-[attr]</i>, otherwise
 *      fetch DM object with given data ID and <i>data-fmml-object-class</i> class. 
 *      Function with name 'get[<i>data-fmml-object-class</i>] if one exists in host or application.      
 *    </td>
 *    <td></td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list</td>
 *    <td>
 *      DM object is first object in response returned from named DM list.
 *      <i>data-fmml-object-id</i> is sent as argument, or object with
 *      all <i>data-fmml-object-attr-&lt;attr name&gt;</i>atributes defined.      
 *    </td>
 *    <td></td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-object-attr-[attr]</td>
 *    <td>
 *      Define value of <i>attr<i> DM object attribute. If host can't obtain DM object
 *      from other sources, new one with defined attributes will be created.
 *    </td>
 *    <td></td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-run-on-init</td>
 *    <td>
 *      Run host after creation.
 *    </td>
 *    <td>[true], false</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-host-event-[event]</td>
 *    <td>
 *      Evaluate content of attribute on <i>event</i> event.
 *    </td>
 *    <td>@...</td>
 *   </tr>
 *  </tbody>
 * </table>
 * 
 * @example 
    &lt;!-- example of HTML template --&gt;
    &lt;div data-fmml-host="Host"&gt;...&lt;/div&gt;
 */

FM.MlHost = FM.defineClass('MlHost', FM.LmObject);

// methods
FM.MlHost.prototype._init = function(app, attrs, node) {
    this._super("_init", app, attrs);
    this.objectSubClass = "Host";

    this.log(attrs, FM.logLevels.debug, 'MlHost._init');
    
    this.setNode(node);
    this.masterHost = null;

    this.listOfObservers = {};


    // two way binding
    this.node.fmmlHost = this;
    this.getApp().addListener(this);
    this.addListener(this.getApp());
    
    this.log("New host created.", FM.logLevels.debug, 'MlHost._init');
}

/**
 * Run host.
 * 
 * @public
 * @function
 * @param {FM.DmObject} [dmObj] Host DM object.
 */
FM.MlHost.prototype.run = function(dmObj) {
    this.log(this.getNode(), FM.logLevels.debug, 'MlHost.run');
    
    this._super("run"); // without dmobject, we will chose him later
    if (this.getAttr('data-fmml-run-maximized', 'false') == 'true') {
        this.log("Set host fullscreen mode.", FM.logLevels.debug, 'MlHost.run');
        this.onMaximize();
    }

    // determine host dmobject
    this.log("Select DM object ...", FM.logLevels.debug, 'MlHost.run');
    this._selectDmObject(dmObj);

    // run all observers
    this.log("Starting all observers ...", FM.logLevels.debug, 'MlHost.run');
    var obsrv = this.listOfObservers;
    for (var id in obsrv) {
        try {
            obsrv[id].run();
        } catch (e) {
            this.log(e, FM.logLevels.error, 'MlHost.run');
        }
    }
    
    this.log("New host started.", FM.logLevels.debug, 'MlHost.run');
    return true;
}

/**
 * Add new observer to host. Usualy there is no need to call this function manualy.
 * 
 * @param {FM.MlObserver} o Observer to add. 
 * If host is running observer will be started too.
 * @returns {Boolean}
 */
FM.MlHost.prototype.addObserver = function(o) {
    if (!FM.isset(o) || !o || !FM.isset(o.getID)) {
        return false;
    }
    this.listOfObservers[o.getID()] = o;
    if (this.executed) {
        o.run();
    }
    this.updateObserver(o);
    return true;
}

/**
 * Remove observer from host. 
 * Usualy there is no need to call this function manualy.
 * 
 * @param {FM.MlObserver} o Observer to remove. 
 * @returns {Boolean}
 */
FM.MlHost.prototype.removeObserver = function(o) {
    if (!FM.isset(o) || !o || !FM.isset(o.getID))
        return false;

    var nlist = {};
    var objId = o.getID();
    if (!objId)
        return false;

    for (var id in this.listOfObservers) {
        if (objId != id) {
            nlist[id] = this.listOfObservers[id];
        }
    }

    this.listOfObservers = nlist;
    return true;
}

/**
 * Call update method of observer.
 * 
 * @param {FM.MlObserver} o Observer to update. 
 * @public     
 * @function 
 */
FM.MlHost.prototype.updateObserver = function(o) {
    if (this.executed && FM.isset(o.update) && FM.isFunction(o.update)) {
        try {
            o.update(this);
        } catch (e) {
            this.log(e, FM.logLevels.error, 'MlHost.updateObserver');
        }
    }

    // kraj
    return true;
}

/**
 * Call update method of all observer.
 * 
 * @param {FM.MlObserver} o Observer to update. 
 * @public     
 * @function 
 */
FM.MlHost.prototype.updateAllObservers = function() {
    for (var id in this.listOfObservers) {
        this.updateObserver(this.listOfObservers[id]);
    }


    // kraj
    return true;
}


/**
 * Validate all observers.
 * 
 * @param {boolean} [force=true] Validate observers even if value is empty.
 *  
 * @public     
 * @function 
 */
FM.MlHost.prototype.verifyAllObservers = function(force) {
    for (var id in this.listOfObservers) {
        if (!this.verifyObserver(this.listOfObservers[id], force)) {
            return false;
        }
    }
    return true;
}

/**
 * Validate observer.
 * 
 * @param {FM.MlObserver} o Observer to validate. 
 * @public     
 * @function 
 */
FM.MlHost.prototype.verifyObserver = function(o, force) {
    return o.isValid(force);
}

/**
 * Send <i>ev</i> event to all observer.
 * 
 * @param {FM.Object} sender Source of event. 
 * @param {string} ev Event. 
 * @param {..} data Event data. 
 * @public     
 * @function 
 */
FM.MlHost.prototype.sendEventToObservers = function(sender, ev, data) {
    var fnd = false;
    for (var id in this.listOfObservers) {
        var o = this.listOfObservers[id];
        if (o.executed) {
            fnd = o.onHostEvent(sender, ev, data);
        }
    }

    // kraj 
    return fnd;
}

/**
 * Dispose host.
 * 
 * @public
 * @function 
 */
FM.MlHost.prototype.dispose = function() {
    if (this.masterHost) {
        this.masterHost.removeListener(this);
    }
    this.app.removeListener(this);
    if (this.node)
        this.node.fmmlHost = null;
    var obsrv = this.listOfObservers;
    for (var id in obsrv) {
        try {
            obsrv[id].dispose();

        } catch (e) {
            this.log(e, FM.logLevels.error, 'MlHost.dispose');
        }
    }
    this.listOfObservers = [];
    this.setDmObject();
    this.executed = false;

    this._super("dispose");
    return true;
}

/**
 * 
 * @ignore
 */
FM.MlHost.prototype.setNode = function(n) {
    this.node = FM.isset(n) && n ? n : null;
}

/**
 * Returns host DOM node.
 * 
 * @returns {node}
 * 
 */
FM.MlHost.prototype.getNode = function() {
    return this.node;
}

/**
 * Set host DM object.
 * 
 * @param {FM.DmObject} o New host DM object. <i>onSetDmObject</i> event will be fired.
 * 
 */
FM.MlHost.prototype.setDmObject = function(o) {
    this._super('setDmObject', o, true);

    this.updateAllObservers();
    this.fireEvent("onSetDmObject", this.dmObject);
}


/**
 * Returns last eror. 
 * 
 * @returns {FM.DmGenericError} 
 */
FM.MlHost.prototype.getLastError = function(oErr) {
    var errhost = this._getErrorHost();
    return errhost ? errhost.getDmObject() : null;
}


/**
 * Set last eror. 
 * 
 * @param {FM.DmGenericError|string} oErr Error to set. 
 * 
 * @return {FM.DmGenericError} 
 */
FM.MlHost.prototype.setLastError = function(oErr) {
    var errhost = this._getErrorHost();
    if (!errhost) {
        return this.getApp() ? this.getApp().setLastError(oErr) : oErr;
    }
    oErr = FM.isset(oErr) && oErr ? oErr : "";

    if (!FM.isObject(oErr)) {
        if (FM.isString(oErr)) {
            oErr = new FM.DmGenericError({"messageId": "GE", "text": oErr});
        } else {
            oErr = new FM.DmGenericError();
        }
    }

    if (!errhost.isExecuted()) {
        errhost.run(oErr);
    } else {
        var dmobj = errhost.getDmObject();
        if (!dmobj) {
            errhost.setDmObject(oErr);
        } else {
            dmobj.forEachAttr(function(attr, value) {
                dmobj.setAttr(attr, oErr.getAttr(attr, null));
                return true;
            });
            dmobj.setChanged(true, true);
            oErr = dmobj;
        }
    }

    return oErr;
}

/**
 * 
 * @ignore
 */
FM.MlHost.prototype._getErrorHost = function() {
    var errnode = document.getElementById(this.getAttr('data-fmml-error-host', ''));
    return (
            errnode && FM.isset(errnode.fmmlHost) && errnode.fmmlHost ?
            errnode.fmmlHost : null
            );
}

/**
 * 
 * @ignore
 */
FM.MlHost.prototype._getHostByIdInAttr = function(attr) {
    var lhost = this.getAttr(attr, '');
    if (lhost != '') {
        var node = document.getElementById(lhost);
        if (node && FM.isset(node.fmmlHost) && node.fmmlHost) {
            return node.fmmlHost;
        }
    }
    return null;
}

/**
 * 
 * @ignore
 */
FM.MlHost.prototype.getLinkedHost = function() {
    return this._getHostByIdInAttr('data-fmml-linked-host', '');
}

/**
 * 
 * @ignore
 */
FM.MlHost.prototype.getMasterHost = function() {
    return this._getHostByIdInAttr('data-fmml-master-host', '');
}




/**
 * Fired when change on DM object attributes or properties ocurs.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 */
FM.MlHost.prototype.onChange = function(sender, obj) {
    if (sender == this.getDmObject()) {
        this.updateAllObservers();

        var hostToRun = this.getAttr('data-fmml-run-on-update', '');
        if (hostToRun != '') {
            var node = document.getElementById(hostToRun);
            if (node && FM.isset(node.fmmlHost) && node.fmmlHost) {
                node.fmmlHost.run(this.getDmObject());
            }
        }
    }

    // kraj
    return true;
}


/**
 * Fired when on host DM object instance change.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {FM.DmObject} obj New DM object
 */
FM.MlHost.prototype.onSetDmObject = function(sender, obj) {
    if (sender == this.masterHost) {
        this.setDmObject(obj);
    }

    return true;
}

/**
 * Fired when host node is maximized.
 * 
 * @event
 * @param {FM.Object} sender Source of event.
 */
FM.MlHost.prototype.onMaximize = function(sender) {
    FM.expandToFullSCreen(this.node);

    // kraj
    return true;
}

/**
 * Main event processing method.
 * 
 * @function
 * @public
 * @param {FM.Object} sender Event source.
 * @param {string} ev Event type.
 * @param {...} data Event data.
 * @param {object} [calledlist] Reserved.
 */
FM.MlHost.prototype.onEvent = function(sender, ev, data, calledlist) {
    var cl = FM.isset(calledlist) ? calledlist : {};

    if (!this.isEnabled() || ev == "onEvent") {
        return false;
    }
    var done = false;

    //  ako imaš event fn
    if (FM.isset(this[ev])) {
        this[ev](sender, data);
        cl[this.getID()] = '1';
        FM.setAttr(cl, '_executed', '1');
        done = true;
    }

    //  ako imaš event fn u app
    if (!done && FM.isset(this.app[ev])) {
        this.app[ev](sender, data);
        cl[this.app.getID()] = '1';
        FM.setAttr(cl, '_executed', '1');
        done = true;
    }
    if (!done) {
        if (!this.sendEventToObservers(sender, ev, data)) {
            // proslijedi dalje ako nemas ev fn
            //cl = this.fireEvent(ev,data,cl);        
        }
        done = true;
    }

    // ako ima def trigger u layoutu
    var evtrg = this.getAttr('data-fmml-host-event-' + ev.toLowerCase(), '');
    if (evtrg !== '') {
        FM.resolveAttrValue(null, "-", evtrg, {
            A: this.getApp(),
            H: this,
            D: this.getDmObject()
        });
    }

    return cl;
}

/**
 * 
 * @ignore
 */
FM.MlHost.prototype._selectDmObject = function(dmObj) {
    this.setProperty('dmObjectCreated', this.getAttr("data-fmml-object-destroy-on-dispose", 'true'));

    // conf
    var objRef = this.getAttr("data-fmml-object-ref", '');
    var mhostid = this.getAttr('data-fmml-master-host', '');
    var id = this.getAttr("data-fmml-object-id", '');
    var className = this.getAttr("data-fmml-object-class", '');
    var dmconfName = this.getAttr('data-fmml-list', '');
    
    // resolve class name & id
    id = id == 'true' ? id :
        FM.resolveAttrValue(null, "-", id, {
            A: this.getApp(),
            H: this,
            D: null
        });

    className = FM.resolveAttrValue(null, "-", className, {
        A: this.getApp(),
        H: this,
        D: null
    });
    
    // == object is sent (not null, same sc name as data-fmml-object-class or data-fmml-object-class is not defined) ==
    // disposing depends of data-fmml-object-destroy-on-dispose (def false)
    if (
        FM.isset(dmObj) && dmObj &&
        dmObj.getSubClassName && (className == '' || dmObj.getSubClassName() == className)
    ) {
        this.setProperty('dmObjectCreated', this.getAttr("data-fmml-object-destroy-on-dispose", 'false'));
        this.setDmObject(dmObj);
        return;
    }

    // == check ref param (data-fmml-object-ref, start with @) =================
    // disposing depends of data-fmml-object-destroy-on-dispose (def true)
    if (objRef != '') {
        dmObj = null;
        if(FM.startsWith(objRef, '@')) {
            this.setProperty('dmObjectCreated', this.getAttr("data-fmml-object-destroy-on-dispose", 'true'));
            dmObj = FM.resolveAttrValue(null, "-", objRef, {
                A: this.getApp(),
                H: this
            });
        }
        this.setDmObject(dmObj);
        return;
    }

    // == master host (true - first parent host, or dom node id with host) =====
    // disposing depends of data-fmml-object-destroy-on-dispose (def false)
    if (mhostid != '') {
        dmObj = null;
        if (mhostid == 'true') {
            this.masterHost = FM.findNodeWithAttr(this.getNode().parentNode, "fmmlHost");
        } else {
            this.masterHost = this.getMasterHost();
        }

        // if found, add listener & get dmobject
        if (this.masterHost) {
            this.masterHost.addListener(this);
            dmObj = this.masterHost.getDmObject();            
            this.setProperty('dmObjectCreated', this.getAttr("data-fmml-object-destroy-on-dispose", 'false'));            
        }
        this.setDmObject(dmObj);
        return;
    }

    // fill attrs from node attr and linked host
    var dmAttrs = {};
    this.forEachAttr(function(n, v) {
        if (FM.startsWith(n, 'data-fmml-object-attr-')) {
            dmAttrs[n.substr(22)] = v;
        }
        return true;
    });
    
    var lhost = this.getLinkedHost();
    if (lhost && lhost.getDmObject()) {
        var lhostObj = lhost.getDmObject();
        lhostObj.forEachAttr(function(pname, value) {
            dmAttrs[pname] = value;
            return true;
        });
    }
    
    // remote fetch, cb fn
    var me = this;
    var cbfn = function(isok, oObj) {
        if (isok) {
            me.setDmObject(oObj);
        }
        else {
            me.setDmObject(null);
        }
    };
    
    
    // == get object by list =============================================
    if (this.getApp() && dmconfName != '' && id != '') {
        this.setProperty('dmObjectCreated', this.getAttr("data-fmml-object-destroy-on-dispose", 'true'));        
        this.getApp().getCustomObject(
            dmconfName,
            className == 'List',
            id == 'true' ? dmAttrs : {id: id},
            cbfn
        );
        return;
    }
    
    
    // == get object by class & id =============================================
    // if class is defined  and id is not empty (real id or true) call getter  
    // in host or in app
    // if id == 'true' send obj with attrs to fn or id if it is not
    if (className != '' && id != '') {
        this.setProperty('dmObjectCreated', this.getAttr("data-fmml-object-destroy-on-dispose", 'true'));

        // call args                
        var fnName = 'get' + className;
        var args = id == 'true' ? dmAttrs : id;        

        // check for and call get function (first in host, then in app, generic fn in app on end)    
        if (FM.isset(this[fnName])) {
            this[fnName](args, cbfn);
        } else if (this.getApp() && FM.isset(this.getApp()[fnName])) {
            this.getApp()[fnName](id, cbfn);
        } 
        return;
    }

    // create dmobject from defined attributes (def)
    var oObj = FM.DmObject.newObject(this.getApp(), className == '' ? 'Object' : className, dmAttrs);
    this.setProperty('dmObjectCreated', this.getAttr("data-fmml-object-destroy-on-dispose", 'true'));
    this.setDmObject(oObj);
}

/**
 * 
 * @ignore
 * 
 */
FM.MlHost.hostTypes = {};

/**
 * Returns MlHost <b>config</b> class function for <b>config</b> subclass type.
 * 
 * @static
 * @function    
 * @param {Object} app Application
 * @param {string} name Configuration name
 * @return {Object} host configuration or null if not found
 */
FM.MlHost.getConfiguration = function(app, name) {
    var list = FM.MlHost.hostTypes;

    app = FM.isset(app) && app ? app : null;
    var appCls = app ? app.getSubClassName() : null;
    var appCfg = appCls && FM.isset(list[appCls]) ? list[appCls] : null;

    var obj = null;
    if (appCfg && FM.isset(appCfg[name])) {
        obj = appCfg[name];
    } else if (app && FM.isArray(app.applicationObjectsSpace)) {
        FM.forEach(app.applicationObjectsSpace, function(i, ns) {
            if (FM.isset(list[ns]) && FM.isset(list[ns][name])) {
                obj = list[ns][name];
                return false;
            }
            return true;
        });
    }

    if (!obj && FM.isset(list['GLOBAL'][name])) {
        obj = list['GLOBAL'][name];
    }

    return obj;
}


/**
 * Returns new instance of chosen <b>sctype</b> host type.
 * 
 * @static
 * @public
 * @function    
 * @param {FM.AppObject} app Current application.
 * @param {object} attrs Host attributes.
 * @param {node} attrs Host node.
 * @param {String} type Host subclass type.
 * @param {FM.DmObject} [oObj=null] DM object to run host with.
 * 
 * @return {FM.MlHost} New host instance.
 */
FM.MlHost.newHost = function(app, attrs, node, type, oObj) {
    var clsFn = FM.MlHost.getConfiguration(app, type);
    var obj = clsFn ? new clsFn(app, attrs, node) : null;
    if (obj && obj.getAttr('data-fmml-run-on-init', 'true') != 'false') {
        obj.run(oObj);
    }
    return obj;
}

/**
 * Register application host type.
 *  
 * @param {string} type name.
 * @param {FM.MlHost} hostfn Host class function.
 * @param {string} [appCls='GLOBAL'] Application subclass type.
 * 
 * @returns {boolean}
 */
FM.MlHost.addHost = function(type, hostfn, appCls) {
    appCls = FM.isset(appCls) && FM.isString(appCls) && appCls != '' ? appCls : 'GLOBAL';
    if (!FM.isset(hostfn) || !FM.isFunction(hostfn))
        return false;
    if (!FM.isset(type) || !type || type == '')
        return false;
    if (!FM.isset(FM.MlHost.hostTypes[appCls])) {
        FM.MlHost.hostTypes[appCls] = {};
    }
    FM.MlHost.hostTypes[appCls][type] = hostfn;
    return true;
}

/**
 * Translate node body or attribute values. 
 * List of attributes to translate is readed from <i>data-fmml-translate</i> attributes.
 * Attribute names must be separated by comma. Use <i>_body</i> keyword to request dom node
 * content translation.
 * 
 * @function
 * @static
 * @param {FM.AppObject} app Current application.
 * @param {node} node Node to translate. 
 * 
 */
FM.MlHost.translateNode = function(app, node) {
    // what to translate
    var txtattrs = $(node).attr('data-fmml-translate');
    var attrs = txtattrs.split(",");
    var txttotranslate;
    FM.forEach(attrs, function(i, name) {
        name = FM.trim(name);
        if (name == 'body') {
            txttotranslate = $(node).text();
            if (FM.isset(txttotranslate)) {
                $(node).text(_T(txttotranslate, app));
            }
        } else {
            txttotranslate = $(node).attr(i);
            if (FM.isset(txttotranslate)) {
                $(node).attr(name, _T(txttotranslate, app));
            }
        }
        return true;
    });
}

/**
 * Init all DOM nodes with <i>fmml</i> attributes.
 * <i>@@</i> will be processed before creation od FM objects.
 * 
 * @static
 * @function
 * 
 * @param {FM.AppObject} app Current application. Note that all node attributes begining with.
 * @param {node} checknode Start node.
 * @param {FM.DmObject} [oObj=null] Contextual FM.DmObject. All templates will be applied with his data,
 * @param {boolean} [childsOnly=true] Process only child nodes.
 * List of DOM attributes (check inherited attributes too):
 * <table class="fm-mlattrs">
 *  <thead>
 *   <tr>
 *    <th>Name</th><th>description</th><th>Default</th>
 *   </tr>
 *  </thead>
 *  <tbody>
 *   <tr>
 *    <td>data-fmml-host</td>
 *    <td>Host type name to run host on this node</td>
 *    <td>Host</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-observer</td>
 *    <td>Observer type name to run on this node</td>
 *    <td>Observer</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-extensions</td>
 *    <td>Extension type names separated by space to run on this node. NOte that you can run more then one extension on single node (and Observer)</td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-template</td>
 *    <td>Template name to load,</td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-app</td>
 *    <td>Restrict access to DOM node to application with given subclass name,</td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-translate</td>
 *    <td>List of node attributes to translate separated by coma,</td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-run-on-init</td>
 *    <td>Run host automaticaly after creation,</td>
 *    <td>[true], false</td>
 *   </tr>
 *  </tbody>
 * </table>
 */
FM.MlHost.initChildNodes = function(app, checknode, oObj, childsOnly) {
    childsOnly = FM.isset(childsOnly) && childsOnly == false ? false : true;
    checknode = FM.isset(checknode) && checknode ? checknode : $('body')[0];
    var appsc = app.getSubClassName();
    var nodeList = childsOnly ? $(checknode).children() : $(checknode);

    nodeList.each(function(index) {
        var domobj = this;
        var jqobj = $(this);
        if (!jqobj)
            return;
        if (
                (!FM.isset(domobj.fmmlHost)) &&
                (!FM.isset(domobj.fmmlObserver)) &&
                (
                        jqobj.attr('data-fmml-host') ||
                        jqobj.attr('data-fmml-observer') ||
                        jqobj.attr('data-fmml-extensions') ||
                        jqobj.attr('data-fmml-template') ||
                        jqobj.attr('data-fmml-translate')
                        )
                ) {
            var mlAppCls = jqobj.attr('data-fmml-app');
            if (!mlAppCls && !app.strictApplicationObjectsSpace) {
                mlAppCls = app.getSubClassName();
            }
            if (mlAppCls == appsc) {
                // pokupi atribute 
                var attrlist = {};
                $.each(this.attributes, function(i, attrib) {
                    if (FM.isString(attrib.value) && FM.startsWith(attrib.value, '@@')) {
                        try {
                            attrlist[attrib.name] = FM.resolveAttrValue(null, "-", attrib.value, {
                                A: app,
                                D: oObj
                            });
                        } catch (e) {
                            FM.log(null, e, FM.logLevels.error, 'FM.MlHost.initChildNodes');
                        }
                    } else {
                        attrlist[attrib.name] = attrib.value;
                    }
                });


                // ako je observer
                if (jqobj.attr('data-fmml-observer')) {
                    try {
                        var obs = FM.MlObserver.newObserver(app, attrlist, domobj, jqobj.attr('data-fmml-observer'));
                        if (obs) {
                            if (obs.getHost()) {
                                obs.getHost().addObserver(obs);
                            }
                        }
                    } catch (e) {
                        FM.log(null, e, FM.logLevels.error, 'FM.MlHost.initChildNodes');
                    }
                    ;
                }

                // extenzije
                if (jqobj.attr('data-fmml-extensions')) { // ako je observer
                    var extarr = jqobj.attr('data-fmml-extensions').split(" ");
                    for (var i = 0; i < extarr.length; i++) {
                        var otype = extarr[i].toString();
                        try {
                            var oExt = FM.MlExtension.newExtension(app, attrlist, domobj, otype);
                            if (oExt && domobj.fmmlObserver)
                                domobj.fmmlObserver.addExtension(oExt);
                        } catch (e) {
                            FM.log(null, e, FM.logLevels.error, 'FM.MlHost.initChildNodes');
                        }
                        ;
                    }
                }

                // ako je host
                if (jqobj.attr('data-fmml-host')) {
                    try {
                        FM.MlHost.newHost(app, attrlist, domobj, jqobj.attr('data-fmml-host'), oObj);
                    } catch (e) {
                        FM.log(null, e, FM.logLevels.error, 'FM.MlHost.initChildNodes');
                    }
                }

                // ako je translation
                if (jqobj.attr('data-fmml-translate')) {
                    try {
                        FM.MlHost.translateNode(app, domobj);
                    } catch (e) {
                        FM.log(null, e, FM.logLevels.error, 'FM.MlHost.initChildNodes');
                    }
                }

                // ako je template                
                if (jqobj.attr('data-fmml-template')) { // begin
                    try {
                        FM.MlTemplate.newTemplate(app, attrlist, domobj, oObj);
                    } catch (e) {
                        FM.log(null, e, FM.logLevels.error, 'FM.MlHost.initChildNodes');
                    }
                }
                // end
            }
        }

        // napravi isto na child nodovima
        FM.MlHost.initChildNodes(app, this, oObj);
    });

    return true;
}

/**
 * Dispose all bindings on child nodes.
 *  
 * @static
 * @function
 * @param {node|string} checknode Node or node id to start from.
 * @param {boolean} [childsOnly=true] Process only child nodes.
 */
FM.MlHost.disposeChildNodes = function(checknode, childsOnly) {
    if (FM.isString(checknode)) {
        checknode = $('#' + checknode);
        checknode = checknode.length > 0 ? checknode[0] : null;
    }
    childsOnly = FM.isset(childsOnly) && childsOnly == false ? false : true;
    var nodes = $(checknode).find("[data-fmml-host],[data-fmml-template]");
    if (!childsOnly && $(checknode).is("[data-fmml-host],[data-fmml-template]")) {
        nodes = nodes.add(checknode);
    }

    nodes.each(function(i, n) {
        if (FM.isset(n.fmmlTemplate) && n.fmmlTemplate) {
            n.fmmlTemplate.dispose();
        }
        if (FM.isset(n.fmmlHost) && n.fmmlHost) {
            n.fmmlHost.dispose();
        }
    });
}

//
FM.MlHost.addHost("Host", FM.MlHost, "GLOBAL");

/**
* Current page query parameters host class. 
* 
* @class FM.MlHostQueryParams
* @memberOf FM
* @extends FM.MlHost
* @param {FM.AppObject} app application object
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/
FM.MlHostQueryParams = FM.defineClass('MlHostQueryParams',FM.MlHost);

FM.MlHostQueryParams.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="QueryParams";
}

FM.MlHostQueryParams.prototype.run = function() {
    this._super("run");                
    this.setDmObject(new FM.DmObject(FM.getArgs()));
}



FM.MlHost.addHost("QueryParams",FM.MlHostQueryParams,'GLOBAL');

/**
 * Generic collection ML Host class. Use it to display list of items.
 * 
 * <ul>
 * <li>All list items will be inserted in node with <i>fmmlListItems</i> CSS class.
 * If inside <i>fmmlListItems</i> node exists node with <i>fmmlListItemWrapper</i> CSS class all
 * items will be wrapped inside this node before insertion.
 * </li>
 * <li>If inside <i>fmmlListItems</i> node exists node with <i>fmmlListItemInner</i> CSS class all
 * items will be wrapped inside this node before insertion in (posibly) <i>fmmlListItemWrapper</i>
 * and <i>fmmlListItems</i> node.
 * </li>
 * <li>If inside <i>fmmlListItems</i> node exists node with <i>fmmlListItemsTemplate</i> CSS class it 
 * will be used as list items template. 
 * </li>
 * <li>If inside <i>fmmlListItems</i> node exists node with <i>fmmlListEmptyTemplate</i> CSS class it 
 * will be used as placeholder for empty rows. 
 * </li>
 * <li>If inside <i>fmmlListItems</i> node exists node with <i>fmmlListEmpty</i> CSS class it 
 * will be used as <i>fmmlListItems</i> node content when items list is empty. 
 * </li>
 * <li>If inside <i>fmmlListItems</i> node exists node with <i>fmmlListWaiting</i> CSS class it 
 * will be used as <i>fmmlListItems</i> node content during AJAX calls. 
 * </li>
 * <ul>
 *  
 * @class FM.MlHostGenericCollection
 * @memberOf FM
 * @extends FM.MlHost
 * @param {FM.AppObject} app application object.
 * @param {object} [attrs] DOM node attributes.
 * @param {DOMnode} node DOM node. 
 * List of DOM attributes (check inherited attributes too):
 * <table class="fm-mlattrs">
 *  <thead>
 *   <tr>
 *    <th>Name</th><th>description</th><th>Default</th>
 *   </tr>
 *  </thead>
 *  <tbody>
 *   <tr>
 *    <td>data-fmml-list-max-items</td>
 *    <td>Maximum number of list items to disply at once.</td>
 *    <td>FM.MlHostGenericCollection.DEF_LIST_SIZE</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-selection-size</td>
 *    <td>Maximum number of selectable items.</td>
 *    <td>[any],0,1,,,n</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-items-template-base</td>
 *    <td>
 *      Items template (used if node with <i>listItemsTemplate</i> class is not defined).
 *    </td>
 *    <td>ui.layouts.dm.[:objectClass].[:itemsLayout].html</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-items-layout</td>
 *    <td>
 *      Items layout. Use it for template name selection in template name (see <i>data-fmml-list-items-template-base</i>),      
 *    </td>
 *    <td>icon</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-items-template-empty</td>
 *    <td>
 *      Empty list placeholder template (used if node with <i>listEmptyTemplate</i> class is not defined)).
 *    </td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-fetch-on-run</td>
 *    <td>
 *      Get list data on host run.
 *    </td>
 *    <td>true</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-get-more-at-end</td>
 *    <td>
 *      Get more data if end of list is reached on <i>onNext</i> and <i>onNextPage</i> events processiog. 
 *    </td>
 *    <td>false</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-refresh-on-change</td>
 *    <td>
 *      Refresh list data on <i>onChange</i> event.
 *    </td>
 *    <td>true</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-clear-selection-on-change</td>
 *    <td>
 *      Clear sellection on <i>onChange</i> event.
 *    </td>
 *    <td>true</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-object-class</td>
 *    <td>
 *      Restrict host DM object to one with given class. This value is olways <i>List</i> for this host type.
 *    </td>
 *    <td>List</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-object-id</td>
 *    <td>
 *      This value is allways <i>true</i> for this host type: call fetch function with object containing all
 *      attributes defined with <i>data-fmml-object-attr-[attr]</i>. 
 *      See <i>data-fmml-list</i> attribute to learn how to define FM.DmList configuration.
 *    </td>
 *    <td>true</td>
 *   </tr>
 *  </tbody>
 * </table>
 * 
 * @example 
    &lt;!-- example of HTML template --&gt;
    &lt;div data-fmml-host=&quot;GenericCollection&quot; data-fmml-list=&quot;list_configuration_name&quot;&gt;
        &lt;div class=&quot;fmmlListItems&quot;&gt;
            &lt;div class=&quot;fmmlListItemWrapper&quot; data-fmml-observer=&quot;Event&quot; data-fmml-event-type=&quot;onAlterSelectionState&quot; data-fmml-event-data=&quot;[:data_id]&quot;&gt;
            &lt;/div&gt;
            &lt;div class=&quot;fmmlListItemsTemplate&quot; data-fmml-host=&quot;Host&quot;&gt;
               &lt;span data-fmml-observer=&quot;Observer&quot; data-fmml-attr-name=&quot;atr1&quot;&gt;&lt;/span&gt;
               &lt;span data-fmml-observer=&quot;Observer&quot; data-fmml-attr-name=&quot;atr2&quot;&gt;&lt;/span&gt;
               &lt;span data-fmml-observer=&quot;Observer&quot; data-fmml-attr-name=&quot;atr3&quot;&gt;&lt;/span&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
 */

FM.MlHostGenericCollection = FM.defineClass('MlHostGenericCollection', FM.MlHost);


FM.MlHostGenericCollection.prototype._init = function(app, attrs, node) {
    this._super("_init", app, attrs, node);
    this.objectSubClass = "GenericCollection";

    // important, app.getCustomObject()!
    this.setAttr('data-fmml-object-class', 'List');
    this.setAttr('data-fmml-object-id', 'true');

    // pagging
    this.listOffset = 0;

    // maximum number of items display
    this.maxItms = FM.MlHostGenericCollection.DEF_LIST_SIZE;
    try {
        this.maxItms = parseInt(
                this.getAttr(
                        'data-fmml-list-max-items',
                        FM.MlHostGenericCollection.DEF_LIST_SIZE
                        )
                );
    } catch (e) {
        // log error
    }
    this.maxItms = this.maxItms && this.maxItms > 0 ?
            this.maxItms :
            FM.MlHostGenericCollection.DEF_LIST_SIZE
            ;

    // selection
    this.selectedItems = {};

    // maximum number of items to select
    try {
        this.maxSelected = parseInt(
                this.getAttr('data-fmml-list-selection-size', '0') == 'any' ?
                -1 : this.getAttr('data-fmml-list-selection-size', '0')
                );
    } catch (e) {
        // log error
        this.maxSelected = 0;
        this.log(e, FM.logLevels.error, 'MlHostGenericCollection._init');
    }


    // items layout (use it for template name selection in template)
    this.itemsLayout = this.getAttr('data-fmml-list-items-layout', 'icon');

    // items template (used if listItemsTemplate node is not defined)
    this.itemsTemplateBase = this.getAttr(
            'data-fmml-list-items-template-base',
            "ui.layouts.dm.[:objectClass].[:itemsLayout].html"
            );

    // empty item template (used if listEmptyTemplate is not defined)
    this.itemsTemplateEmptyBase = this.getAttr('data-fmml-list-items-template-empty', '');

    // find items container if exists, otherwise this.node is container
    this.listItemsContainer = this._findNodeWithClass(this.node, 'fmmlListItems', this.node);

    // find items template node if exists
    var itmTempl = this._findNodeWithClass(this.listItemsContainer, 'fmmlListItemsTemplate', null);
    this.listItemsTemplate = itmTempl ? FM.nodeToHtml(itmTempl) : null;

    // find items empty template node if exists
    var itmTempl = this._findNodeWithClass(this.listItemsContainer, 'fmmlListEmptyTemplate', null);
    this.listEmptyTemplate = itmTempl ? FM.nodeToHtml(itmTempl) : null;

    // find list empty node if exists
    this.listEmpty = this._findNodeWithClass(this.listItemsContainer, 'fmmlListEmpty', null);

    // find list waiting node if exists
    this.listWaiting = this._findNodeWithClass(this.listItemsContainer, 'fmmlListWaiting', null);

    // find items wrapper. if fond all items will be wrapped inside before adding to container
    this.listItemsWrapper = this._findNodeWithClass(this.listItemsContainer, 'fmmlListItemWrapper', null);

    // fmmlListItemInner (if found inside this.listItemsWrapper)
    this.listItemsInner = this.listItemsWrapper ?
            this._findNodeWithClass(this.listItemsWrapper, 'fmmlListItemInner', null) :
            null
            ;

    // clear
    this._clearItems();
}

/**
 * Run host.
 * 
 * @public
 * @function
 * @param {FM.DmObject} [dmObj] Host DM object.
 */
FM.MlHostGenericCollection.prototype.run = function(oObj) {
    this.clearSelection(false);
    this.history = [];

    this._super("run", oObj); // list will be created
}

/**
 * Dispose host.
 * 
 * @public
 * @function 
 */
FM.MlHostGenericCollection.prototype.dispose = function() {
    this.maxSelected = 0;
    this.selectedItems = {};
    this._clearItems();
    this._super("dispose");
}

/**
 * Set host DM object.
 * 
 * @public
 * @function 
 * @param {FM.DmObject} o New host DM object. <i>onSetDmObject</i> event will be fired. 
 */
FM.MlHostGenericCollection.prototype.setDmObject = function(o) {
    o = o && o.getData ? o : null;

    this._super('setDmObject', o);
    if (o && this.getAttr('data-fmml-list-fetch-on-run', 'true') != 'false') {
        this.history.push(o.getAttr());
        o.getData();
    } else {
        this._refreshItems();
    }
}

/**
 * Get number of items to display.
 * 
 * @public
 * @function 
 * @returns  {number}
 * 
 */
FM.MlHostGenericCollection.prototype.getFilteredCount = function() {
    var dmList = this.getDmObject();
    if (!dmList)
        return 0;

    var itemscnt = 0;
    var me = this;

    dmList.forEachListElement(function(i, oObj) {
        if (me._filterItemFromDisplay(oObj) == true) {
            itemscnt += 1;
        }
        return true;
    });

    return itemscnt;
}

/**
 * Clear selection.
 * 
 * @public
 * @function 
 * @param {boolean} [sendevent=false] Update observers after selection change.
 * 
 */
FM.MlHostGenericCollection.prototype.clearSelection = function(sendevent) {
    this.selectedItems = {};
    var nodes = $(this.listItemsContainer).find(
            "[data-fmml-list-id='" + this.getID() + "']"
            ).filter(".fmmlSelected");

    if (nodes.length > 0) {
        nodes.removeClass("fmmlSelected");
        if (FM.isset(sendevent) && sendevent) {
            this.updateAllObservers();
        }
    }
}

/**
 * Add object to selection.
 * 
 * @function
 * @public
 * @param {string|FM.Object} o DM object or DM object data ID.
 * @param {boolean} [sendevent=false] Update observers after selection change.
 */
FM.MlHostGenericCollection.prototype.addToSelection = function(o, sendevent) {
    if (this.maxSelected == 0) {
        return;
    }

    if (FM.isArray(o)) {
        for (var i = 0; i < o.length; i++) {
            this.addToSelection(o[i], node, false);
        }
        if (FM.isset(sendevent) && sendevent) {
            this.updateAllObservers();
        }
        return;
    }

    var lst = this.getDmObject();
    var oid = FM.isset(o) && o ?
            (FM.isString(o) ? o : o.getDataID()) :
            ''
            ;
    if (!lst || !lst.get(oid)) {
        return;
    }

    if (this.maxSelected == 1) {
        this.clearSelection(false);
    } else if (this.maxSelected != -1) {
        if (this.getSelectionSize() >= this.maxSelected)
            return;
    }

    this.selectedItems[oid] = true;


    var node = $(this.listItemsContainer).children("[data-fmml-item-data-id='" + oid + "']");
    node = node && node.length ? node[0] : null;

    if (FM.isset(node) && node) {
        $(node).addClass("fmmlSelected");
    }
    if (FM.isset(sendevent) && sendevent) {
        this.updateAllObservers();
    }
}

/**
 * Remove object from selection.
 * 
 * @function
 * @public
 * @param {string|FM.Object} o DM object or DM object data ID.
 * @param {boolean} [sendevent=false] Update observers after selection change.
 */
FM.MlHostGenericCollection.prototype.removeFromSelection = function(o, sendevent) {
    if (FM.isArray(o)) {
        for (var i = 0; i < o.length; i++) {
            this.removeFromSelection(o[i], node, false);
        }
        if (FM.isset(sendevent) && sendevent) {
            this.updateAllObservers();
        }
        return;
    }

    var oid = FM.isset(o) && o ?
            (FM.isString(o) ? o : o.getDataID()) :
            ''
            ;
    if (FM.isset(this.selectedItems[oid])) {
        delete this.selectedItems[oid];
    }

    var node = $(this.listItemsContainer).children("[data-fmml-item-data-id='" + oid + "']");
    node = node && node.length ? node[0] : null;

    if (FM.isset(node) && node) {
        $(node).removeClass("fmmlSelected");
    }

    if (FM.isset(sendevent) && sendevent) {
        this.updateAllObservers();
    }
}
/**
 * Check if object is selected.
 * 
 * @function
 * @public
 * @param {string|FM.Object} o DM object or DM object data ID.
 * @returns {boolean}
*/
FM.MlHostGenericCollection.prototype.isSelected = function(o) {
    var id = FM.isset(o) && o ?
            (FM.isString(o) ? o : o.getDataID()) :
            '';
    return(id != '' && FM.isset(this.selectedItems[id]));
}

/**
 * Get number of selected items.
 * 
 * @public
 * @function 
 * @returns  {number}
 * 
 */
FM.MlHostGenericCollection.prototype.getSelectionSize = function() {
    var cnt = 0;
    FM.forEach(this.selectedItems, function() {
        cnt++;
        return true;
    });

    return cnt;
}

/**
 * Get selected items.
 * 
 * @public
 * @function 
 * @returns  {Array[FM.DmObject]}
 * 
 */
FM.MlHostGenericCollection.prototype.getSelection = function() {
    var lst = this.getDmObject();
    var sel = [];

    if (lst) {
        FM.forEach(this.selectedItems, function(id) {
            var o = lst.get(id);
            if (o) {
                sel.push(o);
            }
            return true;
        });
    }
    return sel;
}

/**
 * Signal request for selection clearing. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 */
FM.MlHostGenericCollection.prototype.onClearSelection = function(sender) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });
    this.clearSelection(true);
    evCb(true, null);
}

/**
 * Signal request for additeng  list item to selection. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {FM.DmObject|string} [evdata.object] FM.DmObject or data ID to select.
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onSelected = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });

    var itmObj = this._getEventItem(oSender, FM.getAttr(evdata, 'object', null));
    if (!itmObj) {
        evCb(false, null);
        return;
    }
    if (!this.isSelected(itmObj)) {
        this.addToSelection(itmObj, true)
    }
    if (this.isSelected(itmObj)) {
        evCb(true, itmObj);
    } else {
        evCb(false, null);
    }
}

/**
 * Signal request for removing list item from selection. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {FM.DmObject|string} [evdata.object] FM.DmObject or data ID to remove.
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onDeselected = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });

    var itmObj = this._getEventItem(oSender, FM.getAttr(evdata, 'object', null));
    if (!itmObj) {
        evCb(false, null);
        return;
    }

    if (this.isSelected(itmObj)) {
        this.removeFromSelection(itmObj, true)
    }
    if (!this.isSelected(itmObj)) {
        evCb(true, itmObj);
    } else {
        evCb(false, null);
    }
}

/**
 * Signal request for altering selection state of list item. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {FM.DmObject|string} [evdata.object] FM.DmObject or data ID of list item.
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onAlterSelectionState = function(oSender, evdata) {
    var itmObj = this._getEventItem(oSender, FM.getAttr(evdata, 'object', null));
    if (this.isSelected(itmObj)) {
        this.onDeselected(oSender, evdata);
    } else {
        this.onSelected(oSender, evdata);
    }
}

// PAGING
/**
 * Signals request for displaying first page of the list. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onStartOfList = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });
    this.listOffset = 0;
    this._refreshItems();
    evCb(true, null);
}

/**
 * Signals request for displaying last page of the list. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onEndOfList = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });
    this.listOffset = this.getFilteredCount() - 1;
    if (this.listOffset < 0) {
        this.listOffset = 0;
    }
    this._refreshItems();
    evCb(true, null);
}

/**
 * Signals request for increasing first list index. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onNext = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {});
    var dmList = this.getDmObject();
    if (!dmList) {
        evCb(false, null);
        return;
    }
    var itemscnt = this.getFilteredCount();

    var getMoreData = false;
    this.listOffset++;
    if (this.listOffset > itemscnt) {
        this.listOffset = itemscnt - 1;
        getMoreData = true;
    }
    if (this.listOffset < 0) {
        this.listOffset = 0;
    }

    this._refreshItems();

    if (getMoreData && this.getAttr('data-fmml-list-get-more-at-end', 'false') == 'true') {
        this._getMore();
    }
    evCb(true, null);
}

/**
 * Signals request for displaying next page of the list. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onNextPage = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });
    var dmList = this.getDmObject();
    if (!dmList) {
        evCb(true, null);
        return;
    }
    var itemscnt = this.getFilteredCount();

    var getMoreData = false;
    var calcListOffset = this.listOffset + this.maxItms;
    this.listOffset = calcListOffset;
    if (this.listOffset > itemscnt) {
        this.listOffset = Math.floor(itemscnt / this.maxItms) * this.maxItms;
        getMoreData = true;
    }

    if (this.listOffset >= itemscnt) {
        this.listOffset = this.listOffset -= this.maxItms;
        getMoreData = true;
    }
    this._refreshItems();

    if (getMoreData && this.getAttr('data-fmml-list-get-more-at-end', 'false') == 'true') {
        this._getMore();
    }
    evCb(true, null);
}

/**
 * Signals request for decreasing first list index. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onPrevious = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });
    var dmList = this.getDmObject();
    if (!dmList || this.listOffset < 1) {
        evCb(true, null);
        return;
    }
    this.listOffset--;
    this._refreshItems();
    evCb(true, null);
}

/**
 * Signals request for displaying previous page of the list. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onPreviousPage = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });
    var dmList = this.getDmObject();
    if (!dmList) {
        evCb(true, null);
        return;
    }

    var itemscnt = this.getFilteredCount();
    this.listOffset -= this.maxItms;
    if (this.listOffset > itemscnt) {
        this.listOffset = Math.floor(itemscnt / this.maxItms) * this.maxItms;
    }
    if (this.listOffset < 0) {
        this.listOffset = 0;
    }
    this._refreshItems();

    // kraj
    evCb(true, null);
}

// DATA (DM) EVENTS
/**
 * Fired when change on DM object attributes or properties ocurs.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 */
FM.MlHostGenericCollection.prototype.onChange = function(oSender, evdata) {
    this._super("onChange", oSender, evdata);

    var evObj = FM.getAttr(evdata, 'object', null);
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });

    if (
            oSender == this.getDmObject() &&
            this.getAttr('data-fmml-list-refresh-on-change', 'true') != 'false'
            ) {
        if (this.getAttr('data-fmml-list-clear-selection-on-change', 'true') != 'false') {
            this.clearSelection(true);
        }
        this.history.push(oSender.getAttr());
        oSender.getData(false); // novi fetch
    }

    // kraj
    return true;
}

/**
 * Signals request for fetching more data from server. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 */
FM.MlHostGenericCollection.prototype.onGetMore = function(oSender) {
    this._getMore();
}

/**
 * Signals request for refreshing data from server. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 */

FM.MlHostGenericCollection.prototype.onRefresh = function(oSender) {
    var dmList = this.getDmObject();
    if (dmList && FM.isset(dmList, "getData")) {
        dmList.getData(false);
    }
}

/**
 * Signals request for adding new FM.DmObject to list of items. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {FM.DmObject} [evdata.object] FM.DmObject to add.
 */
FM.MlHostGenericCollection.prototype.onAddObjectToList = function(oSender, evdata) {
    var oObj = FM.getAttr(evdata, 'object', null);
    if (!oObj) {
        return;
    }

    var dmList = this.getDmObject();
    if (dmList) {
        dmList.addToList(oObj, oObj.getDataID(), true);
    }
}

// (DM) LIST EVENTS
/**
 * Signals start of fetching data from server. Usualy sent from FM.DmList.
 * 
 * @event
 * @public
 * @param {FM.DmList} sender Source of event.
 */
FM.MlHostGenericCollection.prototype.onListStart = function(sender) {
    this._setWaiting();
    this.sendEventToObservers(sender, "onListStart", {});
}

/**
 * Signals end of fetching data from server. Usualy sent from FM.DmList.
 * 
 * @event
 * @public
 * @param {FM.DmList} sender Source of event.
 */
FM.MlHostGenericCollection.prototype.onListEnd = function(sender) {
    this.sendEventToObservers(sender, "onListEnd", {});
    this.updateAllObservers();
    this._refreshItems();

}

/**
 * Signals error condition durring fetching data from server. Usualy sent from FM.DmList.
 * 
 * @event
 * @public
 * @param {FM.DmList} sender Source of event.
 */
FM.MlHostGenericCollection.prototype.onListError = function(sender) {
    this.sendEventToObservers(sender, "onListError", {});
    this.updateAllObservers();
    this._setListEmpty();
}

// HISTORY
/**
 * Signals request for repeating previous server request. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 */
FM.MlHostGenericCollection.prototype.onHistoryBack = function(oSender, evdata) {
    if (this.history.length > 1) {
        var mydata = this.history.pop(); // me
        var data = this.history.pop(); // last

        var dmList = this.getDmObject();
        if (dmList && FM.isset(dmList, "getData")) {
            FM.forEach(data, function(n, v) {
                dmList.setAttr(n, v);
                return true;
            });
            dmList.setChanged(true, true);
        }

    }
}


/**
 * General purpose event, can be handled in app.
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype.onOpenObject = function(oSender, evdata) {
    var dmObj = this._getEventItem(oSender, FM.getAttr(evdata, 'object', null));
    if (dmObj && this.getApp().openObject) {
        this.getApp().openObject(dmObj);
    }
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype.onChangeResource = function(oSender, evdata) {
    var oObj = FM.getAttr(evdata, 'object', null);
    if (!oObj)
        return;

    // GEnericValue or obj with attr resource_url
    var resurl = oObj.getAttr('resource_url', oObj.getAttr('value', ''));

    if (resurl != '') {
        var resResolvFn = this.getAttr('data-fmml-list-attr-resource-parser', '');
        if (resResolvFn !== '') {
            resResolvFn = FM.stringPtrToObject(resResolvFn, this, this.getApp());
            if (resResolvFn) {
                try {
                    resurl = resResolvFn(this, resurl);
                } catch (e) {
                    this.log(e, FM.logLevels.error, 'MlHostGenericCollection.onChangeResource');
                }
            }
        }
        this.listOffset = 0;
        var dmList = this.getDmObject();
        if (dmList) {
            dmList.setAttr('resource_url', resurl, true);
        }
    }
}

/**
 * Signals request for changing layout of list items. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {FM.DmGenericValue} [evdata.object] FM.DmObject with attribute <i>value</i> containing
 * list layout name.
 */
FM.MlHostGenericCollection.prototype.onChangeListLayout = function(sender, evdata) {
    var layout = FM.isset(evdata) && FM.isset(evdata.object) ?
            evdata.object.getAttr('value', 'icon') :
            'icon'
            ;
    this.setAttr('data-fmml-list-items-layout', layout);
    this._refreshItems();
}


// private
/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._getMore = function() {
    var dmList = this.getDmObject();
    if (dmList && FM.isset(dmList, "getData")) {
        dmList.getData(true);
    }
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._findNodeWithClass = function(parent, cls, def) {
    var node = $(parent).find("." + cls);
    return (node && node.length && node.length > 0 ? node[0] : def);
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._clearItems = function() {
    FM.MlHost.disposeChildNodes(this.listItemsContainer);
    $(this.listItemsContainer).html("");
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._nodeApplyTemplate = function(node, attrs) {
    if (FM.isset(node.attributes)) {
        FM.forEach(node.attributes, function(i, attr) {
            if (attr.specified == true) {
                var val = FM.applyTemplate(attrs, attr.value, false, false);
                if (val != attr.value) {
                    attr.value = val;
                }
            }
            return true;
        });

        var me = this;
        $(node).children().each(function() {
            me._nodeApplyTemplate(this, attrs);
            return true;
        });
    }
    return node;
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._refreshItems = function() {
    this.log("Refresh listi items ...", FM.logLevels.debug, 'MlHostGenericCollection._refreshItems');
    this._clearItems();
    var dmList = this.getDmObject();
    if (!dmList) {
        this.log("DmList not found.", FM.logLevels.warn, 'MlHostGenericCollection._refreshItems');
        return false;
    }
    var me = this;
    var curitm = -1;
    var itmcnt = 0;

    // first display items
    dmList.forEachListElement(function(i, oObj) {
        if (me._filterItemFromDisplay(oObj) == true) {
            curitm++;
            if (curitm < me.listOffset) {
                return true;
            }
            var attrs = oObj.getAttr();
            attrs["objectClass"] = oObj.getSubClassName();
            attrs["data_id"] = oObj.getDataID();
            attrs["listIndex"] = curitm + 1;
            attrs["itemsLayout"] = me.itemsLayout;

            itmcnt++;
            if (me.listItemsTemplate) {
                me._createItmNode(oObj, attrs, me.listItemsTemplate);
            } else {
                var tname = FM.applyTemplate(attrs, me.itemsTemplateBase, false, true);
                FM.UtTemplate.getTemplate(me.getApp(), attrs, tname, function(isok, templ) {
                    if (isok) {
                        me._createItmNode(oObj, attrs, templ);
                    }
                });
            }
        }

        return me.maxItms > itmcnt;
    });

    if (this.maxitms > itmcnt && (this.itemsTemplateEmptyBase != '' || this.listEmptyTemplate)) {
        if (this.listEmptyTemplate) {
            while (this.maxItms > itmcnt) {
                var attrs = {};
                attrs["objectClass"] = 'unknown';
                attrs["data_id"] = 'unknown';
                attrs["listIndex"] = curitm + 1;
                attrs["itemsLayout"] = me.itemsLayout;
                curitm++;
                itmcnt++;
                this._createItmNode(null, attrs, this.listEmptyTemplate);
            }
        } else {
            var tname = FM.applyTemplate(attrs, this.itemsTemplateEmptyBase, false, true);
            FM.UtTemplate.getTemplate(this.getApp(), {}, tname, function(isok, templ) {
                if (isok) {
                    while (me.maxItms > itmcnt) {
                        curitm++;
                        itmcnt++;
                        var attrs = {
                            itemsLayout: me.itemsLayout,
                            objectClass: 'unknown',
                            data_id: 'unknown',
                            listIndex: curitm
                        };
                        me._createItmNode(null, attrs, templ);
                    }
                }
            });
        }
    }

    // empty list
    if (itmcnt == 0 && this.listEmpty == '') {
        this._setListEmpty();
    }

    // send event
    this.sendEventToObservers(this, 'onListRefreshCompleted');
    this.log("Done.", FM.logLevels.debug, 'MlHostGenericCollection._refreshItems');
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._createItmNode = function(oObj, attrs, templ) {
    var iNode;
    var curitm = parseInt(FM.getAttr(attrs, 'listIndex', '0'));
    this.log("Creating " + curitm + ". item ...", FM.logLevels.debug, 'MlHostGenericCollection._createItmNode');
    // create node for data (from template)
    var itm = $(templ);
    if (!itm) {
        this.log("Invalid item template.", FM.logLevels.error, 'MlHostGenericCollection._createItmNode');
        return;
    }

    // if inner node is defined append itm as child of inner node
    if (this.listItemsInner) {
        iNode = $(this.listItemsInner).clone();
        if (iNode && iNode.length) {
            iNode = iNode[0];
        }
        itm = $(iNode).append(itm);
    }

    // if wrapper is defined
    if (this.listItemsWrapper) {
        var iNode = $(this.listItemsWrapper).clone();
        if (iNode && iNode.length) {
            iNode = iNode[0];
        }
        itm = $(iNode).append(itm);
    }
    itm = itm[0];
    itm = this._nodeApplyTemplate(itm, attrs);

    $(itm).attr('data-fmml-list-index', curitm);
    $(itm).attr('data-fmml-list-id', this.getID());
    $(itm).addClass(curitm & 1 ? 'fmmlRowOdd' : 'fmmlRowEven');
    $(itm).attr('data-fmml-item-data-id', oObj && oObj.getDataID ? oObj.getDataID() : 'unknown');
    if (this.isSelected(oObj)) {
        $(itm).addClass("fmmlSelected");
    }
    this.log("" + curitm + ". created. Appending node to dom", FM.logLevels.debug, 'MlHostGenericCollection._createItmNode');
    this._appendItmNode(oObj, itm, curitm);
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._appendItmNode = function(oObj, node, index) {
    this.log("Appending " + index + ". item ...", FM.logLevels.debug, 'MlHostGenericCollection._appendItmNode');
    this.log(node, FM.logLevels.debug, 'MlHostGenericCollection._appendItmNode');
    var lastNode = null;
    var lastNodeIndex = -1;
    for (var i = index - 1; i >= 0 && lastNodeIndex == -1; i--) {
        lastNode = $(this.listItemsContainer).children("[data-fmml-list-index='" + i + "']");
        lastNode = lastNode.length ? lastNode[0] : null;
        if (lastNode) {
            lastNodeIndex = i;
        }
    }
    if (lastNode) {
        $(lastNode).after(node);
    } else {
        $(this.listItemsContainer).prepend(node);
    }

    // ML init
    //if (oObj) {
    FM.MlHost.initChildNodes(this.getApp(), node, oObj, this.listItemsWrapper != null);
    this.log("Done.", FM.logLevels.debug, 'MlHostGenericCollection._appendItmNode');
    //}

}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._filterItemFromDisplay = function(oObj) {
    return true;
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._setWaiting = function() {
    if (this.listWaiting) {
        var wnode = $(this.listWaiting).clone()[0];
        $(this.listItemsContainer).append(wnode);
        FM.MlHost.initChildNodes(this.getApp(), wnode, this.getDmObject());
    }
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._setListEmpty = function() {
    if (this.listEmpty) {
        var enode = $(this.listEmpty).clone()[0];
        this._clearItems();
        $(this.listItemsContainer).append(enode);
        FM.MlHost.initChildNodes(this.getApp(), enode, this.getDmObject());
    }
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._getEventItem = function(oSender, evobj) {
    var lst = this.getDmObject();
    if (!lst) {
        return null;
    }

    if (evobj.getSubClassName() == 'GenericValue') {
        return lst.get(evobj.getAttr('value'));
    }

    return lst.get(evobj.getDataID());
}

/**
 * Default number od list items to display (100).
 * 
 * @static
 * @public
 */
FM.MlHostGenericCollection.DEF_LIST_SIZE = 100;

FM.MlHost.addHost("GenericCollection", FM.MlHostGenericCollection, 'GLOBAL');

/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */
/**
 * Generic ML MlObserver class.  
 * 
 *  
 * @class FM.MlObserver
 * @memberOf FM
 * @extends FM.LmObject
 * @param {FM.AppObject} app application object.
 * @param {object} [attrs] DOM node attributes.
 * @param {node} node DOM node. 
 * List of DOM attributes (check inherited attributes too):
 * <table class="fm-mlattrs">
 *  <thead>
 *   <tr>
 *    <th>Name</th><th>description</th><th>Default</th>
 *   </tr>
 *  </thead>
 *  <tbody>
 *   <tr>
 *    <td>data-fmml-attr-name</td>
 *    <td>Host DM.Object attribute to observe.</td>
 *    <td>-</td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-attr-type</td>
 *    <td>Host DM.Object attribute type.</td>
 *    <td>[string], number, date</td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-attr-decimals</td>
 *    <td>Number of decimals to display. Applies only if attribute type is <i>number</i>.</td>
 *    <td></td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-date-format</td>
 *    <td>Date format of attribute value. Applies only if attribute type is <i>date</i>.</td>
 *    <td></td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-date-is-utc</td>
 *    <td>Attribute value representing date is UTC. Applies only if attribute type is <i>date</i>.</td>
 *    <td>[true], false</td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-attr-default-value</td>
 *    <td>Default attribute value.</td>
 *    <td>-</td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-date-display-as</td>
 *    <td>Display date in given format. Applies only if attribute type is <i>date</i>.</td>
 *    <td></td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-error-host</td>
 *    <td>DOM node id of error host</td>
 *    <td>-</td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-validation-rules</td>
 *    <td>
 *      Observer validation rules. Using FM macros (if rules starts with @) or JavaScript eval.
 *      Macro validation rules are separated by semicolon.
 *      Eval method must return <i>true</i> to consider observer value valid. Expression is evaluated
 *      in FM context: this.A (application), this.H (host), this.O (observer), this.D (DM object)
 *    </td>
 *    <td>-</td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-validation-message</td>
 *    <td>
 *      Error message if validation fails.
 *    </td>
 *    <td>Invalid value.</td>
 *   </tr>
 *   <tr>
 *   <tr>
 *    <td>data-fmml-force-validation</td>
 *    <td>
 *      Validate observer even if attribute value is empty.
 *    </td>
 *    <td>[id],true</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-run-on-update</td>
 *    <td>
 *      DOM node id of the host to run on attribute update. 
 *      Current host DM object is sent as argument.
 *    </td>
 *    <td>-</td>
 *   </tr>
 *  </tbody>
 * </table>
 * 
 * @example 
    &lt;!-- example of HTML template --&gt;
    &lt;div data-fmml-host="Host"&gt;
        &lt;span 
            data-fmml-observer=&quot;Observer&quot; 
            data-fmml-attr-name=&quot;value&quot;
        &gt;&lt;/span&gt;
    &lt;/div&gt;
 */
FM.MlObserver = FM.defineClass('MlObserver', FM.LmObject);

// methods
FM.MlObserver.prototype._init = function(app, attrs, node) {
    this._super("_init", app, attrs);
    this.objectSubClass = "Observer";

    this.log(attrs, FM.logLevels.debug, 'MlObserver._init');

    this.node = node ? node : null;
    this.node.fmmlObserver = this;
    this.lastValue = null;

    this.extensions = [];
    this.renderers = {};
    this.currentRenderer = null;


    // find error host
    this.errorObject = this.getAttr('data-fmml-error-host', '') != '' ?
            new FM.DmGenericError({
                id: '',
                text: ''
            }) : null;

    this.log("New observer created.", FM.logLevels.debug, 'MlObserver._init');
}

/**
 * Run observer.
 * 
 * @public
 * @function
 */
FM.MlObserver.prototype.run = function() {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.run');

    this._super("run");

    this.log("Starting all registred extensions ...", FM.logLevels.debug, 'MlObserver.run');
    for (var i = 0; i < this.extensions.length; i++) {
        try {
            this.runExtension(this.extensions[i]);
        } catch (err) {
            this.log(err, FM.logLevels.error, 'MlObserver.run');
        }
    }
    this.log("Set DOM node value ...", FM.logLevels.debug, 'MlObserver.run');
    this.setNodeValue();

    this.log("New observer started.", FM.logLevels.debug, 'MlObserver.run');
    return true;
}


/**
 * Dispose observer.
 * 
 * @public
 * @function 
 */
FM.MlObserver.prototype.dispose = function() {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.dispose');

    this.log("Disposing all registred extensions ...", FM.logLevels.debug, 'MlObserver.dispose');
    var exts = FM.cloneObject(this.extensions);
    for (var i = 0; i < exts.length; i++) {
        var extObj = exts[i];
        if (FM.isset(extObj.dispose)) {
            try {
                extObj.dispose(this);
            } catch (err) {
                this.log(err, FM.logLevels.error, 'MlObserver.dispose');
            }
        }
    }
    this.extensions = [];

    this.log("Removing observer from DOM node ...", FM.logLevels.debug, 'MlObserver.dispose');
    if (this.node) {
        this.node.fmmlObserver = null;
    }

    this.log("Removing observer from host ...", FM.logLevels.debug, 'MlObserver.dispose');
    if (this.host) {
        this.host.removeObserver(this);
    }

    if (this.errorObject) {
        this.log("Disposing error object ...", FM.logLevels.debug, 'MlObserver.dispose');
        this.errorObject.dispose();
        this.errorObject = null;
    }

    return this._super("dispose");
    this.log("New observer disposed.", FM.logLevels.debug, 'MlObserver.dispose');
}


/**
 * Returns last eror. 
 * 
 * @returns {FM.DmGenericError} 
 */
FM.MlObserver.prototype.getLastError = function() {
    var errhost = this._getErrorHost();
    return errhost ? errhost.getDmObject() : null;
}

/**
 * Set last eror. 
 * 
 * @param {FM.DmGenericError|string} oErr Error to set. 
 * 
 * @return {FM.DmGenericError} 
 */
FM.MlObserver.prototype.setLastError = function(oErr) {
    var errhost = this._getErrorHost();
    if (!errhost) {
        return this.getHost() ? this.getHost().setLastError(oErr) :
            (this.getApp() ? this.getApp().setLastError(oErr) : oErr)
        ;
    }
    oErr = FM.isset(oErr) && oErr ? oErr : "";

    if (!FM.isObject(oErr)) {
        if (FM.isString(oErr)) {
            oErr = new FM.DmGenericError({"messageId": "GE", "text": oErr});
        } else {
            oErr = new FM.DmGenericError();
        }
    }
    
    if (!errhost.isExecuted()) {
        errhost.run(oErr);
    } else {
        var dmobj = errhost.getDmObject();
        if (!dmobj) {
            errhost.setDmObject(oErr);
        } else {
            dmobj.forEachAttr(function(attr, value) {
                dmobj.setAttr(attr, oErr.getAttr(attr, null));
                return true;
            });
            dmobj.setChanged(true, true);
            oErr = dmobj;
        }
    }

    return oErr;
}

/**
 * Check if observer is valid.
 *  
 * @pulbic
 * @function
 * @param {boolean} [force=false] Validate even if value is null or empty string.
 * @returns {boolean}
 */
FM.MlObserver.prototype.isValid = function(force) {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.isValid');

    var rules = this.getAttr("data-fmml-validation-rules", '');
    var response = true;
    var value = this.getValue();

    if (rules != '') {
        force = FM.isset(force) ? force :
                (
                        this.getAttr('data-fmml-force-validation', 'false') == 'true' ?
                        true : false
                        );

        if (force || value != "") {
            // eval
            if (FM.startsWith(rules, "@")) {
                var value = FM.resolveAttrName({}, rules, false, {
                    A: this.getApp(),
                    H: this.getHost(),
                    O: this,
                    D: this.getDmObject()
                });
                return (value == true);
            }

            // predefined (old way)
            var allRules = rules != null && rules != '' ? rules.split(";") : [];

            for (var i = 0; i < allRules.length; i++) {
                var invert = false;
                var rule = allRules[i];
                var ruleArr = rule != null && rule != '' ? rule.split("=") : [];
                var ruleOperator = ruleArr.length > 0 ? ruleArr[0] : '';
                var ruleParamStr = ruleArr.length > 1 ? ruleArr[1] : '';
                var ruleParams = ruleParamStr.split(",");
                if (FM.endsWith(ruleOperator, "!")) {
                    ruleOperator = ruleOperator.substring(0, ruleOperator.length - 1);
                    invert = true;
                }
                var v = true;
                var fn = FM.MlObserver.getValidationRule(this.getApp(), ruleOperator);

                if (fn) {
                    v = fn(this, ruleParams) == (invert ? false : true);
                }
                if (!v) {
                    response = false;
                    break;
                }
            }
        }
    }

    if (response) {
        $(this.node).removeClass("fmmlInvalidValue");
        this.setLastError(new FM.DmGenericError({
            messageId: '',
            text: ''
        }));
    } else {
        $(this.node).addClass("fmmlInvalidValue");
        this.setLastError(new FM.DmGenericError({
            messageId: 'UIVALIDATION',
            text: this.getAttr('data-fmml-validation-message', 'Invalid value')
        }));
    }

    this.log(
            response ? "Observer is valid" : "Validation failed: " + ruleOperator,
            FM.logLevels.debug, 'MlObserver.isValid'
            );
    return response; //no rules
}

/**
 * Called by host to signal change of data model,
 *
 * @public
 * @function 
 *
 */
FM.MlObserver.prototype.update = function() {
    if (!this.isExecuted()) {
        return false;
    }
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.update');

    var dmObj = this.getDmObject();
    var dtstmp = dmObj ? dmObj.getProperty('timestamp', '0') : '0';

    if (
        dmObj && dmObj.isAttr(this.getAttr('data-fmml-attr-name','')) && 
        dtstmp != '0' && dtstmp == this.getProperty('updateTimestamp', '0')
    ) {
        this.log("Aborting, processed updateTimestamp.", FM.logLevels.debug, 'MlObserver.update');
        return false;
    }
    this.setProperty('updateTimestamp', dtstmp);

    // notify extensions
    this.log("Updating all extensions ...", FM.logLevels.debug, 'MlObserver.update');
    for (var i = 0; i < this.extensions.length; i++) {
        var extObj = this.extensions[i];
        if (FM.isset(extObj.update)) {
            try {
                extObj.update(this);
            } catch (err) {
                this.log(err, FM.logLevels.error, 'MlObserver.update');
            }
        }
    }

    // sync node with dmobject
    this.log("Set DOM node value ...", FM.logLevels.debug, 'MlObserver.update');
    this.setNodeValue();

    // check if obs is valid and run update host
    var retc = false;
    if (this.isValid()) {
        var hostToRun = this.getAttr('data-fmml-run-on-update', '');
        if (hostToRun != '') {
            this.log("Running [" + hostToRun + "] on update ...", FM.logLevels.debug, 'MlObserver.update');
            var node = document.getElementById(hostToRun);
            if (node && FM.isset(node.fmmlHost) && node.fmmlHost) {
                try {
                    node.fmmlHost.run(this.getDmObject());
                } catch (err) {
                    this.log(err, FM.logLevels.error, 'MlObserver.update');
                }
            } else {
                this.log("Host [" + hostToRun + "] not found", FM.logLevels.warn, 'MlObserver.update');
            }
        }
        retc = true;
    }

    this.log("Done.", FM.logLevels.debug, 'MlObserver.update');
    return retc;
}

/**
 * Set observer current value.
 * 
 * @public
 * @function
 * @param {...} value New value.
 */
FM.MlObserver.prototype.setValue = function(value) {
    if (!this.isExecuted()) {
        return false;
    }
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.setValue');

    // conf
    var attrname = this.getAttr('data-fmml-attr-name', '');
    var host = this.getHost();
    this.log("Set Observer attribute [" + attrname + "] to [" + value + "] ...", FM.logLevels.debug, 'MlObserver.setValue');

    // value
    var dmobj = this.getDmObject();
    if (!dmobj) {
        this.log("DmObject not found", FM.logLevels.warn, 'MlObserver.setValue');
        return false;
    }

    // set
    value = this._formatValue(value);
    dmobj.setAttr(attrname, value, true);

    // end
    this.log("Done.", FM.logLevels.debug, 'MlObserver.setValue');
    return true;
}

/**
 * Returns observer current value.
 * 
 * @public
 * @function
 * @returns {...}
 */
FM.MlObserver.prototype.getValue = function() {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.getValue');

    if (!this.isExecuted()) {
        this.log("Observer is not executed,returning undefined.", FM.logLevels.warn, 'MlObserver.getValue');
        return undefined;
    }


    // conf
    if(!this.isAttr('data-fmml-attr-name') && !this.isAttr('data-fmml-attr-default-value')) {
        this.log("Attribute name is not defined, returning undefined.", FM.logLevels.warn, 'MlObserver.getValue');
        return undefined;
    }
    
    var attrname = this.getAttr('data-fmml-attr-name', '');
    var defval = this.resolveAttrValue('data-fmml-attr-default-value', '');
    var dmobj = this.getDmObject();

    // value
    var value = FM.resolveAttrName(dmobj ? dmobj.options : {}, attrname, defval, {
        A: this.getApp(),
        H: this.getHost(),
        O: this,
        D: this.getDmObject()
    });


    // end
    this.log("Done.", FM.logLevels.debug, 'MlObserver.getValue');
    return value;
}

/**
 * 
 * @ignore
 */
FM.MlObserver.prototype._getErrorHost = function() {
    var errnode = document.getElementById(this.getAttr('data-fmml-error-host', ''));
    return (
            errnode && FM.isset(errnode.fmmlHost) && errnode.fmmlHost ?
            errnode.fmmlHost : null
            );
}


/**
 * 
 * @ignore
 */
FM.MlObserver.prototype._formatValue = function(value) {
    var attrtype = this.getAttr('data-fmml-attr-type', 'string');
    var decplaces = parseInt(this.getAttr('data-fmml-attr-decimals', '-1'));
    var dateIsUtc = this.getAttr('data-fmml-date-is-utc', 'true') != 'false';
    var dateFormat = this.getAttr('data-fmml-date-format',
            this.getApp().getAttr('fm_date_format', undefined))
            ;

// dates
    if (attrtype == "date") {
        var dateObj = null;
        if (FM.isObject(value) && FM.isset(value.getTime)) {
            dateObj = value;
        } else if (FM.isDateString(value)) {
            dateObj = FM.parseDateString(value, dateIsUtc);
        } else {
            dateObj = FM.parseLocalDateString(value);
        }

        if (dateObj) {
            value = FM.dateToString(dateObj, dateIsUtc, dateFormat);
        }
    } else if (attrtype == "number") {
        value = parseFloat(0.0 + value);
        if (decplaces > -1) {
            value = value.toFixed(decplaces);
        }
    }

    return value;
}

/**
 * 
 * @ignore
 */
FM.MlObserver.prototype._formatValueForRendering = function(value) {
    var attrtype = this.getAttr('data-fmml-attr-type', 'string');
    var dateIsUtc = this.getAttr('data-fmml-date-is-utc', 'true') != 'false';
    var dateFormat = this.getAttr(
            'data-fmml-date-display-as',
            this.getApp().getAttr('fm_date_display_as', undefined)
            );
    var decplaces = parseInt(this.getAttr('data-fmml-attr-decimals', '-1'));


// dates
    if (attrtype == "date") {
        var dateObj = null;

        if (FM.isDateString(value)) {
            dateObj = FM.parseDateString(value, dateIsUtc);
        } else {
            dateObj = FM.parseLocalDateString(value);
        }

        if (dateObj) {
            if (dateFormat == 'local') {
                value = FM.dateLocalFormat(dateObj);
            } else if (dateFormat == 'ago') {
                value = FM.strTimeBetween(dateObj, new Date());
            } else {
                value = FM.dateFormat(dateObj, dateFormat);
            }
        }
    } else if (attrtype == "number") {
        value = parseFloat(0.0 + value);
        if (decplaces > -1) {
            value = value.toFixed(decplaces);
        }
    }

    return value;
}

/**
 * Render observer value in DOM node using current renderer.
 * 
 * @param {boolean} force Render event of value is not changed.
 */
FM.MlObserver.prototype.setNodeValue = function(force) {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.setNodeValue');
    force = FM.isset(force) && force == true ? true : false;

    // get value
    var nfvalue = this.getValue();
    if(!FM.isset(nfvalue)) {
        this.log("Undefined value, aborting.", FM.logLevels.warn, 'MlObserver.setNodeValue');
        return;
    }
    
    // formating
    this.log("Formating value [" + nfvalue + "]...", FM.logLevels.debug, 'MlObserver.setNodeValue');
    var value = this._formatValueForRendering(nfvalue);

    this.log("Formated value is [" + value + "].", FM.logLevels.debug, 'MlObserver.setNodeValue');

    // not changed
    if (!force && value == this.lastValue) {
        this.log("Aborting, formated value is not changed.", FM.logLevels.debug, 'MlObserver.setNodeValue');
        return;
    }

    // remember
    this.lastValue = value;

    // render
    this.log("Rendering value ...", FM.logLevels.debug, 'MlObserver.setNodeValue');
    if (this.getCurrentRenderer()) {
        this.getCurrentRenderer().render(value);
        return;
    }

    // def render
    var doSelection = false;
    try {
        doSelection = this.node.selectionStart ? true : false;
    } catch (e) {

    }
    var selStart = 0, selEnd = 0;
    if (doSelection) {
        selStart = this.node.selectionStart;
        selEnd = this.node.selectionEnd;
    }

    if (this.node.nodeName == 'INPUT' || this.node.nodeName == 'TEXTAREA') {
        if ($(this.node).is(':checkbox')) {
            if (value && value != '' && value.toLowerCase() != 'false') {
                $(this.node).attr('checked', 'checked');
            } else {
                $(this.node).removeAttr('checked');
            }
        } else if ($(this.node).is(':radio')) {
            $("input:radio[name ='" + $(this.node).attr("name") + "']").val([value]);
        } else {
            $(this.node).val(value);
        }
    } else if (this.node.nodeName == 'IMG') {
        $(this.node).attr("src", value);
    } else if (this.node.nodeName == 'A') {
        $(this.node).attr("href", value);
    } else if (FM.isset(this.node.value)) {
        $(this.node).val(value);
    } else {
        $(this.node).html(value);
    }

    // selection range restore
    if (doSelection) {
        this.node.setSelectionRange(selStart, selEnd);
    }

    //end
    this.log("Done.", FM.logLevels.debug, 'MlObserver.setNodeValue');
}

/**
 * Add extension.
 * 
 * @public
 * @function
 * @param {FM.MlExtension} extObj Extension to add. Usualy there is no need to call this function manualy.
 */
FM.MlObserver.prototype.addExtension = function(extObj) {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.addExtension');
    this.log("Adding extension:", FM.logLevels.debug, 'MlObserver.addExtension');
    this.log(extObj, FM.logLevels.debug, 'MlObserver.addExtension');

    this.extensions.push(extObj);
    if (this.isExecuted()) {
        this.log("Running added extension ...", FM.logLevels.debug, 'MlObserver.addExtension');
        try {
            this.runExtension(extObj);
        } catch (err) {
            this.log(err, FM.logLevels.error, 'MlObserver.addExtension');
        }
    }
    this.log("Done.", FM.logLevels.debug, 'MlObserver.addExtension');
    return true;
}

/**
 * Remove extension.
 * 
 * @public
 * @function
 * @param {FM.MlExtension} extObj Extension to remove. Usualy there is no need to call this function manualy.
 */
FM.MlObserver.prototype.removeExtension = function(extObj) {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.removeExtension');
    this.log("Removing extension:", FM.logLevels.debug, 'MlObserver.removeExtension');
    this.log(extObj, FM.logLevels.debug, 'MlObserver.removeExtension');

    for (var i = 0; i < this.extensions.length; i++) {
        if (extObj == this.extensions[i]) {
            if (FM.isset(this.extensions[i].dispose)) {
                this.extensions[i].dispose(this);
            }
            delete this.extensions[i];
            this.log("Done.", FM.logLevels.debug, 'MlObserver.removeExtension');
            return true;
        }
    }
    this.log("Not found.", FM.logLevels.warn, 'MlObserver.removeExtension');
    return false;
}

/**
 * Run extension. Usualy there is no need to call this function manualy.
 * 
 * @public
 * @function
 * @param {FM.MlExtension} extObj Extension to run.
 */
FM.MlObserver.prototype.runExtension = function(extObj) {
    if (FM.isset(extObj.run)) {
        extObj.run(this);
    }
}

/**
 * Returns observer DOM node.
 * 
 * @public
 * @function
 * @returns {node}
 */
FM.MlObserver.prototype.getNode = function() {
    return this.node;
}

/**
 * Returns current observer DM object.
 * 
 * @public
 * @function
 * @returns {FM.DmObject}
 */
FM.MlObserver.prototype.getDmObject = function() {
    return(this.getHost() ? this.getHost().getDmObject(this.node) : null);
}

/**
 * Returns host this observer belongs to.
 * 
 * @public
 * @function
 * @returns {FM.MlHost}
 */
FM.MlObserver.prototype.getHost = function() {
    if (this.host)
        return(this.host);
    this.host = FM.MlObserver.findHost(this.node);
    return(this.host);
}

/**
 * 
 * @ignore
 */
FM.MlObserver.prototype.onHostEvent = function(sender, ev, evdata) {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.onHostEvent');
    this.log("Event:" + ev, FM.logLevels.debug, 'MlObserver.onHostEvent');
    this.log("Event data:", FM.logLevels.debug, 'MlObserver.onHostEvent');
    this.log(evdata, FM.logLevels.debug, 'MlObserver.onHostEvent');

    var fnd = false;
    if (FM.isset(this[ev])) {
        fnd = true;
        try {
            this.log("Event is found, executing ...", FM.logLevels.debug, 'MlObserver.onHostEvent');
            this[ev](sender, evdata);
        } catch (e) {
            this.log(err, FM.logLevels.error, 'MlObserver.onHostEvent');
        }
    } else {
        this.log("Event is not found, checking extensions ...", FM.logLevels.debug, 'MlObserver.onHostEvent');

        // notify extensions
        for (var i = 0; i < this.extensions.length; i++) {
            var extObj = this.extensions[i];
            if (FM.isset(extObj[ev])) {
                try {
                    this.log("Executing event in extension:", FM.logLevels.debug, 'MlObserver.onHostEvent');
                    this.log(extObj, FM.logLevels.debug, 'MlObserver.onHostEvent');
                    extObj[ev](sender, evdata);
                } catch (e) {
                    this.log(e, FM.logLevels.error, 'MlObserver.onHostEvent');
                }
                fnd = true;
            }
        }
    }

    this.log("Done.", FM.logLevels.debug, 'MlObserver.onHostEvent');
    return fnd;
}

/**
 * 
 * @ignore
 */
FM.MlObserver.prototype.resolveAttrValue = function(val, defv) {
    val = FM.resolveAttrValue(this.options, val, defv, {
        A: this.getApp(),
        H: this.getHost(),
        O: this,
        D: this.getDmObject()
    });

    return val;
}


/**
 * Returns current renderer.
 * 
 * @public
 * @function
 * @returns {FM.MlExtension}
 */
FM.MlObserver.prototype.getCurrentRenderer = function() {
    return this.currentRenderer;
}

/**
 * 
 * @ignore
 */
FM.MlObserver.prototype._checkCurrentRenderer = function() {
    for (var i = this.extensions.length - 1; i > -1; i--) {
        var ext = this.extensions[i];
        if (FM.isset(this.renderers[ext.getID()] && this.renderers[ext.getID()])) {
            this.currentRenderer = ext;
            return this.currentRenderer;
        }
    }

    return this.currentRenderer;
}

/**
 * Add extension to list of available renderers. 
 * Last registered extension is active renderer.
 
 * @public 
 * @function
 * @param {FM.MlExtension} renderer Renderer to add.
 */
FM.MlObserver.prototype.addRenderer = function(r) {
    if (!r)
        return;

    var curr = this.getCurrentRenderer();
    this.renderers[r.getID()] = r;
    var newr = this._checkCurrentRenderer();
    if (curr != newr) {
        if (curr)
            curr.disableRenderer();
        if (newr)
            newr.enableRenderer();
    }
}

/**
 * Remove extension from list of available renderers.
 
 * @public 
 * @function
 * @param {FM.MlExtension} renderer Renderer to remove.
 */
FM.MlObserver.prototype.removeRenderer = function(r) {
    if (!r)
        return;

    var curr = this.getCurrentRenderer();
    if (FM.isset(this.renderers[r.getID()])) {
        this.renderers[r.getID()] = null;
    }
    var newr = this._checkCurrentRenderer();
    if (curr != newr) {
        if (curr)
            curr.disableRenderer();
        if (newr)
            newr.enableRenderer();
    }
}


/**
 * Search for first child node with FM.MlHost instance.
 * 
 * @public
 * @static
 * @function
 * @param {node} node DOM node to start searching from.
 * @returns {FM.MlHost|null}
 */
FM.MlObserver.findHost = function(node) {
    return FM.findNodeWithAttr(node, "fmmlHost");
}


/**
 * 
 * @ignore
 */
FM.MlObserver.observerTypes = {
    GLOBAL: {}
};


/**
 * Register application observer type.
 *  
 * @public
 * @static
 * @function
 * @param {string} type name.
 * @param {FM.MlHost} fn Observer class function.
 * @param {string} [appCls='GLOBAL'] Application subclass type.
 * 
 * @returns {boolean}
 */
FM.MlObserver.addObserver = function(type, fn, appCls) {
    appCls = FM.isset(appCls) && FM.isString(appCls) && appCls != '' ? appCls : 'GLOBAL';
    if (!FM.isset(fn) || !FM.isFunction(fn))
        return false;
    if (!FM.isset(type) || !type || type == '')
        return false;
    if (!FM.isset(FM.MlObserver.observerTypes[appCls])) {
        FM.MlObserver.observerTypes[appCls] = {};
    }

    FM.MlObserver.observerTypes[appCls][type] = fn;
    return true;
}

/**
 * Returns MlObserver <b>config</b> class function for <b>config</b> subclass type.
 * 
 * @public
 * @static
 * @function    
 * @param {FM.AppObject} app Current application.
 * @param {String} type Observer subclass type.
 * @return {FM.MlObserver} Class function. 
 */
FM.MlObserver.getConfiguration = function(app, name) {
    var list = FM.MlObserver.observerTypes;

    app = FM.isset(app) && app ? app : null;
    var appCls = app ? app.getSubClassName() : null;
    var appCfg = appCls && FM.isset(list[appCls]) ? list[appCls] : null;

    var obj = null;
    if (appCfg && FM.isset(appCfg[name])) {
        obj = appCfg[name];
    } else if (app && FM.isArray(app.applicationObjectsSpace)) {
        FM.forEach(app.applicationObjectsSpace, function(i, ns) {
            if (FM.isset(list[ns]) && FM.isset(list[ns][name])) {
                obj = list[ns][name];
                return false;
            }
            return true;
        });
    }

    if (!obj && FM.isset(list['GLOBAL'][name])) {
        obj = list['GLOBAL'][name];
    }

    return obj;
}

/**
 * Returns new instance of chosen <b>sctype</b> observer type.
 
 * @static
 * @public
 * @function    
 * @param {FM.AppObject} app Current application.
 * @param {object} attrs Observer attributes.
 * @param {node} node Observer node.
 * @param {String} type Observer subclass type.
 * 
 * @return {FM.MlObserver} New observer instance.
 */
FM.MlObserver.newObserver = function(app, attrs, node, type) {
    var clsFn = FM.MlObserver.getConfiguration(app, type);
    return clsFn ? new clsFn(app, attrs, node) : null;
}

FM.MlObserver.addObserver("Observer", FM.MlObserver, 'GLOBAL');

/**
 * Validation rules. 
 * 
 * @namespace
 */
FM.MlObserver.validationRules = {
    /**
     * Global validation rules. Available to all applications.
     * 
     * @namespace
     */
    GLOBAL: {
        /**
         * Equal validation rule.
         * Example: 
         *  
         * @param {FM.MlObserver} observer Observer.
         * @param {array} ruleParams Rule parameters.
         * 
         * @returns {boolean}
         */
        equal: function(observer, ruleParams, cbFn) {
            var value = observer.getValue();
            if (ruleParams.length < 1)
                return false;

            for (var i = 0; i < ruleParams.length; i++) {
                if (FM.startsWith(ruleParams[i], '#')) {
                    if (value != $(ruleParams[i]).val())
                        return false;
                } else {
                    try {
                        if (value != '' + eval(ruleParams[i])) {
                            return false;
                        }
                    } catch (e) {
                        return false;
                    }
                }
            }

            return true;
        },
        /**
         * Greather then validation rule.
         * Example: 
         *  
         * @param {FM.MlObserver} observer Observer.
         * @param {array} ruleParams Rule parameters.
         * 
         * @returns {boolean}
         */
        gt: function(observer, ruleParams, cbFn) {
            var value = observer.getValue();
            if (ruleParams.length < 1)
                return false;

            for (var i = 0; i < ruleParams.length; i++) {
                if (FM.startsWith(ruleParams[i], '#')) {
                    if (value != $(ruleParams[i]).val())
                        return false;
                } else {
                    try {
                        if (parseFloat(value) > parseFloat(eval(ruleParams[i]))) {
                            return true;
                        }
                    } catch (e) {
                        return false;
                    }
                }
            }

            return false;
        },
        /**
         * Less then rule.
         * Example: 
         *  
         * @param {FM.MlObserver} observer Observer.
         * @param {array} ruleParams Rule parameters.
         * 
         * @returns {boolean}
         */
        lt: function(observer, ruleParams, cbFn) {
            var value = observer.getValue();
            if (ruleParams.length < 1)
                return false;

            for (var i = 0; i < ruleParams.length; i++) {
                if (FM.startsWith(ruleParams[i], '#')) {
                    if (value != $(ruleParams[i]).val())
                        return false;
                } else {
                    try {
                        if (parseFloat(value) < parseFloat(eval(ruleParams[i]))) {
                            return true;
                        }
                    } catch (e) {
                        return false;
                    }
                }
            }

            return false;
        },
        /**
         * Empty validation rule.
         * Example: 
         *  
         * @param {FM.MlObserver} observer Observer.
         * @param {array} ruleParams Rule parameters.
         * 
         * @returns {boolean}
         */
        empty: function(observer, ruleParams, cbFn) {
            var value = observer.getValue();
            if (value == null || value == '') {
                return true;
            }
            return false;
        },
        /**
         * validEmail validation rule.
         * Example: 
         *  
         * @param {FM.MlObserver} observer Observer.
         * @param {array} ruleParams Rule parameters.
         * 
         * @returns {boolean}
         */
        validEmail: function(observer, ruleParams, cbFn) {
            var value = observer.getValue();
            if (value == null || value == '') {
                return true;
            }

            // check if email address is valid
            return FM.validateEmail(value);
        }
    }
}

/**
 * Returns requested validation rule function.
 * 
 * @public
 * @static
 * @param {type} app Current application.
 * @param {type} name Validation rule name.
 * @returns {function} 
 */
FM.MlObserver.getValidationRule = function(app, name) {
    var list = FM.MlObserver.validationRules;

    app = FM.isset(app) && app ? app : null;
    var appCls = app ? app.getSubClassName() : null;
    var appCfg = appCls && FM.isset(list[appCls]) ? list[appCls] : null;

    var obj = null;
    if (appCfg && FM.isset(appCfg[name])) {
        obj = appCfg[name];
    } else if (app && FM.isArray(app.applicationObjectsSpace)) {
        FM.forEach(app.applicationObjectsSpace, function(i, ns) {
            if (FM.isset(list[ns]) && FM.isset(list[ns][name])) {
                obj = list[ns][name];
                return false;
            }
            return true;
        });
    }

    if (!obj && FM.isset(list['GLOBAL'][name])) {
        obj = list['GLOBAL'][name];
    }

    return obj;
}

/**
 * Register new validation rule.
 * 
 * @public
 * @static
 * @param {string} name Validation rule name.
 * @param {function} fn Validation rule function. 
 * Function receives two arguments (observer instance and array of rule parameters)
 *  and returns <i>true</i> or <i>false</i>.
 * @param {string} [appCls='GLOBAL'] Application subclass type.
 */
FM.MlObserver.addValidationRule = function(name, fn, appCls) {
    appCls = FM.isset(appCls) && FM.isString(appCls) && appCls != '' ? appCls : 'GLOBAL';
    if (!FM.isset(name) || !name || name == '')
        return false;
    if (!FM.isset(fn) || !FM.isFunction(fn))
        return false;
    if (!FM.isset(FM.MlObserver.validationRules[appCls])) {
        FM.MlObserver.validationRules[appCls] = {};
    }
    FM.MlObserver.validationRules[appCls][name] = fn;
    return true;
}


/**
* Attribute display ML observer class. 
*
* <table>
* <th>List of ML node attributes</th>
* <tr><td>data-fmml-attr-value-visible</td><td>type of attribute (string,number,date)</td></tr>
* <tr><td>data-fmml-attr-value-hidden</td><td>set true if dates is in UTC</td></tr>
* </table>
* 
* @class FM.MlObserverDisplay
* @extends FM.MlObserver
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/    
FM.MlObserverDisplay = FM.defineClass('MlObserverDisplay',FM.MlObserver);

FM.MlObserverDisplay.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="Display";
}        


FM.MlObserverDisplay.prototype.evalCondition = function(dmobj,v) {
    var ok = false;
    
    // if condition is undefined
    if(!FM.isset(v) || v == '' || !v) return ok;
    
    // prop or function in dmobject
    if(dmobj && FM.isset(dmobj[v])) { 
        if(FM.isFunction(dmobj[v])) {
            ok = dmobj[v]();
        } else {
            ok = dmobj[v];
        }
    } else if(dmobj && dmobj.isAttr(v)) { // attr in dmobject
        ok = dmobj.getAttr(v,false);
    } else {
        // eval value
        ok = this.resolveAttrValue("-",v);
    }

    // end
    return FM.isset(ok) && ok != null && ok != '' && ok != false && ok != 'false';    
}

FM.MlObserverDisplay.prototype.evalCondition__old = function(dmobj,v) {
    var ok = false;
    
    if(!dmobj || !FM.isset(v) || v == '' || !v) return ok;
    
    if(dmobj && FM.isset(dmobj[v])) { // ako je fn ili prop u obj
        if(FM.isFunction(dmobj[v])) {
            ok = dmobj[v]();
        } else {
            ok = dmobj[v];
        }
    } else if(dmobj && dmobj.isAttr(v)) {
        ok = dmobj.getAttr(v,false);
    } else {
        // eval
        ok = this.resolveAttrValue("-",v);
    }

    // end
    return FM.isset(ok) && ok != null && ok != '' && ok != false;    
}

FM.MlObserverDisplay.prototype.setNodeValue = function() {
    var visible = null;
    var visibilityCheck = this.getAttr('data-fmml-attr-value-visible','');    
    if(visibilityCheck != '') {
        visible = this.evalCondition(this.getDmObject(),visibilityCheck);
    } else {
        visibilityCheck = this.getAttr('data-fmml-attr-value-hidden','');
        if(visibilityCheck != '') {
            visible = !this.evalCondition(this.getDmObject(),visibilityCheck);
        }
    }
    
    // set
    if(this.getAttr('data-fmml-attr-name','') != '') {
        var value = this.getValue();
    
        if(FM.isset(this.node.value)) {
            this.node.value = value;
        } else if(this.node.nodeName == 'IMG') {
            this.node.setAttribute("src",value);
        } else {
            this.node.innerHTML = value;
        }
    }
    
    // show & hide
    if(visible) {
        $(this.node).show();
    } else {
        $(this.node).hide();
    }
    
}

FM.MlObserver.addObserver("Display",FM.MlObserverDisplay,'GLOBAL');

/**
* Event ML observer class. Sends event to host.
* 
* Applicable on HTML nodes with <click> event.
* 
* <table>
* <th>List of ML node attributes</th>
* <tr><td>data-fmml-dom-event</td><td>DOM event which trigger FM event. Default is <b>click</b> event</td></tr>
* <tr><td>data-fmml-event-type</td><td>type (name) of event. In case of event type is not defined, successful action processing is triggered immediately</td></tr>
* <tr><td>data-fmml-event-host</td><td>DOM node id of host which will receive event instead of default host</td></tr>
* <tr><td>data-fmml-event-data</td><td>instead current host dmObject send FM.GenericValue object with this value</td></tr>
* <tr><td>data-fmml-verify-observers</td><td>verify all observers first</td></tr>
* <tr><td>data-fmml-event-async</td><td>Signals that event is async (AJAX request wil be triggered)</td></tr>
* <tr><td>data-fmml-exec-on-success</td><td>code to exec when event is successfully completed</td></tr>
* <tr><td>data-fmml-exec-on-error</td><td>code to exec when event error occurred</td></tr>
* <tr><td>data-fmml-redirect-on-success</td><td>redirect to specified URL when event is successfully completed</td></tr>
* <tr><td>data-fmml-redirect-on-error</td><td>redirect to specified URL when event error occurred</td></tr>
* <tr><td>data-fmml-run-on-success</td><td>run host on DOM node with specified id when event is successfully completed</td></tr>
* <tr><td>data-fmml-run-on-error</td><td>run host on DOM node with specified id when event error occurred</td></tr>
* <tr><td>data-fmml-send-form</td><td>send form on host node to URL specified in data-fmml-redirect-on-success node attribute. Host node type must be FORM</td></tr>
* </table>
*
* On case of multiple actions defined on succes or on error, all of them will be executed in following order: 
*  data-fmml-exec-on-*, data-fmml-run-on-*, data-fmml-redirect-on-*
* 
* <table>
* <th>List of ML CSS classes</th>
* <tr><td>fmmlWaitButton</td><td>Async event is in progress</td></tr>
* </table>
* 
* @class FM.MlObserverEvent
* @extends FM.MlObserver
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/    
FM.MlObserverEvent = FM.defineClass('MlObserverEvent',FM.MlObserver);

FM.MlObserverEvent.prototype._init = function(app,attrs,node) {
    this._super("_init",app,attrs,node);
    this.objectSubClass ="Event";

    this.eventHost = null;
    this.eventHostNode = null;
}


FM.MlObserverEvent.prototype.run = function() {
    this._super("run");
    
    var me = this;
    
    // dom event
    var evtrigger = this.getAttr('data-fmml-dom-event','click');

    $(this.node)[evtrigger](function(event) {
        event.preventDefault();
        
        // blur form change processing (bad, bad, bad)
        if(document.activeElement != this) { // this -> ev node
            document.activeElement.blur();
        }
        
        // my host & host node
        var myhost = me.getHost();
        var myhostnode = myhost ? myhost.getNode() : null;
        
        // obs verify
        if(myhost && me.getAttr('data-fmml-verify-observers','false') == 'true') {
            if(!myhost.verifyAllObservers(true)) {
                me.setLastError(new FM.DmGenericError({
                    messageId: 'UIVALIDATION',
                    text: 'Please enter all required fields'
                }));
                return false; // force validation of empty attributes
            }
        }
        
        // event host
        me.eventHost = null;
        me.eventHostNode = null;
        var evhostid = me.getAttr('data-fmml-event-host','');
        if(evhostid != '') {
            if(evhostid == 'parent' && myhostnode) {
                me.eventHost = FM.findNodeWithAttr(myhostnode.parentNode, "fmmlHost");
                me.eventHostNode = me.eventHost ? me.eventHost.getNode() : null;
            } else {
                me.eventHostNode = FM.getNodeWithId(evhostid);
                me.eventHost = me.eventHostNode && me.eventHostNode.fmmlHost ? 
                    me.eventHostNode.fmmlHost : null
                    ;
            }
        } else {
            me.eventHost = myhost;    
            me.eventHostNode = myhostnode;    
        }
    
        // data to send
        var evdmobj = null;
        var evdata = me.getAttr('data-fmml-event-data','');
        if(evdata != '') {
            if(FM.startsWith(evdata,'@')) {
                evdata = me.resolveAttrValue("-",evdata);
            } 
            evdmobj = FM.isset(evdata) && evdata && FM.isset(evdata.getAttr) ? evdata : new FM.DmGenericValue({
                value: evdata
            });            
        } else {
            evdmobj = me.getDmObject();
        }

        // event to send
        var ev = me.getAttr('data-fmml-event-type','');
        
        // we are now ready to send
        if(ev && ev != '') {
            // set async class
            if(me.getAttr('data-fmml-event-async','false') === 'true') {
                $(me.node).addClass("fmmlWaitButton");
            }
            
            // clear old success & error hosts
            me._runHostOnNode(document.getElementById(me.getAttr('data-fmml-run-on-success','')),null);
            me._runHostOnNode(document.getElementById(me.getAttr('data-fmml-run-on-error','')),null);
            
            // send event
            me.eventHost.onEvent(me,ev,{
                object: evdmobj,
                callback: function(isok, o) {
                    me.eventCallback(isok, o);
                }
            });
        } else {
            me.eventCallback(true, null);
        }
        return false;
    });
}
 
FM.MlObserverEvent.prototype._runHostOnNode = function(hostnode,dmobj) {
    if(FM.isset(hostnode) && hostnode && FM.isset(hostnode.fmmlHost) && hostnode.fmmlHost) {
        hostnode.fmmlHost.run(dmobj);
    }
}

FM.MlObserverEvent.prototype._redirectToPage = function(url,dmobj) {
    var redirApl = FM.isset(url) && url && url != '' ?
         this.resolveAttrValue('-',FM.isset(dmobj) && dmobj ? FM.applyTemplate(dmobj.getAttr(),url) : url) : 
        ''
    ;
    window.location = redirApl;
}

FM.MlObserverEvent.prototype._sendFormToPage = function(url,dmobj) {
    if(!this.eventHost || !FM.isset(this.eventHostNode.submit)) return;
    
    var redirApl = FM.isset(url) && url && url != '' ?
         this.resolveAttrValue('-',FM.isset(dmobj) && dmobj ? FM.applyTemplate(dmobj.getAttr(),url) : url) : 
        ''
    ;
    
    this.eventHostNode.action = redirApl;
    this.eventHostNode.submit();    
}
            
FM.MlObserverEvent.prototype._execCode = function(code,dmobj) {
    try {
        var val = FM.resolveAttrValue(this.options,"-", code,{
            A: this.getApp(),
            H: this.getHost(),
            O: this,
            D: dmobj
        });
    } catch(e) {
        this.log(e,FM.logLevels.error,'MlObserverEvent._execCode');
    }
}

FM.MlObserverEvent.prototype.eventCallback = function(isok,oResponse) {
    // remove async class 
    $(this.node).removeClass("fmmlWaitButton");

    // exec
    var code = isok ?
        this.getAttr('data-fmml-exec-on-success','') :
        this.getAttr('data-fmml-exec-on-error','')
    ;
    if(code != '') {
        this._execCode(code,oResponse);
    }
    
    // host run
    var hostid = isok ?
        this.getAttr('data-fmml-run-on-success','') :
        this.getAttr('data-fmml-run-on-error','')
    ;
    if(hostid != '') {
        this._runHostOnNode(document.getElementById(hostid),oResponse);
    }        

    // redirect
    var redir = isok ?
        this.getAttr('data-fmml-redirect-on-success','') :
        this.getAttr('data-fmml-redirect-on-error','')
    ;
    if(redir != '') {
        if(this.getAttr('data-fmml-send-form','false') == 'true') {
            this._sendFormToPage(redir,oResponse);
        } else{
            this._redirectToPage(redir,oResponse);
        }
    }
}

FM.MlObserver.addObserver("Event",FM.MlObserverEvent,'GLOBAL');

/**
* List remote call state ML observer class for {@link FM.MlHostGenericList} host. 
* 
* @class FM.MlObserverListState
* @extends FM.MlObserver
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/ 
FM.MlObserverListState = FM.defineClass('MlObserverListState',FM.MlObserver);

FM.MlObserverListState.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="ListState";
}        

FM.MlObserverListState.prototype.update = function() {            
}        

FM.MlObserverListState.prototype.onListStart = function() {
    $(this.node).removeClass("fmmlInactiveState");
    $(this.node).addClass("fmmlWaitState");
}

FM.MlObserverListState.prototype.onListEnd = function() {
    $(this.node).removeClass("fmmlWaitState");
    $(this.node).addClass("fmmlInactiveState");
}

FM.MlObserverListState.prototype.onListError = function() {
    $(this.node).removeClass("fmmlWaitState");
    $(this.node).addClass("fmmlInactiveState");
}


FM.MlObserver.addObserver("ListState",FM.MlObserverListState,'GLOBAL');

/**
* List index ML observer class for {@link FM.MlHostGenericList} host. 
* 
* @class FM.MlObserverListIndex
* @extends FM.MlObserver
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/ 
FM.MlObserverListIndex = FM.defineClass('MlObserverListIndex',FM.MlObserver);

FM.MlObserverListIndex.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="ListIndex";
}        

FM.MlObserverListIndex.prototype.setNodeValue = function() {
    var me = this;
    var value = '';
    
    // get dmobj && dmlist
    var dmobj = this.getDmObject();
    var host = this.getHost();
    
    if(host) value = host.getAttr('data-fmml-list-index','');
    if(host && value == '') {    
        var dmlist = host ? host.getDmObject(null) : null;

        if(
            dmobj && dmlist && 
            host && FM.isset(host.cursorStartIndex) && 
            FM.isset(this.node) && FM.isset(this.node.fmmlObserverListIndex)
        ) {
            value = this.node.fmmlObserverListIndex + host.cursorStartIndex + 1;
            value = '' + value;
        }
    }
    
    if(FM.isset(this.node.value)) {
        this.node.value = value;
    } else if(me.node.nodeName == 'IMG') {
        me.node.setAttribute("src",value);
    } else {
        me.node.innerHTML = value;
    }
}

FM.MlObserver.addObserver("ListIndex",FM.MlObserverListIndex,'GLOBAL');

/**
* List selection ML observer class for {@link FM.MlHostGenericList} host. 
* 
* @class FM.MlObserverListSelection
* @extends FM.MlObserver
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/ 
FM.MlObserverListSelection = FM.defineClass('MlObserverListSelection',FM.MlObserver);
    

FM.extendClass(FM.MlObserverListSelection, FM.MlObserver);  

FM.MlObserverListSelection.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="ListSelection";
    
    var me = this;
    $(this.node).click(function(event) {
        var host = me.getHost();                
        var dmobj = me.getDmObject();
        if(dmobj && FM.isset(host.isSelected)) {
            host.onEvent(
                me,
                host.isSelected(dmobj) ? "onDeselected" : "onSelected", 
                {object: dmobj}
            );
        }
        return true;
    });
}

FM.MlObserverListSelection.prototype.setNodeValue = function() {
    // provjeri
    var host = this.getHost();                
        
    // get dmobj && dmlist
    var dmobj = this.getDmObject();
    var issel = dmobj && FM.isset(host.isSelected) ?  host.isSelected(dmobj) : false;
    if(FM.isset(this.node.checked)) {
        if(this.node.checked != issel) this.node.checked = issel;
    } 
    
    if(issel) {
        $(this.node).closest(".fmmlClsListRowWrapper").addClass("fmmlSelected");
    } else {
        $(this.node).closest(".fmmlClsListRowWrapper").removeClass("fmmlSelected");
    }
}

FM.MlObserver.addObserver("ListSelection",FM.MlObserverListSelection,'GLOBAL');

/**
* List order ML observer class for {@link FM.MlHostGenericList} host. 
* 
* @class FM.MlObserverListOrder
* @extends FM.MlObserver
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/ 
FM.MlObserverListOrder = FM.defineClass('MlObserverListOrder',FM.MlObserver);

FM.MlObserverListOrder.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="ListOrder";
    
    var me = this;
    $(this.node).click(function(event) { 
        event.preventDefault();
        var dmobj = me.getDmObject();
        if(dmobj) {
            var attrname = me.getAttr('data-fmml-attr-name',''); // mine attr
            var orderAttrname = me.getAttr('data-fmml-order-attr-name','order_attr'); // attr to set order (put attrname here)
            var orderDir = me.getAttr('data-fmml-order-dir-attr-name','order'); // order dir attr (ASC/DESC)
            var curOrderAtrr = dmobj.getAttr(orderAttrname,'');
            var curOrderDir = dmobj.getAttr(orderDir,'ASC');
            if(curOrderAtrr == attrname) {
                dmobj.setAttr(orderDir, curOrderDir == 'DESC' ? 'ASC' : 'DESC',true);
            } else {
                var attrs = {};
                attrs[orderAttrname] = attrname;
                attrs[orderDir] = 'ASC';
                dmobj.setAttr(null,attrs,true);                
            }
        }
    });
}        

FM.MlObserverListOrder.prototype.setNodeValue = function() {    
    // provjeri
    var attrname = this.getAttr('data-fmml-attr-name',''); // mine attr
    var orderAttrname = this.getAttr('data-fmml-order-attr-name','order_attr'); // attr to set order (put attrname here)
    var orderDir = this.getAttr('data-fmml-order-dir-attr-name','order'); // order dir attr (ASC/DESC)
    var dmobj = this.getDmObject();
    if(dmobj && attrname != '') {
        var curOrderAttr = dmobj.getAttr(orderAttrname,'');
        var curOrderDir = dmobj.getAttr(orderDir,'ASC');
        if(curOrderAttr == attrname) {
            if(curOrderDir == 'DESC') {
                $(this.node).removeClass("fmmlOrderAsc");
                $(this.node).addClass("fmmlOrderDesc");
            } else {
                $(this.node).addClass("fmmlOrderAsc");
                $(this.node).removeClass("fmmlOrderDesc");                
            }
        } else {
            $(this.node).removeClass("fmmlOrderAsc");
            $(this.node).removeClass("fmmlOrderDesc");            
        }
    }
}

FM.MlObserver.addObserver("ListOrder",FM.MlObserverListOrder,'GLOBAL');

/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */
/**
* Basic ML extensions class. Extensions purpose is rendering of observer value,
* implementation of input methods, etc.
* 
* @class FM.MlExtension
* @extends FM.LmObject
* @param {FM.AppObject} app Current application.
* @param {object} [attrs] DOM node attributes

*/
FM.MlExtension = FM.defineClass('MlExtension',FM.LmObject);


// methods
FM.MlExtension.prototype._init = function(app,attrs) {
    this._super("_init",app,attrs);
    this.objectSubClass = "Extension";
    
    this.log(attrs, FM.logLevels.debug, 'MlExtension._init');

    this.defaultRenderer = false;
    
    this.log("New extension created.", FM.logLevels.debug, 'MlExtension._init');
}

/**
 * Run extension.
 * 
 * @public
 * @function
 * @param {FM.MlObserver} [obs] Observer extension belongs to.
 */
FM.MlExtension.prototype.run = function(obs) {
    this.observer = obs ? obs : null;
    this._super("run");
}

/**
 * Dispose extension.
 * 
 * @public
 * @function  
 * @param {FM.MlObserver} [obs] Observer extension belongs to.
 */
FM.MlExtension.prototype.dispose = function(obs) {    
    this._super("dispose");
}


/**
 * Called by observer to signal change of data model,
 *
 * @public
 * @function 
 * @param {FM.MlObserver} obs Observer extension belongs to.
 */
FM.MlExtension.prototype.update = function(obs) {
}


/**
 * Returns observer this extension belongs to.
 * 
 * @public
 * @function
 * @returns {FM.MlObserver}
 */

FM.MlExtension.prototype.getObserver = function() {
    return this.observer ? this.observer : null;
}

/**
 * Returns host this extension belongs to.
 * 
 * @public
 * @function
 * @returns {FM.MlHost}
 */
FM.MlExtension.prototype.getHost = function() {
    return this.observer ? this.observer.getHost() : null;
}

/**
 * Returns extension application instance.
 * 
 * @returns {FM.AppObject}
 * 
 */
FM.MlExtension.prototype.getApp = function() {
    return this.observer ? this.observer.getApp() : null;
}

/**
 * Returns current DM object.
 * 
 * @public
 * @function
 * @returns {FM.DmObject}
 */
FM.MlExtension.prototype.getDmObject = function() {
    return this.observer ? this.observer.getDmObject() : null;
}

/**
 * Set extension DM object. This method in FM.MlExtension have no efect.
 * Extension DM object is always provided from observer extension is registred to.
 * 
 * @param {FM.DmObject} o New extension DM object. <i>onSetDmObject</i> event will be fired.
 * 
 */
FM.MlExtension.prototype.setDmObject = function(o) {
}

/**
 * Returns extension DOM node.
 * 
 * @returns {node}
 * 
 */
FM.MlExtension.prototype.getNode = function() {
    return this.observer ? this.observer.getNode() : null;
}

// renderer interface
/**
 * Reender observer value in DOM node.
 * This method is called by observer when extension is default renderer.
 * 
 * @public
 * @function
 */
FM.MlExtension.prototype.render = function() {
    // abstract
}

/**
 * Check if extension is default renderer.
 * 
 * @public
 * @function
 * @returns {boolean} 
 */
FM.MlExtension.prototype.isRendererEnabled = function() {
    return this.defaultRenderer;
}


/**
 * Enable renderer. 
 * This method is called by observer when extension become default renderer.
 * 
 * @public
 * @function
 */
FM.MlExtension.prototype.enableRenderer = function() {
    if(this.defaultRenderer != true) {
        this.defaultRenderer = true;
    }
}

/**
 * Disable renderer. 
 * This method is called by observer when extension is not default renderer any more.
 * 
 * @public
 * @function
 */

FM.MlExtension.prototype.disableRenderer = function() {
    if(this.defaultRenderer != false) {
        this.defaultRenderer = false;
    }
}


// static
FM.MlExtension.extensionTypes = {
    GLOBAL: {}
};

/**
 * Register application extension type.
 *  
 * @public
 * @static
 * @function
 * @param {string} type name.
 * @param {FM.MlExtension} fn Extension class function.
 * @param {string} [appCls='GLOBAL'] Application subclass type.
 * 
 * @returns {boolean}
 */
FM.MlExtension.addExtensionType = function(type,fn,appCls) {    
    if(!FM.isset(fn) || !FM.isFunction(fn)) return false;
    appCls = FM.isset(appCls) && FM.isString(appCls) && appCls != '' ? appCls : 'GLOBAL';
    if(!FM.isset(FM.MlExtension.extensionTypes[appCls])) {
        FM.MlExtension.extensionTypes[appCls]= {};
    }
    
    FM.MlExtension.extensionTypes[appCls][type] = fn;
    return true;
}



/**
* Returns MlExtension <b>config</b> class function for <b>config</b> subclass type.
* 
* @static
* @function    
 * @param {FM.AppObject} app Current application.
 * @param {String} name Extension subclass type.
 * @return {FM.MlExtension} Class function. 
*/   
FM.MlExtension.getConfiguration = function(app,name) {
    var list = FM.MlExtension.extensionTypes;

    app = FM.isset(app) && app ? app : null;
    var appCls = app ? app.getSubClassName() : null;
    var appCfg = appCls && FM.isset(list[appCls]) ? list[appCls] : null;
        
    var obj = null;
    if(appCfg && FM.isset(appCfg[name])) {
        obj = appCfg[name];
    } else if(app && FM.isArray(app.applicationObjectsSpace)) {
        FM.forEach(app.applicationObjectsSpace,function(i,ns) {
            if(FM.isset(list[ns]) && FM.isset(list[ns][name])) {
                obj = list[ns][name];
                return false;
            }
            return true;
        });
    }
    
    if(!obj && FM.isset(list['GLOBAL'][name])) {
        obj = list['GLOBAL'][name];
    }
    
    return obj;
}

/**
 * Returns new instance of chosen <b>sctype</b> extension type.
 
 * @static
 * @public
 * @function    
 * @param {FM.AppObject} app Current application.
 * @param {object} attrs Extension attributes.
 * @param {node} node Extension node.
 * @param {String} type Extension subclass type.
 * 
 * @return {FM.MlExtension} New extension instance.
 */
FM.MlExtension.newExtension = function(app,attrs,node,type) {
    var clsFn = FM.MlExtension.getConfiguration(app,type);
    return clsFn ? new clsFn(app,attrs) : null;
}


/**
 * ML observer value edit extensions class. 
 * 
 * @class FM.MlEdit
 * @extends FM.MlExtension
 * @param {FM.AppObject} app Current application.
 * @param {object} [attrs] DOM node attributes
 */
FM.MlEdit = FM.defineClass('MlEdit', FM.MlExtension);

// methods
FM.MlEdit.prototype._init = function(app,attrs) {
    this._super("_init", app, attrs);
    this.objectSubClass = "Edit";
    this.triggerEvent = this.getAttr('data-fmml-update-condition', 'blur') +
        ".fmMlEdit"
        ;
    this.editWidget = null;
}

FM.MlEdit.prototype.run = function(obs) {
    this._super("run", obs);

    if (this.getObserver()) {
        this.getObserver().addRenderer(this);
    }
}

FM.MlEdit.prototype.dispose = function(obs) {
    if (this.getObserver()) {
        this.getObserver().removeRenderer(this);
    }

    this._super("dispose",obs);
}

// methods
FM.MlEdit.prototype._setNodeValue = function(node, value) {
    var doSelection =false;
    try {
        doSelection = node.selectionStart ? true : false;
    } catch(e){
        
    }
    var selStart = 0,selEnd = 0;
    if (doSelection) {
        selStart = node.selectionStart;
        selEnd = node.selectionEnd;
    }
    
    
    if (node.nodeName == 'INPUT' || node.nodeName == 'TEXTAREA') {
        if ($(node).is(':checkbox')) {
            if (value && value != '' && value.toLowerCase() != 'false') {
                $(node).attr('checked', 'checked');
            } else {
                $(node).removeAttr('checked');
            }
        } else if ($(node).is(':radio')) {
            $("input:radio[name ='" + $(node).attr("name") + "']").val([value]);
        } else {
            $(node).val(value);
        }
    } else if (node.nodeName == 'IMG') {
        value = $(node).attr("src");
    } else if (node.nodeName == 'A') {
        value = $(node).attr("href");
    } else if (FM.isset(node.value)) {
        $(node).val(value);
    } else {
        $(node).html(value);
    }

    // selection range restore
    if (doSelection) {
        node.setSelectionRange(selStart, selEnd);
    }
}

FM.MlEdit.prototype.widgetHide = function() {
    $(this.editWidget).hide();
    $(this.getNode()).show();
}

FM.MlEdit.prototype.widgetShow = function() {
    $(this.getNode()).hide();
    $(this.editWidget).show();
    this.getObserver().setNodeValue(true);
    $(this.editWidget).focus();

}

FM.MlEdit.prototype.widgetCb = function(node) {
    if (!this.isRendererEnabled()) {
        return true;
    }

    //var node = this.editWidget ? this.editWidget : this.getNode();
    if (!node) {
        return true;
    }
    var value =
        $(node).is(':checkbox') ?
        ($(node).is(":checked") ? 'true' : 'false') : (
            $(node).is(':radio') ? 
            $("input:radio[name ='" + $(node).attr("name") + "']:checked").val() :
            (FM.isset(node.value) ? $(node).val() : $(node).html())
        );
    if(FM.isArray(value) && value.length < 2) {
        value = value.length==0 ? "" : value[0];
    }
    this.getObserver().setValue(value);
    return true;
}

FM.MlEdit.prototype.initWidget = function() {
    var domnode = this.getNode();
    var me = this;
    this.editWidget = null;
    var nType = domnode.nodeName;

    if (nType == 'INPUT' || nType == 'TEXTAREA' || nType == 'SELECT') {
        if ($(domnode).is(':radio')) {
            $("input:radio[name ='" + $(domnode).attr("name") + "']").bind(this.triggerEvent, function() {
                return me.widgetCb(this);
            });
        } else {
            $(domnode).bind(this.triggerEvent, function(a,b,c) {
                return me.widgetCb(this);
            });
        }
    } else {
        var edittype = this.getAttr('data-fmml-attr-edittype', 'input');

        if (edittype != 'input') {
            this.editWidget = $("<" + edittype + " class='fmmlValueInput'></" + edittype + ">")[0];
        } else {
            this.editWidget = $("<input type='text' class='fmmlValueInput'>")[0];
        }

        $(this.editWidget).bind(this.triggerEvent, function() {
            return me.widgetCb(this);
        });

        $(domnode).bind("click.fmMlEdit", function() {
            return me.widgetShow();
        });
        $(this.editWidget).bind("blur.fmMlEdit", function() {
            return me.widgetHide();
        });
        $(this.editWidget).hide();
        $(this.getNode()).after(this.editWidget);
    }
}

FM.MlEdit.prototype.disposeWidget = function() {
    if (this.editWidget) {
        this.widgetHide();
        $(this.editWidget).unbind(this.triggerEvent);
        $(this.editWidget).unbind("blur.fmMlEdit");
        $(this.getNode()).unbind("click.fmMlEdit");
        $(this.editWidget).remove();
        this.editWidget = null;
    } else {
        if ($(this.getNode()).is(':radio')) {
            $("input:radio[name ='" + $(this.getNode()).attr("name") + "']").unbind(this.triggerEvent);
        } else {
            $(this.getNode()).unbind(this.triggerEvent);
        }
    }
}


FM.MlEdit.prototype.render = function(value) {
    if (this.editWidget) {
        this._setNodeValue(this.editWidget, value);
    }
    this._setNodeValue(this.getNode(), value);
}

FM.MlEdit.prototype.enableRenderer = function() {
    if (!this.isRendererEnabled()) {
        this.initWidget();
    }
    this._super("enableRenderer");
}

FM.MlEdit.prototype.disableRenderer = function() {
    if (this.isRendererEnabled()) {
        this.disposeWidget();
    }
    this._super("disableRenderer");
}



FM.MlExtension.addExtensionType('Edit', FM.MlEdit);



/**
 * ML date  edit extensions class. 
 * 
 * @class FM.MlDateEdit
 * @extends FM.MlExtension
 * @param {FM.AppObject} app Current application.
 * @param {object} [attrs] DOM node attributes
 * @requires <a href="http://api.jqueryui.com/datepicker/">http://api.jqueryui.com/datepicker/</a>
 * @description You can use other plugins instead jquery ui by replacing initWidget() method
 */
FM.MlDateEdit = FM.defineClass('MlDateEdit', FM.MlEdit);

FM.MlDateEdit.prototype._init = function(app,attrs) {
    this._super("_init", app, attrs);
    this.objectSubClass = "DateEdit";
    this.editWidgetDate =  null;
}

// methods
FM.MlDateEdit.prototype.initWidget = function() {
    this._super("initWidget");
    this.editWidgetDate = $("<input style='display:none;'></input>")[0];
    $(this.editWidget? this.editWidget : this.getNode()).after(this.editWidgetDate);
    var me = this;
        
    $(this.editWidgetDate).val(this.getObserver().getValue());
    
    var opts = {
        dateFormat: "yy-mm-dd",
         showOn: "both",
        onSelect: function(dateText, oDp) {
            var obs = me.getObserver();
            if (obs) {
                obs.setValue(dateText);
            }
            return true;
        }
    };
    
    this.forEachAttr(function(n,v) {
        if(FM.startsWith(n,'data-fmml-wg-option-')) {
            opts[FM.camelCase(n.substr(20))] = v;
        }
        return true;
    });

    $(this.editWidgetDate).datepicker(opts);
}

FM.MlDateEdit.prototype.disposeWidget = function() {    
    if (this.editWidgetDate) {
        $(this.editWidgetDate).remove();        
    }
    this.editWidgetDate = null;
    
    this._super("disposeWidget");    
}

FM.MlDateEdit.prototype.render = function(value) {
    this._super("render",value);
    var d = null;
    try {
        d = FM.parseDateString(
            this.getObserver().getValue(),
            this.getAttr('data-fmml-date-is-utc', 'true') != 'false'
        );
    } catch (e) {
        
    }
    if (this.editWidgetDate) {
        $(this.editWidgetDate).datepicker( 
            "setDate", d
        );
    }
}

FM.MlExtension.addExtensionType('DateEdit', FM.MlDateEdit);

/**
 * ML list of values edit extensions class. 
 * 
 * @class FM.MlListOfValues
 * @extends FM.MlEdit
 * @param {object} [attrs] DOM node attributes
 * @param {DOMnode} node DOM node
 */
/*
 * data-fmml-update-condition   - update event blur def
 * data-fmml-list               - dm list conf
 * data-fmml-list-id-attr       - list attr which correspond to attr of observer
 * data-fmml-list-id            - menu id attr
 * data-fmml-list-text-attr     - menu text attr
 * data-fmml-list-def-selected  - menu def value
 * data-fmml-list-def-selected-attr -
 * data-fmml-list-allow-null    - add empty row in menu
 * data-fmml-list-depends-of    - list of host attributes to send
 */
FM.MlListOfValues = FM.defineClass('MlListOfValues', FM.MlEdit);

// methods
FM.MlListOfValues.prototype._init = function(app,attrs) {
    this._super("_init", app,attrs);
    this.objectSubClass = "ListOfValues";

    // LOV
    this.lastLovArguments = null;
    this.lovDependsOf = null;
    this.lovItemsTemplate = null;
    this.dmList = null;
}

FM.MlListOfValues.prototype.run = function(obs) {
    this._super("run", obs);

    // if dependsof attrs are not jet collected 
    var dependsOfStr = obs.getAttr('data-fmml-list-depends-of', '');
    this.lovDependsOf = dependsOfStr == '' ? [] : dependsOfStr.split(',');

    // create LOV
    var me = this;
    this.lovFetch(this.lovGetFetchArguments(), function(isok, list) {
        me.lovDisplay(isok, list);
    });
}

// methods
// fetch values for LOV from server
FM.MlListOfValues.prototype.lovFetch = function(args, callback) {

    // get observer
    var obs = this.getObserver();
    if (!obs) {
        return false;
    }

    // create dmlist
    args = FM.isset(args) && args && FM.isObject(args) ? args : {};
    callback = FM.isset(callback) && callback && FM.isFunction(callback) ? callback : function() {
    };
    var dmconfName = obs.getAttr('data-fmml-list', '');
    if (this.dmList) {
        this.dmList.dispose();
    }
    this.dmList = new FM.DmList(args, dmconfName, obs.getApp());
    this.lastLovArguments = args;

    // prepare listener
    var me = this;
    var lstnr = {
        /** @ignore */
        onListStart: function(sender, data) {
            me.log("Ajax call started", FM.logLevels.info, 'MlListOfValues.onListStart');
            $(me.getNode()).addClass("fmmlWaitState");
            return true;
        },
        /** @ignore */
        onListEnd: function(sender, data) {
            me.log("Ajax call completed", FM.logLevels.info, 'MlListOfValues.onListEnd');
            $(me.getNode()).removeClass("fmmlWaitState");
            me.dmList.removeListener(lstnr);
            callback(true, me.dmList);
            return true;
        },
        /** @ignore */
        onListError: function(sender, data) {
            me.log(data, FM.logLevels.error, 'MlListOfValues.onListError');
            $(me.getNode()).removeClass("fmmlWaitState");
            me.dmList.removeListener(lstnr);
            callback(false, null);
            return true;
        }
    };

    me.dmList.addListener(lstnr);
    me.dmList.getData();

    return true;
}

FM.MlListOfValues.prototype.lovEmpty = function() {
    $(this.editWidget ? this.editWidget : this.getNode()).empty();
    var lovDesc = this.getAttr(
        'data-fmml-lov-description', ''
        );
    if (lovDesc != '' && this.editWidget) {
        $(this.editWidget).append('<legend>' + lovDesc + '</legend>');
    }
}

FM.MlListOfValues.prototype.lovRenderItem = function(obj, issel, menuId, menuAttr, menuTempl, menuTemplName) {
    var itmText = '';
    var me = this;
    var domnode = this.editWidget ? this.editWidget : this.getNode();
    var attrs = obj ? obj.getAttr() : {};
    attrs['lovSelected'] = issel ? 'selected' : '';
    attrs['lovValue'] = FM.getAttr(attrs, menuId, '');
    attrs['lovDataID'] = obj ? obj.getDataID() : '';

    if (menuTemplName != '') {
        if (this.lovItemsTemplate == null) {
            FM.UtTemplate.getTemplate(
                this.getApp(), attrs, menuTemplName, function(isok, templ) {
                if (isok) {
                    me.lovItemsTemplate = templ;
                } else {
                    me.lovItemsTemplate = '';
                }
                itmText = $(FM.applyTemplate(
                    attrs, me.lovItemsTemplate, false, false
                    ));
                $(itmText).attr("data-fmml-object-id", FM.getAttr(attrs, 'lovDataID', ''));
                $(domnode).append(itmText);
            }
            );
            return;
        } else {
            itmText = FM.applyTemplate(attrs, this.lovItemsTemplate, false, false);
            itmText = $(itmText);
        }

    } else if (menuTempl != '') {
        itmText = FM.applyTemplate(attrs, this.menuTempl, false, false);
        itmText = $(itmText);
    } else {
        var nType = domnode.nodeName;

        if (nType == 'SELECT') {
            itmText =
                '<option  class="fmmlOption"' +
                (issel ? ' selected="selected"' : '') +
                ' value="' + FM.getAttr(attrs, menuId, '') + '">' +
                FM.getAttr(attrs, menuAttr, '') +
                '</option>'
                ;
            itmText = $(itmText);
        } else {
            var itmid = "fm_rg_" + this.getID();
            itmText =
                '<label for="' + itmid + '" class="fmmlRadioLabel">' +
                FM.getAttr(attrs, menuAttr, '') + '</label>' +
                '<input type="radio" name="' + itmid + '" id="' + itmid + '"' +
                (issel ? ' checked="checked"' : '') +
                ' value="' + FM.getAttr(attrs, menuId, '') + '"/><br />'
                ;
            itmText = $(itmText);
            itmText.bind(this.triggerEvent, function() {
                return me.widgetCb(this);
            });
        }
    }


    itmText.attr("data-fmml-object-id", obj.getDataID());

    $(domnode).append(itmText);
}

FM.MlListOfValues.prototype.lovDisplay = function(isok) {
    if (!this.isRendererEnabled() || !this.dmList) {
        return;
    }

    // clear list
    this.lovEmpty();

    // get observer & dmobject & obs attribute name
    var me = this;
    var obs = this.getObserver();

    // LOV def data-fmml-list-id-attr > data-fmml-attr-name ref!
    var menuId = obs.getAttr('data-fmml-list-id-attr', 'id');
    var menuAttr = obs.getAttr('data-fmml-list-text-attr', '');
    var menuTempl = obs.getAttr('data-fmml-list-text-template', '');
    var menuTemplName = obs.getAttr('data-fmml-list-text-template-name', '');
    var defSelValue = obs.getAttr('data-fmml-list-def-selected', '');
    if (FM.isFunction(window[defSelValue]))
        defSelValue = window[defSelValue](); // ref!
    var defSelAttr = obs.getAttr('data-fmml-list-def-selected-attr', '');
    var allowNulls = obs.getAttr('data-fmml-list-allow-null', 'false');

    // state
    var def = null, first = null, cur = null;
    var curVal = obs.getValue();

    // ok, display list
    if (isok) {
        // iterate list and find sel value
        this.dmList.forEachListElement(function(index, obj) {
            // def
            if (defSelAttr != '' && defSelValue != '') {
                if (obj.getAttr(defSelAttr, '') == defSelValue) {
                    def = obj;
                }
            }
            if (!first) {
                first = obj;
            }
            if (obj.getAttr(menuId, '') == curVal) {
                cur = obj;
            }
            return(true);
        });

        // find selected (current > def > first > none
        var lovSelected = cur ? cur : (def ? def : first);

        // null
        if (allowNulls == 'true') {
            this.lovRenderItem(null, false, "", "", menuTempl, menuTemplName);
        }

        // fill list
        this.dmList.forEachListElement(function(index, obj) {
            me.lovRenderItem(
                obj, obj == lovSelected,
                menuId, menuAttr,
                menuTempl, menuTemplName
                );
            return(true);
        });

        // check if dm value and lov value are the same
        this._runHost(true);
        if (lovSelected) {
            obs.setValue(lovSelected.getAttr(menuId, ''));
        }
    } else { // error
        this.lovRenderItem(null, false, "", "Error occured", menuTempl, menuTemplName);
    }
}

FM.MlListOfValues.prototype.render = function(value) {
    if (this.editWidget && this.editWidget.nodeName == 'FIELDSET') {
        $(this.editWidget).find("input:radio").val([value]);
    } else {
        this._super("render", value);
    }
}


FM.MlListOfValues.prototype.widgetCb = function(evnode) {
    if (!this.isRendererEnabled()) {
        return true;
    }

    this._super("widgetCb", evnode);

    // host to run
    this._runHost(true);
}

FM.MlListOfValues.prototype._runHost = function(doinit) {
    var hostToRun = this.getAttr("data-fmml-run-on-lov-change", '');
    if (hostToRun != '' && this.dmList) {
        var node = document.getElementById(hostToRun);
        if (node) {
            var menuId = this.getAttr('data-fmml-list-id-attr', 'id');
            var curVal = this.getObserver().getValue();
            var oObj = this.dmList.get(curVal, menuId);
            doinit = doinit == true;

            if (!FM.isset(node.fmmlHost) || !node.fmmlHost) {
                if (!doinit || !$(node).attr('data-fmml-host'))
                    return false;
                FM.MlHost.initChildNodes(this.getApp(), node, oObj, false);
                if (!FM.isset(node.fmmlHost) || !node.fmmlHost)
                    return false;
            }

            node.fmmlHost.run(oObj);
            return true;
        }
    }

    return false;
}

FM.MlListOfValues.prototype.lovGetFetchArguments = function() {
    var args = {};
    var obs = this.getObserver();
    var dmobj = obs.getDmObject();
    if (dmobj)
        for (var i = 0; i < this.lovDependsOf.length; i++) {
            args[this.lovDependsOf[i]] = dmobj.getAttr(this.lovDependsOf[i], '');
        }
    return args;
}


FM.MlListOfValues.prototype.lovCheckDepedOfChanged = function() {
    var obs = this.getObserver();
    var dmobj = obs.getDmObject();

    // menu is not filled yet
    if (!dmobj || this.lastLovArguments == null)
        return true;


    // check attributes
    var depchanged = false;
    for (var i = 0; i < this.lovDependsOf.length; i++) {
        if (
            FM.getAttr(this.lastLovArguments, this.lovDependsOf[i], '')
            !=
            dmobj.getAttr(this.lovDependsOf[i], '')
            ) {
            depchanged = true;
            break;
        }
    }

    // end
    return(depchanged);
}



FM.MlListOfValues.prototype.initWidget = function() {
    var domnode = this.getNode();
    var me = this;
    this.editWidget = null;
    var nType = domnode.nodeName;

    if (nType == 'SELECT') {
        this.lovDisplay(true, this.dmList);
        $(domnode).bind(this.triggerEvent, function() {
            return me.widgetCb(this);
        });
    } else {
        var edittype = this.getAttr(
            'data-fmml-attr-edittype',
            $(domnode).is(':radio') ? 'radio' : 'select'
            );
        if (edittype == 'select') {
            this.editWidget = $("<select class='fmmlValueInput'></select>")[0];
        } else if (edittype == 'radio') {
            this.editWidget =
                $("<fieldset class='fmmlFieldset fmmlValueGroup'></fieldset>")[0];
        } else {
            this.editWidget = $("<" + edittype + " class='fmmlValueInput'></" + edittype + ">")[0];
        }
        $(domnode).after(this.editWidget);
        if ($(domnode).is(':radio') || edittype == 'radio') {
            this.widgetShow();
        } else {
            $(domnode).bind("click.fmMlEdit", function() {
                return me.widgetShow();
            });
            $(this.editWidget).bind("blur.fmMlEdit", function() {
                return me.widgetHide();
            });
            this.widgetHide();
        }

        this.lovDisplay(true, this.dmList);
        if (edittype != 'radio') {
            $(this.editWidget).bind(this.triggerEvent, function() {
                return me.widgetCb(this);
            });
        }
    }
}

FM.MlListOfValues.prototype.update = function(obs) {
    this._super("update", obs);

    // if dep value are not changed
    if (!this.lovCheckDepedOfChanged()) {
        return true;
    }

    var me = this;
    this.lovFetch(this.lovGetFetchArguments(), function(isok, list) {
        me.lovDisplay(isok, list);
    });
}


// static
FM.MlExtension.addExtensionType('ListOfValues', FM.MlListOfValues);






}
