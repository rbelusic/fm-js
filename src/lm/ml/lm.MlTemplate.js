/**
* ML template class. 
* 
* @class FM.MlTemplate
* @memberOf FM
* @extends FM.LmObject
* @param {FM.AppObject} app application object
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
* 
* 
*/    
FM.MlTemplate = FM.defineClass('MlTemplate',FM.LmObject);

// methods
FM.MlTemplate.prototype._init = function(app,attrs,node) {
    this._super("_init",app,attrs);
    this.objectSubClass = "Template";
    this.node = node;    
    
    // two way binding
    this.node.fmmlTemplate = this;    
    this.getApp().addListener(this);
    this.addListener(this.getApp());
}


FM.MlTemplate.prototype.dispose = function() {
    FM.MlHost.disposeChildNodes(this.getNode());
    this._super("dispose");
}

FM.MlTemplate.prototype.getNode = function() {
    return this.node;
}


FM.MlTemplate.newTemplate = function(app,attrs,node,oObj) {
    var obj = new FM.MlTemplate(app,attrs,node);
    if(obj && obj.getAttr('data-fmml-run-on-init','true') != 'false') {
        obj.run(oObj); 
    }
    return obj;
}

FM.MlTemplate.prototype.run = function(dmObj) {
    var me = this;
    
    this.setDmObject(dmObj);
    
    // t. args from node attributes
    var args = FM.UtTemplate.getTemplateArgs(this.getAttr());
    
    // add global arguments (from url query str)
    if(this.getAttr('data-fmml-use-global-args','false') == 'true') {            
        var globalArgs = FM.getArgs();
        FM.forEach(globalArgs, function(n,v) {
            if(!FM.isset(args,n)) {
                args[n]=v;
            }
            return true;
        });
    }
    
    // eval values
    var app = this.getApp();
    var oObj = this.getDmObject();
    FM.forEach(args, function(n,v) {
        if(FM.isString(v) && FM.startsWith(v,'@@')) {                                    
            v = FM.resolveAttrValue(null,"-",v,{
                A: app,
                D: oObj,
                T: me
            });
        }
        return true;
    });

    // template name
    var tname = this.getAttr('data-fmml-template','');
    tname = FM.applyTemplate(args, tname, false, false);
    FM.UtTemplate.getTemplate(app,args,tname,function(isok,templ) {
        if(isok) {
            var tmplnode = $(templ);
            if(me.getAttr('data-fmml-template-replace','') == "true") {
                $(me.getNode()).replaceWith(tmplnode);
                me.node = tmplnode;
                me.node.fmmlTemplate = me;
            } else {
                $(me.getNode()).html(templ);
            }
            FM.MlHost.initChildNodes(me.getApp(),me.getNode(),oObj);
        }
    });

}


FM.MlTemplate.prototype.onUrlHashChange = function(sender,data) {
    
}

