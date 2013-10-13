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
