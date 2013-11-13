/*
 * data-fmml-list-fetch-on-run - na setdmobjekt se okida (napravi fetch pa display ili samo display)
 * HC da super (Host class) kreira listu
 *    this.setAttr('data-fmml-object-class', 'List');
 *    this.setAttr('data-fmml-object-id', 'true');
 data-fmml-list-max-items 200
 data-fmml-list-items-layout icon
 data-fmml-list-items-template-base "ui.layouts.dm.[:objectClass].[:itemsLayout].html"
 var emptyTempl = this.getAttr('data-fmml-list-items-template-empty', '');
 * items container unutar templatea (ovo su css klase)
 .fmmlListItems
 -> .fmmlListItemsTemplate - node koji definira template za iteme (napr. <div fmml-host=''...)
 -> .fmmlListEmptyTemplate - ako je fixan broj rowowa popuni razne sa ovim templateom
 -> .fmmlListEmpty - ako je lista prazna ubaci u fmmlListItems ovaj template (napr. <div>List is empty</div>
 -> .fmmlListWaiting - obaci u fmmlListItems kad je fetch u toku
 -> .fmmlListItemWrapper - zawrapaj svaki item unutra ovog
 -> .fmmlListItemInner (unutra ide sadrzaj) - ako postoji item ne ide direktno u .fmmlListItemWrapper nego unutar ovog
 */



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
FM.MlHostGenericCollection = FM.defineClass('MlHostGenericCollection', FM.MlHost);


FM.MlHostGenericCollection.prototype._init = function(app, attrs, node) {
    this._super("_init", app, attrs, node);
    this.objectSubClass = "GenericCollection";

    // selection
    this.selectedItems = {};
    this.maxSelected = -1;
    this.listOffset = 0;
    
    // important, app.getCustomObject()!
    this.setAttr('data-fmml-object-class', 'List');
    this.setAttr('data-fmml-object-id', 'true');

    // maximum number of items display
    this.maxItms = FM.MlHostGenericCollection.DEF_LIST_SIZE;
    try {
        this.maxItms = parseInt(
            this.getAttr(
                'data-fmml-list-max-items', 
                FM.MlHostGenericCollection.DEF_LIST_SIZE
            )
        );
    } catch (e) {
        // log error
    }
    this.maxItms = this.maxItms && this.maxItms > 0 ? 
        this.maxItms : 
        FM.MlHostGenericCollection.DEF_LIST_SIZE
    ;

    // items layout (use it for template name selection in template)
    this.itemsLayout = this.getAttr('data-fmml-list-items-layout', 'icon');

    // items template (used if listItemsTemplate node is not defined)
    this.itemsTemplateBase = this.getAttr(
            'data-fmml-list-items-template-base',
            "ui.layouts.dm.[:objectClass].[:itemsLayout].html"
            );

    // empty item template (used if listEmptyTemplate is not defined)
    this.itemsTemplateEmptyBase = this.getAttr('data-fmml-list-items-template-empty', '');

    // find items container if exists, otherwise this.node is container
    this.listItemsContainer = this._findNodeWithClass(this.node, 'fmmlListItems', this.node);

    // find items template node if exists
    var itmTempl = this._findNodeWithClass(this.listItemsContainer, 'fmmlListItemsTemplate', null);
    this.listItemsTemplate = itmTempl ? FM.nodeToHtml(itmTempl) : null;

    // find items empty template node if exists
    var itmTempl = this._findNodeWithClass(this.listItemsContainer, 'fmmlListEmptyTemplate', null);
    this.listEmptyTemplate = itmTempl ? FM.nodeToHtml(itmTempl) : null;

    // find list empty node if exists
    this.listEmpty = this._findNodeWithClass(this.listItemsContainer, 'fmmlListEmpty', null);

    // find list waiting node if exists
    this.listWaiting = this._findNodeWithClass(this.listItemsContainer, 'fmmlListWaiting', null);

    // find items wrapper. if fond all items will be wrapped inside before adding to container
    this.listItemsWrapper = this._findNodeWithClass(this.listItemsContainer, 'fmmlListItemWrapper', null);

    // fmmlListItemInner (if found inside this.listItemsWrapper)
    this.listItemsInner = this.listItemsWrapper ?
            this._findNodeWithClass(this.listItemsWrapper, 'fmmlListItemInner', null) :
            null
            ;

    // clear
    this._clearItems();
}

FM.MlHostGenericCollection.prototype.run = function(oObj) {
    this.clearSelection(false);
    this.history = [];

    this._super("run", oObj); // list will be created
}

FM.MlHostGenericCollection.prototype.dispose = function() {
    this.maxSelected = 0;
    this.selectedItems = {};
    this._clearItems();
    this._super("dispose");
}

FM.MlHostGenericCollection.prototype.setDmObject = function(o) {
    o = o && o.getData ? o : null;

    this._super('setDmObject', o);
    if (o && this.getAttr('data-fmml-list-fetch-on-run', 'true') != 'false') {
        this.history.push(o.getAttr());
        o.getData();
    } else {
        this._refreshItems();
    }
}

// SELECTION
FM.MlHostGenericCollection.prototype.clearSelection = function(sendevent) {
    this.selectedItems = {};
    $(this.listItemsContainer).find(".fmmlSelected").removeClass("fmmlSelected");
    if (FM.isset(sendevent) && sendevent)
        this.updateAllObservers();
}

FM.MlHostGenericCollection.prototype.addToSelection = function(o, node, sendevent) {
    if (this.maxSelected == 0) {
        return;
    } else if (this.maxSelected == 1) {
        this.clearSelection(false);
    } else if (this.maxSelected != -1) {
        var cnt = 0;
        FM.forEach(this.selectedItems, function(id, obj) {
            if (obj == true)
                cnt++;
            return true;
        });
        if (cnt >= this.maxSelected)
            return;
    }

    if (FM.isArray(o)) {
        for (var i = 0; i < o.length; i++) {
            this.selectedItems[o[i].getDataID()] = true;
        }
    } else {
        var oid = FM.isset(o) && o ?
                (FM.isString(o) ? o : o.getDataID()) :
                ''
                ;
        this.selectedItems[oid] = true;
    }
    if (FM.isset(node) && node)
        $(node).addClass("fmmlSelected");
    if (FM.isset(sendevent) && sendevent)
        this.updateAllObservers();
}

FM.MlHostGenericCollection.prototype.removeFromSelection = function(o, node, sendevent) {
    if (FM.isArray(o)) {
        for (var i = 0; i < o.length; i++) {
            if (FM.isset(o[i]) && o[i] && FM.isset(this.selectedItems[o[i].getDataID()])) {
                this.selectedItems[o[i].getDataID()] = false;
            }
        }
    } else {
        var oid = FM.isset(o) && o ?
                (FM.isString(o) ? o : o.getDataID()) :
                ''
                ;
        if (FM.isset(this.selectedItems[oid]))
            this.selectedItems[oid] = false;
    }

    if (FM.isset(node) && node)
        $(node).removeClass("fmmlSelected");
    if (FM.isset(sendevent) && sendevent)
        this.updateAllObservers();
}

FM.MlHostGenericCollection.prototype.isSelected = function(o) {
    var id = FM.isset(o) && o ?
            (FM.isString(o) ? o : o.getDataID()) :
            '';
    return(id != '' && FM.isset(this.selectedItems[id]) && this.selectedItems[id]);
}

FM.MlHostGenericCollection.prototype.getSelectionSize = function() {
    var cnt = 0;
    FM.forEach(this.selectedItems, function(id) {
        cnt++;
        return true;
    });

    return cnt;
}

FM.MlHostGenericCollection.prototype.getSelection = function() {
    var lst = this.getDmObject();
    var sel = [];

    if (lst) {
        FM.forEach(this.selectedItems, function(id) {
            var o = lst.get(id);
            if (o)
                sel.push(o);
            return true;
        });
    }
    return sel;
}

FM.MlHostGenericCollection.prototype.onClearSelection = function(oSender, evdata) {
    var evObj = FM.getAttr(evdata, 'object', null);
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });

    if (evObj)
        this.clearSelection(true);

    // kraj
    return true;
}

// PAGING
FM.MlHostGenericCollection.prototype.onNextPage = function() {
    var dmList = this.getDmObject();
    if (!dmList)
        return (true);
    var maxitms = parseInt(this.getAttr('data-fmml-list-max-items', '200'));
    var itemscnt = this.getFilteredCount();
    maxitms = FM.isset(maxitms) && maxitms > 0 ? maxitms : 200;
    var getMoreData = false;
    var calcListOffset = this.listOffset + maxitms;
    this.listOffset = calcListOffset;
    if (this.listOffset > itemscnt) {
        this.listOffset = Math.floor(itemscnt / maxitms) * maxitms;
        getMoreData = true;
    }

    if (this.listOffset >= itemscnt) {
        this.listOffset = this.listOffset -= maxitms;
        getMoreData = true;
    }
    this._refreshItems();

    if (getMoreData && this.getAttr('data-fmml-list-get-more-at-end', 'false') == 'true') {
        var fromrowAttr = this.getAttr('data-fmml-fromrow-attr-name', "fromrow");
        if (fromrowAttr != '') {
            dmList.setAttr(fromrowAttr, dmList.getListSize(), false);
        }
        this.getMore();
    }

    // kraj
    return true;
}

FM.MlHostGenericCollection.prototype.onPreviousPage = function() {
    var dmList = this.getDmObject();
    if (!dmList)
        return (true);
    var maxitms = parseInt(this.getAttr('data-fmml-list-max-items', '200'));
    maxitms = FM.isset(maxitms) && maxitms > 0 ? maxitms : 200;
    var itemscnt = this.getFilteredCount();
    this.listOffset -= maxitms;
    if (this.listOffset > itemscnt) {
        this.listOffset = Math.floor(itemscnt / maxitms) * maxitms;
    }
    if (this.listOffset < 0)
        this.listOffset = 0;
    this._refreshItems();
    // kraj
    return true;
}

// eventi
FM.MlHostGenericCollection.prototype.onChange = function(oSender, evdata) {
    this._super("onChange", oSender, evdata);

    var evObj = FM.getAttr(evdata, 'object', null);
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });

    if (
            oSender && oSender.getClassName && oSender.getClassName() == 'DmList' &&
            this.getAttr('data-fmml-list-refresh-on-change', 'true') != 'false'
            ) {
        var fromrowAttr = this.getAttr('data-fmml-fromrow-attr-name', "fromrow");
        if (fromrowAttr != '') {
            oSender.setAttr(fromrowAttr, '0', false);
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
    if (dmList && FM.isset(dmList, "getData")) {
        dmList.getData(true);
    }
}

FM.MlHostGenericCollection.prototype.onGetMore = function(oSender, evdata) {
    this.getMore();
}

FM.MlHostGenericCollection.prototype.onRefresh = function(oSender, evdata) {
    var dmList = this.getDmObject();
    if (dmList && FM.isset(dmList, "getData")) {
        dmList.getData(false);
    }
}

FM.MlHostGenericCollection.prototype.onHistoryBack = function(oSender, evdata) {
    if (this.history.length > 1) {
        var mydata = this.history.pop(); // me
        var data = this.history.pop(); // last

        var dmList = this.getDmObject();
        if (dmList && FM.isset(dmList, "getData")) {
            FM.forEach(data, function(n, v) {
                dmList.setAttr(n, v);
                return true;
            });
            //dmList.getData(false);
            dmList.setChanged(true, true);
            if (this.getAttr('data-fmml-list-refresh-on-change', 'true') != 'true') {
                dmList.getData(false);
            }
        }

    }
}

FM.MlHostGenericCollection.prototype.onAddObjectToList = function(oSender, evdata) {
    var oObj = FM.getAttr(evdata, 'object', null);
    if (!oObj)
        return false;
    var dmList = this.getDmObject();
    if (dmList) {
        dmList.addToList(oObj, oObj.getDataID(), true);
    }
    return true;
}

FM.MlHostGenericCollection.prototype.onOpenObject = function(oSender, evdata) {
    var oObj = FM.getAttr(evdata, 'object', null);
    if (!oObj)
        return;
    var id = oObj.getAttr('value', '');
    if (id == '')
        return;
    var lst = this.getDmObject();
    var dmObj = lst ? lst.get(id) : null;
    if (dmObj && this.getApp().openObject) {
        this.getApp().openObject(dmObj);
    }
}

FM.MlHostGenericCollection.prototype.onChangeResource = function(oSender, evdata) {
    var oObj = FM.getAttr(evdata, 'object', null);
    if (!oObj)
        return;

    var resurl = oObj.getAttr('resource_url', oObj.getAttr('value', ''));
    if (resurl != '') {
        var resResolvFn = this.getAttr('data-fmml-list-attr-resource-parser', '');
        if (resResolvFn !== '') {
            resResolvFn = FM.stringPtrToObject(resResolvFn, this, this.getApp());
            if (resResolvFn) {
                try {
                    resurl = resResolvFn(this, resurl);
                } catch (e) {
                    this.log(e, FM.logLevels.error, 'onChangeResource');
                }
            }
        }
        this.listOffset = 0;
        var dmList = this.getDmObject();
        if (dmList) {
            dmList.setAttr('resource_url', resurl, true);
        }
    }
}

FM.MlHostGenericCollection.prototype.onListStart = function(sender) {
    this.setWaiting();
    this.sendEventToObservers(sender, "onListStart", {});
    // kraj
    return true;
}


FM.MlHostGenericCollection.prototype.onListEnd = function(sender) {
    this.sendEventToObservers(sender, "onListEnd", {});
    this.updateAllObservers();
    this._refreshItems();
    // kraj
    return true;
}

FM.MlHostGenericCollection.prototype.onListError = function(sender) {
    this.sendEventToObservers(sender, "onListError", {});
    this.updateAllObservers();
    this._setListEmpty();
    return true;
}

FM.MlHostGenericCollection.prototype.setWaiting = function() {

    if (this.listWaiting) {
        var wnode = $(this.listWaiting).clone()[0];
        if (this.getAttr('data-fmml-list-waiting-fs', 'true') == 'true') {
            $(wnode).width('100%');
            $(wnode).height($(this.listItemsContainer).height());
            this._clearItems();
        }
        $(this.listItemsContainer).append(wnode);
        FM.MlHost.initChildNodes(this.getApp(), wnode, this.getDmObject());
    }
}

FM.MlHostGenericCollection.prototype.onChangeListLayout = function(sender, evdata) {
    var layout = FM.isset(evdata) && FM.isset(evdata.object) ?
            evdata.object.getAttr('value', 'icon') :
            'icon'
            ;
    this.setAttr('data-fmml-list-items-layout', layout);
    this.setRegistryValue("/itemsLayout", layout);

    this._refreshItems();
}

FM.MlHostGenericCollection.prototype.getSelectedCount = function() {
    var cnt = 0;
    FM.forEach(this.selectedItems, function(id, obj) {
        if (obj == true)
            cnt++;
        return true;
    });

    // kraj
    return cnt;
}

FM.MlHostGenericCollection.prototype.getFilteredCount = function() {
    var dmList = this.getDmObject();
    if (!dmList)
        return 0;

    var itemscnt = 0;
    var me = this;

    dmList.forEachListElement(function(i, oObj) {
        if (me._filterItemFromDisplay(oObj) == true) {
            itemscnt += 1;
        }
        return true;
    });

    return itemscnt;
}

FM.MlHostGenericCollection.prototype.onSelected = function(oSender, evdata) {
    var evObj = FM.getAttr(evdata, 'object', null);
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });
    if (evObj)
        this.addToSelection(evObj, this._getNodeListNode(oSender.getNode()), true);

    // kraj
    return true;
}

FM.MlHostGenericCollection.prototype.onDeselected = function(oSender, evdata) {
    var evObj = FM.getAttr(evdata, 'object', null);
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });

    if (evObj)
        this.removeFromSelection(evObj, this._getNodeListNode(oSender.getNode()), true);

    // kraj
    return true;
}

FM.MlHostGenericCollection.prototype.onAlterSelectionState = function(oSender, evdata) {
    var evObj = FM.getAttr(evdata, 'object', null);
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });
    var id = '';
    if (oSender && evObj) {
        var inode = this._getNodeListNode(oSender.getNode());

        if (inode && FM.isset($(inode).attr('data-fmml-item-data-id'))) {
            id = $(inode).attr('data-fmml-item-data-id');
        }
        if (id != '') {
            if (!this.isSelected(id)) {
                this.addToSelection(id, inode, true)
            } else {
                this.removeFromSelection(id, inode, true);
            }
        }
    }

    // kraj
    return true;
}

// private
FM.MlHostGenericCollection.prototype._findNodeWithClass = function(parent, cls, def) {
    var node = $(parent).find("." + cls);
    return (node && node.length && node.length > 0 ? node[0] : def);
}

FM.MlHostGenericCollection.prototype._clearItems = function() {
    FM.MlHost.disposeChildNodes(this.listItemsContainer);
    $(this.listItemsContainer).html("");
}

FM.MlHostGenericCollection.prototype._nodeApplyTemplate = function(node, attrs) {
    FM.forEach(node.attributes, function(i, attr) {
        if (attr.specified == true) {
            var val = FM.applyTemplate(attrs, attr.value, false, false);
            if (val != attr.value) {
                attr.value = val;
            }
        }
        return true;
    });

}

FM.MlHostGenericCollection.prototype._refreshItems = function() {
    this._clearItems();
    var dmList = this.getDmObject();
    if (!dmList) {
        return false;
    }
    var me = this;
    var curitm = -1;
    var itmcnt = 0;

    // first display items
    dmList.forEachListElement(function(i, oObj) {
        if (me._filterItemFromDisplay(oObj) == true) {
            curitm++;
            if (curitm < me.listOffset) {
                return true;
            }
            var attrs = oObj.getAttr();
            attrs["objectClass"] = oObj.getSubClassName();
            attrs["data_id"] = oObj.getDataID();
            attrs["listIndex"] = curitm + 1;
            attrs["itemsLayout"] = me.itemsLayout;

            itmcnt++;
            if (me.listItemsTemplate) {
                me._createItmNode(oObj, attrs, me.listItemsTemplate);
            } else {
                var tname = FM.applyTemplate(attrs, me.itemsTemplateBase, false, true);
                FM.UtTemplate.getTemplate(me.getApp(), attrs, tname, function(isok, templ) {
                    if (isok) {
                        me._createItmNode(oObj, attrs, templ);
                    }
                });
            }
        }

        return me.maxItms > itmcnt;
    });

    var emptyTempl = this.getAttr('data-fmml-list-items-template-empty', '');
    if (this.maxitms > itmcnt && (this.itemsTemplateEmptyBase != '' || this.listEmptyTemplate)) {
        if (this.listEmptyTemplate) {
            while (this.maxItms > itmcnt) {
                var attrs = {};
                attrs["objectClass"] = 'unknown';
                attrs["data_id"] = 'unknown';
                attrs["listIndex"] = curitm + 1;
                attrs["itemsLayout"] = me.itemsLayout;
                curitm++;
                itmcnt++;
                this._createItmNode(null, attrs, this.listEmptyTemplate);
            }
        } else {
            var tname = FM.applyTemplate(attrs, this.itemsTemplateEmptyBase, false, true);
            FM.UtTemplate.getTemplate(this.getApp(), {}, tname, function(isok, templ) {
                if (isok) {
                    while (me.maxItms > itmcnt) {
                        curitm++;
                        itmcnt++;
                        var attrs = {
                            itemsLayout: me.itemsLayout,
                            objectClass: 'unknown',
                            data_id: 'unknown',
                            listIndex: curitm
                        };
                        me._createItmNode(null, attrs, templ);
                    }
                }
            });
        }
    }

    // empty list
    if (itmcnt == 0 && this.listEmpty == '') {
        this._setListEmpty();
    }

    // send event
    this.sendEventToObservers(this, 'onListRefreshCompleted');
}

FM.MlHostGenericCollection.prototype._createItmNode = function(oObj, attrs, templ) {
    var iNode;
    var curitm = parseInt(FM.getAttr(attrs, 'listIndex', '0'));

    // create node for data (from template)
    var itm = $(templ);
    if (!itm) {
        return;
    }

    // if inner node is defined append itm as child of inner node
    if (this.listItemsInner) {
        iNode = $(this.listItemsInner).clone();
        if (FM.isArray(iNode) && iNode.length > 0) {
            iNode = iNode[0];
        }
        $(iNode).append(itm);
        itm = iNode;
    }

    // if wrapper is defined
    if (this.listItemsWrapper) {
        var iNode = $(this.listItemsWrapper).clone();
        if (FM.isArray(iNode) && iNode.length > 0) {
            iNode = iNode[0];
        }        
        $(iNode).append(itm);
        itm = iNode;
    }
    this._nodeApplyTemplate(itm, attrs);

    $(itm).attr('data-fmml-list-index', curitm);
    $(itm).addClass(curitm & 1 ? 'fmmlRowOdd' : 'fmmlRowEven');
    $(itm).attr('data-fmml-item-data-id', oObj ? oObj.getDataID() : 'unknown');

    this._appendItmNode(oObj, itm, curitm);
}

FM.MlHostGenericCollection.prototype._appendItmNode = function(oObj, node, index) {
    var lastNode = null;
    var lastNodeIndex = -1;
    for (var i = index - 1; i >= 0 && lastNodeIndex == -1; i--) {
        lastNode = $(this.listItemsContainer).children("[data-fmml-list-index='" + i + "']");
        lastNode = lastNode.length ? lastNode[0] : null;
        if (lastNode) {
            lastNodeIndex = i;
        }
    }
    if (lastNode) {
        $(lastNode).after(node);
    } else {
        $(this.listItemsContainer).prepend(node);
    }
    
    // ML init
    //if (oObj) {
    FM.MlHost.initChildNodes(this.getApp(), node, oObj, this.listItemsWrapper != null);
    //}
}

FM.MlHostGenericCollection.prototype._filterItemFromDisplay = function(oObj) {
    return true;
}

FM.MlHostGenericCollection.prototype._setListEmpty = function() {
    if (this.listEmpty) {
        var enode = $(this.listEmpty).clone()[0];
        this._clearItems();
        $(this.listItemsContainer).append(enode);
        FM.MlHost.initChildNodes(this.getApp(), enode, this.getDmObject());
    }
}


FM.MlHostGenericCollection.prototype._getNodeListNode = function(node) {
    var inode = node;
    var rnode = null;
    while (inode && !FM.isset($(inode).attr('data-fmml-item-data-id'))) {
        inode = inode.parentNode;
    }

    if (FM.isset($(inode).attr('data-fmml-item-data-id'))) {
        rnode = inode;
    }

    return rnode;
}


FM.MlHostGenericCollection.DEF_LIST_SIZE = 5;

FM.MlHost.addHost("GenericCollection", FM.MlHostGenericCollection, 'GLOBAL');
