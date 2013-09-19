// -- Basic FM class -----------------------------------------------------------
/**
* Basic FM class. Provide listeners, attributes, propertyes, logger
* 
* @class FM.Object
* @memberOf FM
* @param {object} attrs list of attribute name and values
* @param {object} [flds] allowed attributes
*/    
FM.Object = FM.defineClass('Object');

/**
* Get  FM class name
* @public     
* @function 
* @returns {string} Returns name of the object
*/   
FM.Object.prototype.getClassName = function() {
    var o=this;

    while(o && !FM.isset(o.constructor.className)) {
        o = o.parent? o.parent : null;
    }
    return(o ? o.constructor.className : '');
}


/**
* Get FM subclass name
* @public     
* @function 
* @returns {string} Returns subclass of object
*/   
FM.Object.prototype.getSubClassName = function() {
    return this.objectSubClass;
},

/**
* Get object id
* @public     
* @function 
* @returns {string} Returns id of object
*/   
FM.Object.prototype.getID = function() {
    if(this.id == null) this.id = FM.generateNewID();
    return(this.id);
}

/**
* Get object data id 
* @public     
* @function 
* @returns {string} Returns id of object
*/   
FM.Object.prototype.getDataID = function() {    
    return(this.getID());
}


/**
* Add listener
* @public     
* @function 
* @param {FM.Object|object} oListener FM.Object to register as listener or object with event functions
* @param {object} [config] Additional options
*/   
FM.Object.prototype.addListener = function(oListener,config) {

    // definicija listenera
    var lstnrdef = {
        listener: oListener,
        config: FM.isset(config) ? config : {},
        iscallback: !FM.isset(oListener.onEvent)
    };

    // if the listener is not object
    if(!FM.isset(oListener.getID)) {
        var lid = '_CB_' + FM.generateNewID();
        /** @ignore */
        oListener.getID = function() {
            return lid;
        }
    }
    this.listenersArr[oListener.getID()] = lstnrdef;
}

/**
* Remove listener
* @public     
* @function 
* @param {FM.Object|object} oListener 
*/   
FM.Object.prototype.removeListener = function(oListener) {
    if(!FM.isset(oListener)  || !oListener || !FM.isset(oListener.getID)) return false;

    var nlist = {};
    var objId = oListener.getID();
    if(!objId) return false;

    for(var id in this.listenersArr) {
        if(objId != id) nlist[id] = this.listenersArr[id];
    }

    this.listenersArr = nlist;

    return true;
}

/**
* Remove all listeners
* @public     
* @function 
*/   
FM.Object.prototype.removeAllListeners = function() {
    this.listenersArr = {};
    return true;
}


/**
* Event function
* @public     
* @function 
* @param {FM.Object} sender Sender of event
* @param {String} ev Event
* @param {String} data Event data
* @param {Object} calledlist list of olready called listeners
*/   
FM.Object.prototype.onEvent = function(sender,ev,data,calledlist) {
     var cl = FM.isset(calledlist) ? calledlist : {};
    if(!this.isEnabled()) return false;

    //  ako imaš event fn
    if(FM.isset(this[ev])) {
        this[ev](sender,data);
        cl[this.getID()] = '1';
        FM.setAttr(cl,'_executed','1'); 
        //return cl;
    } 

    // proslijedi dalje ako nemas ev fn
    //return this.fireEvent(ev,data,cl);
    return cl;
}

/**
* Send event to all listeners
* @public     
* @function 
* @param {String} ev Event
* @param {String} evdata Event data
*/   
FM.Object.prototype.fireEvent = function(ev,evdata,calledlist) {
    var cl = FM.isset(calledlist) ? calledlist : {};
    if(FM.getAttr(cl,'_executed','0') == '1') return cl;
    
    cl[this.getID()] = '0'; 
    
    // obicni listeneri
    var larr = this.listenersArr;
    for(var id in larr) {
        var ldef = larr[id];
        if(!FM.isset(cl[id])) {
            cl[id] = "0";
            try {
                if(ldef.iscallback) {
                    if(FM.isFunction(ldef.listener[ev])) {
                        ldef.listener[ev](this,evdata);
                        cl[ldef.listener.getID()] = '1';
                        FM.setAttr(cl,'_executed','1'); 
                    }
                } else {
                    cl = ldef.listener.onEvent(this,ev,FM.isset(evdata) ? evdata : {},cl);
                }
            } catch(err) {
                console.log("fireEvent error(" + ev + "): " + err);
            }
            //if(FM.getAttr(cl,'_executed','0') == '1') break;            
        }
    }

    // kraj
    return cl;
}

/**
* Test attribute existence
* @public     
* @function 
* @param {string} [key] Attribute name
* @returns {boolean} 
*/   
FM.Object.prototype.isAttr = function(key) {
    return FM.isAttr(this.options,key);
}

/**
* Get attribute value
* @public     
* @function 
* @param {string} [key] Attribute name
* @param {string} [defv] Default value of attribute. Default for default is empty string :)
* @returns {object|string|number} Returns attribute value of <i>key</i> attribute or all attributes in object if <i>key</i> is undefined
*/   
FM.Object.prototype.getAttr = function(key,defv) {
    return FM.getAttr(this.options,key,defv);
}

/**
* Set value of <i>key</i> attribute to <i>val</i> value
* @public
* @function
* @param {string} key Attribute name
* @param {string} val Value of attribute
* @param {boolean} callevent Fire <i>onChange</i> after object update (default is true)
*/
FM.Object.prototype.setAttr = function(key,val,callevent) {
    if(FM.setAttr(this.options,this.undoList,key,val)) {
        this.setProperty('dirty',true);
        this.setProperty('timestamp',new Date().getTime());
        if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    }
}

/**
* See <i>FM.Object.getAttr()</i>
* @see FM.Object#getAttr
*/    
FM.Object.prototype.d = function(key,defv) {
    return this.getAttr(key,defv);
}

/**
* See <i>FM.Object.setAttr()</i>
* @see FM.Object#setAttr
*/    
FM.Object.prototype.s = function(key,val,callevent) {
    return this.setAttr(key,val,callevent);
}

/**
* Check if <i>key</i> attribute is changed
* @public
* @function 
* @param {string} key Attribute name
* @returns {boolean} Returns <i>true</i> if attribute is changed 
*/
FM.Object.prototype.isChanged = function(key) {
    if(FM.isset(key)) {
        if(FM.isset(this.undoList[key])) return true;
        return false;
    }
    return this.getProperty('dirty');
}

/**
* Set object <i>changed</i> property 
* @public
* @function 
* @param {boolean} v true or false
* @param {boolean} callevent Fire <i>onChange</i> after object update (default is false)
*/
FM.Object.prototype.setChanged = function(v,callevent) {
    this.setProperty('dirty',v == true);
    if(!this.getProperty('dirty')) this.undoList = {};
    if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
}

/**
* Discard object attributes changes
* @public
* @function 
*/
FM.Object.prototype.discardChanges = function() {
    for (var option in this.undoList) {
        this.setAttr(option, this.undoList[option]);
    }
    this.setChanged(false, true);
}

FM.Object.prototype.resolveAttrValue = function(attrName,def,context) {
    return FM.resolveAttrValue(this.options,attrName,def,context);
}

/**
* Return an unique string based on object data
* 
* @public
* @function
*/      
FM.Object.prototype.getDataHash = function() {
    var dataHash = '';
    for(var dataName in this.getAttr()) {
        var dataValue = this.d(dataName, '');

        dataHash += dataHash == '' ? dataValue : ',' + dataValue;
    }
    return FM.md5(dataHash);
}

/**
* Return object with all changed attributes
* @public     
* @function 
* @returns {object} Returns with changed attributes
*/
FM.Object.prototype.getChangedAttrList = function() {
    return FM.cloneObject(this.undoList);
}

/**
* Get property value
* @function 
* @param {string} key Property name
* @param {string} defv Default value of property
* @returns Returns property value
*/    
FM.Object.prototype.getProperty = function(key,defv) {
    return FM.getAttr(this.prop,key,defv);
}

/**
* Set property value
* @static
* @function
* @param {string} key Property name
* @param {string} val Value of property
* @param [boolean] callevent Fire <i>onChange</i> after object update (default is true)
*/
FM.Object.prototype.setProperty = function(key,val,callevent) {
    if(FM.setAttr(this.prop,null,key,val)) {
        if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    } else {
        return false;
    }
    return true;
}

/**
* For each attribute call function <i>doFn(id,attr)</i> until end of attributes or <i>false</i> return value.    
* @public
* @function 
* @param {function} [doFn={}]
* @return {string} In case of <i>false</i> return value of <i>doFn()</i> call return attribute name otherwise null
*/
FM.Object.prototype.forEachAttr = function(doFn) {
    return FM.forEach(this.options,doFn);
}

/**
* Evaluate property value
* @static
* @function
* @param {string} attrName Property name
* @param {string} def Default value of property
* @param {array} fnargs resolver arguments
*/
FM.Object.prototype.resolvePropertyValue = function(attrName,def,context) {
    return FM.resolveAttrValue(this.prop,attrName,def,context);
}

/**
* For each property call function <i>doFn(id,prop)</i> until end of properties or <i>false</i> return value.    
* @public
* @function 
* @param {function} [doFn={}]
* @return {string} In case of <i>false</i> return value of <i>doFn()</i> call return property name otherwise null
*/
FM.Object.prototype.forEachProperty = function(doFn) {
    return FM.forEach(this.prop,doFn);
}

/**
* Enable object. Object start to process events.
* @public
* @function 
*/
FM.Object.prototype.enable = function() {
    this.enabled = true;
}

/**
* Disable object. Object stop to process events.
* @public
* @function 
*/
FM.Object.prototype.disable = function() {
    this.enabled = false;
}


/**
* Check if object is enabled
* @public
* @function 
* @return {boolean} 
*/
FM.Object.prototype.isEnabled = function() {
    return this.enabled;
}

/**
* Log function to call from this object
* @public
* @function 
* @param {string} msg Log text
* @param {number} level Log level
* @param {string} callerinfo 
*/
FM.Object.prototype.log = function(msg,level,callerinfo) {
    FM.log(this,msg,level,callerinfo);
}                

/**
* Set log level for this object
* @public
* @function 
* @param {string | number} level Log level
*/
FM.Object.prototype.setLogLevel = function(level) {
    if(FM.isString(level)) {
        if(FM.isset(FM.logLevels[level.toLowerCase()])) {
            this.objectLogLevel = FM.logLevels[level.toLowerCase()];
        }
    } else {
        this.objectLogLevel = level;
    }
}

/**
* Get log level for this object
* 
* @public
* @function 
*/
FM.Object.prototype.getLogLevel = function() {
    return this.objectLogLevel;

}

/**
* Dispose object
* 
* @public
* @function 
*/
FM.Object.prototype.dispose = function() {
    console.log("DISPOSE:" + this.getSubClassName() + ":" + this.getID());
    this.removeAllListeners();
}


FM.Object.prototype._init = function(attrs,flds) {
    // properties    
    this.objectSubClass = "Objects";            
    this.id =  null;    
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
        fetched: true // da li je new loc ili je fetchan
    },        

    this.setAttr(false,FM.isset(flds) ? flds : {},false);
    this.strictOptions = FM.isset(flds) ? true : false;
    if(FM.isset(attrs) && attrs) {
        if(FM.isString(attrs)) attrs = FM.stringPtrToObject(attrs);
        if(FM.isFunction(attrs)) attrs = attrs();        
        this.setAttr(this.strictOptions,attrs,false);
    }
    
    this.setChanged(false,false);
}
