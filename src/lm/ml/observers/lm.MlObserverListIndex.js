/**
* List index ML observer class for {@link FM.MlHostGenericList} host. 
* 
* @class FM.MlObserverListIndex
* @extends FM.MlObserver
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/ 
FM.MlObserverListIndex = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(FM.MlObserverListIndex, FM.MlObserver);

FM.MlObserverListIndex.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="ObserverListIndex";
}        

FM.MlObserverListIndex.prototype.setNodeValue = function() {
    var me = this;
    var value = '';
    
    // get dmobj && dmlist
    var dmobj = this.getDmObject();
    var host = this.getHost();
    
    if(host) value = host.getAttr('data-fmml-list-index','');
    if(host && value == '') {    
        var dmlist = host ? host.getDmObject(null) : null;

        if(
            dmobj && dmlist && 
            host && FM.isset(host.cursorStartIndex) && 
            FM.isset(this.node) && FM.isset(this.node.fmmlObserverListIndex)
        ) {
            value = this.node.fmmlObserverListIndex + host.cursorStartIndex + 1;
            value = '' + value;
        }
    }
    
    if(FM.isset(this.node.value)) {
        this.node.value = value;
    } else if(me.node.nodeName == 'IMG') {
        me.node.setAttribute("src",value);
    } else {
        me.node.innerHTML = value;
    }
}


FM.MlObserverListIndex.className = "MlObserverListIndex";
FM.MlObserverListIndex.fullClassName = 'lm.MlObserverListIndex';

FM.MlObserver.addObserver("ListIndex",FM.MlObserverListIndex,'GLOBAL');
