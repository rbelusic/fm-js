/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */

/**
 * Generic ML Host class.
 * 
 *  
 * @class FM.MlHost
 * @memberOf FM
 * @extends FM.LmObject
 * @param {FM.AppObject} app application object.
 * @param {object} [attrs] DOM node attributes.
 * @param {DOMnode} node DOM node. 
 * List of DOM attributes (check inherited attributes too):
 * <table class="fm-mlattrs">
 *  <thead>
 *   <tr>
 *    <th>Name</th><th>description</th><th>Default</th>
 *   </tr>
 *  </thead>
 *  <tbody>
 *   <tr>
 *    <td>data-fmml-run-maximized</td>
 *    <td>Run host node full screen</td>
 *    <td>[false],true</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-error-host</td>
 *    <td>DOM node id of error host</td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-linked-host</td>
 *    <td>
 *      DOM node id of linked host. 
 *      Attributes of linked host DM object are apended to list of attributes 
 *      defined with <i>data-fmml-object-attr-&lt;attr name&gt;</i>
 *      when creating new host DM object    
 *    </td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-master-host</td>
 *    <td>
 *      DOM node id of master host. 
 *      Master host DM object will be used as this host DM object too.
 *      If value is <i>true</i> host from first parent DOM node will be used.
 *    </td>
 *    <td>[id],true</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-run-on-update</td>
 *    <td>
 *      DOM node id of the host to run on <i>onChange</> event. 
 *      Current host DM object is sent as argument.
 *    </td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-object-destroy-on-dispose</td>
 *    <td>
 *      If <i>true</i> host DM object will be disposed on host dispose.
 *    </td>
 *    <td>Depends of the way host DM object is obtained.</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-object-ref</td>
 *    <td>
 *      Evaluate content of attribute as host DM object. 
 *    </td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-object-class</td>
 *    <td>
 *      Restrict host DM object to one with given class. 
 *    </td>
 *    <td></td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-object-id</td>
 *    <td>
 *      if set to <i>true</i>, call fetch function with object containing all
 *      attributes defined with <i>data-fmml-object-attr-[attr]</i>, otherwise
 *      fetch DM object with given data ID and <i>data-fmml-object-class</i> class. 
 *      Function with name 'get[<i>data-fmml-object-class</i>] if one exists in host or application.      
 *    </td>
 *    <td></td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list</td>
 *    <td>
 *      DM object is first object in response returned from named DM list.
 *      <i>data-fmml-object-id</i> is sent as argument, or object with
 *      all <i>data-fmml-object-attr-&lt;attr name&gt;</i>atributes defined.      
 *    </td>
 *    <td></td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-object-attr-[attr]</td>
 *    <td>
 *      Define value of <i>attr<i> DM object attribute. If host can't obtain DM object
 *      from other sources, new one with defined attributes will be created.
 *    </td>
 *    <td></td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-run-on-init</td>
 *    <td>
 *      Run host after creation.
 *    </td>
 *    <td>[true], false</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-host-event-[event]</td>
 *    <td>
 *      Evaluate content of attribute on <i>event</i> event.
 *    </td>
 *    <td>@...</td>
 *   </tr>
 *  </tbody>
 * </table>
 */

FM.MlHost = FM.defineClass('MlHost', FM.LmObject);

// methods
FM.MlHost.prototype._init = function(app, attrs, node) {
    this._super("_init", app, attrs);
    this.objectSubClass = "Host";

    this.setNode(node);
    this.masterHost = null;

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

/**
 * Run host.
 * 
 * @public
 * @function
 * @param {FM.DmObject} [dmObj] Host DM object.
 */
FM.MlHost.prototype.run = function(dmObj) {
    this._super("run");

    if (this.getAttr('data-fmml-run-maximized', 'false') == 'true') {
        this.onMaximize();
    }

    // determine host dmobject
    this._selectDmObject(dmObj);

    // run all observers
    var obsrv = this.listOfObservers;
    for (var id in obsrv) {
        try {
            obsrv[id].run();
        } catch (e) {
            this.log(e, FM.logLevels.error, 'MlHost.run');
        }
    }
}

/**
 * Add new observer to host. Usualy there is no need to call this function manualy.
 * 
 * @param {FM.MlObserver} o Observer to add. 
 * If host is running observer will be started too.
 * @returns {Boolean}
 */
FM.MlHost.prototype.addObserver = function(o) {
    if (!FM.isset(o) || !o || !FM.isset(o.getID))
        return false;
    this.listOfObservers[o.getID()] = o;
    if (this.executed)
        o.run();
    this.updateObserver(o);
    return true;
}

/**
 * Remove observer from host. 
 * Usualy there is no need to call this function manualy.
 * 
 * @param {FM.MlObserver} o Observer to remove. 
 * @returns {Boolean}
 */
FM.MlHost.prototype.removeObserver = function(o) {
    if (!FM.isset(o) || !o || !FM.isset(o.getID))
        return false;

    var nlist = {};
    var objId = o.getID();
    if (!objId)
        return false;

    for (var id in this.listOfObservers) {
        if (objId != id)
            nlist[id] = this.listOfObservers[id];
    }

    this.listOfObservers = nlist;

    return true;
}

/**
 * Call update method of observer.
 * 
 * @param {FM.MlObserver} o Observer to update. 
 * @public     
 * @function 
 */
FM.MlHost.prototype.updateObserver = function(o) {
    if (this.executed && FM.isset(o.update) && FM.isFunction(o.update)) {
        try {
            o.update(this);
        } catch (e) {
            this.log(e, FM.logLevels.error, 'MlHost.updateObserver');
        }
    }

    // kraj
    return true;
}

/**
 * Call update method of all observer.
 * 
 * @param {FM.MlObserver} o Observer to update. 
 * @public     
 * @function 
 */
FM.MlHost.prototype.updateAllObservers = function() {
    for (var id in this.listOfObservers) {
        this.updateObserver(this.listOfObservers[id]);
    }


    // kraj
    return true;
}


/**
 * Validate all observers.
 * 
 * @param {boolean} [force=true] Validate observers even if value is empty.
 *  
 * @public     
 * @function 
 */
FM.MlHost.prototype.verifyAllObservers = function(force) {
    for (var id in this.listOfObservers) {
        if (!this.verifyObserver(this.listOfObservers[id], force))
            return false;
    }
    return true;
}

/**
 * Validate observer.
 * 
 * @param {FM.MlObserver} o Observer to validate. 
 * @public     
 * @function 
 */
FM.MlHost.prototype.verifyObserver = function(o, force) {
    return o.isValid(force);
}

/**
 * Send <i>ev</i> event to all observer.
 * 
 * @param {FM.Object} sender Source of event. 
 * @param {string} ev Event. 
 * @param {..} data Event data. 
 * @public     
 * @function 
 */
FM.MlHost.prototype.sendEventToObservers = function(sender, ev, data) {
    var fnd = false;
    for (var id in this.listOfObservers) {
        var o = this.listOfObservers[id];
        if (o.executed) {
            fnd = o.onHostEvent(sender, ev, data);
            //this.updateObserver(o);
        }
    }

    // kraj 
    return fnd;
}

/**
 * Dispose host.
 * 
 * @public
 * @function 
 */
FM.MlHost.prototype.dispose = function() {
    if (this.masterHost) {
        this.masterHost.removeListener(this);
    }
    this.app.removeListener(this);
    if (this.node)
        this.node.fmmlHost = null;
    var obsrv = this.listOfObservers;
    for (var id in obsrv) {
        try {
            obsrv[id].dispose();

        } catch (e) {
            this.log(e, FM.logLevels.error, 'MlHost.dispose');
        }
    }
    this.listOfObservers = [];
    this.setDmObject();
    this.executed = false;

    this._super("dispose");
    return true;
}

/**
 * 
 * @ignore
 */
FM.MlHost.prototype.setNode = function(n) {
    this.node = FM.isset(n) && n ? n : null;
}

/**
 * Returns host DOM node.
 * 
 * @returns {node}
 * 
 */
FM.MlHost.prototype.getNode = function() {
    return this.node;
}

/**
 * Set host DM object.
 * 
 * @param {FM.DmObject} o New host DM object. <i>onSetDmObject</i> event will be fired.
 * 
 */
FM.MlHost.prototype.setDmObject = function(o) {
    this._super('setDmObject', o, true);

    this.updateAllObservers();
    this.fireEvent("onSetDmObject", this.dmObject);
}


/**
 * Returns last eror. 
 * 
 * @returns {FM.DmGenericError} 
 */
FM.MlHost.prototype.getLastError = function(oErr) {
    var errhost = this._getErrorHost();
    return errhost ? errhost.getDmObject() : null;
}


/**
 * Set last eror. 
 * 
 * @param {FM.DmGenericError|string} oErr Error to set. 
 * 
 * @return {FM.DmGenericError} 
 */
FM.MlHost.prototype.setLastError = function(oErr) {
    var errhost = this._getErrorHost();
    if (!errhost) {
        return this.getApp() ? this.getApp().setLastError(oErr) : oErr;
    }
    oErr = FM.isset(oErr) && oErr ? oErr : "";

    if (!FM.isObject(oErr)) {
        if (FM.isString(oErr)) {
            oErr = new FM.DmGenericError({"messageId": "GE", "text": oErr});
        } else {
            oErr = new FM.DmGenericError();
        }
    }

    if (!errhost.isExecuted()) {
        errhost.run(oErr);
    } else {
        var dmobj = errhost.getDmObject();
        if (!dmobj) {
            errhost.setDmObject(oErr);
        } else {
            dmobj.forEachAttr(function(attr, value) {
                dmobj.setAttr(attr, oErr.getAttr(attr, null));
                return true;
            });
            dmobj.setChanged(true, true);
            oErr = dmobj;
        }
    }

    return oErr;
}

/**
 * 
 * @ignore
 */
FM.MlHost.prototype._getErrorHost = function() {
    var errnode = document.getElementById(this.getAttr('data-fmml-error-host', ''));
    return (
            errnode && FM.isset(errnode.fmmlHost) && errnode.fmmlHost ?
            errnode.fmmlHost : null
            );
}

/**
 * 
 * @ignore
 */
FM.MlHost.prototype._getHostByIdInAttr = function(attr) {
    var lhost = this.getAttr(attr, '');
    if (lhost != '') {
        var node = document.getElementById(lhost);
        if (node && FM.isset(node.fmmlHost) && node.fmmlHost) {
            return node.fmmlHost;
        }
    }
    return null;
}

/**
 * 
 * @ignore
 */
FM.MlHost.prototype.getLinkedHost = function() {
    return this._getHostByIdInAttr('data-fmml-linked-host', '');
}

/**
 * 
 * @ignore
 */
FM.MlHost.prototype.getMasterHost = function() {
    return this._getHostByIdInAttr('data-fmml-master-host', '');
}




/**
 * Fired when change on DM object attributes or properties ocurs.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {FM.Object} obj Changed DM object (usualy same as sender)
 */
FM.MlHost.prototype.onChange = function(sender, obj) {
    if (sender == this.getDmObject()) {
        this.updateAllObservers();

        var hostToRun = this.getAttr('data-fmml-run-on-update', '');
        if (hostToRun != '') {
            var node = document.getElementById(hostToRun);
            if (node && FM.isset(node.fmmlHost) && node.fmmlHost) {
                node.fmmlHost.run(this.getDmObject());
            }
        }
    }

    // kraj
    return true;
}


/**
 * Fired when on host DM object instance change.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {FM.DmObject} obj New DM object
 */
FM.MlHost.prototype.onSetDmObject = function(sender, obj) {
    if (sender == this.masterHost) {
        this.setDmObject(obj);
    }

    return true;
}

/**
 * Fired when host node is maximized.
 * 
 * @event
 * @param {FM.Object} sender Source of event.
 */
FM.MlHost.prototype.onMaximize = function(sender) {
    FM.expandToFullSCreen(this.node);

    // kraj
    return true;
}

/**
 * Main event processing method.
 * 
 * @function
 * @public
 * @param {FM.Object} sender Event source.
 * @param {string} ev Event type.
 * @param {...} data Event data.
 * @param {object} [calledlist] Reserved.
 */
FM.MlHost.prototype.onEvent = function(sender, ev, data, calledlist) {
    var cl = FM.isset(calledlist) ? calledlist : {};

    if (!this.isEnabled() || ev == "onEvent") {
        return false;
    }
    var done = false;

    //  ako imaš event fn
    if (FM.isset(this[ev])) {
        this[ev](sender, data);
        cl[this.getID()] = '1';
        FM.setAttr(cl, '_executed', '1');
        done = true;
    }

    //  ako imaš event fn u app
    if (!done && FM.isset(this.app[ev])) {
        this.app[ev](sender, data);
        cl[this.app.getID()] = '1';
        FM.setAttr(cl, '_executed', '1');
        done = true;
    }
    if (!done) {
        if (!this.sendEventToObservers(sender, ev, data)) {
            // proslijedi dalje ako nemas ev fn
            //cl = this.fireEvent(ev,data,cl);        
        }
        done = true;
    }

    // ako ima def trigger u layoutu
    var evtrg = this.getAttr('data-fmml-host-event-' + ev.toLowerCase(), '');
    if (evtrg !== '') {
        FM.resolveAttrValue(null, "-", evtrg, {
            A: this.getApp(),
            H: this,
            D: this.getDmObject()
        });
    }

    return cl;
}

/**
 * 
 * @ignore
 */
FM.MlHost.prototype._selectDmObject = function(dmObj) {
    this.setProperty('dmObjectCreated', this.getAttr("data-fmml-object-destroy-on-dispose", 'true'));

    // conf
    var objRef = this.getAttr("data-fmml-object-ref", '');
    var mhostid = this.getAttr('data-fmml-master-host', '');
    var id = this.getAttr("data-fmml-object-id", '');
    var className = this.getAttr("data-fmml-object-class", '');
    var dmconfName = this.getAttr('data-fmml-list', '');

    // fill attrs from node attr and linked host
    var dmAttrs = {};
    this.forEachAttr(function(n, v) {
        if (FM.startsWith(n, 'data-fmml-object-attr-')) {
            dmAttrs[n.substr(22)] = v;
        }
        return true;
    });
    var lhost = this.getLinkedHost();
    if (lhost) {
        var lhostObj = lhost.getDmObject();
        lhostObj.forEachAttr(function(pname, value) {
            dmAttrs[pname] = value;
            return true;
        });
    }

    // == object is sent (not null, same sc name as data-fmml-object-class or data-fmml-object-class is not defined) ==
    // disposing depends of data-fmml-object-destroy-on-dispose (def false)
    if (FM.isset(dmObj) && dmObj && dmObj.getSubClassName && (className == '' || dmObj.getSubClassName() == className)) {
        this.setProperty('dmObjectCreated', this.getAttr("data-fmml-object-destroy-on-dispose", 'false'));
        this.setDmObject(dmObj);
        return;
    }

    // == check ref param (data-fmml-object-ref, start with @) =================
    // disposing depends of data-fmml-object-destroy-on-dispose (def true)
    else if (objRef != '' && FM.startsWith(objRef, '@')) {
        this.setProperty('dmObjectCreated', this.getAttr("data-fmml-object-destroy-on-dispose", 'true'));
        dmObj = FM.resolveAttrValue(null, "-", objRef, {
            A: this.getApp(),
            H: this
        });
        this.setDmObject(dmObj ? dmObj : null);
        return;
    }

    // == master host (true - first parent host, or dom node id with host) =====
    // disposing depends of data-fmml-object-destroy-on-dispose (def false)
    if (mhostid != '') {
        if (mhostid == 'true') {
            this.masterHost = FM.findNodeWithAttr(this.getNode().parentNode, "fmmlHost");
        } else {
            this.masterHost = this.getMasterHost();
        }

        // if found, add listener & get dmobject
        if (this.masterHost) {
            this.masterHost.addListener(this);
            dmObj = this.masterHost.getDmObject();
            this.setDmObject(dmObj ? dmObj : null);
            this.setProperty('dmObjectCreated', this.getAttr("data-fmml-object-destroy-on-dispose", 'false'));
            return;
        }
    }

    // == get object by class & id =============================================

    // resolve class name & id
    id = id == 'true' ? id :
            FM.resolveAttrValue(null, "-", id, {
                A: this.getApp(),
                H: this,
                D: this.getDmObject()
            });

    className = FM.resolveAttrValue(null, "-", className, {
        A: this.getApp(),
        H: this,
        D: this.getDmObject()
    });

    // if class is defined  and id is not empty (real id or true) call getter  
    // in host or in app
    // if id == 'true' send obj with attrs to fn or id if it is not
    if (className != '' && id != '') {
        this.setProperty('dmObjectCreated', this.getAttr("data-fmml-object-destroy-on-dispose", 'true'));

        // call args                
        var fnName = 'get' + className;
        var args = id == 'true' ? dmAttrs : id;
        var me = this;
        var cbfn = function(isok, oObj) {
            if (isok) {
                me.setDmObject(oObj);
            }
            else {
                me.setDmObject(null);
            }
        };

        // check for and call get function (first in host, then in app, generic fn in app on end)    
        if (FM.isset(this[fnName])) {
            this[fnName](args, cbfn);
        } else if (this.getApp() && FM.isset(this.getApp()[fnName])) {
            this.getApp()[fnName](id, cbfn);
        } else if (this.getApp() && dmconfName != '') {
            this.getApp().getCustomObject(
                    dmconfName,
                    id == 'true' ? dmAttrs : {id: id},
            cbfn
                    );
        }
        return;
    }

    // create dmobject from defined attributes (def)
    var oObj = FM.DmObject.newObject(this.getApp(), className == '' ? 'Object' : className, dmAttrs);
    this.setProperty('dmObjectCreated', this.getAttr("data-fmml-object-destroy-on-dispose", 'true'));
    this.setDmObject(oObj);
}

/**
 * 
 * @ignore
 * 
 */
FM.MlHost.hostTypes = {};

/**
 * Returns MlHost <b>config</b> class function for <b>config</b> subclass type.
 * 
 * @static
 * @function    
 * @param {Object} app Application
 * @param {string} name Configuration name
 * @return {Object} host configuration or null if not found
 */
FM.MlHost.getConfiguration = function(app, name) {
    var list = FM.MlHost.hostTypes;

    app = FM.isset(app) && app ? app : null;
    var appCls = app ? app.getSubClassName() : null;
    var appCfg = appCls && FM.isset(list[appCls]) ? list[appCls] : null;

    var obj = null;
    if (appCfg && FM.isset(appCfg[name])) {
        obj = appCfg[name];
    } else if (app && FM.isArray(app.applicationObjectsSpace)) {
        FM.forEach(app.applicationObjectsSpace, function(i, ns) {
            if (FM.isset(list[ns]) && FM.isset(list[ns][name])) {
                obj = list[ns][name];
                return false;
            }
            return true;
        });
    }

    if (!obj && FM.isset(list['GLOBAL'][name])) {
        obj = list['GLOBAL'][name];
    }

    return obj;
}


/**
 * Returns new instance of chosen <b>sctype</b> host type.
 * 
 * @static
 * @public
 * @function    
 * @param {FM.AppObject} app Current application.
 * @param {object} attrs Host attributes.
 * @param {node} attrs Host node.
 * @param {String} type Host subclass type.
 * @param {FM.DmObject} [oObj=null] DM object to run host with.
 * 
 * @return {FM.MlHost} New host instance.
 */
FM.MlHost.newHost = function(app, attrs, node, type, oObj) {
    var clsFn = FM.MlHost.getConfiguration(app, type);
    var obj = clsFn ? new clsFn(app, attrs, node) : null;
    if (obj && obj.getAttr('data-fmml-run-on-init', 'true') != 'false') {
        obj.run(oObj);
    }
    return obj;
}

/**
 * Register application host type.
 *  
 * @param {string} type name.
 * @param {FM.MlHost} hostfn Host class function.
 * @param {string} [appCls='GLOBAL'] Application subclass type.
 * 
 * @returns {boolean}
 */
FM.MlHost.addHost = function(type, hostfn, appCls) {
    appCls = FM.isset(appCls) && FM.isString(appCls) && appCls != '' ? appCls : 'GLOBAL';
    if (!FM.isset(hostfn) || !FM.isFunction(hostfn))
        return false;
    if (!FM.isset(type) || !type || type == '')
        return false;
    if (!FM.isset(FM.MlHost.hostTypes[appCls])) {
        FM.MlHost.hostTypes[appCls] = {};
    }
    FM.MlHost.hostTypes[appCls][type] = hostfn;
    return true;
}

/**
 * Translate node body or attribute values. 
 * List of attributes to translate is readed from <i>data-fmml-translate</i> attributes.
 * Attribute names must be separated by comma. Use <i>_body</i> keyword to request dom node
 * content translation.
 * 
 * @function
 * @static
 * @param {FM.AppObject} app Current application.
 * @param {node} node Node to translate. 
 * 
 */
FM.MlHost.translateNode = function(app, node) {
    // what to translate
    var txtattrs = $(node).attr('data-fmml-translate');
    var attrs = txtattrs.split(",");
    var txttotranslate;
    FM.forEach(attrs, function(i, name) {
        name = FM.trim(name);
        if (name == 'body') {
            txttotranslate = $(node).text();
            if (FM.isset(txttotranslate)) {
                $(node).text(_T(txttotranslate, app));
            }
        } else {
            txttotranslate = $(node).attr(i);
            if (FM.isset(txttotranslate)) {
                $(node).attr(name, _T(txttotranslate, app));
            }
        }
        return true;
    });
}

/**
 * Init all DOM nodes with <i>fmml</i> attributes.
 * <i>@@</i> will be processed before creation od FM objects.
 * 
 * @static
 * @function
 * 
 * @param {FM.AppObject} app Current application. Note that all node attributes begining with.
 * @param {node} checknode Start node.
 * @param {FM.DmObject} [oObj=null] Contextual FM.DmObject. All templates will be applied with his data,
 * @param {boolean} [childsOnly=true] Process only child nodes.
 * List of DOM attributes (check inherited attributes too):
 * <table class="fm-mlattrs">
 *  <thead>
 *   <tr>
 *    <th>Name</th><th>description</th><th>Default</th>
 *   </tr>
 *  </thead>
 *  <tbody>
 *   <tr>
 *    <td>data-fmml-host</td>
 *    <td>Host type name to run host on this node</td>
 *    <td>Host</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-observer</td>
 *    <td>Observer type name to run on this node</td>
 *    <td>Observer</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-extensions</td>
 *    <td>Extension type names separated by space to run on this node. NOte that you can run more then one extension on single node (and Observer)</td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-template</td>
 *    <td>Template name to load,</td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-app</td>
 *    <td>Restrict access to DOM node to application with given subclass name,</td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-translate</td>
 *    <td>List of node attributes to translate separated by coma,</td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-run-on-init</td>
 *    <td>Run host automaticaly after creation,</td>
 *    <td>[true], false</td>
 *   </tr>
 *  </tbody>
 * </table>
 */
FM.MlHost.initChildNodes = function(app, checknode, oObj, childsOnly) {
    childsOnly = FM.isset(childsOnly) && childsOnly == false ? false : true;
    checknode = FM.isset(checknode) && checknode ? checknode : $('body')[0];
    var appsc = app.getSubClassName();
    var nodeList = childsOnly ? $(checknode).children() : $(checknode);

    nodeList.each(function(index) {
        var domobj = this;
        var jqobj = $(this);
        if (!jqobj)
            return;
        if (
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
            if (!mlAppCls && !app.strictApplicationObjectsSpace) {
                mlAppCls = app.getSubClassName();
            }
            if (mlAppCls == appsc) {
                // pokupi atribute 
                var attrlist = {};
                $.each(this.attributes, function(i, attrib) {
                    if (FM.isString(attrib.value) && FM.startsWith(attrib.value, '@@')) {
                        try {
                            attrlist[attrib.name] = FM.resolveAttrValue(null, "-", attrib.value, {
                                A: app,
                                D: oObj
                            });
                        } catch (e) {
                            FM.log(null, e, FM.logLevels.error, 'FM.MlHost.initChildNodes');
                        }
                    } else {
                        attrlist[attrib.name] = attrib.value;
                    }
                });


                // ako je observer
                if (jqobj.attr('data-fmml-observer')) {
                    try {
                        var obs = FM.MlObserver.newObserver(app, attrlist, domobj, jqobj.attr('data-fmml-observer'));
                        if (obs) {
                            if (obs.getHost()) {
                                obs.getHost().addObserver(obs);
                            }
                        }
                    } catch (e) {
                        FM.log(null, e, FM.logLevels.error, 'FM.MlHost.initChildNodes');
                    }
                    ;
                }

                // extenzije
                if (jqobj.attr('data-fmml-extensions')) { // ako je observer
                    var extarr = jqobj.attr('data-fmml-extensions').split(" ");
                    for (var i = 0; i < extarr.length; i++) {
                        var otype = extarr[i].toString();
                        try {
                            var oExt = FM.MlExtension.newExtension(app, attrlist, domobj, otype);
                            if (oExt && domobj.fmmlObserver)
                                domobj.fmmlObserver.addExtension(oExt);
                        } catch (e) {
                            FM.log(null, e, FM.logLevels.error, 'FM.MlHost.initChildNodes');
                        }
                        ;
                    }
                }

                // ako je host
                if (jqobj.attr('data-fmml-host')) {
                    try {
                        FM.MlHost.newHost(app, attrlist, domobj, jqobj.attr('data-fmml-host'), oObj);
                    } catch (e) {
                        FM.log(null, e, FM.logLevels.error, 'FM.MlHost.initChildNodes');
                    }
                }

                // ako je translation
                if (jqobj.attr('data-fmml-translate')) {
                    try {
                        FM.MlHost.translateNode(app, domobj);
                    } catch (e) {
                        FM.log(null, e, FM.logLevels.error, 'FM.MlHost.initChildNodes');
                    }
                }

                // ako je template                
                if (jqobj.attr('data-fmml-template')) { // begin
                    try {
                        FM.MlTemplate.newTemplate(app, attrlist, domobj, oObj);
                    } catch (e) {
                        FM.log(null, e, FM.logLevels.error, 'FM.MlHost.initChildNodes');
                    }
                }
                // end
            }
        }

        // napravi isto na child nodovima
        FM.MlHost.initChildNodes(app, this, oObj);
    });

    return true;
}

/**
 * Dispose all bindings on child nodes.
 *  
 * @static
 * @function
 * @param {node|string} checknode Node or node id to start from.
 * @param {boolean} [childsOnly=true] Process only child nodes.
 */
FM.MlHost.disposeChildNodes = function(checknode, childsOnly) {
    if (FM.isString(checknode)) {
        checknode = $('#' + checknode);
        checknode = checknode.length > 0 ? checknode[0] : null;
    }
    childsOnly = FM.isset(childsOnly) && childsOnly == false ? false : true;
    var nodes = $(checknode).find("[data-fmml-host],[data-fmml-template]");
    if (!childsOnly && $(checknode).is("[data-fmml-host],[data-fmml-template]")) {
        nodes = nodes.add(checknode);
    }

    nodes.each(function(i, n) {
        if (FM.isset(n.fmmlTemplate) && n.fmmlTemplate) {
            n.fmmlTemplate.dispose();
        }
        if (FM.isset(n.fmmlHost) && n.fmmlHost) {
            n.fmmlHost.dispose();
        }
    });
}

//
FM.MlHost.addHost("Host", FM.MlHost, "GLOBAL");
