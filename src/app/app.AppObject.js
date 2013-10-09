/**
* Basic application class. 
* 
* @class FM.AppObject
* @extends FM.LmObject
* @memberOf FM
* @param {Object} [opt] Options (application attributes).
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

FM.AppObject.prototype.run = function() {
    // err
    this.lastError = FM.DmObject.newObject(this,'GenericError', {});

    // registry
    this.appRegistry = new FM.UtRegistry();
    
    // start sys events
    var me = this;
    $(window).on('hashchange.'+this.getID(), function () {
        me.fireEvent("onUrlHashChange",FM.getAttr(window,'location.hash',''));
    });
}

FM.AppObject.prototype.dmListFactory = function(dmData,dmConfig,addlstnr,updChObj) {
    var lst = new FM.DmList(dmData,dmConfig,this);
    if(lst) {
        if(!FM.isset(addlstnr) || addlstnr != false) lst.addListener(this);
    }
    lst.setProperty('appFactory', {createdAt: new Date().getTime()});
    lst.setProperty('appFactory.updateChangedObjects',updChObj == true ? "true" : "false");
    return(lst);
}

FM.AppObject.prototype.dmListDispose = function(lst) {
    lst.dispose();
    return true;
}

FM.AppObject.prototype.mlInit = function(node) {
    return FM.MlHost.initChildNodes(this, node);
}

// create error object from string or return same object
FM.AppObject.prototype.getErrorObject = function(oErr) {
    oErr = FM.isset(oErr) && oErr ? oErr : '';
    
    if(FM.isString(oErr)) {
        oErr = FM.DmObject.newObject(this,'GenericError', {
            messageId: '9999',
            text: oErr
        });
    }
    
    return oErr;
}

FM.AppObject.prototype.getLastError = function() {
    return this.lastError;
}

FM.AppObject.prototype.setLastError = function(oErr) {
    if(!FM.isset(oErr) || !oErr || !FM.isObject(oErr)) {
        oErr = FM.DmObject.newObject(this,'GenericError', {});
    }
    var me = this;
    this.lastError.forEachAttr(function(attr,value) {
        me.lastError.setAttr(attr,oErr.getAttr(attr,''));
        return true;
    });
    this.lastError.setChanged(true,true); // send event
    return oErr;
}


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
    } else {
        callbackFn(false,null);
        return;        
    }
}

FM.AppObject.prototype.onSubmitForm = function(sender,evdata) {
    this.submitForm(
        sender,
        FM.getAttr(evdata,'object',null),
        FM.getAttr(evdata,'callback',null)
    );
}

// static
FM.AppObject.applicationInstances = {};

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

