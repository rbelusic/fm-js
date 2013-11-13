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
