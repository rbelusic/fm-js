/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */
/**
 * Generic ML MlObserver class.  
 * 
 *  
 * @class FM.MlObserver
 * @memberOf FM
 * @extends FM.LmObject
 * @param {FM.AppObject} app application object.
 * @param {object} [attrs] DOM node attributes.
 * @param {node} node DOM node. 
 * List of DOM attributes (check inherited attributes too):
 * <table class="fm-mlattrs">
 *  <thead>
 *   <tr>
 *    <th>Name</th><th>description</th><th>Default</th>
 *   </tr>
 *  </thead>
 *  <tbody>
 *   <tr>
 *    <td>data-fmml-attr-name</td>
 *    <td>Host DM.Object attribute to observe.</td>
 *    <td>-</td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-attr-type</td>
 *    <td>Host DM.Object attribute type.</td>
 *    <td>[string], number, date</td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-attr-decimals</td>
 *    <td>Number of decimals to display. Applies only if attribute type is <i>number</i>.</td>
 *    <td></td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-date-format</td>
 *    <td>Date format of attribute value. Applies only if attribute type is <i>date</i>.</td>
 *    <td></td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-date-is-utc</td>
 *    <td>Attribute value representing date is UTC. Applies only if attribute type is <i>date</i>.</td>
 *    <td>[true], false</td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-attr-default-value</td>
 *    <td>Default attribute value.</td>
 *    <td>-</td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-date-display-as</td>
 *    <td>Display date in given format. Applies only if attribute type is <i>date</i>.</td>
 *    <td></td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-error-host</td>
 *    <td>DOM node id of error host</td>
 *    <td>-</td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-validation-rules</td>
 *    <td>
 *      Observer validation rules. Using FM macros (if rules starts with @) or JavaScript eval.
 *      Macro validation rules are separated by semicolon.
 *      Eval method must return <i>true</i> to consider observer value valid. Expression is evaluated
 *      in FM context: this.A (application), this.H (host), this.O (observer), this.D (DM object)
 *    </td>
 *    <td>-</td>
 *   </tr>  
 *   <tr>
 *    <td>data-fmml-validation-message</td>
 *    <td>
 *      Error message if validation fails.
 *    </td>
 *    <td>Invalid value.</td>
 *   </tr>
 *   <tr>
 *   <tr>
 *    <td>data-fmml-force-validation</td>
 *    <td>
 *      Validate observer even if attribute value is empty.
 *    </td>
 *    <td>[id],true</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-run-on-update</td>
 *    <td>
 *      DOM node id of the host to run on attribute update. 
 *      Current host DM object is sent as argument.
 *    </td>
 *    <td>-</td>
 *   </tr>
 *  </tbody>
 * </table>
 * 
 * @example 
    &lt;!-- example of HTML template --&gt;
    &lt;div data-fmml-host="Host"&gt;
        &lt;span 
            data-fmml-observer=&quot;Observer&quot; 
            data-fmml-attr-name=&quot;value&quot;
        &gt;&lt;/span&gt;
    &lt;/div&gt;
 */
FM.MlObserver = FM.defineClass('MlObserver', FM.LmObject);

// methods
FM.MlObserver.prototype._init = function(app, attrs, node) {
    this._super("_init", app, attrs);
    this.objectSubClass = "Observer";

    this.log(attrs, FM.logLevels.debug, 'MlObserver._init');

    this.node = node ? node : null;
    this.node.fmmlObserver = this;
    this.lastValue = null;

    this.extensions = [];
    this.renderers = {};
    this.currentRenderer = null;


    // find error host
    this.errorObject = this.getAttr('data-fmml-error-host', '') != '' ?
            new FM.DmGenericError({
                id: '',
                text: ''
            }) : null;

    this.log("New observer created.", FM.logLevels.debug, 'MlObserver._init');
}

/**
 * Run observer.
 * 
 * @public
 * @function
 */
FM.MlObserver.prototype.run = function() {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.run');

    this._super("run");

    this.log("Starting all registred extensions ...", FM.logLevels.debug, 'MlObserver.run');
    for (var i = 0; i < this.extensions.length; i++) {
        try {
            this.runExtension(this.extensions[i]);
        } catch (err) {
            this.log(err, FM.logLevels.error, 'MlObserver.run');
        }
    }
    this.log("Set DOM node value ...", FM.logLevels.debug, 'MlObserver.run');
    this.setNodeValue();

    this.log("New observer started.", FM.logLevels.debug, 'MlObserver.run');
    return true;
}


/**
 * Dispose observer.
 * 
 * @public
 * @function 
 */
FM.MlObserver.prototype.dispose = function() {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.dispose');

    this.log("Disposing all registred extensions ...", FM.logLevels.debug, 'MlObserver.dispose');
    var exts = FM.cloneObject(this.extensions);
    for (var i = 0; i < exts.length; i++) {
        var extObj = exts[i];
        if (FM.isset(extObj.dispose)) {
            try {
                extObj.dispose(this);
            } catch (err) {
                this.log(err, FM.logLevels.error, 'MlObserver.dispose');
            }
        }
    }
    this.extensions = [];

    this.log("Removing observer from DOM node ...", FM.logLevels.debug, 'MlObserver.dispose');
    if (this.node) {
        this.node.fmmlObserver = null;
    }

    this.log("Removing observer from host ...", FM.logLevels.debug, 'MlObserver.dispose');
    if (this.host) {
        this.host.removeObserver(this);
    }

    if (this.errorObject) {
        this.log("Disposing error object ...", FM.logLevels.debug, 'MlObserver.dispose');
        this.errorObject.dispose();
        this.errorObject = null;
    }

    return this._super("dispose");
    this.log("New observer disposed.", FM.logLevels.debug, 'MlObserver.dispose');
}


/**
 * Returns last eror. 
 * 
 * @returns {FM.DmGenericError} 
 */
FM.MlObserver.prototype.getLastError = function() {
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
FM.MlObserver.prototype.setLastError = function(oErr) {
    var errhost = this._getErrorHost();
    if (!errhost) {
        return this.getHost() ? this.getHost().setLastError(oErr) :
            (this.getApp() ? this.getApp().setLastError(oErr) : oErr)
        ;
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
 * Check if observer is valid.
 *  
 * @pulbic
 * @function
 * @param {boolean} [force=false] Validate even if value is null or empty string.
 * @returns {boolean}
 */
FM.MlObserver.prototype.isValid = function(force) {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.isValid');

    var rules = this.getAttr("data-fmml-validation-rules", '');
    var response = true;
    var value = this.getValue();

    if (rules != '') {
        force = FM.isset(force) ? force :
                (
                        this.getAttr('data-fmml-force-validation', 'false') == 'true' ?
                        true : false
                        );

        if (force || value != "") {
            // eval
            if (FM.startsWith(rules, "@")) {
                var value = FM.resolveAttrName({}, rules, false, {
                    A: this.getApp(),
                    H: this.getHost(),
                    O: this,
                    D: this.getDmObject()
                });
                return (value == true);
            }

            // predefined (old way)
            var allRules = rules != null && rules != '' ? rules.split(";") : [];

            for (var i = 0; i < allRules.length; i++) {
                var invert = false;
                var rule = allRules[i];
                var ruleArr = rule != null && rule != '' ? rule.split("=") : [];
                var ruleOperator = ruleArr.length > 0 ? ruleArr[0] : '';
                var ruleParamStr = ruleArr.length > 1 ? ruleArr[1] : '';
                var ruleParams = ruleParamStr.split(",");
                if (FM.endsWith(ruleOperator, "!")) {
                    ruleOperator = ruleOperator.substring(0, ruleOperator.length - 1);
                    invert = true;
                }
                var v = true;
                var fn = FM.MlObserver.getValidationRule(this.getApp(), ruleOperator);

                if (fn) {
                    v = fn(this, ruleParams) == (invert ? false : true);
                }
                if (!v) {
                    response = false;
                    break;
                }
            }
        }
    }

    if (response) {
        $(this.node).removeClass("fmmlInvalidValue");
        this.setLastError(new FM.DmGenericError({
            messageId: '',
            text: ''
        }));
    } else {
        $(this.node).addClass("fmmlInvalidValue");
        this.setLastError(new FM.DmGenericError({
            messageId: 'UIVALIDATION',
            text: this.getAttr('data-fmml-validation-message', 'Invalid value')
        }));
    }

    this.log(
            response ? "Observer is valid" : "Validation failed: " + ruleOperator,
            FM.logLevels.debug, 'MlObserver.isValid'
            );
    return response; //no rules
}

/**
 * Called by host to signal change of data model,
 *
 * @public
 * @function 
 *
 */
FM.MlObserver.prototype.update = function() {
    if (!this.isExecuted()) {
        return false;
    }
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.update');

    var dmObj = this.getDmObject();
    var dtstmp = dmObj ? dmObj.getProperty('timestamp', '0') : '0';

    if (
        dmObj && dmObj.isAttr(this.getAttr('data-fmml-attr-name','')) && 
        dtstmp != '0' && dtstmp == this.getProperty('updateTimestamp', '0')
    ) {
        this.log("Aborting, processed updateTimestamp.", FM.logLevels.debug, 'MlObserver.update');
        return false;
    }
    this.setProperty('updateTimestamp', dtstmp);

    // notify extensions
    this.log("Updating all extensions ...", FM.logLevels.debug, 'MlObserver.update');
    for (var i = 0; i < this.extensions.length; i++) {
        var extObj = this.extensions[i];
        if (FM.isset(extObj.update)) {
            try {
                extObj.update(this);
            } catch (err) {
                this.log(err, FM.logLevels.error, 'MlObserver.update');
            }
        }
    }

    // sync node with dmobject
    this.log("Set DOM node value ...", FM.logLevels.debug, 'MlObserver.update');
    this.setNodeValue();

    // check if obs is valid and run update host
    var retc = false;
    if (this.isValid()) {
        var hostToRun = this.getAttr('data-fmml-run-on-update', '');
        if (hostToRun != '') {
            this.log("Running [" + hostToRun + "] on update ...", FM.logLevels.debug, 'MlObserver.update');
            var node = document.getElementById(hostToRun);
            if (node && FM.isset(node.fmmlHost) && node.fmmlHost) {
                try {
                    node.fmmlHost.run(this.getDmObject());
                } catch (err) {
                    this.log(err, FM.logLevels.error, 'MlObserver.update');
                }
            } else {
                this.log("Host [" + hostToRun + "] not found", FM.logLevels.warn, 'MlObserver.update');
            }
        }
        retc = true;
    }

    this.log("Done.", FM.logLevels.debug, 'MlObserver.update');
    return retc;
}

/**
 * Set observer current value.
 * 
 * @public
 * @function
 * @param {...} value New value.
 */
FM.MlObserver.prototype.setValue = function(value) {
    if (!this.isExecuted()) {
        return false;
    }
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.setValue');

    // conf
    var attrname = this.getAttr('data-fmml-attr-name', '');
    var host = this.getHost();
    this.log("Set Observer attribute [" + attrname + "] to [" + value + "] ...", FM.logLevels.debug, 'MlObserver.setValue');

    // value
    var dmobj = this.getDmObject();
    if (!dmobj) {
        this.log("DmObject not found", FM.logLevels.warn, 'MlObserver.setValue');
        return false;
    }

    // set
    value = this._formatValue(value);
    dmobj.setAttr(attrname, value, true);

    // end
    this.log("Done.", FM.logLevels.debug, 'MlObserver.setValue');
    return true;
}

/**
 * Returns observer current value.
 * 
 * @public
 * @function
 * @returns {...}
 */
FM.MlObserver.prototype.getValue = function() {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.getValue');

    if (!this.isExecuted()) {
        this.log("Observer is not executed,returning undefined.", FM.logLevels.warn, 'MlObserver.getValue');
        return undefined;
    }


    // conf
    if(!this.isAttr('data-fmml-attr-name') && !this.isAttr('data-fmml-attr-default-value')) {
        this.log("Attribute name is not defined, returning undefined.", FM.logLevels.warn, 'MlObserver.getValue');
        return undefined;
    }
    
    var attrname = this.getAttr('data-fmml-attr-name', '');
    var defval = this.resolveAttrValue('data-fmml-attr-default-value', '');
    var dmobj = this.getDmObject();

    // value
    var value = FM.resolveAttrName(dmobj ? dmobj.options : {}, attrname, defval, {
        A: this.getApp(),
        H: this.getHost(),
        O: this,
        D: this.getDmObject()
    });


    // end
    this.log("Done.", FM.logLevels.debug, 'MlObserver.getValue');
    return value;
}

/**
 * 
 * @ignore
 */
FM.MlObserver.prototype._getErrorHost = function() {
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
FM.MlObserver.prototype._formatValue = function(value) {
    var attrtype = this.getAttr('data-fmml-attr-type', 'string');
    var decplaces = parseInt(this.getAttr('data-fmml-attr-decimals', '-1'));
    var dateIsUtc = this.getAttr('data-fmml-date-is-utc', 'true') != 'false';
    var dateFormat = this.getAttr('data-fmml-date-format',
            this.getApp().getAttr('fm_date_format', undefined))
            ;

// dates
    if (attrtype == "date") {
        var dateObj = null;
        if (FM.isObject(value) && FM.isset(value.getTime)) {
            dateObj = value;
        } else if (FM.isDateString(value)) {
            dateObj = FM.parseDateString(value, dateIsUtc);
        } else {
            dateObj = FM.parseLocalDateString(value);
        }

        if (dateObj) {
            value = FM.dateToString(dateObj, dateIsUtc, dateFormat);
        }
    } else if (attrtype == "number") {
        value = parseFloat(0.0 + value);
        if (decplaces > -1) {
            value = value.toFixed(decplaces);
        }
    }

    return value;
}

/**
 * 
 * @ignore
 */
FM.MlObserver.prototype._formatValueForRendering = function(value) {
    var attrtype = this.getAttr('data-fmml-attr-type', 'string');
    var dateIsUtc = this.getAttr('data-fmml-date-is-utc', 'true') != 'false';
    var dateFormat = this.getAttr(
            'data-fmml-date-display-as',
            this.getApp().getAttr('fm_date_display_as', undefined)
            );
    var decplaces = parseInt(this.getAttr('data-fmml-attr-decimals', '-1'));


// dates
    if (attrtype == "date") {
        var dateObj = null;

        if (FM.isDateString(value)) {
            dateObj = FM.parseDateString(value, dateIsUtc);
        } else {
            dateObj = FM.parseLocalDateString(value);
        }

        if (dateObj) {
            if (dateFormat == 'local') {
                value = FM.dateLocalFormat(dateObj);
            } else if (dateFormat == 'ago') {
                value = FM.strTimeBetween(dateObj, new Date());
            } else {
                value = FM.dateFormat(dateObj, dateFormat);
            }
        }
    } else if (attrtype == "number") {
        value = parseFloat(0.0 + value);
        if (decplaces > -1) {
            value = value.toFixed(decplaces);
        }
    }

    return value;
}

/**
 * Render observer value in DOM node using current renderer.
 * 
 * @param {boolean} force Render event of value is not changed.
 */
FM.MlObserver.prototype.setNodeValue = function(force) {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.setNodeValue');
    force = FM.isset(force) && force == true ? true : false;

    // get value
    var nfvalue = this.getValue();
    if(!FM.isset(nfvalue)) {
        this.log("Undefined value, aborting.", FM.logLevels.warn, 'MlObserver.setNodeValue');
        return;
    }
    
    // formating
    this.log("Formating value [" + nfvalue + "]...", FM.logLevels.debug, 'MlObserver.setNodeValue');
    var value = this._formatValueForRendering(nfvalue);

    this.log("Formated value is [" + value + "].", FM.logLevels.debug, 'MlObserver.setNodeValue');

    // not changed
    if (!force && value == this.lastValue) {
        this.log("Aborting, formated value is not changed.", FM.logLevels.debug, 'MlObserver.setNodeValue');
        return;
    }

    // remember
    this.lastValue = value;

    // render
    this.log("Rendering value ...", FM.logLevels.debug, 'MlObserver.setNodeValue');
    if (this.getCurrentRenderer()) {
        this.getCurrentRenderer().render(value);
        return;
    }

    // def render
    var doSelection = false;
    try {
        doSelection = this.node.selectionStart ? true : false;
    } catch (e) {

    }
    var selStart = 0, selEnd = 0;
    if (doSelection) {
        selStart = this.node.selectionStart;
        selEnd = this.node.selectionEnd;
    }

    if (this.node.nodeName == 'INPUT' || this.node.nodeName == 'TEXTAREA') {
        if ($(this.node).is(':checkbox')) {
            if (value && value != '' && value.toLowerCase() != 'false') {
                $(this.node).attr('checked', 'checked');
            } else {
                $(this.node).removeAttr('checked');
            }
        } else if ($(this.node).is(':radio')) {
            $("input:radio[name ='" + $(this.node).attr("name") + "']").val([value]);
        } else {
            $(this.node).val(value);
        }
    } else if (this.node.nodeName == 'IMG') {
        $(this.node).attr("src", value);
    } else if (this.node.nodeName == 'A') {
        $(this.node).attr("href", value);
    } else if (FM.isset(this.node.value)) {
        $(this.node).val(value);
    } else {
        $(this.node).html(value);
    }

    // selection range restore
    if (doSelection) {
        this.node.setSelectionRange(selStart, selEnd);
    }

    //end
    this.log("Done.", FM.logLevels.debug, 'MlObserver.setNodeValue');
}

/**
 * Add extension.
 * 
 * @public
 * @function
 * @param {FM.MlExtension} extObj Extension to add. Usualy there is no need to call this function manualy.
 */
FM.MlObserver.prototype.addExtension = function(extObj) {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.addExtension');
    this.log("Adding extension:", FM.logLevels.debug, 'MlObserver.addExtension');
    this.log(extObj, FM.logLevels.debug, 'MlObserver.addExtension');

    this.extensions.push(extObj);
    if (this.isExecuted()) {
        this.log("Running added extension ...", FM.logLevels.debug, 'MlObserver.addExtension');
        try {
            this.runExtension(extObj);
        } catch (err) {
            this.log(err, FM.logLevels.error, 'MlObserver.addExtension');
        }
    }
    this.log("Done.", FM.logLevels.debug, 'MlObserver.addExtension');
    return true;
}

/**
 * Remove extension.
 * 
 * @public
 * @function
 * @param {FM.MlExtension} extObj Extension to remove. Usualy there is no need to call this function manualy.
 */
FM.MlObserver.prototype.removeExtension = function(extObj) {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.removeExtension');
    this.log("Removing extension:", FM.logLevels.debug, 'MlObserver.removeExtension');
    this.log(extObj, FM.logLevels.debug, 'MlObserver.removeExtension');

    for (var i = 0; i < this.extensions.length; i++) {
        if (extObj == this.extensions[i]) {
            if (FM.isset(this.extensions[i].dispose)) {
                this.extensions[i].dispose(this);
            }
            delete this.extensions[i];
            this.log("Done.", FM.logLevels.debug, 'MlObserver.removeExtension');
            return true;
        }
    }
    this.log("Not found.", FM.logLevels.warn, 'MlObserver.removeExtension');
    return false;
}

/**
 * Run extension. Usualy there is no need to call this function manualy.
 * 
 * @public
 * @function
 * @param {FM.MlExtension} extObj Extension to run.
 */
FM.MlObserver.prototype.runExtension = function(extObj) {
    if (FM.isset(extObj.run)) {
        extObj.run(this);
    }
}

/**
 * Returns observer DOM node.
 * 
 * @public
 * @function
 * @returns {node}
 */
FM.MlObserver.prototype.getNode = function() {
    return this.node;
}

/**
 * Returns current observer DM object.
 * 
 * @public
 * @function
 * @returns {FM.DmObject}
 */
FM.MlObserver.prototype.getDmObject = function() {
    return(this.getHost() ? this.getHost().getDmObject(this.node) : null);
}

/**
 * Returns host this observer belongs to.
 * 
 * @public
 * @function
 * @returns {FM.MlHost}
 */
FM.MlObserver.prototype.getHost = function() {
    if (this.host)
        return(this.host);
    this.host = FM.MlObserver.findHost(this.node);
    return(this.host);
}

/**
 * 
 * @ignore
 */
FM.MlObserver.prototype.onHostEvent = function(sender, ev, evdata) {
    this.log(this.getNode(), FM.logLevels.debug, 'MlObserver.onHostEvent');
    this.log("Event:" + ev, FM.logLevels.debug, 'MlObserver.onHostEvent');
    this.log("Event data:", FM.logLevels.debug, 'MlObserver.onHostEvent');
    this.log(evdata, FM.logLevels.debug, 'MlObserver.onHostEvent');

    var fnd = false;
    if (FM.isset(this[ev])) {
        fnd = true;
        try {
            this.log("Event is found, executing ...", FM.logLevels.debug, 'MlObserver.onHostEvent');
            this[ev](sender, evdata);
        } catch (e) {
            this.log(err, FM.logLevels.error, 'MlObserver.onHostEvent');
        }
    } else {
        this.log("Event is not found, checking extensions ...", FM.logLevels.debug, 'MlObserver.onHostEvent');

        // notify extensions
        for (var i = 0; i < this.extensions.length; i++) {
            var extObj = this.extensions[i];
            if (FM.isset(extObj[ev])) {
                try {
                    this.log("Executing event in extension:", FM.logLevels.debug, 'MlObserver.onHostEvent');
                    this.log(extObj, FM.logLevels.debug, 'MlObserver.onHostEvent');
                    extObj[ev](sender, evdata);
                } catch (e) {
                    this.log(e, FM.logLevels.error, 'MlObserver.onHostEvent');
                }
                fnd = true;
            }
        }
    }

    this.log("Done.", FM.logLevels.debug, 'MlObserver.onHostEvent');
    return fnd;
}

/**
 * 
 * @ignore
 */
FM.MlObserver.prototype.resolveAttrValue = function(val, defv) {
    val = FM.resolveAttrValue(this.options, val, defv, {
        A: this.getApp(),
        H: this.getHost(),
        O: this,
        D: this.getDmObject()
    });

    return val;
}


/**
 * Returns current renderer.
 * 
 * @public
 * @function
 * @returns {FM.MlExtension}
 */
FM.MlObserver.prototype.getCurrentRenderer = function() {
    return this.currentRenderer;
}

/**
 * 
 * @ignore
 */
FM.MlObserver.prototype._checkCurrentRenderer = function() {
    for (var i = this.extensions.length - 1; i > -1; i--) {
        var ext = this.extensions[i];
        if (FM.isset(this.renderers[ext.getID()] && this.renderers[ext.getID()])) {
            this.currentRenderer = ext;
            return this.currentRenderer;
        }
    }

    return this.currentRenderer;
}

/**
 * Add extension to list of available renderers. 
 * Last registered extension is active renderer.
 
 * @public 
 * @function
 * @param {FM.MlExtension} renderer Renderer to add.
 */
FM.MlObserver.prototype.addRenderer = function(r) {
    if (!r)
        return;

    var curr = this.getCurrentRenderer();
    this.renderers[r.getID()] = r;
    var newr = this._checkCurrentRenderer();
    if (curr != newr) {
        if (curr)
            curr.disableRenderer();
        if (newr)
            newr.enableRenderer();
    }
}

/**
 * Remove extension from list of available renderers.
 
 * @public 
 * @function
 * @param {FM.MlExtension} renderer Renderer to remove.
 */
FM.MlObserver.prototype.removeRenderer = function(r) {
    if (!r)
        return;

    var curr = this.getCurrentRenderer();
    if (FM.isset(this.renderers[r.getID()])) {
        this.renderers[r.getID()] = null;
    }
    var newr = this._checkCurrentRenderer();
    if (curr != newr) {
        if (curr)
            curr.disableRenderer();
        if (newr)
            newr.enableRenderer();
    }
}


/**
 * Search for first child node with FM.MlHost instance.
 * 
 * @public
 * @static
 * @function
 * @param {node} node DOM node to start searching from.
 * @returns {FM.MlHost|null}
 */
FM.MlObserver.findHost = function(node) {
    return FM.findNodeWithAttr(node, "fmmlHost");
}


/**
 * 
 * @ignore
 */
FM.MlObserver.observerTypes = {
    GLOBAL: {}
};


/**
 * Register application observer type.
 *  
 * @public
 * @static
 * @function
 * @param {string} type name.
 * @param {FM.MlHost} fn Observer class function.
 * @param {string} [appCls='GLOBAL'] Application subclass type.
 * 
 * @returns {boolean}
 */
FM.MlObserver.addObserver = function(type, fn, appCls) {
    appCls = FM.isset(appCls) && FM.isString(appCls) && appCls != '' ? appCls : 'GLOBAL';
    if (!FM.isset(fn) || !FM.isFunction(fn))
        return false;
    if (!FM.isset(type) || !type || type == '')
        return false;
    if (!FM.isset(FM.MlObserver.observerTypes[appCls])) {
        FM.MlObserver.observerTypes[appCls] = {};
    }

    FM.MlObserver.observerTypes[appCls][type] = fn;
    return true;
}

/**
 * Returns MlObserver <b>config</b> class function for <b>config</b> subclass type.
 * 
 * @public
 * @static
 * @function    
 * @param {FM.AppObject} app Current application.
 * @param {String} type Observer subclass type.
 * @return {FM.MlObserver} Class function. 
 */
FM.MlObserver.getConfiguration = function(app, name) {
    var list = FM.MlObserver.observerTypes;

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
 * Returns new instance of chosen <b>sctype</b> observer type.
 
 * @static
 * @public
 * @function    
 * @param {FM.AppObject} app Current application.
 * @param {object} attrs Observer attributes.
 * @param {node} node Observer node.
 * @param {String} type Observer subclass type.
 * 
 * @return {FM.MlObserver} New observer instance.
 */
FM.MlObserver.newObserver = function(app, attrs, node, type) {
    var clsFn = FM.MlObserver.getConfiguration(app, type);
    return clsFn ? new clsFn(app, attrs, node) : null;
}

FM.MlObserver.addObserver("Observer", FM.MlObserver, 'GLOBAL');

/**
 * Validation rules. 
 * 
 * @namespace
 */
FM.MlObserver.validationRules = {
    /**
     * Global validation rules. Available to all applications.
     * 
     * @namespace
     */
    GLOBAL: {
        /**
         * Equal validation rule.
         * Example: 
         *  
         * @param {FM.MlObserver} observer Observer.
         * @param {array} ruleParams Rule parameters.
         * 
         * @returns {boolean}
         */
        equal: function(observer, ruleParams, cbFn) {
            var value = observer.getValue();
            if (ruleParams.length < 1)
                return false;

            for (var i = 0; i < ruleParams.length; i++) {
                if (FM.startsWith(ruleParams[i], '#')) {
                    if (value != $(ruleParams[i]).val())
                        return false;
                } else {
                    try {
                        if (value != '' + eval(ruleParams[i])) {
                            return false;
                        }
                    } catch (e) {
                        return false;
                    }
                }
            }

            return true;
        },
        /**
         * Greather then validation rule.
         * Example: 
         *  
         * @param {FM.MlObserver} observer Observer.
         * @param {array} ruleParams Rule parameters.
         * 
         * @returns {boolean}
         */
        gt: function(observer, ruleParams, cbFn) {
            var value = observer.getValue();
            if (ruleParams.length < 1)
                return false;

            for (var i = 0; i < ruleParams.length; i++) {
                if (FM.startsWith(ruleParams[i], '#')) {
                    if (value != $(ruleParams[i]).val())
                        return false;
                } else {
                    try {
                        if (parseFloat(value) > parseFloat(eval(ruleParams[i]))) {
                            return true;
                        }
                    } catch (e) {
                        return false;
                    }
                }
            }

            return false;
        },
        /**
         * Less then rule.
         * Example: 
         *  
         * @param {FM.MlObserver} observer Observer.
         * @param {array} ruleParams Rule parameters.
         * 
         * @returns {boolean}
         */
        lt: function(observer, ruleParams, cbFn) {
            var value = observer.getValue();
            if (ruleParams.length < 1)
                return false;

            for (var i = 0; i < ruleParams.length; i++) {
                if (FM.startsWith(ruleParams[i], '#')) {
                    if (value != $(ruleParams[i]).val())
                        return false;
                } else {
                    try {
                        if (parseFloat(value) < parseFloat(eval(ruleParams[i]))) {
                            return true;
                        }
                    } catch (e) {
                        return false;
                    }
                }
            }

            return false;
        },
        /**
         * Empty validation rule.
         * Example: 
         *  
         * @param {FM.MlObserver} observer Observer.
         * @param {array} ruleParams Rule parameters.
         * 
         * @returns {boolean}
         */
        empty: function(observer, ruleParams, cbFn) {
            var value = observer.getValue();
            if (value == null || value == '') {
                return true;
            }
            return false;
        },
        /**
         * validEmail validation rule.
         * Example: 
         *  
         * @param {FM.MlObserver} observer Observer.
         * @param {array} ruleParams Rule parameters.
         * 
         * @returns {boolean}
         */
        validEmail: function(observer, ruleParams, cbFn) {
            var value = observer.getValue();
            if (value == null || value == '') {
                return true;
            }

            // check if email address is valid
            return FM.validateEmail(value);
        }
    }
}

/**
 * Returns requested validation rule function.
 * 
 * @public
 * @static
 * @param {type} app Current application.
 * @param {type} name Validation rule name.
 * @returns {function} 
 */
FM.MlObserver.getValidationRule = function(app, name) {
    var list = FM.MlObserver.validationRules;

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
 * Register new validation rule.
 * 
 * @public
 * @static
 * @param {string} name Validation rule name.
 * @param {function} fn Validation rule function. 
 * Function receives two arguments (observer instance and array of rule parameters)
 *  and returns <i>true</i> or <i>false</i>.
 * @param {string} [appCls='GLOBAL'] Application subclass type.
 */
FM.MlObserver.addValidationRule = function(name, fn, appCls) {
    appCls = FM.isset(appCls) && FM.isString(appCls) && appCls != '' ? appCls : 'GLOBAL';
    if (!FM.isset(name) || !name || name == '')
        return false;
    if (!FM.isset(fn) || !FM.isFunction(fn))
        return false;
    if (!FM.isset(FM.MlObserver.validationRules[appCls])) {
        FM.MlObserver.validationRules[appCls] = {};
    }
    FM.MlObserver.validationRules[appCls][name] = fn;
    return true;
}

