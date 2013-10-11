/**
 * Templates factory class. 
 * 
 * @class FM.UtTemplate
 * @extends FM.Object
 * @param {object} opt Options
 */
FM.UtTemplate = FM.defineClass('UtTemplate', FM.Object);
FM.UtTemplate.loadedTemplates = {};

FM.UtTemplate.prototype._init = function(attrs) {
    this._super("_init", attrs);
    this.objectSubClass = "Template";
}

FM.UtTemplate.getTemplateArgs = function(attrlist) {
    var params = {};
    FM.forEach(attrlist, function(i, v) {
        if (FM.startsWith(i, "data-fmml-template-attr-")) {
            params[i.substring(24)] = v;
        }
        return true;
    });

    return params;
}

FM.UtTemplate.getTemplate = function(app, attrlist, tname, cbfn) {
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {
    };
    attrlist = FM.isset(attrlist) && attrlist && FM.isObject(attrlist) ? attrlist : {};
    var params = FM.UtTemplate.getTemplateArgs(attrlist);

    FM.UtTemplate.fetchTemplate(app, tname, function(isok, templ) {
        if (isok) {
            callbackFn(true, FM.applyTemplate(params, templ, false, false));
        } else {
            callbackFn(false, templ);
        }
    });
}

FM.UtTemplate.getLoadedTemplate = function(app, name) {
    var list = FM.UtTemplate.loadedTemplates;

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

    // check in DOM
    if (!obj) {
        var templNode = $("[data-fmml-template-def='" + name + "']");
        if (templNode.length > 0) {
            obj= $(templNode[0]).html();
        }
    }

    return obj;
}

FM.UtTemplate.addTemplate = function(tname, tdata, appCls) {
    appCls = FM.isset(appCls) && FM.isString(appCls) && appCls != '' ? appCls : 'GLOBAL';
    if (!FM.isset(tdata) || !tdata)
        return false;
    if (!FM.isset(tname) || !tname || tname == '')
        return false;
    if (!FM.isset(FM.UtTemplate.loadedTemplates[appCls])) {
        FM.UtTemplate.loadedTemplates[appCls] = {};
    }
    FM.UtTemplate.loadedTemplates[appCls][tname] = tdata;
    return true;
}

FM.UtTemplate.fetchTemplate = function(app, tname, cbfn) {
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {
    };
    var templData = FM.UtTemplate.getLoadedTemplate(app, tname);
    if (templData) {
        callbackFn(true, templData);
        return;
    }

    var res = tname.replace(/\./g, '/');
    res = '/' + res.replace('/html', '.html');
    var dmlist = new FM.DmList({
        fm_templates_path: app.getAttr(
            "fm_templates_path",
            FM.getAttr(
            FM, "templates_path",
            FM.getAttr(
            window, "FM_TEMPLATES_PATH",
            "/resources/templates"
            )
            )
            )
    }, 'getTemplate', app);
    var lurl = dmlist.getProperty('config.url', '');
    lurl += res;
    dmlist.setProperty('config.url', lurl);
    FM.log(app, "Loading template " + lurl + " ...", FM.logLevels.debug);

    var lstnr = {
        onListEnd: function(sender, data) {
            var oData = null;
            FM.forEach(data.Added, function(id, obj) {
                oData = obj;
                return false;
            });
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            if (oData) {
                FM.UtTemplate.addTemplate(tname, oData.getAttr("value", ""), app.getSubClassName());
                callbackFn(true, oData.getAttr("value"));
            } else {
                callbackFn(false, new FM.DmGenericError({
                    messageId: -1,
                    text: 'Data error: invalid response.'
                }));
            }
            return true;
        },
        onListError: function(sender, data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            callbackFn(false, new FM.DmGenericError({
                messageId: -1,
                text: data
            }));
            return true;
        }
    };
    dmlist.addListener(lstnr);
    dmlist.getData();
}



