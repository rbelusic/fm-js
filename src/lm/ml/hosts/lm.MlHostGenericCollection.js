/**
 * ML generic collection host class. 
 * 
 * @class FM.MlHostGenericCollection
 * @memberOf FM
 * @extends FM.MlHost
 * @param {FM.AppObject} app application object
 * @param {object} [attrs] DOM node attributes
 * @param {DOMnode} node DOM node
 * 
 * data-fmml-list-max-items, 'data-fmml-list-items-template-base,
 * data-fmml-list-items-template-empty, data-fmml-list-items-layout,
 * data-fmml-list, data-fmml-list-attr-*,data-fmml-list-fetch-on-run,
 * data-fmml-list-refresh-on-change,data-fmml-fromrow-attr-name,
 * data-fmml-list-attr-resource-parser, data-fmml-list-waiting-fs,
 * data-fmml-list-get-more-at-end
 *  
 */
FM.MlHostGenericCollection = FM.defineClass('MlHostGenericCollection',FM.MlHost);

FM.MlHostGenericCollection.prototype._init = function(app,attrs,node) {            
    this._super("_init",app,attrs,node);
    this.objectSubClass ="GenericCollection";

    // selection
    this.selectedItems = {};
    this.maxSelected = -1;
    this.listOffset = 0;

    this.listItemsTemplate = null;
    this.listEmptyTemplate = null;

    // find items container
    this.listItemsContainer = this.node;
    var itmCont = $(this.node).find(".fmmlListItems");
    if(FM.isset(itmCont) && itmCont && FM.isset(itmCont[0])) {
        this.listItemsContainer = itmCont[0];
        var itmTempl = $(this.listItemsContainer).find(".fmmlListItemsTemplate");
        if(FM.isset(itmTempl) && itmTempl && FM.isset(itmTempl[0])) {
            this.listItemsTemplate = FM.nodeToHtml(itmTempl[0]);
        }
        itmTempl = $(this.listItemsContainer).find(".fmmlListEmptyTemplate");
        if(FM.isset(itmTempl) && itmTempl && FM.isset(itmTempl[0])) {
            this.listEmptyTemplate = FM.nodeToHtml(itmTempl[0]);
        }
    }

    // find list empty ode
    this.listEmpty = null;
    var itmWrp = $(this.listItemsContainer).find(".fmmlListEmpty");
    if(FM.isset(itmWrp) && itmWrp && FM.isset(itmWrp[0])) {
        this.listEmpty = itmWrp[0];
    }

    // find list waiting ode
    this.listWaiting = null;
    var itmWrp = $(this.listItemsContainer).find(".fmmlListWaiting");
    if(FM.isset(itmWrp) && itmWrp && FM.isset(itmWrp[0])) {
        this.listWaiting = itmWrp[0];
    }

    // find items wrapper
    this.listItemsWrapper = null; //$("<div></div>");
    itmWrp = $(this.listItemsContainer).find(".fmmlListItemWrapper");
    if(FM.isset(itmWrp) && itmWrp && FM.isset(itmWrp[0])) {
        this.listItemsWrapper = itmWrp[0];
    }

    // fmmlListItemInner
    this.listItemsInner = null;
    itmWrp = $(this.listItemsWrapper).find(".fmmlListItemInner");
    if(FM.isset(itmWrp) && itmWrp && FM.isset(itmWrp[0])) {
        this.listItemsInner = itmWrp[0];
    }
    $(this.listItemsWrapper).html("");

    // clear
    this._clearItems();
}    

FM.MlHostGenericCollection.prototype._clearItems = function() {
    FM.MlHost.disposeChildNodes(this.listItemsContainer);
    $(this.listItemsContainer).html("");
}

FM.MlHostGenericCollection.prototype._nodeApplyTemplate = function(node,attrs) {
    FM.forEach(node.attributes, function(i,attr) {
        if (attr.specified == true) {
            var val = FM.applyTemplate(attrs, attr.value, false, false);
            if(val != attr.value) {
                attr.value = val;
            }
        }
        return true;
    });
    
}

FM.MlHostGenericCollection.prototype._refreshItems = function() {
    this._clearItems();
    var dmList = this.getDmObject();
    if(!dmList) return false;
    var me = this;    
    var curitm = -1;
    var itmcnt = 0;
    var maxitms = parseInt(this.getAttr('data-fmml-list-max-items','200'));
    maxitms = FM.isset(maxitms) ? maxitms : 200;
    dmList.forEachListElement(function(i,oObj) {                
        var layout = me.getRegistryValue(
            "/itemsLayout",
            me.getAttr('data-fmml-list-items-layout','icon')
            );
        
        var attrs = {
            itemsLayout: layout
        };
        if (me._filterItemFromDisplay(oObj) == true) {
            curitm++;
            if(curitm < me.listOffset) return true;
        
            oObj.forEachAttr(function(pname,value) {
                attrs[pname] = value;
                return true;
            });
            attrs["objectClass"] = oObj.getSubClassName();
            attrs["data_id"] = oObj.getDataID();
            attrs["listIndex"] = curitm+1;
            
            itmcnt++;
            if(me.listItemsTemplate) {
                me._createItmNode(oObj,attrs,me.listItemsTemplate);
            } else {
                var tname = me.getAttr(
                    'data-fmml-list-items-template-base',
                    "ui.layouts.dm.[:objectClass].[:itemsLayout].html"
                    );
                tname = FM.applyTemplate(attrs,tname,false,true);
                FM.UtTemplate.getTemplate(me.getApp(),attrs,tname,function(isok,templ) {            
                    if(isok) {                
                        me._createItmNode(oObj,attrs,templ);
                    }
                });
            }
        }
    
        return maxitms > itmcnt;
    });

    var emptyTempl = this.getAttr('data-fmml-list-items-template-empty','');
    if(maxitms > itmcnt && (emptyTempl != '' || this.listEmptyTemplate)) {
        curitm++;
        if(this.listEmptyTemplate) {
            while(maxitms > itmcnt) {
                curitm++;
                itmcnt++;
                var attrs = {
                    itemsLayout: 'unknown',
                    objectClass: 'unknown',
                    data_id: 'unknown',
                    listIndex: curitm
                };
                this._createItmNode(null,attrs,this.listEmptyTemplate);                                        
            }            
        } else {        
            FM.UtTemplate.getTemplate(this.getApp(),{},emptyTempl,function(isok,templ) {                    
                if(isok) {
                    while(maxitms > itmcnt) {
                        curitm++;
                        itmcnt++;
                        var attrs = {
                            itemsLayout: 'unknown',
                            objectClass: 'unknown',
                            data_id: 'unknown',
                            listIndex: curitm
                        };
                        me._createItmNode(null,attrs,templ);                                        
                    }
                }
            });
        }
    }
    
    // empty list
    if(itmcnt == 0 && emptyTempl == '') this.setListEmpty();
    
    // send event
    this.sendEventToObservers(this,'onListRefreshCompleted');
}

FM.MlHostGenericCollection.prototype._createItmNode = function(oObj,attrs,templ) {
    var curitm = parseInt(FM.getAttr(attrs,'listIndex','0'));
    
    var itm = $(templ);
    if(itm) {
        if(this.listItemsInner) {
            var iNode = $(this.listItemsInner).clone();
            if(FM.isset(iNode) && iNode && FM.isset(iNode[0])) {
                iNode = iNode[0];
            }
            this._nodeApplyTemplate(iNode,attrs);
            $(iNode).append(itm);
            itm = iNode;
        }

        if(this.listItemsWrapper) {
            var newNode = $(this.listItemsWrapper).clone();
            if(FM.isset(newNode) && newNode && FM.isset(newNode[0])) {
                newNode = newNode[0];
            }
            this._nodeApplyTemplate(newNode,attrs);
            $(newNode).append(itm);
        } else {
            newNode = itm;
        }


        $(newNode).attr('data-fmml-list-index',curitm);   
        $(newNode).addClass(curitm & 1 ? 'fmmlRowOdd' : 'fmmlRowEven');
        $(newNode).attr('data-fmml-item-data-id',oObj ? oObj.getDataID() : 'unknown');
        
        this._appendItmNode(oObj,newNode,attrs);                        
    }
}

FM.MlHostGenericCollection.prototype._appendItmNode = function(oObj,node,attrs) {
    var index = attrs["listIndex"];
    var lastNode = null;
    var lastNodeIndex = -1;
    for(var i = index-1; i >=0 && lastNodeIndex == -1; i--) {
        lastNode = $("[data-fmml-list-index='" + i + "']");
        lastNode = lastNode.length ? lastNode[0]: null;
        if(lastNode) {
            lastNodeIndex = i;
        }
    }
    if(lastNode) {
        $(lastNode).after(node[0]);
    } else {
        $(this.listItemsContainer).prepend(node);
    }
    if(oObj) {
        FM.MlHost.initChildNodes(this.getApp(),node,oObj,this.listItemsWrapper != null);
    }
}

FM.MlHostGenericCollection.prototype._filterItemFromDisplay = function(oObj) {
    return true;
}

FM.MlHostGenericCollection.prototype._createList = function(oObj) {
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
            if( lhost) {
                oObj = lhost.getDmObject();
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
    
    dmconfName = FM.resolveAttrValue(null,"-",dmconfName,{
        A: this.getApp(),
        H: this
    });
    var dmList = FM.isObject(dmconfName) && dmconfName ? 
        dmconfName :
        new FM.DmList(listOpt,dmconfName,this.getApp())
    ;
    
    return dmList;
}

FM.MlHostGenericCollection.prototype.run = function(oObj) {
    this._super("run");
    this.clearSelection(false);
    this.history = [];
    
    // get data
    
    var dmlist = FM.isset(oObj) && oObj && oObj.getClassName && oObj.getClassName() == 'DmList' ?
    oObj :  this._createList(oObj)
    ;
              
    this.setDmObject(dmlist);  
    
    if(this.getAttr('data-fmml-list-fetch-on-run','true') != 'false') {
        this.history.push(dmlist.getAttr());
        dmlist.getData();
    } else {
        this._refreshItems();
    }
}

FM.MlHostGenericCollection.prototype.dispose = function() {
    this.maxSelected = 0;
    this.selectedItems = {};
    this._clearItems();    
    this._super("dispose");
}

FM.MlHostGenericCollection.prototype.clearSelection = function(sendevent) {
    this.selectedItems = {};
    $(this.listItemsContainer).find(".fmmlSelected").removeClass("fmmlSelected");
    if(FM.isset(sendevent) && sendevent) this.updateAllObservers();
}

FM.MlHostGenericCollection.prototype.addToSelection = function(o, node, sendevent) {    
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
    } else {
        var oid = FM.isset(o) && o ? 
        (FM.isString(o) ? o : o.getDataID()) :
        ''
        ;      
        this.selectedItems[oid]=true;
    }
    if(FM.isset(node) && node) $(node).addClass("fmmlSelected");
    if(FM.isset(sendevent) && sendevent) this.updateAllObservers();
}

FM.MlHostGenericCollection.prototype.removeFromSelection = function(o,node,sendevent) { 
    if(FM.isArray(o)) {
        for(var i= 0; i < o.length; i++) {
            if(FM.isset(o[i]) && o[i] && FM.isset(this.selectedItems[o[i].getDataID()])) {
                this.selectedItems[o[i].getDataID()]=false;
            }
        }
    } else {
        var oid = FM.isset(o) && o ? 
        (FM.isString(o) ? o : o.getDataID()) :
        ''
        ;      
        if(FM.isset(this.selectedItems[oid])) this.selectedItems[oid]=false;
    }
    
    if(FM.isset(node) && node) $(node).removeClass("fmmlSelected");
    if(FM.isset(sendevent) && sendevent) this.updateAllObservers();
}

FM.MlHostGenericCollection.prototype.isSelected = function(o) {
    var id = FM.isset(o) && o ? 
    (FM.isString(o) ? o : o.getDataID()) :
    '';
    return(id != '' && FM.isset(this.selectedItems[id]) && this.selectedItems[id]);
}

FM.MlHostGenericCollection.prototype.getSelectionSize = function() {
    var cnt=0;
    FM.forEach(this.selectedItems,function(id) {
        cnt++;
        return true;
    });
    
    return cnt;
}

FM.MlHostGenericCollection.prototype.getSelection = function() {
    var lst = this.getDmObject();
    var sel = [];
    
    if(lst) {
        FM.forEach(this.selectedItems,function(id) {
            var o = lst.get(id);
            if(o) sel.push(o);
            return true;
        });
    }
    return sel;
}

// eventi
FM.MlHostGenericCollection.prototype.onChange = function(oSender,evdata) {
    this._super("onChange",oSender,evdata);
    
    var evObj = FM.getAttr(evdata,'object',null);
    var evCb = FM.getAttr(evdata,'callback',function(){});
    
    if(
        oSender && oSender.getClassName && oSender.getClassName() == 'DmList' &&
        this.getAttr('data-fmml-list-refresh-on-change','true') != 'false'
        ) {
        var fromrowAttr = this.getAttr('data-fmml-fromrow-attr-name',"fromrow");
        if(fromrowAttr != '') {
            oSender.setAttr(fromrowAttr,'0',false);
        }
        this.clearSelection(true);
        this.history.push(oSender.getAttr());
        oSender.getData(false); // novi fetch
    }
    
    // kraj
    return true;
}
FM.MlHostGenericCollection.prototype.getMore = function() {
    var dmList = this.getDmObject();
    if(dmList && FM.isset(dmList,"getData")) {
        dmList.getData(true);
    }    
}

FM.MlHostGenericCollection.prototype.onGetMore = function(oSender,evdata) {
    this.getMore();
}

FM.MlHostGenericCollection.prototype.onRefresh = function(oSender,evdata) {
    var dmList = this.getDmObject();
    if(dmList && FM.isset(dmList,"getData")) {
        dmList.getData(false);
    }
}

FM.MlHostGenericCollection.prototype.onHistoryBack = function(oSender,evdata) {
    if(this.history.length > 1) {
        var mydata = this.history.pop(); // me
        var data = this.history.pop(); // last
        
        var dmList = this.getDmObject();
        if(dmList && FM.isset(dmList,"getData")) {
            FM.forEach(data, function(n,v) {
                dmList.setAttr(n,v);
                return true;
            });
            //dmList.getData(false);
            dmList.setChanged(true,true);
            if(this.getAttr('data-fmml-list-refresh-on-change','true') != 'true') {
                dmList.getData(false);
            }
        }        
        
    }
}

FM.MlHostGenericCollection.prototype.onAddObjectToList = function(oSender,evdata) {
    var oObj = FM.getAttr(evdata,'object',null);
    if(!oObj) return false;
    var dmList = this.getDmObject();
    if(dmList) {
        dmList.addToList(oObj,oObj.getDataID(),true);
    }
    return true;
}

FM.MlHostGenericCollection.prototype.onOpenObject = function(oSender,evdata) {
    var oObj = FM.getAttr(evdata,'object',null);
    if(!oObj) return;    
    var id = oObj.getAttr('value','');
    if(id == '') return;    
    var lst = this.getDmObject();
    var dmObj = lst ? lst.get(id) : null;
    if(dmObj && this.getApp().openObject) {
        this.getApp().openObject(dmObj);
    }
}

FM.MlHostGenericCollection.prototype.onChangeResource = function(oSender,evdata) {
    var oObj = FM.getAttr(evdata,'object',null);
    if(!oObj) return;
    
    var resurl = oObj.getAttr('resource_url',oObj.getAttr('value',''));
    if(resurl != '') {
        var resResolvFn = this.getAttr('data-fmml-list-attr-resource-parser','');
        if(resResolvFn !== '') {
            resResolvFn = FM.stringPtrToObject(resResolvFn, this, this.getApp());
            if(resResolvFn) {
                try {
                    resurl = resResolvFn(this,resurl);
                } catch(e) {
                    this.log(e,FM.logLevels.error,'onChangeResource');
                }
            }
        }
        this.listOffset = 0;
        var dmList = this.getDmObject();
        if(dmList) {
            dmList.setAttr('resource_url',resurl,true);
        }
    }
}

FM.MlHostGenericCollection.prototype.onListStart = function(sender) {    
    this.setWaiting();
    this.sendEventToObservers(sender,"onListStart",{});
    // kraj
    return true;
}


FM.MlHostGenericCollection.prototype.onListEnd = function(sender) {    
    this.sendEventToObservers(sender,"onListEnd",{});
    this.updateAllObservers();
    this._refreshItems();
    // kraj
    return true;
}

FM.MlHostGenericCollection.prototype.onListError = function(sender) {
    this.sendEventToObservers(sender,"onListError",{});
    this.updateAllObservers();
    this.setListEmpty();
    return true;
}

FM.MlHostGenericCollection.prototype.setWaiting = function() {
    
    if(this.listWaiting) {
        var wnode = $(this.listWaiting).clone()[0];
        if(this.getAttr('data-fmml-list-waiting-fs','true') == 'true') {
            $(wnode).width('100%');
            $(wnode).height($(this.listItemsContainer).height());
            this._clearItems();
        }                
        $(this.listItemsContainer).append(wnode);
        FM.MlHost.initChildNodes(this.getApp(), wnode, this.getDmObject());
    }
}

FM.MlHostGenericCollection.prototype.setListEmpty = function() {
    if(this.listEmpty) {
        var enode = $(this.listEmpty).clone()[0];
        $(enode).width('100%');
        $(enode).height($(this.listItemsContainer).height());
        
        this._clearItems();
        
        $(this.listItemsContainer).append(enode);
        FM.MlHost.initChildNodes(this.getApp(), enode, this.getDmObject());
    }
}

FM.MlHostGenericCollection.prototype.onChangeListLayout = function(sender,evdata) {    
    var layout = FM.isset(evdata) && FM.isset(evdata.object) ? 
    evdata.object.getAttr('value','icon') : 
    'icon'
    ;
    this.setAttr('data-fmml-list-items-layout', layout);
    this.setRegistryValue("/itemsLayout",layout);
    
    this._refreshItems();
}

FM.MlHostGenericCollection.prototype.getSelectedCount = function() {
    var cnt = 0;
    FM.forEach(this.selectedItems,function(id,obj) {
        if(obj == true) cnt++;
        return true;
    });

    // kraj
    return cnt;
}

FM.MlHostGenericCollection.prototype.getFilteredCount = function() {
    var dmList = this.getDmObject();
    if(!dmList) return 0;
    
    var itemscnt = 0;
    var me = this;

    dmList.forEachListElement(function(i,oObj) {
        if (me._filterItemFromDisplay(oObj) == true) {
            itemscnt += 1;
        }
        return true;
    });
    
    return itemscnt;
}

FM.MlHostGenericCollection.prototype.onSelected = function(oSender,evdata) {
    var evObj = FM.getAttr(evdata,'object',null);
    var evCb = FM.getAttr(evdata,'callback',function(){});
    if(evObj) this.addToSelection(evObj,this._getNodeListNode(oSender.getNode()), true);
    
    // kraj
    return true;
}

FM.MlHostGenericCollection.prototype.onDeselected = function(oSender,evdata) {
    var evObj = FM.getAttr(evdata,'object',null);
    var evCb = FM.getAttr(evdata,'callback',function(){});
    
    if(evObj) this.removeFromSelection(evObj,this._getNodeListNode(oSender.getNode()), true);
    
    // kraj
    return true;
}

FM.MlHostGenericCollection.prototype.onAlterSelectionState = function(oSender,evdata) {
    var evObj = FM.getAttr(evdata,'object',null);
    var evCb = FM.getAttr(evdata,'callback',function(){});
    var id = '';
    if(oSender && evObj) {
        var inode = this._getNodeListNode(oSender.getNode());
                
        if(inode && FM.isset($(inode).attr('data-fmml-item-data-id'))) {
            id = $(inode).attr('data-fmml-item-data-id');
        }
        if(id != '') {
            if(!this.isSelected(id)) {
                this.addToSelection(id, inode, true)
            } else {
                this.removeFromSelection(id, inode, true);
            }
        }
    }
    
    // kraj
    return true;
}

FM.MlHostGenericCollection.prototype._getNodeListNode = function(node) {
    var inode = node;
    var rnode = null;
    while(inode && !FM.isset($(inode).attr('data-fmml-item-data-id'))) {
        inode = inode.parentNode;
    }

    if(FM.isset($(inode).attr('data-fmml-item-data-id'))) {
        rnode = inode;
    }
    
    return rnode;
}

FM.MlHostGenericCollection.prototype.onClearSelection = function(oSender,evdata) {
    var evObj = FM.getAttr(evdata,'object',null);
    var evCb = FM.getAttr(evdata,'callback',function(){});
    
    if(evObj) this.clearSelection(true);
    
    // kraj
    return true;
}

FM.MlHostGenericCollection.prototype.onNextPage = function() {
    var dmList = this.getDmObject();
    if(!dmList) return (true);
    var maxitms = parseInt(this.getAttr('data-fmml-list-max-items','200'));
    var itemscnt = this.getFilteredCount();
    maxitms = FM.isset(maxitms) && maxitms > 0 ? maxitms : 200;
    var getMoreData = false;
    var calcListOffset = this.listOffset + maxitms;
    this.listOffset = calcListOffset;
    if(this.listOffset > itemscnt) {
        this.listOffset = Math.floor(itemscnt/maxitms) * maxitms;
        getMoreData = true;
    }
    
    if(this.listOffset >= itemscnt) {
        this.listOffset = this.listOffset -= maxitms;
        getMoreData = true;        
    }
    this._refreshItems();
    
    if(getMoreData && this.getAttr('data-fmml-list-get-more-at-end','false') == 'true') {
        var fromrowAttr = this.getAttr('data-fmml-fromrow-attr-name',"fromrow");
        if(fromrowAttr != '') {
            dmList.setAttr(fromrowAttr,dmList.getListSize(),false);
        }
        this.getMore();
    }
    
    // kraj
    return true;
}

FM.MlHostGenericCollection.prototype.onPreviousPage = function() {
    var dmList = this.getDmObject();
    if(!dmList) return (true);
    var maxitms = parseInt(this.getAttr('data-fmml-list-max-items','200'));
    maxitms = FM.isset(maxitms) && maxitms > 0 ? maxitms : 200;
    var itemscnt = this.getFilteredCount();
    this.listOffset -= maxitms;
    if(this.listOffset > itemscnt) {
        this.listOffset = Math.floor(itemscnt/maxitms) * maxitms;
    }
    if(this.listOffset < 0) this.listOffset = 0;
    this._refreshItems();
    // kraj
    return true;
}

FM.MlHostGenericCollection.DEF_LIST_SIZE = 5;

FM.MlHost.addHost("GenericCollection",FM.MlHostGenericCollection,'GLOBAL');
