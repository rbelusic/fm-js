/**
 * ML generic list host class. 
 * Selection types:
 * - none,[single], many, {N} max number of sel items
 * - [scsession],scpage, scproxy
 * 
 * @class FM.MlHostGenericList
 * @extends FM.MlHost
 * @param {FM.AppObject} app application object
 * @param {object} [attrs] DOM node attributes
 * @param {DOMnode} node DOM node
 */
FM.MlHostGenericList = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(FM.MlHostGenericList, FM.MlHost);

FM.MlHostGenericList.prototype.selectedItems = null;    // list of selected items
FM.MlHostGenericList.prototype.selectionControllerInstance =  null; // session controller instance
FM.MlHostGenericList.prototype.maxSelected = -1;        // max selection size
FM.MlHostGenericList.prototype.selectionController = null; // selection controler type

FM.MlHostGenericList.prototype.rowTemplate = null;
FM.MlHostGenericList.prototype.listViewportSize = -1;
FM.MlHostGenericList.prototype.rowTemplateParentNode = null;
FM.MlHostGenericList.prototype.cursorStartIndex = -1;

FM.MlHostGenericList.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="GenericList";
    
    this.selectedItems = {};
    this.selectionController = "session";
    this.selectionControllerInstance =  null;
    this.maxSelected = -1;

    // determine selection attributes
    var seltypes = FM.trim(this.getAttr('data-fmml-list-selection-type','single;scsession'));
    var seltypesArr = seltypes != '' ? seltypes.split(";") : [];
    for (var i = 0; i < seltypesArr.length; i++) {    
        seltypesArr[i] = FM.trim(seltypesArr[i]);        
        if(seltypesArr[i] == 'single') {
            this.maxSelected = 1;
        } else if(seltypesArr[i] == 'none') {
            this.maxSelected = 0;
        }  else if(seltypesArr[i] == 'many') {
            this.maxSelected = -1;
        } else if(seltypesArr[i] == 'scproxy') {
            this.selectionController = "proxy";
        } else if(seltypesArr[i] == 'scpage') {
            this.selectionController = "page";
        } else if(seltypesArr[i] == 'scsession') {
            this.selectionController = "session";
        } else if(seltypesArr[i] != '') {
            this.maxSelected = parseInt(seltypesArr[i]);            
            if(this.maxSelected == 'NaN') this.maxSelected = 0;
        }
    }

    // find row template
    this.rowTemplate = null;
    this.listViewportSize = 0;
    this.rowTemplateParentNode = null;
    var rowTemp = $(this.node).find(".fmmlClsListRowWrapper");
 
    // number of displayed items
    if(FM.isset(rowTemp) && rowTemp && FM.isset(rowTemp[0])) {
        this.rowTemplate = rowTemp[0];
        this.listViewportSize = parseInt($(this.rowTemplate).attr('data-fmml-list-size'));
        $(this.rowTemplate).removeAttr('data-fmml-list-size');
        if(
            !FM.isset(this.listViewportSize) || 
            this.listViewportSize == null || 
            this.listViewportSize == 'NaN' ||
            this.listViewportSize < 0 ||
            this.listViewportSize > 99
        ) {
            this.listViewportSize = FM.MlHostGenericList.DEF_LIST_SIZE;;
        }
        this.rowTemplateParentNode = FM.isset(this.rowTemplate.parentNode) ?
            this.rowTemplate.parentNode : null
        ;
    }
}    

FM.MlHostGenericList.prototype._createList = function(oObj) {
    var dmconfName = this.getAttr('data-fmml-list','');
    var listOpt = {};
    var pref = 'data-fmml-list-attr-';
    var prefLen = pref.length;
    
    this.forEachAttr(function(pname,value) {
        if(FM.startsWith(pname,pref)) {
            listOpt[pname.substring(prefLen)] = value;
        }                    
        return true;
    });
    
    // input param
    oObj = FM.isset(oObj) && oObj ? oObj : null;
    if(!oObj) {        
        var lhost = this.getLinkedHost();
        if(lhost) {
            var node = document.getElementById(lhost);
            if( node && FM.isset(node.fmmlHost) && node.fmmlHost) {
                oObj = node.fmmlHost.getDmObject();
            }         
        }
    }
    
    if(FM.isset(oObj) && oObj && FM.isset(oObj.forEachAttr)) { // fm obect
        oObj.forEachAttr(function(pname,value) {
            listOpt[pname] = value;
            return true;
        });
        listOpt["objectClass"] = oObj.getSubClassName();
    } else if(FM.isArray(oObj) || FM.isObject(oObj)) { // array
        FM.forEach(oObj, function(pname,value) {
            listOpt[pname] = value;
            return true;
        });        
    }

    return new FM.DmList(listOpt,dmconfName,this.getApp());
}

FM.MlHostGenericList.prototype.run = function(oObj) {
    this._super("run");                
    this.clearSelection(false);

    // find first row wrapper
    if(this.rowTemplate) {
        if(FM.isset(this.listViewportSize)) {                        
            if(FM.isset(this.rowTemplateParentNode) && this.rowTemplateParentNode) {
                $(this.rowTemplateParentNode).html("");
                for(var i = 0; i < this.listViewportSize; i++) {
                    var newNode = $(this.rowTemplate).clone();
                    $(newNode).attr('data-fmml-list-index',"" + i);   
                    $(newNode).addClass(i & 1 ? 'fmmlRowOdd' : 'fmmlRowEven');
                    if(i == 0) $(newNode).addClass('fmmlRowFirst');
                    if(i == this.listViewportSize -1) $(newNode).addClass('fmmlRowLast');
                    $(newNode).addClass('fmmlRowEmpty');
                    $(this.rowTemplateParentNode).append(newNode);                                                     
                }
                FM.MlHost.initChildNodes(this.getApp(),this.rowTemplateParentNode);
            }
        }
    }

    // get data
    this.cursorStartIndex = 0;  
    var dmlist = this._createList(oObj);      
    this.setDmObject(dmlist);        
    dmlist.getData();
}

FM.MlHostGenericList.prototype.dispose = function() {
    this.selectionControllerInstance =  null;
    this.maxSelected = 0;
    this.selectionController = "session";
    this.selectedItems = {};
    
    var dmList = this.getDmObject();
    var me = this;
    dmList.forEachListElement(function(index,obj) {
        obj.removeListener(me);
        return true;
    });
    this._super("dispose");
}


FM.MlHostGenericList.prototype.getListIndex = function(obsnode) {
    if(!FM.isset(obsnode) || !obsnode) return -1;
    
    if(!FM.isset(obsnode.fmmlObserverListIndex)) {
        var parent = obsnode;
        while(parent && parent != this.node && !FM.isset($(parent).attr('data-fmml-list-index'))) {
            parent = parent.parentNode;
        }
        if(FM.isset($(parent).attr('data-fmml-list-index')) && parent != this.node) {
            obsnode.fmmlObserverListIndex = parseInt($(parent).attr('data-fmml-list-index'));
            obsnode.fmmlObserverListIndex = obsnode.fmmlObserverListIndex == 'NaN' ?
                -1 : obsnode.fmmlObserverListIndex;
        } else {
            obsnode.fmmlObserverListIndex = -1;
        }            
    }
    return(obsnode.fmmlObserverListIndex);
}


FM.MlHostGenericList.prototype.getListDmObject = function(oList,obsnode) {
    // find list index
    if(
        !FM.isset(oList) || 
        !oList || 
        !FM.isset(obsnode) || 
        !obsnode 
        || oList.getClassName() != 'DmList'
        ) {
        return oList;
    }
    
    if(this.getListIndex(obsnode) < 0) return this.dmObject;
    
    var listObj = null;
    var curPos = obsnode.fmmlObserverListIndex + this.cursorStartIndex;
    var cnt=0;
    this.dmObject.forEachListElement(
        function(index,iObj) {
            if(cnt == curPos) {
                listObj = iObj;
                return false;
            }
            cnt++;
            return true;
        }
        );

    return listObj;
}

FM.MlHostGenericList.prototype.getDmObject = function(obsnode) {
    var oObj = this._super("getDmObject");
    if(!oObj) {
        return oObj;
    }
    
    // not list
    if(
        oObj.getClassName() != 'DmList'  || 
        !FM.isset(obsnode) || !obsnode /*|| 
        !$(obsnode).attr('data-fmml-list-index')*/
        ) {
        return oObj;
    }
        
    // find list index
    return this.getListDmObject(oObj,obsnode);        
}

FM.MlHostGenericList.prototype.setDmObject = function(o) {
    var oold = this.getDmObject();    
    var onew = o;
    var me = this;                
    if(oold && oold != onew && oold.getClassName() == 'DmList') {
        oold.forEachListElement(
            function(index,iObj) {
                iObj.removeListener(me);
                return true;
            }
        );
    }
    
    if(onew && oold != onew && onew.getClassName() == 'DmList') {
        onew.forEachListElement(
            function(index,iObj) {
                iObj.addListener(me);
                return true;
            }
        );                
    }
    
    return this._super("setDmObject",o);
}

FM.MlHostGenericList.prototype.updateObserver = function(o,dmobj) {
    if(this.executed && FM.isset(o.update) && FM.isFunction(o.update)) {
        try {
            if(!FM.isset(dmobj) || dmobj == this.getDmObject(o.node)) {
                o.update(this);
            }
        } catch(e) {
            console.log("updateObservers() error: " + e);
        }
    }

    // kraj
    return true;
}

FM.MlHostGenericList.prototype.updateAllObservers = function(obj) {
    for(var id in this.listOfObservers) {
        this.updateObserver(this.listOfObservers[id],obj);
    }

    // kraj
    return true;
}


FM.MlHostGenericList.prototype.getPageIndexForTableIndex = function(ti) {
    var dmList = this.getDmObject();
    if(!dmList) return (-1);
    var vps = this.listViewportSize;    
    return(vps > 0 ? Math.floor(ti/vps) : -1);
}

FM.MlHostGenericList.prototype.setSelectionProxy = function(oProxy) {
    if(this.selectionController == "proxy") { 
        this.selectionControllerInstance = FM.isset(oProxy) && oProxy ? oProxy : null;
    } 
}

FM.MlHostGenericList.prototype.clearSelection = function(sendevent) {
    if(this.selectionController == "proxy") { 
        if(this.selectionControllerInstance && FM.isset(this.selectionControllerInstance.clearSelection)) {
            this.selectionControllerInstance.clearSelection(this,sendevent);
        }
        return;
    } 
 
    this.selectedItems = {};
    if(FM.isset(sendevent) && sendevent) this.updateAllObservers();
}

FM.MlHostGenericList.prototype.addToSelection = function(o,sendevent) {    
    if(this.selectionController == "proxy") { 
        if(this.selectionControllerInstance && FM.isset(this.selectionControllerInstance.addToSelection)) {
            this.selectionControllerInstance.addToSelection(this,o,sendevent);
        }
        return;
    } 
        
        
    if(this.maxSelected == 0) {
        return;
    } else if(this.maxSelected == 1) {
        this.clearSelection(false);
    } else if(this.maxSelected != -1) {
        var cnt = 0;
        FM.forEach(this.selectedItems,function(id,obj) {
            if(obj == true) cnt++;
            return true;
        });
        if(cnt >= this.maxSelected) return;
    }
    
   if(FM.isArray(o)) {
        for(var i= 0; i < o.length; i++) {
            this.selectedItems[o[i].getDataID()]=true;
        }
    } else if(FM.isset(o) && o) {
        this.selectedItems[o.getDataID()]=true;        
    }
    
    if(FM.isset(sendevent) && sendevent) this.updateAllObservers();
}

FM.MlHostGenericList.prototype.removeFromSelection = function(o,sendevent) {    
    if(this.selectionController == "proxy") { 
        if(this.selectionControllerInstance && FM.isset(this.selectionControllerInstance.removeFromSelection)) {
            this.selectionControllerInstance.removeFromSelection(this,o,sendevent);
        }
        return;
    } 
    
    if(FM.isArray(o)) {
        for(var i= 0; i < o.length; i++) {
            if(FM.isset(o[i]) && o[i] && FM.isset(this.selectedItems[o[i].getDataID()])) {
                this.selectedItems[o[i].getDataID()]=false;
            }
        }
    } else if(FM.isset(o) && o && FM.isset(this.selectedItems[o.getDataID()])) {
        this.selectedItems[o.getDataID()]=false;        
    }
    
    if(FM.isset(sendevent) && sendevent) this.updateAllObservers();
}

FM.MlHostGenericList.prototype.isSelected = function(o) {    
    if(this.selectionController == "proxy" && this.selectionControllerInstance && FM.isset(this.selectionControllerInstance.isSelected)) {
        return this.selectionControllerInstance.isSelected(o);
    }
    return(
        FM.isset(o) && o && 
        FM.isset(this.selectedItems[o.getDataID()]) && 
        this.selectedItems[o.getDataID()]
        );
}

// eventi
FM.MlHostGenericList.prototype.onChange = function(oSender,evdata) {
    var dmobj = this.getDmObject();
    if(
        dmobj && oSender && dmobj != oSender && 
        FM.isset(oSender['getDataID']) &&
        dmobj.get(oSender.getDataID())
    ) {
        this.updateAllObservers(oSender);
    } else {
        this._super("onChange",oSender,evdata);
    }
        
    if(
        oSender && oSender.getClassName && oSender.getClassName() == 'DmList' &&
        this.getAttr('data-fmml-list-refresh-on-change','true') != 'false'
        ) {        
        var fromrowAttr = this.getAttr('data-fmml-fromrow-attr-name',"fromrow");
        if(fromrowAttr != '') {
            oSender.setAttr(fromrowAttr,'0',false);
            this.cursorStartIndex = 0;
        }
        this.clearSelection(true);
        //this.disable();
        oSender.getData(false); // novi fetch
        
    }
    
    // kraj
    return true;
}

FM.MlHostGenericList.prototype._checkSelectionOnViewportChange = function(ci,nci) {
    if(
        this.getPageIndexForTableIndex(ci) != this.getPageIndexForTableIndex(nci) && 
        this.selectionController == "page"
    ) {
        this.clearSelection(true);
    }    
}

FM.MlHostGenericList.prototype.onStartOfList = function() {
    var dmList = this.getDmObject();
    if(!dmList) return (true);
    this._checkSelectionOnViewportChange(this.cursorStartIndex,0);
    this.cursorStartIndex = 0;
    this.updateAllObservers();

    // kraj
    return true;
};

FM.MlHostGenericList.prototype.onEndOfList = function() {    
    var dmList = this.getDmObject();
    if(!dmList) return (true);
    
    var vps = this.listViewportSize;
    var ci = vps == -1 ? dmList.getListSize() - 1 : dmList.getListSize() - vps;
    if(ci < 0) ci = 0;
    this._checkSelectionOnViewportChange(this.cursorStartIndex,ci);
    this.cursorStartIndex = ci;
    this.updateAllObservers();

    // kraj
    return true;
};

FM.MlHostGenericList.prototype.onPrevious = function() {
    var dmList = this.getDmObject();
    if(!dmList) return (true);
    var ci = this.cursorStartIndex;
    ci--;
    if(ci > -1) {
        this._checkSelectionOnViewportChange(this.cursorStartIndex,ci);
        this.cursorStartIndex = ci;
        this.updateAllObservers();
    }
    // kraj
    return true;
}

FM.MlHostGenericList.prototype.onPreviousPage = function() {
    var dmList = this.getDmObject();
    if(!dmList) return (true);
    var ci = this.cursorStartIndex;
    var vps = this.listViewportSize;
    
    if(ci < vps || vps < 1) {        
        return true;
    }
    
    var nci = (Math.floor(ci/vps) -1) * vps;
    if(nci > -1) {
        this._checkSelectionOnViewportChange(this.cursorStartIndex,nci);
        this.cursorStartIndex = nci;
        this.updateAllObservers();
    }
    // kraj
    return true;
}

FM.MlHostGenericList.prototype.onNext = function() {
    var dmList = this.getDmObject();
    if(!dmList) return (true);
    var ci = this.cursorStartIndex;
    var vps = this.listViewportSize;
    ci++;
    
    if((vps > 0 && ci + vps - 1 >= dmList.getListSize()) || (vps <1 && ci >= dmList.getListSize())) {
        if(this.getAttr('data-fmml-get-more','false') == 'true') {
            this._checkSelectionOnViewportChange(this.cursorStartIndex,ci);
            this.cursorStartIndex = ci;
            var fromrowAttr = this.getAttr('data-fmml-fromrow-attr-name',"fromrow");
            if(fromrowAttr != '') {
                dmList.setAttr(fromrowAttr,dmList.getListSize(),false);
            }
            dmList.getData(true);
            return true;
        } else {
            ci = dmList.getListSize() - (vps == -1 ? 1 : vps);
        }
    }
    this._checkSelectionOnViewportChange(this.cursorStartIndex,ci);
    this.cursorStartIndex = ci;
    this.updateAllObservers();

    // kraj
    return true;
};

FM.MlHostGenericList.prototype.onNextPage = function() {
    var dmList = this.getDmObject();
    if(!dmList) return (true);
    var ci = this.cursorStartIndex;
    var vps = this.listViewportSize;
    
    ci = (Math.floor(ci/vps) +1) * vps;    
    if((vps > 0 && ci + vps - 1 >= dmList.getListSize()) || (vps <1 && ci >= dmList.getListSize())) {
        if(this.getAttr('data-fmml-get-more','false') == 'true') {
            this._checkSelectionOnViewportChange(this.cursorStartIndex,ci);
            this.cursorStartIndex = ci;
            var fromrowAttr = this.getAttr('data-fmml-fromrow-attr-name',"fromrow");
            if(fromrowAttr != '') {
                dmList.setAttr(fromrowAttr,dmList.getListSize(),false);
            }
            dmList.getData(true);
            return true;
        } else {
            ci = (Math.floor((dmList.getListSize()-1)/vps)) * vps; 
        }
    }
    this._checkSelectionOnViewportChange(this.cursorStartIndex,ci);
    this.cursorStartIndex = ci;
    this.updateAllObservers();

    // kraj
    return true;
}

FM.MlHostGenericList.prototype.onLastPage = function() {
    var dmList = this.getDmObject();
    if(!dmList) return (true);
    var vps = this.listViewportSize;

    var ci = dmList.getListSize() -
        (this.getAttr('data-fmml-get-more','false') == 'true' ? 0 : 1)
    ;
    ci = (Math.floor(ci/vps)) * vps;
    
    if(vps > 0 && ci + vps - 1 >= dmList.getListSize()) {
        if(this.getAttr('data-fmml-get-more','false') == 'true') {
            this._checkSelectionOnViewportChange(this.cursorStartIndex,ci);
            this.cursorStartIndex = ci;
            var fromrowAttr = this.getAttr('data-fmml-fromrow-attr-name',"fromrow");
            if(fromrowAttr != '') {
                dmList.setAttr(fromrowAttr,dmList.getListSize(),false);
            }
            //this.disable();
            dmList.getData(true);
            return true;
        } else {
            ci = (Math.floor((dmList.getListSize()-1)/vps)) * vps; 
        }
    }
    this._checkSelectionOnViewportChange(this.cursorStartIndex,ci);
    this.cursorStartIndex = ci;
    this.updateAllObservers();

    // kraj
    return true;
}

FM.MlHostGenericList.prototype.onListStart = function(sender) {
    this.setLastError();
    this.sendEventToObservers(sender,"onListStart",{});
    // kraj
    return true;
}

FM.MlHostGenericList.prototype._checkRowsStatus = function(oList, startIndex) {    
    if(FM.isset(this.rowTemplateParentNode) && this.rowTemplateParentNode) {
        var me = this;
        var ls = oList.getListSize();
        $(this.rowTemplateParentNode).children().each(function() {
            if(FM.isset($(this).attr('data-fmml-list-index'))) {
                var i = parseInt($(this).attr('data-fmml-list-index'));
                if(i != 'NaN') {
                    if(i + startIndex >= ls) {
                        $(this).addClass("fmmlRowEmpty");
                    } else {
                        $(this).removeClass("fmmlRowEmpty");
                    }
                }
            }
        });
    }
}

FM.MlHostGenericList.prototype.onListEnd = function(sender) {
    var _q = sender.getLastGetArgs();
    this.sendEventToObservers(sender,"onListEnd",{});
    
    var dmList = this.getDmObject();
    if(dmList) {
        var ci = this.cursorStartIndex;
        var vps = this.listViewportSize;
        
        if(ci > dmList.getListSize() - (vps == -1 ? 1 : vps)) {
            if(vps == -1) {
                ci = dmList.getListSize() - 1;
            } else {
                ci = (Math.floor((dmList.getListSize()-1)/vps)) * vps;
            }
            if(ci < 0) ci = 0;
            this._checkSelectionOnViewportChange(this.cursorStartIndex,ci);            
            this.cursorStartIndex = ci;            
        }
        var me = this;
        dmList.forEachListElement(function(index,obj) { 
            obj.setAttr('_query',_q);
            obj.addListener(me); 
            return true;
        });
        
        this._checkRowsStatus(dmList,ci);
    }
    
    // 
    this.updateAllObservers();
    // kraj
    return true;
}

FM.MlHostGenericList.prototype.onListError = function(sender,errObj) {
    this.setLastError(errObj);
    this.sendEventToObservers(sender,"onListError",{});
    var dmList = this.getDmObject();
    var me = this;
    dmList.forEachListElement(function(index,obj) {
        obj.addListener(me);
        return true;
    });
    this.updateAllObservers();
    // kraj
    return true;
}

FM.MlHostGenericList.prototype.getSelectedCount = function() {
    if(this.selectionController == "proxy") { 
        if(this.selectionControllerInstance && FM.isset(this.selectionControllerInstance.getSelectedCount)) {
            return this.selectionControllerInstance.getSelectedCount(this);
        }
        return 0;
    }
    var cnt = 0;
    FM.forEach(this.selectedItems,function(id,obj) {
        if(obj == true) cnt++;
        return true;
    });

    // kraj
    return cnt;
}

FM.MlHostGenericList.prototype.onSelected = function(oSender,evdata) {
    var evObj = FM.getAttr(evdata,'object',null);
    var evCb = FM.getAttr(evdata,'callback',function(){});
    
    if(evObj) this.addToSelection(evObj, true);
    
    // kraj
    return true;
}

FM.MlHostGenericList.prototype.onDeselected = function(oSender,evdata) {
    var evObj = FM.getAttr(evdata,'object',null);
    var evCb = FM.getAttr(evdata,'callback',function(){});
    
    if(evObj) this.removeFromSelection(evObj, true);
    
    // kraj
    return true;
}

FM.MlHostGenericList.prototype.onClearSelection = function(oSender,evdata) {
    var evObj = FM.getAttr(evdata,'object',null);
    var evCb = FM.getAttr(evdata,'callback',function(){});
    
    if(evObj) this.clearSelection(true);
    
    // kraj
    return true;
}

FM.MlHostGenericList.prototype.onAddPageToSelection = function(oSender,evdata) {
    var dmList = this.getDmObject();
    if(dmList) {
        var ci = this.cursorStartIndex;
        var vps = this.listViewportSize;
        var sellst = [];
        var i = 0;
        if(vps > 0) {
            var ce = ci+vps;
            dmList.forEachListElement(function(id,obj) {
                if(i >= ci && i < ce) sellst.push(obj);
                return true;
            });
        }
        if(sellst.length > 0) this.addToSelection(sellst, true);
    }
    
    // kraj
    return true;
}

FM.MlHostGenericList.prototype.onRemovePageFromSelection = function(oSender,evdata) {
    var dmList = this.getDmObject();
    if(dmList) {
        var ci = this.cursorStartIndex;
        var vps = this.listViewportSize;
        var sellst = [];
        var i = 0;
        if(vps > 0) {
            var ce = ci+vps;
            dmList.forEachListElement(function(id,obj) {
                if(i >= ci && i < ce) sellst.push(obj);
                return true;
            });
        }
        if(sellst.length > 0) this.removeFromSelection(sellst, true);
    }
    
    // kraj
    return true;
}

FM.MlHostGenericList.className = "MlHostGenericList";
FM.MlHostGenericList.fullClassName = 'lm.MlHostGenericList';

FM.MlHostGenericList.DEF_LIST_SIZE = 5;

FM.MlHost.addHost("GenericList",FM.MlHostGenericList,'GLOBAL');

