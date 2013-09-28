/**
* List remote call state ML observer class for {@link FM.MlHostGenericList} host. 
* 
* @class FM.MlObserverListState
* @extends FM.MlObserver
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/ 
FM.MlObserverListState = FM.defineClass('MlObserverListState',FM.MlObserver);

FM.MlObserverListState.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="ListState";
}        

FM.MlObserverListState.prototype.update = function() {            
}        

FM.MlObserverListState.prototype.onListStart = function() {
    $(this.node).removeClass("fmmlInactiveState");
    $(this.node).addClass("fmmlWaitState");
}

FM.MlObserverListState.prototype.onListEnd = function() {
    $(this.node).removeClass("fmmlWaitState");
    $(this.node).addClass("fmmlInactiveState");
}

FM.MlObserverListState.prototype.onListError = function() {
    $(this.node).removeClass("fmmlWaitState");
    $(this.node).addClass("fmmlInactiveState");
}


FM.MlObserver.addObserver("ListState",FM.MlObserverListState,'GLOBAL');
