/**
 * Generic collection ML Host class. Use it to display list of items.
 * 
 * <ul>
 * <li>All list items will be inserted in node with <i>fmmlListItems</i> CSS class.
 * If inside <i>fmmlListItems</i> node exists node with <i>fmmlListItemWrapper</i> CSS class all
 * items will be wrapped inside this node before insertion.
 * </li>
 * <li>If inside <i>fmmlListItems</i> node exists node with <i>fmmlListItemInner</i> CSS class all
 * items will be wrapped inside this node before insertion in (posibly) <i>fmmlListItemWrapper</i>
 * and <i>fmmlListItems</i> node.
 * </li>
 * <li>If inside <i>fmmlListItems</i> node exists node with <i>fmmlListItemsTemplate</i> CSS class it 
 * will be used as list items template. 
 * </li>
 * <li>If inside <i>fmmlListItems</i> node exists node with <i>fmmlListEmptyTemplate</i> CSS class it 
 * will be used as placeholder for empty rows. 
 * </li>
 * <li>If inside <i>fmmlListItems</i> node exists node with <i>fmmlListEmpty</i> CSS class it 
 * will be used as <i>fmmlListItems</i> node content when items list is empty. 
 * </li>
 * <li>If inside <i>fmmlListItems</i> node exists node with <i>fmmlListWaiting</i> CSS class it 
 * will be used as <i>fmmlListItems</i> node content during AJAX calls. 
 * </li>
 * <ul>
 *  
 * @class FM.MlHostGenericCollection
 * @memberOf FM
 * @extends FM.MlHost
 * @param {FM.AppObject} app application object.
 * @param {object} [attrs] DOM node attributes.
 * @param {DOMnode} node DOM node. 
 * List of DOM attributes (check inherited attributes too):
 * <table class="fm-mlattrs">
 *  <thead>
 *   <tr>
 *    <th>Name</th><th>description</th><th>Default</th>
 *   </tr>
 *  </thead>
 *  <tbody>
 *   <tr>
 *    <td>data-fmml-list-max-items</td>
 *    <td>Maximum number of list items to disply at once.</td>
 *    <td>FM.MlHostGenericCollection.DEF_LIST_SIZE</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-selection-size</td>
 *    <td>Maximum number of selectable items.</td>
 *    <td>[any],0,1,,,n</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-items-template-base</td>
 *    <td>
 *      Items template (used if node with <i>listItemsTemplate</i> class is not defined).
 *    </td>
 *    <td>ui.layouts.dm.[:objectClass].[:itemsLayout].html</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-items-layout</td>
 *    <td>
 *      Items layout. Use it for template name selection in template name (see <i>data-fmml-list-items-template-base</i>),      
 *    </td>
 *    <td>icon</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-items-template-empty</td>
 *    <td>
 *      Empty list placeholder template (used if node with <i>listEmptyTemplate</i> class is not defined)).
 *    </td>
 *    <td>-</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-fetch-on-run</td>
 *    <td>
 *      Get list data on host run.
 *    </td>
 *    <td>true</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-get-more-at-end</td>
 *    <td>
 *      Get more data if end of list is reached on <i>onNext</i> and <i>onNextPage</i> events processiog. 
 *    </td>
 *    <td>false</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-refresh-on-change</td>
 *    <td>
 *      Refresh list data on <i>onChange</i> event.
 *    </td>
 *    <td>true</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-list-clear-selection-on-change</td>
 *    <td>
 *      Clear sellection on <i>onChange</i> event.
 *    </td>
 *    <td>true</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-object-class</td>
 *    <td>
 *      Restrict host DM object to one with given class. This value is olways <i>List</i> for this host type.
 *    </td>
 *    <td>List</td>
 *   </tr>
 *   <tr>
 *    <td>data-fmml-object-id</td>
 *    <td>
 *      This value is allways <i>true</i> for this host type: call fetch function with object containing all
 *      attributes defined with <i>data-fmml-object-attr-[attr]</i>. 
 *      See <i>data-fmml-list</i> attribute to learn how to define FM.DmList configuration.
 *    </td>
 *    <td>true</td>
 *   </tr>
 *  </tbody>
 * </table>
 * 
 * @example 
    &lt;!-- example of HTML template --&gt;
    &lt;div data-fmml-host=&quot;GenericCollection&quot; data-fmml-list=&quot;list_configuration_name&quot;&gt;
        &lt;div class=&quot;fmmlListItems&quot;&gt;
            &lt;div class=&quot;fmmlListItemWrapper&quot; data-fmml-observer=&quot;Event&quot; data-fmml-event-type=&quot;onAlterSelectionState&quot; data-fmml-event-data=&quot;[:data_id]&quot;&gt;
            &lt;/div&gt;
            &lt;div class=&quot;fmmlListItemsTemplate&quot; data-fmml-host=&quot;Host&quot;&gt;
               &lt;span data-fmml-observer=&quot;Observer&quot; data-fmml-attr-name=&quot;atr1&quot;&gt;&lt;/span&gt;
               &lt;span data-fmml-observer=&quot;Observer&quot; data-fmml-attr-name=&quot;atr2&quot;&gt;&lt;/span&gt;
               &lt;span data-fmml-observer=&quot;Observer&quot; data-fmml-attr-name=&quot;atr3&quot;&gt;&lt;/span&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
 */

FM.MlHostGenericCollection = FM.defineClass('MlHostGenericCollection', FM.MlHost);


FM.MlHostGenericCollection.prototype._init = function(app, attrs, node) {
    this._super("_init", app, attrs, node);
    this.objectSubClass = "GenericCollection";

    // important, app.getCustomObject()!
    this.setAttr('data-fmml-object-class', 'List');
    this.setAttr('data-fmml-object-id', 'true');

    // pagging
    this.listOffset = 0;

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

    // selection
    this.selectedItems = {};

    // maximum number of items to select
    try {
        this.maxSelected = parseInt(
                this.getAttr('data-fmml-list-selection-size', '0') == 'any' ?
                -1 : this.getAttr('data-fmml-list-selection-size', '0')
                );
    } catch (e) {
        // log error
        this.maxSelected = 0;
        this.log(e, FM.logLevels.error, 'MlHostGenericCollection._init');
    }


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

/**
 * Run host.
 * 
 * @public
 * @function
 * @param {FM.DmObject} [dmObj] Host DM object.
 */
FM.MlHostGenericCollection.prototype.run = function(oObj) {
    this.clearSelection(false);
    this.history = [];

    this._super("run", oObj); // list will be created
}

/**
 * Dispose host.
 * 
 * @public
 * @function 
 */
FM.MlHostGenericCollection.prototype.dispose = function() {
    this.maxSelected = 0;
    this.selectedItems = {};
    this._clearItems();
    this._super("dispose");
}

/**
 * Set host DM object.
 * 
 * @public
 * @function 
 * @param {FM.DmObject} o New host DM object. <i>onSetDmObject</i> event will be fired. 
 */
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

/**
 * Get number of items to display.
 * 
 * @public
 * @function 
 * @returns  {number}
 * 
 */
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

/**
 * Clear selection.
 * 
 * @public
 * @function 
 * @param {boolean} [sendevent=false] Update observers after selection change.
 * 
 */
FM.MlHostGenericCollection.prototype.clearSelection = function(sendevent) {
    this.selectedItems = {};
    var nodes = $(this.listItemsContainer).find(
            "[data-fmml-list-id='" + this.getID() + "']"
            ).filter(".fmmlSelected");

    if (nodes.length > 0) {
        nodes.removeClass("fmmlSelected");
        if (FM.isset(sendevent) && sendevent) {
            this.updateAllObservers();
        }
    }
}

/**
 * Add object to selection.
 * 
 * @function
 * @public
 * @param {string|FM.Object} o DM object or DM object data ID.
 * @param {boolean} [sendevent=false] Update observers after selection change.
 */
FM.MlHostGenericCollection.prototype.addToSelection = function(o, sendevent) {
    if (this.maxSelected == 0) {
        return;
    }

    if (FM.isArray(o)) {
        for (var i = 0; i < o.length; i++) {
            this.addToSelection(o[i], node, false);
        }
        if (FM.isset(sendevent) && sendevent) {
            this.updateAllObservers();
        }
        return;
    }

    var lst = this.getDmObject();
    var oid = FM.isset(o) && o ?
            (FM.isString(o) ? o : o.getDataID()) :
            ''
            ;
    if (!lst || !lst.get(oid)) {
        return;
    }

    if (this.maxSelected == 1) {
        this.clearSelection(false);
    } else if (this.maxSelected != -1) {
        if (this.getSelectionSize() >= this.maxSelected)
            return;
    }

    this.selectedItems[oid] = true;


    var node = $(this.listItemsContainer).children("[data-fmml-item-data-id='" + oid + "']");
    node = node && node.length ? node[0] : null;

    if (FM.isset(node) && node) {
        $(node).addClass("fmmlSelected");
    }
    if (FM.isset(sendevent) && sendevent) {
        this.updateAllObservers();
    }
}

/**
 * Remove object from selection.
 * 
 * @function
 * @public
 * @param {string|FM.Object} o DM object or DM object data ID.
 * @param {boolean} [sendevent=false] Update observers after selection change.
 */
FM.MlHostGenericCollection.prototype.removeFromSelection = function(o, sendevent) {
    if (FM.isArray(o)) {
        for (var i = 0; i < o.length; i++) {
            this.removeFromSelection(o[i], node, false);
        }
        if (FM.isset(sendevent) && sendevent) {
            this.updateAllObservers();
        }
        return;
    }

    var oid = FM.isset(o) && o ?
            (FM.isString(o) ? o : o.getDataID()) :
            ''
            ;
    if (FM.isset(this.selectedItems[oid])) {
        delete this.selectedItems[oid];
    }

    var node = $(this.listItemsContainer).children("[data-fmml-item-data-id='" + oid + "']");
    node = node && node.length ? node[0] : null;

    if (FM.isset(node) && node) {
        $(node).removeClass("fmmlSelected");
    }

    if (FM.isset(sendevent) && sendevent) {
        this.updateAllObservers();
    }
}
/**
 * Check if object is selected.
 * 
 * @function
 * @public
 * @param {string|FM.Object} o DM object or DM object data ID.
 * @returns {boolean}
*/
FM.MlHostGenericCollection.prototype.isSelected = function(o) {
    var id = FM.isset(o) && o ?
            (FM.isString(o) ? o : o.getDataID()) :
            '';
    return(id != '' && FM.isset(this.selectedItems[id]));
}

/**
 * Get number of selected items.
 * 
 * @public
 * @function 
 * @returns  {number}
 * 
 */
FM.MlHostGenericCollection.prototype.getSelectionSize = function() {
    var cnt = 0;
    FM.forEach(this.selectedItems, function() {
        cnt++;
        return true;
    });

    return cnt;
}

/**
 * Get selected items.
 * 
 * @public
 * @function 
 * @returns  {Array[FM.DmObject]}
 * 
 */
FM.MlHostGenericCollection.prototype.getSelection = function() {
    var lst = this.getDmObject();
    var sel = [];

    if (lst) {
        FM.forEach(this.selectedItems, function(id) {
            var o = lst.get(id);
            if (o) {
                sel.push(o);
            }
            return true;
        });
    }
    return sel;
}

/**
 * Signal request for selection clearing. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 */
FM.MlHostGenericCollection.prototype.onClearSelection = function(sender) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });
    this.clearSelection(true);
    evCb(true, null);
}

/**
 * Signal request for additeng  list item to selection. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {FM.DmObject|string} [evdata.object] FM.DmObject or data ID to select.
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onSelected = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });

    var itmObj = this._getEventItem(oSender, FM.getAttr(evdata, 'object', null));
    if (!itmObj) {
        evCb(false, null);
        return;
    }
    if (!this.isSelected(itmObj)) {
        this.addToSelection(itmObj, true)
    }
    if (this.isSelected(itmObj)) {
        evCb(true, itmObj);
    } else {
        evCb(false, null);
    }
}

/**
 * Signal request for removing list item from selection. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {FM.DmObject|string} [evdata.object] FM.DmObject or data ID to remove.
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onDeselected = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });

    var itmObj = this._getEventItem(oSender, FM.getAttr(evdata, 'object', null));
    if (!itmObj) {
        evCb(false, null);
        return;
    }

    if (this.isSelected(itmObj)) {
        this.removeFromSelection(itmObj, true)
    }
    if (!this.isSelected(itmObj)) {
        evCb(true, itmObj);
    } else {
        evCb(false, null);
    }
}

/**
 * Signal request for altering selection state of list item. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {FM.DmObject|string} [evdata.object] FM.DmObject or data ID of list item.
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onAlterSelectionState = function(oSender, evdata) {
    var itmObj = this._getEventItem(oSender, FM.getAttr(evdata, 'object', null));
    if (this.isSelected(itmObj)) {
        this.onDeselected(oSender, evdata);
    } else {
        this.onSelected(oSender, evdata);
    }
}

// PAGING
/**
 * Signals request for displaying first page of the list. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onStartOfList = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });
    this.listOffset = 0;
    this._refreshItems();
    evCb(true, null);
}

/**
 * Signals request for displaying last page of the list. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onEndOfList = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });
    this.listOffset = this.getFilteredCount() - 1;
    if (this.listOffset < 0) {
        this.listOffset = 0;
    }
    this._refreshItems();
    evCb(true, null);
}

/**
 * Signals request for increasing first list index. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onNext = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {});
    var dmList = this.getDmObject();
    if (!dmList) {
        evCb(false, null);
        return;
    }
    var itemscnt = this.getFilteredCount();

    var getMoreData = false;
    this.listOffset++;
    if (this.listOffset > itemscnt) {
        this.listOffset = itemscnt - 1;
        getMoreData = true;
    }
    if (this.listOffset < 0) {
        this.listOffset = 0;
    }

    this._refreshItems();

    if (getMoreData && this.getAttr('data-fmml-list-get-more-at-end', 'false') == 'true') {
        this._getMore();
    }
    evCb(true, null);
}

/**
 * Signals request for displaying next page of the list. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onNextPage = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });
    var dmList = this.getDmObject();
    if (!dmList) {
        evCb(true, null);
        return;
    }
    var itemscnt = this.getFilteredCount();

    var getMoreData = false;
    var calcListOffset = this.listOffset + this.maxItms;
    this.listOffset = calcListOffset;
    if (this.listOffset > itemscnt) {
        this.listOffset = Math.floor(itemscnt / this.maxItms) * this.maxItms;
        getMoreData = true;
    }

    if (this.listOffset >= itemscnt) {
        this.listOffset = this.listOffset -= this.maxItms;
        getMoreData = true;
    }
    this._refreshItems();

    if (getMoreData && this.getAttr('data-fmml-list-get-more-at-end', 'false') == 'true') {
        this._getMore();
    }
    evCb(true, null);
}

/**
 * Signals request for decreasing first list index. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onPrevious = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });
    var dmList = this.getDmObject();
    if (!dmList || this.listOffset < 1) {
        evCb(true, null);
        return;
    }
    this.listOffset--;
    this._refreshItems();
    evCb(true, null);
}

/**
 * Signals request for displaying previous page of the list. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {function} [evdata.callback] Callback function.
 */
FM.MlHostGenericCollection.prototype.onPreviousPage = function(oSender, evdata) {
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });
    var dmList = this.getDmObject();
    if (!dmList) {
        evCb(true, null);
        return;
    }

    var itemscnt = this.getFilteredCount();
    this.listOffset -= this.maxItms;
    if (this.listOffset > itemscnt) {
        this.listOffset = Math.floor(itemscnt / this.maxItms) * this.maxItms;
    }
    if (this.listOffset < 0) {
        this.listOffset = 0;
    }
    this._refreshItems();

    // kraj
    evCb(true, null);
}

// DATA (DM) EVENTS
/**
 * Fired when change on DM object attributes or properties ocurs.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 */
FM.MlHostGenericCollection.prototype.onChange = function(oSender, evdata) {
    this._super("onChange", oSender, evdata);

    var evObj = FM.getAttr(evdata, 'object', null);
    var evCb = FM.getAttr(evdata, 'callback', function() {
    });

    if (
            oSender == this.getDmObject() &&
            this.getAttr('data-fmml-list-refresh-on-change', 'true') != 'false'
            ) {
        if (this.getAttr('data-fmml-list-clear-selection-on-change', 'true') != 'false') {
            this.clearSelection(true);
        }
        this.history.push(oSender.getAttr());
        oSender.getData(false); // novi fetch
    }

    // kraj
    return true;
}

/**
 * Signals request for fetching more data from server. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 */
FM.MlHostGenericCollection.prototype.onGetMore = function(oSender) {
    this._getMore();
}

/**
 * Signals request for refreshing data from server. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 */

FM.MlHostGenericCollection.prototype.onRefresh = function(oSender) {
    var dmList = this.getDmObject();
    if (dmList && FM.isset(dmList, "getData")) {
        dmList.getData(false);
    }
}

/**
 * Signals request for adding new FM.DmObject to list of items. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {FM.DmObject} [evdata.object] FM.DmObject to add.
 */
FM.MlHostGenericCollection.prototype.onAddObjectToList = function(oSender, evdata) {
    var oObj = FM.getAttr(evdata, 'object', null);
    if (!oObj) {
        return;
    }

    var dmList = this.getDmObject();
    if (dmList) {
        dmList.addToList(oObj, oObj.getDataID(), true);
    }
}

// (DM) LIST EVENTS
/**
 * Signals start of fetching data from server. Usualy sent from FM.DmList.
 * 
 * @event
 * @public
 * @param {FM.DmList} sender Source of event.
 */
FM.MlHostGenericCollection.prototype.onListStart = function(sender) {
    this._setWaiting();
    this.sendEventToObservers(sender, "onListStart", {});
}

/**
 * Signals end of fetching data from server. Usualy sent from FM.DmList.
 * 
 * @event
 * @public
 * @param {FM.DmList} sender Source of event.
 */
FM.MlHostGenericCollection.prototype.onListEnd = function(sender) {
    this.sendEventToObservers(sender, "onListEnd", {});
    this.updateAllObservers();
    this._refreshItems();

}

/**
 * Signals error condition durring fetching data from server. Usualy sent from FM.DmList.
 * 
 * @event
 * @public
 * @param {FM.DmList} sender Source of event.
 */
FM.MlHostGenericCollection.prototype.onListError = function(sender) {
    this.sendEventToObservers(sender, "onListError", {});
    this.updateAllObservers();
    this._setListEmpty();
}

// HISTORY
/**
 * Signals request for repeating previous server request. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 */
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
            dmList.setChanged(true, true);
        }

    }
}


/**
 * General purpose event, can be handled in app.
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype.onOpenObject = function(oSender, evdata) {
    var dmObj = this._getEventItem(oSender, FM.getAttr(evdata, 'object', null));
    if (dmObj && this.getApp().openObject) {
        this.getApp().openObject(dmObj);
    }
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype.onChangeResource = function(oSender, evdata) {
    var oObj = FM.getAttr(evdata, 'object', null);
    if (!oObj)
        return;

    // GEnericValue or obj with attr resource_url
    var resurl = oObj.getAttr('resource_url', oObj.getAttr('value', ''));

    if (resurl != '') {
        var resResolvFn = this.getAttr('data-fmml-list-attr-resource-parser', '');
        if (resResolvFn !== '') {
            resResolvFn = FM.stringPtrToObject(resResolvFn, this, this.getApp());
            if (resResolvFn) {
                try {
                    resurl = resResolvFn(this, resurl);
                } catch (e) {
                    this.log(e, FM.logLevels.error, 'MlHostGenericCollection.onChangeResource');
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

/**
 * Signals request for changing layout of list items. Usualy sent to host fom Event observer.
 * 
 * @event
 * @public
 * @param {FM.Object} sender Source of event.
 * @param {object} [evdata] Event data: 
 * @param {FM.DmGenericValue} [evdata.object] FM.DmObject with attribute <i>value</i> containing
 * list layout name.
 */
FM.MlHostGenericCollection.prototype.onChangeListLayout = function(sender, evdata) {
    var layout = FM.isset(evdata) && FM.isset(evdata.object) ?
            evdata.object.getAttr('value', 'icon') :
            'icon'
            ;
    this.setAttr('data-fmml-list-items-layout', layout);
    this._refreshItems();
}


// private
/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._getMore = function() {
    var dmList = this.getDmObject();
    if (dmList && FM.isset(dmList, "getData")) {
        dmList.getData(true);
    }
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._findNodeWithClass = function(parent, cls, def) {
    var node = $(parent).find("." + cls);
    return (node && node.length && node.length > 0 ? node[0] : def);
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._clearItems = function() {
    FM.MlHost.disposeChildNodes(this.listItemsContainer);
    $(this.listItemsContainer).html("");
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._nodeApplyTemplate = function(node, attrs) {
    if (FM.isset(node.attributes)) {
        FM.forEach(node.attributes, function(i, attr) {
            if (attr.specified == true) {
                var val = FM.applyTemplate(attrs, attr.value, false, false);
                if (val != attr.value) {
                    attr.value = val;
                }
            }
            return true;
        });

        var me = this;
        $(node).children().each(function() {
            me._nodeApplyTemplate(this, attrs);
            return true;
        });
    }
    return node;
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._refreshItems = function() {
    this.log("Refresh listi items ...", FM.logLevels.debug, 'MlHostGenericCollection._refreshItems');
    this._clearItems();
    var dmList = this.getDmObject();
    if (!dmList) {
        this.log("DmList not found.", FM.logLevels.warn, 'MlHostGenericCollection._refreshItems');
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
    this.log("Done.", FM.logLevels.debug, 'MlHostGenericCollection._refreshItems');
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._createItmNode = function(oObj, attrs, templ) {
    var iNode;
    var curitm = parseInt(FM.getAttr(attrs, 'listIndex', '0'));
    this.log("Creating " + curitm + ". item ...", FM.logLevels.debug, 'MlHostGenericCollection._createItmNode');
    // create node for data (from template)
    var itm = $(templ);
    if (!itm) {
        this.log("Invalid item template.", FM.logLevels.error, 'MlHostGenericCollection._createItmNode');
        return;
    }

    // if inner node is defined append itm as child of inner node
    if (this.listItemsInner) {
        iNode = $(this.listItemsInner).clone();
        if (iNode && iNode.length) {
            iNode = iNode[0];
        }
        itm = $(iNode).append(itm);
    }

    // if wrapper is defined
    if (this.listItemsWrapper) {
        var iNode = $(this.listItemsWrapper).clone();
        if (iNode && iNode.length) {
            iNode = iNode[0];
        }
        itm = $(iNode).append(itm);
    }
    itm = itm[0];
    itm = this._nodeApplyTemplate(itm, attrs);

    $(itm).attr('data-fmml-list-index', curitm);
    $(itm).attr('data-fmml-list-id', this.getID());
    $(itm).addClass(curitm & 1 ? 'fmmlRowOdd' : 'fmmlRowEven');
    $(itm).attr('data-fmml-item-data-id', oObj && oObj.getDataID ? oObj.getDataID() : 'unknown');
    if (this.isSelected(oObj)) {
        $(itm).addClass("fmmlSelected");
    }
    this.log("" + curitm + ". created. Appending node to dom", FM.logLevels.debug, 'MlHostGenericCollection._createItmNode');
    this._appendItmNode(oObj, itm, curitm);
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._appendItmNode = function(oObj, node, index) {
    this.log("Appending " + index + ". item ...", FM.logLevels.debug, 'MlHostGenericCollection._appendItmNode');
    this.log(node, FM.logLevels.debug, 'MlHostGenericCollection._appendItmNode');
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
    this.log("Done.", FM.logLevels.debug, 'MlHostGenericCollection._appendItmNode');
    //}

}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._filterItemFromDisplay = function(oObj) {
    return true;
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._setWaiting = function() {
    if (this.listWaiting) {
        var wnode = $(this.listWaiting).clone()[0];
        $(this.listItemsContainer).append(wnode);
        FM.MlHost.initChildNodes(this.getApp(), wnode, this.getDmObject());
    }
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._setListEmpty = function() {
    if (this.listEmpty) {
        var enode = $(this.listEmpty).clone()[0];
        this._clearItems();
        $(this.listItemsContainer).append(enode);
        FM.MlHost.initChildNodes(this.getApp(), enode, this.getDmObject());
    }
}

/**
 * 
 * @ignore
 */
FM.MlHostGenericCollection.prototype._getEventItem = function(oSender, evobj) {
    var lst = this.getDmObject();
    if (!lst) {
        return null;
    }

    if (evobj.getSubClassName() == 'GenericValue') {
        return lst.get(evobj.getAttr('value'));
    }

    return lst.get(evobj.getDataID());
}

/**
 * Default number od list items to display (100).
 * 
 * @static
 * @public
 */
FM.MlHostGenericCollection.DEF_LIST_SIZE = 100;

FM.MlHost.addHost("GenericCollection", FM.MlHostGenericCollection, 'GLOBAL');
