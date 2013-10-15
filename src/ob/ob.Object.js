/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */

/**
 * Basic FM class. Provide listeners, attributes, propertyes, logger.
 * 
 * @class FM.Object
 * @param {object|string|function} attrs List of attribute name and values, 
 *  This parametar can be object, string evaluating to object or function returning object.
 * @param {object} [flds] Allowed attributes,
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
 * Returns name of the class.
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
* Get class instance id.
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
 * Returns data ID of the class instance,
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
    if (!this.isEnabled())
        return false;

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
 * Start to process events.
 * 
 * @public
 * @function 
 */
FM.Object.prototype.enable = function() {
    this.enabled = true;
}

/**
 * Stop processing events.
 * 
 * @public
 * @function 
 */
FM.Object.prototype.disable = function() {
    this.enabled = false;
}


/**
 * Check if object is enabled.
 * 
 * @public
 * @function 
 * @return {boolean} 
 */
FM.Object.prototype.isEnabled = function() {
    return this.enabled;
}

/**
 *  Log a message.
 * 
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
 * Get global log level,
 * 
 * @public
 * @function 
 */
FM.Object.prototype.getLogLevel = function() {
    return this.objectLogLevel;

}

/**
 * Dispose object.
 * 
 * @public
 * @function 
 */
FM.Object.prototype.dispose = function() {
    this.removeAllListeners();
}

