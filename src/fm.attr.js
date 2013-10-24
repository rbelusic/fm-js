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
