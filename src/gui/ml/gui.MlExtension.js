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

