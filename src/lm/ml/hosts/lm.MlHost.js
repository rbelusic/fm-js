/**
* ML host class. 
* 
* @class FM.MlHost
* @memberOf FM
* @extends FM.Object
* @param {FM.AppObject} app application object
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
* 
* 
* data-fmml-run-maximized, data-fmml-object-class, data-fmml-object-id,
* data-fmml-object-ref, data-fmml-object-destroy-on-dispose,
* data-fmml-master-host, data-fmml-use-global-args,
* data-fmml-object-attr-*, data-fmml-linked-host,
* data-fmml-error-host, data-fmml-run-on-update,data-fmml-host-event-*
* data-fmml-run-on-init
* 
*/    
FM.MlHost = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.MlHost,FM.LmObject); 
FM.MlHost.className = "MlHost";

// methods
FM.MlHost.prototype._init = function(app,attrs,node) {
    this._super("_init",app,attrs);
    this.objectSubClass = "Host";
    this.node = node;    
    this.dmObject = null; 
    
    this.masterHost = null;
    this.masterHostDm = null;
    
    this.listOfObservers = {};
    
    this.clsParams = {
        id: '',
        className: ''
    }

    
    // two way binding
    this.node.fmmlHost = this;    
    this.getApp().addListener(this);
    this.addListener(this.getApp());
}

FM.MlHost.prototype.run = function(dmObj) {
    if(this.getAttr('data-fmml-run-maximized','false') == 'true') {
        this.onMaximize();
    }

    var id = this.getAttr("data-fmml-object-id",'');
    var className = this.getAttr("data-fmml-object-class",'');
    var objRef = this.getAttr("data-fmml-object-ref",'');
    this.setProperty('dmObjectCreated',this.getAttr("data-fmml-object-destroy-on-dispose",'true'));
    
    // object
    if(FM.isset(dmObj) && dmObj && (className == '' || dmObj.getSubClassName() == className)){
        this.setProperty('dmObjectCreated','false');
        this.setDmObject(dmObj);
    } else if(objRef != '' && FM.startsWith(objRef,'@')) {
        dmObj = FM.resolveAttrValue(null,"-",objRef,{
            A: this.getApp(),
            H: this
        });
        this.setProperty('dmObjectCreated','false');
        this.setDmObject(dmObj);
    } else {
        if(this.getAttr('data-fmml-master-host','') != '') {
            var mhostid = this.getAttr('data-fmml-master-host','');
            if(mhostid == 'true') {
                this.masterHost = FM.findNodeWithAttr(this.getNode().parentNode, "fmmlHost");
            } else {            
                var mhostnode = document.getElementById(mhostid);
                if(mhostnode && FM.isset(mhostnode.fmmlHost) && mhostnode.fmmlHost) {
                    this.masterHost = mhostnode.fmmlHost;
                }
            }
            if(this.masterHost) {
                this.masterHost.addListener(this);
                this.masterHostDm = this.masterHost.getDmObject();
                if(this.masterHostDm) this.masterHostDm.addListener(this);
            }
        }
        
        this._checkMasterReload();        
    }

    this._super("run");     
    this.executed = true;
    
    var obsrv = this.listOfObservers;
    for(var id in obsrv) {
        try {
            obsrv[id].run();            
        } catch(e) {
            console.log("run observer() error: " + e);
        }
    }
}


FM.MlHost.prototype._checkMasterReload = function() {
    //this.log("_checkMasterReload:" + this.getID(),FM.logLevels.warn);
    var id = this.getAttr("data-fmml-object-id",'');
    var className = this.getAttr("data-fmml-object-class",'');
    
    if(this.getAttr('data-fmml-use-global-args') == 'true'){
        var args = FM.getArgs();
        if(id == '') id = FM.getAttr(args,'id','');
        if(className == '') className = FM.getAttr(args,'cls','');        
    }
    
    //FM.resolveAttrValue = function(options,attrName,def,context)
    if(this.masterHost) {
        id = FM.resolveAttrValue(null,"-",id,{
            A: this.masterHost.getApp(),
            H: this.masterHost, 
            D: this.masterHostDm
        });
        className = FM.resolveAttrValue(null,"-",className,{
            A: this.masterHost.getApp(),
            H: this.masterHost, 
            D: this.masterHostDm
        });
    } else {
        id = FM.resolveAttrValue(null,"-",id,{
            A: this.getApp(),
            H: this, 
            D: this.getDmObject()
        });
        className = FM.resolveAttrValue(null,"-",className,{
            A: this.getApp(),
            H: this, 
            D: this.getDmObject()
        });
    }

    if(id == this.clsParams.id && className == this.clsParams.className) return;
    
    this.clsParams = {
        id: id,
        className: className
    }
    if(id != '') {
        var fnName = 'get' + className;
        if(id != '' && className != '' && FM.isset(this.app[fnName])) {
            var me = this;
            //this.log("_checkMasterReload fetch ...:" + this.getID(),FM.logLevels.warn);
            this.app[fnName](id,function(isok,oObj) {
                if(isok) {
                    //me.log("_checkMasterReload fetch ok:" + me.getID());
                    me.setDmObject(oObj);
                    me.setProperty('dmObjectCreated','true');
                }
                else {
                    me.setDmObject(null);
                }
            });
        }
    } else {
        if(className != '') {
            var attrs = {};
            this.forEachAttr(function(n,v) {
                if(FM.startsWith(n,'data-fmml-object-attr-')) {
                    attrs[n.substr(22)] = v;
                } 
            });
            var oObj = FM.DmObject.newObject(this.getApp(),className, attrs);
            this.setProperty('dmObjectCreated','true');
            this.setDmObject(oObj);
        }
    }
}

FM.MlHost.prototype.dispose = function() {
    if(this.masterHost) {
        this.masterHost.removeListener(this);
        if(this.masterHostDm) this.masterHostDm.removeListener(this);
    }
    
    this.app.removeListener(this);
    if(this.node) this.node.fmmlHost = null;
    var obsrv = this.listOfObservers;
    for(var id in obsrv) {
        try {
            obsrv[id].dispose();
            
        } catch(e) {
            console.log("dispose observer() error: " + e);
        }
    }
    this.listOfObservers = [];
    this.setDmObject();
    this.executed = false;
    
    this._super("dispose");
    return true;
}

FM.MlHost.prototype.getNode = function() {
    return this.node;
}

FM.MlHost.prototype.getDmObject = function() {
    return this.dmObject;
}


FM.MlHost.prototype.setDmObject = function(o) {
    this._super('setDmObject',o,true);

    this.updateAllObservers();    
    this.fireEvent("onSetDmObject",this.dmObject);
}


FM.MlHost.prototype.getLinkedHost = function() {
    var lhost = this.getAttr('data-fmml-linked-host','');
    if(lhost != '') {
        var node = document.getElementById(lhost);
        if( node && FM.isset(node.fmmlHost) && node.fmmlHost) {
            return node.fmmlHost;
        }
    }
    return null;
}

FM.MlHost.prototype.addObserver = function(o) {
    if(!FM.isset(o)  || !o || !FM.isset(o.getID)) return false;
    this.listOfObservers[o.getID()] = o;
    if(this.executed) o.run();
    this.updateObserver(o);
    return true;
}

FM.MlHost.prototype.removeObserver = function(o) {
    if(!FM.isset(o)  || !o || !FM.isset(o.getID)) return false;

    var nlist = {};
    var objId = o.getID();
    if(!objId) return false;

    for(var id in this.listOfObservers) {
        if(objId != id) nlist[id] = this.listOfObservers[id];
    }

    this.listOfObservers = nlist;

    return true;
}

/**
 * Call update of all observers
 * @public     
 * @function 
 */   

FM.MlHost.prototype.updateObserver = function(o) {
    if(this.executed && FM.isset(o.update) && FM.isFunction(o.update)) {
        try {
            o.update(this);
        } catch(e) {
            console.log("updateObservers() error: " + e);
        }
    }

    // kraj
    return true;
}

FM.MlHost.prototype.updateAllObservers = function() {
    for(var id in this.listOfObservers) {
        this.updateObserver(this.listOfObservers[id]);
    }


    // kraj
    return true;
}

FM.MlHost.prototype.verifyAllObservers = function(force) {
    for(var id in this.listOfObservers) {        
        if(!this.verifyObserver(this.listOfObservers[id],force))
            return false;
    }
    return true;
}

FM.MlHost.prototype.verifyObserver = function(o,force) {
    return o.isValid(force);
}

FM.MlHost.prototype.sendEventToObservers = function(sender,ev,data) {    
    var fnd=false;
    for(var id in this.listOfObservers) {
        var o = this.listOfObservers[id];
        if(o.executed) {
            fnd = o.onHostEvent(sender,ev,data);
        //this.updateObserver(o);
        }
    }

    // kraj 
    return fnd;
}

FM.MlHost.prototype._getErrorHost = function() {
    var errnode = document.getElementById(this.getAttr('data-fmml-error-host',''));
    return (
        errnode && FM.isset(errnode.fmmlHost) && errnode.fmmlHost ?
        errnode.fmmlHost : null
        );
}

FM.MlHost.prototype.getLastError = function(oErr) {
    var errhost = this._getErrorHost();
    return errhost ? errhost.getDmObject() : null;
}

FM.MlHost.prototype.setLastError = function(oErr) {
    var errhost = this._getErrorHost();
    if(!errhost) {
        return this.getApp() ? this.getApp().setLastError(oErr) : oErr;
    }
    
    
    if(!FM.isset(oErr) || !oErr || !FM.isObject(oErr)) {        
        oErr = new FM.DmGenericError();
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

// events
FM.MlHost.prototype.onChange = function(sender,obj) {
    if(sender == this.masterHostDm) {
        this._checkMasterReload();
    } else if(sender == this.getDmObject()) {
        this.updateAllObservers();
    }
    
    var hostToRun =  this.getAttr('data-fmml-run-on-update','');
    if(hostToRun != '') {
        var node = document.getElementById(hostToRun);
        if( node && FM.isset(node.fmmlHost) && node.fmmlHost) {
            node.fmmlHost.run(this.getDmObject());
        }
    }

    // kraj
    return true;
}



FM.MlHost.prototype.onSetDmObject = function(sender,obj) {
    this.log("onSetDmObject:" + this.getID() + " < " +  sender.getID(),FM.logLevels.warn);
    if(sender == this.masterHost) {
        if(this.masterHostDm) this.masterHostDm.removeListener(this);
        this.masterHostDm = obj;
        if(this.masterHostDm) this.masterHostDm.addListener(this);
        this._checkMasterReload();
    }
    
    return true;
}

FM.MlHost.prototype.onMaximize = function() {
    FM.expandToFullSCreen(this.node);
    
    // kraj
    return true;
}

FM.MlHost.prototype.onEvent = function(sender,ev,data,calledlist) {
    var cl = FM.isset(calledlist) ? calledlist : {};

    if(!this.isEnabled()) return false;
    
    var done = false;
    
    //  ako imaš event fn
    if(FM.isset(this[ev])) {
        this[ev](sender,data);
        cl[this.getID()] = '1';
        FM.setAttr(cl,'_executed','1'); 
        done = true;
    }

    //  ako imaš event fn u app
    if(!done && FM.isset(this.app[ev])) {
        this.app[ev](sender,data);
        cl[this.app.getID()] = '1';
        FM.setAttr(cl,'_executed','1'); 
        done = true;
    }
    if(!done) {
        if(!this.sendEventToObservers(sender,ev, data)) {
        // proslijedi dalje ako nemas ev fn
        //cl = this.fireEvent(ev,data,cl);        
        }
        done = true;
    }
    
    //console.log("ev:" + ev);
    
    // ako ima def trigger u layoutu
    var evtrg = this.getAttr('data-fmml-host-event-' + ev.toLowerCase(),'');
    if(evtrg !== '') {
        FM.resolveAttrValue(null,"-",evtrg,{
            A: this.getApp(),
            H: this, 
            D: this.getDmObject()
        });
    }
    
    return cl;
}

// static
FM.MlHost.hostTypes = {};

/**
 * Returns MlHost <b>config</b> class function for <b>config</b> subclass type
 * @static
 * @function    
 * @param {object} app Application
 * @param {String} name Configuration name
 * @return {object} host configuration or null if not found
 */   
FM.MlHost.getConfiguration = function(app,name) {
    var list = FM.MlHost.hostTypes;

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

FM.MlHost.newHost = function(app,attrs,node,type,oObj) {
    var clsFn = FM.MlHost.getConfiguration(app,type);
    var obj = clsFn ? new clsFn(app,attrs,node) : null;
    if(obj && obj.getAttr('data-fmml-run-on-init','true') != 'false') {
        obj.run(oObj); 
    }
    return obj;
}

FM.MlHost.addHost = function(type,hostfn,appCls) {
    appCls = FM.isset(appCls) && FM.isString(appCls) && appCls != '' ? appCls : 'GLOBAL';
    if(!FM.isset(hostfn) || !FM.isFunction(hostfn)) return false;
    if(!FM.isset(type) || !type || type == '') return false;
    if(!FM.isset(FM.MlHost.hostTypes[appCls])) {
        FM.MlHost.hostTypes[appCls]= {};
    }
    FM.MlHost.hostTypes[appCls][type] = hostfn;
    return true;
}

FM.MlHost.translateNode = function(app,node) {
    // what to translate
    var txtattrs = $(node).attr('data-fmml-translate');
    var attrs = txtattrs.split(",");
    var txttotranslate;
    FM.forEach(attrs, function(i,name) {
        name = FM.trim(name);
        if(name == 'body') {
            txttotranslate = $(node).text(); 
            if(FM.isset(txttotranslate)) {
                $(node).text(_T(txttotranslate,app));
                console.log("TRANSLATE(" + name + "):" + txttotranslate);
            }
        } else {
            txttotranslate = $(node).attr(i); 
            if(FM.isset(txttotranslate)) {
                $(node).attr(name,_T(txttotranslate,app));
                console.log("TRANSLATE(" + name + "):" + txttotranslate);
            }
        }
        return true;
    });
}
    
// radi update child nodova - promjena na dom nodu koji je nosioc
FM.MlHost.initChildNodes = function(app,checknode,oObj,childsOnly) {
    childsOnly = FM.isset(childsOnly) && childsOnly == false ? false : true;
    checknode = FM.isset(checknode) && checknode ? checknode : $('body')[0];
    var appsc = app.getSubClassName();
    var nodeList = childsOnly ? $(checknode).children() : $(checknode);    
    
    
    nodeList.each(function(index) {
        var domobj = this;        
        var jqobj = $(this);
        if(!jqobj) return;
        if(
            (!FM.isset(domobj.fmmlHost)) &&
            (!FM.isset(domobj.fmmlObserver)) &&                
            (
                jqobj.attr('data-fmml-host') || 
                jqobj.attr('data-fmml-observer') || 
                jqobj.attr('data-fmml-extensions') ||
                jqobj.attr('data-fmml-template') ||
                jqobj.attr('data-fmml-translate')
                )
            ) {
            var mlAppCls = jqobj.attr('data-fmml-app');
            if(!mlAppCls && !app.strictApplicationObjectsSpace) {
                mlAppCls = app.getSubClassName();
            }
            if(mlAppCls == appsc) {  
                // pokupi atribute 
                var attrlist = {};
                $.each(this.attributes, function(i, attrib){
                    if(FM.isString(attrib.value) && FM.startsWith(attrib.value,'@@')) { 
                        try {
                            attrlist[attrib.name] = FM.resolveAttrValue(null,"-",attrib.value,{
                                A: app,
                                D: oObj
                            });
                        } catch(e) {
                            console.log("resolveAttrValue error (" + attrib.value + "): " + e);
                        }
                    } else {
                        attrlist[attrib.name] = attrib.value;
                    }
                });
                
                
                // ako je observer
                if(jqobj.attr('data-fmml-observer')) { 
                    try {
                        FM.MlObserver.newObserver(app,attrlist,domobj,jqobj.attr('data-fmml-observer'));
                    } catch(e) {
                        console.log("new MlObserver(<" + otype + ">) error: " + e);
                    };
                }
                
                // extenzije
                if(jqobj.attr('data-fmml-extensions')) { // ako je observer
                    var extarr = jqobj.attr('data-fmml-extensions').split(" ");
                    for(var i = 0; i < extarr.length; i++) {
                        var otype = extarr[i].toString();
                        try {
                            var oExt = FM.MlExtension.newExtension(app,attrlist,domobj,otype);
                            if(oExt && domobj.fmmlObserver) domobj.fmmlObserver.addExtension(oExt);
                        } catch(e) {
                            console.log("new MlExtension(<" + otype + ">) error: " + e);
                        };
                    }
                }

                // ako je host
                if(jqobj.attr('data-fmml-host')) {
                    try {
                        FM.MlHost.newHost(app,attrlist,domobj,jqobj.attr('data-fmml-host'),oObj);
                    } catch(e) {
                        console.log("new MlHost(<" + jqobj.attr('data-fmml-host') + ">) error: " + e);
                    }                  
                } 

                // ako je translation
                if(jqobj.attr('data-fmml-translate')) {
                    try {
                        FM.MlHost.translateNode(app,domobj);
                    } catch(e) {
                        console.log("translateNode(<" + jqobj.attr('data-fmml-translate') + ">) error: " + e);
                    }                  
                } 

                // ako je template                
                if(jqobj.attr('data-fmml-template')) {
                    if(
                        FM.isset(jqobj.attr('data-fmml-use-global-args')) && 
                        jqobj.attr('data-fmml-use-global-args') == 'true'
                        ) {
                        var args = FM.getArgs();
                        FM.forEach(args, function(n,v) {
                            var attname = 'data-fmml-template-attr-' + n; 
                            if(!FM.isAttr(attrlist,attname)) {
                                if(FM.isString(v) && FM.startsWith(v,'@@')) {                                    
                                    v = FM.resolveAttrValue(null,"-",v,{
                                        A: app,
                                        D: oObj
                                    });
                                } else {
                                    attrlist[attname] = v;
                                }
                            }
                            return true;
                        });
                    }
                    var tname = jqobj.attr('data-fmml-template');
                    tname = FM.applyTemplate(FM.UtTemplate.getTemplateArgs(attrlist), tname, false, false);
                    FM.UtTemplate.getTemplate(app,attrlist,tname,function(isok,templ) {
                        if(isok) {
                            var tmplnode = $(templ);
                            if(jqobj.attr('data-fmml-template-replace') == "true") {
                                jqobj.replaceWith(tmplnode);
                                domobj = tmplnode;
                            } else {
                                jqobj.html(templ);
                            }
                            FM.MlHost.initChildNodes(app,domobj,oObj);                            
                        }
                    });
                
                }                 
            }            
        }
        
        // napravi isto na child nodovima
        FM.MlHost.initChildNodes(app,this,oObj);
    });
    
    return true;
}

// radi update child nodova - promjena na dom nodu koji je nosioc
FM.MlHost.disposeChildNodes = function(checknode,childsOnly) {
    if(FM.isString(checknode)) {
        checknode = $('#' + checknode);
        checknode = checknode.length > 0 ? checknode[0] : null;
    }    
    childsOnly = FM.isset(childsOnly) && childsOnly == false ? false : true;
    var nodes = $(checknode).find("[data-fmml-host]");
    if(!childsOnly && $(checknode).is("[data-fmml-host]")) {
        nodes = nodes.add(checknode);
    }
    
    nodes.each(function(i, n){
        if(FM.isset(n.fmmlHost) && n.fmmlHost) {
            n.fmmlHost.dispose();
        }        
    });  
}

//
FM.MlHost.addHost("Host",FM.MlHost,"GLOBAL");
