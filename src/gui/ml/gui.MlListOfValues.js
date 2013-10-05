/**
 * ML list of values edit extensions class. 
 * 
 * @class FM.MlListOfValues
 * @extends FM.MlEdit
 * @param {object} [attrs] DOM node attributes
 * @param {DOMnode} node DOM node
 */
/*
 * data-fmml-update-condition   - update event blur def
 * data-fmml-list               - dm list conf
 * data-fmml-list-id-attr       - list attr which correspond to attr of observer
 * data-fmml-list-id            - menu id attr
 * data-fmml-list-text-attr     - menu text attr
 * data-fmml-list-def-selected  - menu def value
 * data-fmml-list-def-selected-attr -
 * data-fmml-list-allow-null    - add empty row in menu
 * data-fmml-list-depends-of    - list of host attributes to send
 */
FM.MlListOfValues = FM.defineClass('MlListOfValues', FM.MlEdit);

// methods
FM.MlListOfValues.prototype._init = function(attrs, node) {
    this._super("_init", attrs, node);
    this.objectSubClass = "ListOfValues";

    // LOV
    this.lastLovArguments = null;
    this.lovDependsOf = null;
    this.lovItemsTemplate = null;
    this.dmList = null;
}

FM.MlListOfValues.prototype.run = function(obs) {
    this._super("run", obs);

    // if dependsof attrs are not jet collected 
    var dependsOfStr = obs.getAttr('data-fmml-list-depends-of', '');
    this.lovDependsOf = dependsOfStr == '' ? [] : dependsOfStr.split(',');

    // create LOV
    var me = this;
    this.lovFetch(this.lovGetFetchArguments(), function(isok, list) {
        me.lovDisplay(isok, list);
    });
}

// methods
// fetch values for LOV from server
FM.MlListOfValues.prototype.lovFetch = function(args, callback) {

    // get observer
    var obs = this.getObserver();
    if (!obs) {
        return false;
    }

    // create dmlist
    args = FM.isset(args) && args && FM.isObject(args) ? args : {};
    callback = FM.isset(callback) && callback && FM.isFunction(callback) ? callback : function() {
    };
    var dmconfName = obs.getAttr('data-fmml-list', '');
    if (this.dmList) {
        this.dmList.dispose();
    }
    this.dmList = new FM.DmList(args, dmconfName, obs.getApp());
    this.lastLovArguments = args;

    // prepare listener
    var me = this;
    var lstnr = {
        /** @ignore */
        onListStart: function(sender, data) {
            me.log("Ajax call started", FM.logLevels.info, 'MlListOfValues.onListStart');
            $(me.getNode()).addClass("fmmlWaitState");
            return true;
        },
        /** @ignore */
        onListEnd: function(sender, data) {
            me.log("Ajax call completed", FM.logLevels.info, 'MlListOfValues.onListEnd');
            $(me.getNode()).removeClass("fmmlWaitState");
            me.dmList.removeListener(lstnr);
            callback(true, me.dmList);
            return true;
        },
        /** @ignore */
        onListError: function(sender, data) {
            me.log(data, FM.logLevels.error, 'MlListOfValues.onListError');
            $(me.getNode()).removeClass("fmmlWaitState");
            me.dmList.removeListener(lstnr);
            callback(false, null);
            return true;
        }
    };

    me.dmList.addListener(lstnr);
    me.dmList.getData();

    return true;
}

FM.MlListOfValues.prototype.lovEmpty = function() {
    $(this.editWidget ? this.editWidget : this.getNode()).empty();
    var lovDesc = this.getAttr(
        'data-fmml-lov-description', ''
        );
    if (lovDesc != '' && this.editWidget) {
        $(this.editWidget).append('<legend>' + lovDesc + '</legend>');
    }
}

FM.MlListOfValues.prototype.lovRenderItem = function(obj, issel, menuId, menuAttr, menuTempl, menuTemplName) {
    var itmText = '';
    var me = this;
    var domnode = this.editWidget ? this.editWidget : this.getNode();
    var attrs = obj ? obj.getAttr() : {};
    attrs['lovSelected'] = issel ? 'selected' : '';
    attrs['lovValue'] = FM.getAttr(attrs, menuId, '');
    attrs['lovDataID'] = obj ? obj.getDataID() : '';

    if (menuTemplName != '') {
        if (this.lovItemsTemplate == null) {
            FM.UtTemplate.getTemplate(
                this.getApp(), attrs, menuTemplName, function(isok, templ) {
                if (isok) {
                    me.lovItemsTemplate = templ;
                } else {
                    me.lovItemsTemplate = '';
                }
                itmText = $(FM.applyTemplate(
                    attrs, me.lovItemsTemplate, false, false
                    ));
                $(itmText).attr("data-fmml-object-id", FM.getAttr(attrs, 'lovDataID', ''));
                $(domnode).append(itmText);
            }
            );
            return;
        } else {
            itmText = FM.applyTemplate(attrs, this.lovItemsTemplate, false, false);
            itmText = $(itmText);
        }

    } else if (menuTempl != '') {
        itmText = FM.applyTemplate(attrs, this.menuTempl, false, false);
        itmText = $(itmText);
    } else {
        var nType = domnode.nodeName;

        if (nType == 'SELECT') {
            itmText =
                '<option  class="fmmlOption"' +
                (issel ? ' selected="selected"' : '') +
                ' value="' + FM.getAttr(attrs, menuId, '') + '">' +
                FM.getAttr(attrs, menuAttr, '') +
                '</option>'
                ;
            itmText = $(itmText);
        } else {
            var itmid = "fm_rg_" + this.getID();
            itmText =
                '<label for="' + itmid + '" class="fmmlRadioLabel">' +
                FM.getAttr(attrs, menuAttr, '') + '</label>' +
                '<input type="radio" name="' + itmid + '" id="' + itmid + '"' +
                (issel ? ' checked="checked"' : '') +
                ' value="' + FM.getAttr(attrs, menuId, '') + '"/><br />'
                ;
            itmText = $(itmText);
            itmText.bind(this.triggerEvent, function() {
                return me.widgetCb(this);
            });
        }
    }


    itmText.attr("data-fmml-object-id", obj.getDataID());

    $(domnode).append(itmText);
}

FM.MlListOfValues.prototype.lovDisplay = function(isok) {
    if (!this.isRendererEnabled() || !this.dmList) {
        return;
    }

    // clear list
    this.lovEmpty();

    // get observer & dmobject & obs attribute name
    var me = this;
    var obs = this.getObserver();

    // LOV def data-fmml-list-id-attr > data-fmml-attr-name ref!
    var menuId = obs.getAttr('data-fmml-list-id-attr', 'id');
    var menuAttr = obs.getAttr('data-fmml-list-text-attr', '');
    var menuTempl = obs.getAttr('data-fmml-list-text-template', '');
    var menuTemplName = obs.getAttr('data-fmml-list-text-template-name', '');
    var defSelValue = obs.getAttr('data-fmml-list-def-selected', '');
    if (FM.isFunction(window[defSelValue]))
        defSelValue = window[defSelValue](); // ref!
    var defSelAttr = obs.getAttr('data-fmml-list-def-selected-attr', '');
    var allowNulls = obs.getAttr('data-fmml-list-allow-null', 'false');

    // state
    var def = null, first = null, cur = null;
    var curVal = obs.getValue();

    // ok, display list
    if (isok) {
        // iterate list and find sel value
        this.dmList.forEachListElement(function(index, obj) {
            // def
            if (defSelAttr != '' && defSelValue != '') {
                if (obj.getAttr(defSelAttr, '') == defSelValue) {
                    def = obj;
                }
            }
            if (!first) {
                first = obj;
            }
            if (obj.getAttr(menuId, '') == curVal) {
                cur = obj;
            }
            return(true);
        });

        // find selected (current > def > first > none
        var lovSelected = cur ? cur : (def ? def : first);

        // null
        if (allowNulls == 'true') {
            this.lovRenderItem(null, false, "", "", menuTempl, menuTemplName);
        }

        // fill list
        this.dmList.forEachListElement(function(index, obj) {
            me.lovRenderItem(
                obj, obj == lovSelected,
                menuId, menuAttr,
                menuTempl, menuTemplName
                );
            return(true);
        });

        // check if dm value and lov value are the same
        this._runHost(true);
        if (lovSelected) {
            obs.setValue(lovSelected.getAttr(menuId, ''));
        }
    } else { // error
        this.lovRenderItem(null, false, "", "Error occured", menuTempl, menuTemplName);
    }
}

FM.MlListOfValues.prototype.render = function(value) {
    if (this.editWidget && this.editWidget.nodeName == 'FIELDSET') {
        $(this.editWidget).find("input:radio").val([value]);
    } else {
        this._super("render", value);
    }
}


FM.MlListOfValues.prototype.widgetCb = function(evnode) {
    if (!this.isRendererEnabled()) {
        return true;
    }

    this._super("widgetCb", evnode);

    // host to run
    this._runHost(true);
}

FM.MlListOfValues.prototype._runHost = function(doinit) {
    var hostToRun = this.getAttr("data-fmml-run-on-lov-change", '');
    if (hostToRun != '' && this.dmList) {
        var node = document.getElementById(hostToRun);
        if (node) {
            var menuId = this.getAttr('data-fmml-list-id-attr', 'id');
            var curVal = this.getObserver().getValue();
            var oObj = this.dmList.get(curVal, menuId);
            doinit = doinit == true;

            if (!FM.isset(node.fmmlHost) || !node.fmmlHost) {
                if (!doinit || !$(node).attr('data-fmml-host'))
                    return false;
                FM.MlHost.initChildNodes(this.getApp(), node, oObj, false);
                if (!FM.isset(node.fmmlHost) || !node.fmmlHost)
                    return false;
            }

            node.fmmlHost.run(oObj);
            return true;
        }
    }

    return false;
}

FM.MlListOfValues.prototype.lovGetFetchArguments = function() {
    var args = {};
    var obs = this.getObserver();
    var dmobj = obs.getDmObject();
    if (dmobj)
        for (var i = 0; i < this.lovDependsOf.length; i++) {
            args[this.lovDependsOf[i]] = dmobj.getAttr(this.lovDependsOf[i], '');
        }
    return args;
}


FM.MlListOfValues.prototype.lovCheckDepedOfChanged = function() {
    var obs = this.getObserver();
    var dmobj = obs.getDmObject();

    // menu is not filled yet
    if (!dmobj || this.lastLovArguments == null)
        return true;


    // check attributes
    var depchanged = false;
    for (var i = 0; i < this.lovDependsOf.length; i++) {
        if (
            FM.getAttr(this.lastLovArguments, this.lovDependsOf[i], '')
            !=
            dmobj.getAttr(this.lovDependsOf[i], '')
            ) {
            depchanged = true;
            break;
        }
    }

    // end
    return(depchanged);
}



FM.MlListOfValues.prototype.initWidget = function() {
    var domnode = this.getNode();
    var me = this;
    this.editWidget = null;
    var nType = domnode.nodeName;

    if (nType == 'SELECT') {
        this.lovDisplay(true, this.dmList);
        $(domnode).bind(this.triggerEvent, function() {
            return me.widgetCb(this);
        });
    } else {
        var edittype = this.getAttr(
            'data-fmml-attr-edittype',
            $(domnode).is(':radio') ? 'radio' : 'select'
            );
        if (edittype == 'select') {
            this.editWidget = $("<select class='fmmlValueInput'></select>")[0];
        } else if (edittype == 'radio') {
            this.editWidget =
                $("<fieldset class='fmmlFieldset fmmlValueGroup'></fieldset>")[0];
        } else {
            this.editWidget = $("<" + edittype + " class='fmmlValueInput'></" + edittype + ">")[0];
        }
        $(domnode).after(this.editWidget);
        if ($(domnode).is(':radio') || edittype == 'radio') {
            this.widgetShow();
        } else {
            $(domnode).bind("click.fmMlEdit", function() {
                return me.widgetShow();
            });
            $(this.editWidget).bind("blur.fmMlEdit", function() {
                return me.widgetHide();
            });
            this.widgetHide();
        }

        this.lovDisplay(true, this.dmList);
        if (edittype != 'radio') {
            $(this.editWidget).bind(this.triggerEvent, function() {
                return me.widgetCb(this);
            });
        }
    }
}

FM.MlListOfValues.prototype.dispose = function(obs) {
    this._super("dispose");
}

FM.MlListOfValues.prototype.update = function(obs) {
    this._super("update", obs);

    // if dep value are not changed
    if (!this.lovCheckDepedOfChanged()) {
        return true;
    }

    var me = this;
    this.lovFetch(this.lovGetFetchArguments(), function(isok, list) {
        me.lovDisplay(isok, list);
    });
}


// static
FM.MlExtension.addExtensionType('ListOfValues', FM.MlListOfValues);




