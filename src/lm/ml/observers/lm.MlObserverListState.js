/**
* List remote call state ML observer class for {@link FM.MlHostGenericList} host. 
* 
* @class FM.MlObserverListState
* @extends FM.MlObserver
* @param {object} [attrs] DOM node attributes
* @param {DOMnode} node DOM node
*/ 
FM.MlObserverListState = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(FM.MlObserverListState, FM.MlObserver);

FM.MlObserverListState.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="ObserverListState";
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

FM.MlObserverListState.className = "MlObserverListState";
FM.MlObserverListState.fullClassName = 'lm.MlObserverListState';

FM.MlObserver.addObserver("ListState",FM.MlObserverListState,'GLOBAL');
