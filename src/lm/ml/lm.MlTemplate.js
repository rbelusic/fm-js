/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */
/**
* Generic ML template class. 
* 
* @class FM.MlTemplate
* @memberOf FM
* @extends FM.LmObject
* @param {FM.AppObject} app Application object.
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
 *    <td>data-fmml-template-type</td>
 *    <td>Template type (only "route" is currently supported)</td>
 *    <td>[...], route</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-template</td>
 *    <td>Template name</td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-template-replace</td>
 *    <td>
 *      Replace DOM node instead of his content.
 *    </td>
 *    <td>[false], true</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-run-on-init</td>
 *    <td>
 *      Run template after creation.
 *    </td>
 *    <td>[true], false</td>
 *   </tr>
 *  </tbody>
 * </table>
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


/**
 * Dispose template.
 * 
 * @public
 * @function 
 */
FM.MlTemplate.prototype.dispose = function() {
    FM.MlHost.disposeChildNodes(this.getNode());
    this._super("dispose");
}


/**
 * Returns template DOM node.
 * 
 * @public
 * @function
 * @returns {node}
 */
FM.MlTemplate.prototype.getNode = function() {
    return this.node;
}


/**
 * 
 * @ignore
 */
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

/**
 * Run template.
 * 
 * @public
 * @function
 * @param {FM.DmObject} [dmObj] Template DM object.
 */
FM.MlTemplate.prototype.run = function(dmObj) {    
    this._super("run"); 
    this.setDmObject(dmObj);
    
    this._applyTemplate();

}

/**
 * Fired when change on hash of window.location object attributes occurs.
 * If template type is <i>route</i> template will be applyed again.
 *  
 * @public
 * @event
 * @param {FM.AppObject} sender This event is sent from application.
 * @param {string} hash New location hash.
 */
FM.MlTemplate.prototype.onUrlHashChange = function(sender,hash) {
    if(sender == this.getApp() && this.getAttr('data-fmml-template-type') == 'route') {
        this._applyTemplate();
    }
}

/**
* Returns new instance of template.
* 
* @static
* @public
* @function    
* @param {FM.AppObject} app Current application.
* @param {object} attrs Template attributes.
* @param {node} attrs Template node.
* @param {FM.DmObject} [oObj=null] DM object to run template with.
* 
* @return {FM.MlTemplate} New template instance.
*/   
FM.MlTemplate.newTemplate = function(app,attrs,node,oObj) {
    var obj = new FM.MlTemplate(app,attrs,node);
    if(obj && obj.getAttr('data-fmml-run-on-init','true') != 'false') {
        obj.run(oObj); 
    }
    return obj;
}
