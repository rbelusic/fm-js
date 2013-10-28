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
    this.lastTemplateName = '';
    
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


FM.MlTemplate.prototype._applyTemplate = function() {
    var me = this;

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
        if(FM.isString(v) && FM.startsWith(v,'@')) {                                    
            args[n] = FM.resolveAttrValue(null,"-",v,{
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
    if(tname != this.lastTemplateName) {            
        FM.UtTemplate.getTemplate(app,args,tname,function(isok,templ) {
            if(isok) {
                me.lastTemplateName = tname;
                var tmplnode = $(templ);
                var replaced = me.getAttr('data-fmml-template-replace','') == "true";
                if(replaced) {
                    $(me.getNode()).replaceWith(tmplnode);
                    me.node = tmplnode;
                    me.node.fmmlTemplate = me;
                } else {
                    $(me.getNode()).html(templ);
                }
                FM.MlHost.initChildNodes(me.getApp(),me.getNode(),oObj,!replaced);
            }
        });
    }
}

FM.MlTemplate.prototype.run = function(dmObj) {    
    this._super("run"); 
    this.setDmObject(dmObj);
    
    this._applyTemplate();

}


FM.MlTemplate.prototype.onUrlHashChange = function(sender,hash) {
    if(sender == this.getApp() && this.getAttr('data-fmml-template-type') == 'route') {
        this._applyTemplate();
    }
}

FM.MlTemplate.newTemplate = function(app,attrs,node,oObj) {
    var obj = new FM.MlTemplate(app,attrs,node);
    if(obj && obj.getAttr('data-fmml-run-on-init','true') != 'false') {
        obj.run(oObj); 
    }
    return obj;
}
