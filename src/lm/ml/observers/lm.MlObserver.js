/**
* Basic ML observer class. 
* 
* <table>
* <th>List of ML node attributes</th>
* <tr><td>data-fmml-attr-name</td><td>name of attribute</td></tr>
* <tr><td>data-fmml-attr-default-value</td><td>default value of attribute</td></tr>
* <tr><td>data-fmml-validation-rules</td><td>validation rules for observer</td></tr>
* <tr><td>data-fmml-validation-message</td><td>validation error message</td></tr>
* <tr><td>data-fmml-run-on-update</td><td>node id of host to run on update</td></tr>
* </table>
* 
* <table>
* <th>List of ML CSS classes</th>
* <tr><td>fmmlInvalidValue</td><td>attribute value is invalid</td></tr>
* </table>
* 
* @class FM.MlObserver
* @extends FM.LmObject
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/    
FM.MlObserver = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.MlObserver,FM.LmObject); 

// properties
FM.MlObserver.prototype.host = null;
FM.MlObserver.prototype.node = null;
FM.MlObserver.prototype.lastValue = null;
FM.MlObserver.prototype.extensions = [];
FM.MlObserver.prototype.errorObject = null;

// methods
FM.MlObserver.prototype._init = function(app,attrs,node) {
    this._super("_init",app,attrs);
    this.objectSubClass = "MlObserver";
    this.executed = false;
    this.node = node;
    this.node.fmmlObserver = this;
    this.lastValue = null;
    this.extensions = [];
    
    
    // find error host
    this.errorObject = this.getAttr('data-fmml-error-host','') != '' ?            
    new FM.DmGenericError({
        id: '',
        text: ''
    }) : 
    null
    ;
    this.getHost();
    if(this.host) this.host.addObserver(this);
}

FM.MlObserver.prototype.run = function() {
    //if(this.executed) this.dispose();
    this._super("run");

    var attrname = this.getAttr('data-fmml-attr-name','');
    var dmobj = this.getDmObject();

    for(var i = 0; i < this.extensions.length; i++) {
        try {
            this.runExtension(this.extensions[i]);
        } catch(err) {
            console.log("run extension error error: " + err);            
        }
    }
    this.executed = true;
    this.setNodeValue();
    return true;
}


FM.MlObserver.prototype.dispose = function() {
    var exts = FM.cloneObject(this.extensions);
    for(var i = 0; i < exts.length; i++) {
        var extObj = exts[i];
        if(FM.isset(extObj.dispose)) {
            extObj.dispose(this);
        }
    }
    this.extensions = [];
    
    if(this.node) {
        this.node.fmmlObserver = null;
    }
    if(this.host) {
        this.host.removeObserver(this);
    }
    
    if(this.errorObject) {
        this.errorObject.dispose();
        this.errorObject = null;
    }
        
    return this._super("dispose");
    this.executed = false;
}


FM.MlObserver.prototype._getErrorHost = function() {
    var errnode = document.getElementById(this.getAttr('data-fmml-error-host',''));
    return (
        errnode && FM.isset(errnode.fmmlHost) && errnode.fmmlHost ?
        errnode.fmmlHost : null
        );
}

FM.MlObserver.prototype.getLastError = function() {
    var errhost = this._getErrorHost();
    return errhost ? errhost.getDmObject() : null;
}

FM.MlObserver.prototype.setLastError = function(oErr) {
    var errhost = this._getErrorHost();
    if(!errhost) {
        return oErr;
    }
    
    if(!FM.isset(oErr) || !oErr || !FM.isObject(oErr)) {
        oErr = new FM.DmGenericError();
    }
    
    if(!errhost.isExecuted()) {
        errhost.run(oErr);
    } else {
        var dmobj = errhost.getDmObject();
        if(!dmobj) {
            errhost.setDmObject(oErr);
        } else {
            dmobj.forEachAttr(function(attr,value) {
                dmobj.setAttr(attr,oErr.getAttr(attr,null));
                return true;
            });   
            dmobj.setChanged(true,true);
            oErr = dmobj;
        }
    }    
    
    return oErr;
}

FM.MlObserver.prototype.isValid = function(force) {
    var rules = this.getAttr("data-fmml-validation-rules",''); 
    var response = true;
    
    if(rules != '') {        
        var value = this.node ? 
        (FM.isset(this.node.value) ? this.node.value : this.node.innerHTML) : ""
        ;
        force = FM.isset(force) ? force : false;

        if(force || value != "") {
            var allRules = rules != null && rules != '' ? rules.split(";") : [];

            for (var i = 0; i < allRules.length; i++) {
                var invert = false;
                var rule = allRules[i];
                var ruleArr = rule != null && rule != '' ? rule.split("=") : [];
                var ruleOperator = ruleArr.length > 0 ? ruleArr[0] : '';
                var ruleParamStr = ruleArr.length > 1 ? ruleArr[1] : '';
                var ruleParams = ruleParamStr.split(",");
                if(FM.endsWith(ruleOperator,"!")) {
                    ruleOperator = ruleOperator.substring(0,ruleOperator.length -1);
                    invert = true;
                }
                var v = true;
                var fn = FM.MlObserver.getValidationRule(this.getApp(), ruleOperator);
                
                if(fn) {
                    v = fn(this,ruleParams) == (invert ? false : true);
                }
                if(!v) {
                    response = false;
                    break;
                }
            }
        }
    }
    
    if(response){
        $(this.node).removeClass("fmmlInvalidValue");
        this.setLastError(new FM.DmGenericError({
            messageId: '',
            text: ''
        }));
    } else {
        $(this.node).addClass("fmmlInvalidValue"); 
        this.setLastError(new FM.DmGenericError({
            messageId: 'UIVALIDATION',
            text: this.getAttr('data-fmml-validation-message','Invalid value')
        }));
    }
    return response; //no rules
}

FM.MlObserver.prototype.update = function() {
    if(!this.executed) return false;
    
    // sync node with dmobject
    this.setNodeValue();
    
    // notify extensions
    for(var i = 0; i < this.extensions.length; i++) {
        var extObj = this.extensions[i];
        if(FM.isset(extObj.update)) {
            extObj.update(this);
        }
    }
    
    // check if obs is valid
    if(this.isValid()) {
        var hostToRun =  this.getAttr('data-fmml-run-on-update','');
        if(hostToRun != '') {
            var node = document.getElementById(hostToRun);
            if( node && FM.isset(node.fmmlHost) && node.fmmlHost) {
                node.fmmlHost.run(this.getDmObject());
            }
        }
        return true;
    }
    return false;
}

FM.MlObserver.prototype.setValue = function(value) {
    if(!this.executed) return false;
    
    // conf
    var attrname = this.getAttr('data-fmml-attr-name','');
    var host = this.getHost();  
    
    // value
    var dmobj = this.getDmObject();
    if(!dmobj) return false;
    
    // set
    
    dmobj.setAttr(attrname,value,true);
    
    // end
    return true;
}

FM.MlObserver.prototype.getValue = function() {
    // conf
    var attrname = this.getAttr('data-fmml-attr-name','');
    var defval = this.resolveAttrValue('data-fmml-attr-default-value','');
    if(!this.executed) return defval;
    
    // value
    var dmobj = this.getDmObject();
    if(!dmobj) return defval;
    
    // get
    return dmobj.getAttr(attrname,defval);
}


FM.MlObserver.prototype.getNodeValue = function() {
    var value = '';
    if(FM.isset(this.node.value)) {
        value = this.node.value;
    } else if(this.node.nodeName == 'IMG') {
        value = this.node.getAttribute("src");
    } else {
        value = this.node.innerHTML;
    }

    return value;
}

FM.MlObserver.prototype.setNodeValue = function() {
    // conf
    var attrname = this.getAttr('data-fmml-attr-name','');
    if(attrname == '') return;
    
    if(FM.startsWith(this.getAttr('data-fmml-attr-default-value',''),'@')) {
        var sss = 1;
    }
    var defval = this.resolveAttrValue('data-fmml-attr-default-value','');
    
    // value
    var dmobj = this.getDmObject();
    var value = 
    dmobj && attrname != '' ?
    dmobj.getAttr(attrname,'') :
    defval
    ;
    
    // not changed
    if(value == this.lastValue) {
        return;
    }
    
    // set
    this.lastValue = value;
    if(FM.isset(this.node.value)) {
        var selStart = this.node.selectionStart;
        var selEnd = this.node.selectionEnd;
        this.node.value = value;
        if(FM.isset(this.node.setSelectionRange)) {
            this.node.setSelectionRange(selStart, selEnd);
        }
    } else if(this.node.nodeName == 'IMG') {
        this.node.setAttribute("src",value);
    } else {
        this.node.innerHTML = value;
    }
    this.node.fmmlValueSync = value;
    
}

FM.MlObserver.prototype.addExtension = function(extObj) {
    this.extensions.push(extObj);
    if(this.executed) {
        extObj.run(this);
    }
    return true;
}

FM.MlObserver.prototype.removeExtension = function(extObj) {
    for(var i = 0; i < this.extensions.length; i++) {
        if(extObj == this.extensions[i]) {
            if(FM.isset(this.extensions[i].dispose)) {
                this.extensions[i].dispose(this);
            }
            delete this.extensions[i];
            return true;
        }
    }
    return false;
}

FM.MlObserver.prototype.runExtension = function(extObj) {
    if(FM.isset(extObj.run)) {
        extObj.run(this);
    }
}

FM.MlObserver.prototype.getNode = function() {
    return this.node;
}

FM.MlObserver.prototype.getDmObject = function() {
    return(this.getHost()  ? this.getHost().getDmObject(this.node) : null);
}

FM.MlObserver.prototype.getHost = function() {
    if(this.host) return(this.host);
    this.host = FM.MlObserver.findHost(this.node);
    return(this.host);
}

FM.MlObserver.prototype.onHostEvent = function(sender,ev,evdata) {
    if(FM.isset(this[ev])) {
        try {
            this[ev](sender,evdata);
            return true;
        } catch(e) {
            console.log("onHostEvent() error: " + e);
            return true;
        }        
    } else {
        var fnd = false;
        
        // notify extensions
        for(var i = 0; i < this.extensions.length; i++) {
            var extObj = this.extensions[i];
            if(FM.isset(extObj[ev])) {
                try {
                    extObj[ev](sender,evdata);
                } catch(e) {
                    console.log("onHostEvent-ext() error: " + e);             
                }
                fnd = true;
            }
        }
        return fnd;
    }
}


FM.MlObserver.prototype.resolveAttrValue = function(val,defv) {
    val = FM.resolveAttrValue(this.options,val,defv,{
        A: this.getApp(),
        H: this.getHost(),
        O: this,
        D: this.getDmObject()
    });

    return val;
}

// static
FM.MlObserver.className = "MlObserver";
FM.MlObserver.fullClassName = 'lm.MlObserver';

// pronadji u dom tree na dolje node koji ima fmmlDmObject - to je tvoj dm
// vrati null ako ne nadjes
FM.MlObserver.findHost = function(node) {
    return FM.findNodeWithAttr(node,"fmmlHost");
}


FM.MlObserver.observerTypes = {
    GLOBAL: {}
};


FM.MlObserver.addObserver = function(type,fn,appCls) {    
    appCls = FM.isset(appCls) && FM.isString(appCls) && appCls != '' ? appCls : 'GLOBAL';
    if(!FM.isset(fn) || !FM.isFunction(fn)) return false;
    if(!FM.isset(type) || !type || type == '') return false;
    if(!FM.isset(FM.MlObserver.observerTypes[appCls])) {
        FM.MlObserver.observerTypes[appCls]= {};
    }
    
    FM.MlObserver.observerTypes[appCls][type] = fn;
    return true;
}

/**
* Returns MlObserver <b>config</b> class function for <b>config</b> subclass type
* @static
* @function    
* @param {object} app Application
* @param {String} name Configuration name
* @return {object} observer configuration or null if not found
*/   
FM.MlObserver.getConfiguration = function(app,name) {
    var list = FM.MlObserver.observerTypes;

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

FM.MlObserver.newObserver = function(app,attrs,node,type) {
    var clsFn = FM.MlObserver.getConfiguration(app,type);
    return clsFn ? new clsFn(app,attrs,node) : null;
}

/**
 * 
 * @namespace
 */
FM.MlObserver.validationRules = {
    GLOBAL: {
        equal: function(observer, ruleParams,cbFn) {
            var value = observer.getValue();
            if(ruleParams.length < 1) return false;
        
            for(var i = 0; i < ruleParams.length; i++) {
                if(FM.startsWith(ruleParams[i],'#')) {
                    if(value != $(ruleParams[i]).val()) return false;
                } else {
                    try {
                        if(value != '' + eval(ruleParams[i])) {
                            return false;
                        }
                    } catch(e) {                            
                        return false;
                    }
                }
            }
        			
            return true;
        },
        gt: function(observer, ruleParams,cbFn) {
            var value = observer.getValue();
            if(ruleParams.length < 1) return false;
        
            for(var i = 0; i < ruleParams.length; i++) {
                if(FM.startsWith(ruleParams[i],'#')) {
                    if(value != $(ruleParams[i]).val()) return false;
                } else {
                    try {
                        if(parseFloat(value) > parseFloat(eval(ruleParams[i]))) {
                            return true;
                        }
                    } catch(e) {                            
                        return false;
                    }
                }
            }
        			
            return false;
        },
        lt: function(observer, ruleParams,cbFn) {
            var value = observer.getValue();
            if(ruleParams.length < 1) return false;
        
            for(var i = 0; i < ruleParams.length; i++) {
                if(FM.startsWith(ruleParams[i],'#')) {
                    if(value != $(ruleParams[i]).val()) return false;
                } else {
                    try {
                        if(parseFloat(value) < parseFloat(eval(ruleParams[i]))) {
                            return true;
                        }
                    } catch(e) {                            
                        return false;
                    }
                }
            }
        			
            return false;
        },
        empty: function(observer, ruleParams,cbFn) {
            var value = observer.getValue();
            if(value==null || value == '') {
                return true;
            }
            return false;
        },
        validEmail: function(observer, ruleParams,cbFn) {
            var value = observer.getValue();
            if(value==null || value == '') {
                return true;
            }
            
            // check if email address is valid
            return FM.validateEmail(value);
        }
    }
}

FM.MlObserver.getValidationRule = function(app,name) {
    var list = FM.MlObserver.validationRules;

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

FM.MlObserver.addValidationRule = function(name,fn,appCls) {  
    appCls = FM.isset(appCls) && FM.isString(appCls) && appCls != '' ? appCls : 'GLOBAL';
    if(!FM.isset(name) || !name || name == '') return false;
    if(!FM.isset(fn) || !FM.isFunction(fn)) return false;
    if(!FM.isset(FM.MlObserver.validationRules[appCls])) {
        FM.MlObserver.validationRules[appCls]= {};
    }
    FM.MlObserver.validationRules[appCls][name] = fn;
    return true;
}

