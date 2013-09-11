/**
* List selection ML observer class for {@link FM.MlHostGenericList} host. 
* 
* @class FM.MlObserverListSelection
* @extends FM.MlObserver
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/ 
FM.MlObserverListSelection = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(FM.MlObserverListSelection, FM.MlObserver);  

FM.MlObserverListSelection.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="ObserverListSelection";
    
    var me = this;
    $(this.node).click(function(event) {
        var host = me.getHost();                
        var dmobj = me.getDmObject();
        if(dmobj && FM.isset(host.isSelected)) {
            host.onEvent(
                me,
                host.isSelected(dmobj) ? "onDeselected" : "onSelected", 
                {object: dmobj}
            );
        }
        return true;
    });
}

FM.MlObserverListSelection.prototype.setNodeValue = function() {
    // provjeri
    var host = this.getHost();                
        
    // get dmobj && dmlist
    var dmobj = this.getDmObject();
    var issel = dmobj && FM.isset(host.isSelected) ?  host.isSelected(dmobj) : false;
    if(FM.isset(this.node.checked)) {
        if(this.node.checked != issel) this.node.checked = issel;
    } 
    
    if(issel) {
        $(this.node).closest(".fmmlClsListRowWrapper").addClass("fmmlSelected");
    } else {
        $(this.node).closest(".fmmlClsListRowWrapper").removeClass("fmmlSelected");
    }
}


FM.MlObserverListSelection.className = "MlObserverListSelection";
FM.MlObserverListSelection.fullClassName = 'lm.MlObserverListSelection';

FM.MlObserver.addObserver("ListSelection",FM.MlObserverListSelection,'GLOBAL');
