/**
* Templates factory class. 
* 
* @class FM.UtTemplate
* @extends FM.Object
* @param {object} opt Options
*/    
FM.UtTemplate = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.UtTemplate,FM.Object); 

// properties
FM.UtTemplate.prototype.objectSubClass = "";
FM.UtTemplate.loadedTemplates = {};

FM.UtTemplate.prototype._init = function(attrs) {
    this._super("_init",attrs);
    this.objectSubClass = "UtTemplate";
}

FM.UtTemplate.getTemplateArgs = function(attrlist) {
    var params = {};
    FM.forEach(attrlist, function(i,v) {
        if(FM.startsWith(i, "data-fmml-template-attr-")) {
            params[i.substring(24)] = v;
        }
        return true;
    });
    
    return params;
}

FM.UtTemplate.getTemplate = function(app,attrlist,tname,cbfn) {
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {};
    attrlist = FM.isset(attrlist) && attrlist && FM.isObject(attrlist) ? attrlist : {};
    var params = FM.UtTemplate.getTemplateArgs(attrlist);

    FM.UtTemplate._fetchTemplate(app,tname,function(isok,templ) {
        if(isok) {
            callbackFn(true,FM.applyTemplate(params,templ,false,false));
        } else {
            callbackFn(false,templ);
        }
    });
}    
    
FM.UtTemplate._fetchTemplate = function(app,tname,cbfn) {
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {};
    if(FM.isset(FM.UtTemplate.loadedTemplates[tname])) {
        callbackFn(true,FM.UtTemplate.loadedTemplates[tname]);
        return;
    }
    var res = tname.replace(/\./g,'/');    
    res = '/' + res.replace('/html','.html');    
    var dmlist = new FM.DmList({},'getTemplate',app); 
    var lurl = dmlist.getProperty('config.url','');
    lurl += res;
    dmlist.setProperty('config.url', lurl);
    
    var lstnr = {
        onListEnd: function(sender,data) {
            var oData = null;
            FM.forEach(data.Added,function(id, obj) {
                oData = obj;
                return false;
            });
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            if(oData) {
                FM.UtTemplate.loadedTemplates[tname] = oData.getAttr("value");
                callbackFn(true,oData.getAttr("value"));
            } else {
                callbackFn(false,new FM.DmGenericError({
                    messageId: -1,
                    text: 'Data error: invalid response.'
                }));
            }
            return true;
        },
        onListError: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            callbackFn(false,new FM.DmGenericError({
                messageId: -1,
                text: data
            }));
            return true;
        }
    };
    dmlist.addListener(lstnr);
    dmlist.getData();    
}
    


