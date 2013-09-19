/**
* List order ML observer class for {@link FM.MlHostGenericList} host. 
* 
* @class FM.MlObserverListOrder
* @extends FM.MlObserver
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/ 
FM.MlObserverListOrder = FM.defineClass('MlObserverListOrder',FM.MlObserver);

FM.MlObserverListOrder.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="ListOrder";
    
    var me = this;
    $(this.node).click(function(event) { 
        event.preventDefault();
        var dmobj = me.getDmObject();
        if(dmobj) {
            var attrname = me.getAttr('data-fmml-attr-name',''); // mine attr
            var orderAttrname = me.getAttr('data-fmml-order-attr-name','order_attr'); // attr to set order (put attrname here)
            var orderDir = me.getAttr('data-fmml-order-dir-attr-name','order'); // order dir attr (ASC/DESC)
            var curOrderAtrr = dmobj.getAttr(orderAttrname,'');
            var curOrderDir = dmobj.getAttr(orderDir,'ASC');
            if(curOrderAtrr == attrname) {
                dmobj.setAttr(orderDir, curOrderDir == 'DESC' ? 'ASC' : 'DESC',true);
            } else {
                var attrs = {};
                attrs[orderAttrname] = attrname;
                attrs[orderDir] = 'ASC';
                dmobj.setAttr(null,attrs,true);                
            }
        }
    });
}        

FM.MlObserverListOrder.prototype.setNodeValue = function() {    
    // provjeri
    var attrname = this.getAttr('data-fmml-attr-name',''); // mine attr
    var orderAttrname = this.getAttr('data-fmml-order-attr-name','order_attr'); // attr to set order (put attrname here)
    var orderDir = this.getAttr('data-fmml-order-dir-attr-name','order'); // order dir attr (ASC/DESC)
    var dmobj = this.getDmObject();
    if(dmobj && attrname != '') {
        var curOrderAttr = dmobj.getAttr(orderAttrname,'');
        var curOrderDir = dmobj.getAttr(orderDir,'ASC');
        if(curOrderAttr == attrname) {
            if(curOrderDir == 'DESC') {
                $(this.node).removeClass("fmmlOrderAsc");
                $(this.node).addClass("fmmlOrderDesc");
            } else {
                $(this.node).addClass("fmmlOrderAsc");
                $(this.node).removeClass("fmmlOrderDesc");                
            }
        } else {
            $(this.node).removeClass("fmmlOrderAsc");
            $(this.node).removeClass("fmmlOrderDesc");            
        }
    }
}

FM.MlObserver.addObserver("ListOrder",FM.MlObserverListOrder,'GLOBAL');
