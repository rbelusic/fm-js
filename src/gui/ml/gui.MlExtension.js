/**
* Basic ML extensions class. 
* 
* @class FM.MlExtension
* @extends FM.Object
 * @param {object} [attrs] DOM node attributes
 * @param {DOMnode} node DOM node
*/
FM.MlExtension = FM.defineClass('MlExtension',FM.Object);


// methods
FM.MlExtension.prototype._init = function(attrs,node) {
    this._super("_init",attrs);
    this.objectSubClass = "Extension";
    this.node = node;
    this.executed = false;    
}

FM.MlExtension.prototype.run = function(obs) {
    //this.dispose(obs);
    this._super("run");
    this.observer = obs;
    this.executed = true;
}

FM.MlExtension.prototype.dispose = function(obs) {
    this._super("dispose");
    this.executed = false;
}

FM.MlExtension.prototype.update = function(obs) {
    this._super("update");
}

FM.MlExtension.prototype.getObserver = function() {
    return this.observer;
}

FM.MlExtension.prototype.getHost = function() {
    return this.observer ? this.observer.getHost() : null;
}

FM.MlExtension.prototype.getApp = function() {
    return this.observer ? this.observer.getApp() : null;
}

FM.MlExtension.prototype.getDmObject = function() {
    return this.observer ? this.observer.getDmObject() : null;
}

FM.MlExtension.prototype.getNode = function() {
    return this.observer ? this.observer.getNode() : null;
}

// static
FM.MlExtension.extensionTypes = {
    GLOBAL: {}
};

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
* Returns MlExtension <b>config</b> class function for <b>config</b> subclass type
* @static
* @function    
* @param {object} app Application
* @param {String} name Configuration name
* @return {object} extension configuration or null if not found
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

FM.MlExtension.newExtension = function(app,attrs,node,type) {
    var clsFn = FM.MlExtension.getConfiguration(app,type);
    return clsFn ? new clsFn(attrs,node) : null;
}
