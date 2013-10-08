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
