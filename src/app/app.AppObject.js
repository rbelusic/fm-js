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

