/**
* Attribute decoration ML observer class. 
* 
* <table>
* <th>List of ML node attributes</th>
* </table>
* 
* @class FM.MlObserverAttributeDecoration
* @extends FM.MlObserver
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/    
FM.MlObserverAttributeDecoration = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(FM.MlObserverAttributeDecoration, FM.MlObserver);

FM.MlObserverAttributeDecoration.prototype._init = function(app,attrs,node) {
    this._super("_init",app,attrs,node);
    this.objectSubClass ="ObserverAttributeDecoration";
}        

FM.MlObserverAttributeDecoration.prototype.setNodeValue = function() {
    // conf
    var attrname = this.getAttr('data-fmml-attr-name','');
    var defval = this.getAttr('data-fmml-attr-default-value','');
    
    // value
    var dmobj = this.getDmObject();
    var value = 
        dmobj ?         
        FM.UiItem.getAttributeDecoration(
            dmobj.getSubClassName(),
            attrname
        ) : defval
    ;
    
    // set
    if(FM.isset(this.node.value)) {
        this.node.value = value;
    } else if(this.node.nodeName == 'IMG') {
        this.node.setAttribute("src",value);
    } else {
        this.node.innerHTML = value;
    }   
}

FM.MlObserverAttributeDecoration.className = "MlObserverAttributeDecoration";
FM.MlObserverAttributeDecoration.fullClassName = 'lm.MlObserverAttributeDecoration';

FM.MlObserver.addObserver("AttributeDecoration",FM.MlObserverAttributeDecoration,'GLOBAL');
