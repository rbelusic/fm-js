/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */
/** 
 * DM list holds FM.DmObject's.
 * 
 * @class FM.DmList
 * @extends FM.DmObject
 * @memberOf FM
 * @param {object} attrs List of attribute names and values.
 * @param {object|string} config List configuration object, 
 *  list configuration name or string evaluating to configuration object.
 *  
 * @param {string} [config.listname] Name of list configration. Automaticaly set by
 *  FM.DmList.addConfiguration.
 * @param {boolean} [config.isstatic=false] Static lists newer requests data.
 * @param {boolean} [config.cache=false] Cached lists only once requests data.
 * @param {array} [config.data] Predefined data for static list type 
 * @param {string} [config.url] URL to fetch data from.
 * @param {string} [config.method] HTTP method for AJAX call.
 * @param {string} [config.contentType='application/x-www-form-urlencoded'] HTTP content type for AJAX call.
 * @param {object} [config.headers] HTTP headers to send with AJAX call.
 * @param {string} [config.responseFormat='TEXT'] TEXT or JSON.
 * @param {object} [config.params={}] object containing list of AJAX call arguments (that mus't be valid list attributes).
 *  The value of property dasn't metter. 
 * @param {object} [config.auth] Object containing username and password properties.
 * @param {string} [config.responseClass='Object'] Class name to expect in response.
 * @param {function|string} [config.getFetchArguments] Function (or string evaluating to function) 
 *  returning object with fetch arguments and accepting object 
 *  {dmList: <list>, getMore: true|false} as argument.
 * @param {function|string} [config.isErrorResponse] Function (or string evaluating to function) 
 *  for checking responsefor errors (returns true or false)
 *  and accepting object {dmList: <list>, utAjax: oAjax, response: response} as argument.
 * @param {function|string} [config.errorParser] Function (or string evaluating to function) 
 *  responsible for parsing response to some error class instance (GenericError usualy) 
 *  and accepting object {dmList: <list>, utAjax: oAjax, response: response} as argument.
 * @param {function|string} [config.responseParser] Function (or string evaluating to function) 
 *  responsible for parsing part of response to DM object.
 *  and accepting object {dmList: <list>, response: <response>, raw: <complete response>} as argument.
 * @param {string} [config.listType='collection'] Determines if AJAX call return single, collection or none of objects.
 * @param {string} [config.dataProperty] AJAX response JSON data property containing requested objects.
 * @param {string} [config.validResponseCodes] List of valid HTTP responses separated by comas.
 * @param {string} [config.pageAttribute] FM.DmList attribute acting as fetch argument for requested page number.
 * @param {string} [config.pageSizeAttribute] FM.DmList attribute acting as fetch argument for page size.
 * @param {string} [config.fromRowAttribute] FM.DmList attribute acting as fetch argument for first row to fetch.
 * @param {string} [config.numRowsAttribute] FM.DmList attribute acting as fetch argument for response size.
 *  
 * @param {FM.AppObject} app application object.
 */
FM.DmList = FM.defineClass('DmList', FM.DmObject);


FM.DmList.prototype._init = function(attrs, config, app) {
    this.objectsList = {};
    this.listIndex = [];
    this.setApp(app);

    // ajax
    this.lastFetchTime = null;
    this.lastFetchEndTime = null;
    this.lastFetchArgs = null;
    this.lastFetchedArgs = null;

    this._super("_init", attrs);
    this.objectSubClass = "List";

    // list configuration
    config = FM.isset(config) && config ? config : null;
    if (FM.isString(config)) {
        if (FM.DmList.getConfiguration(this.app, config)) {
            config = FM.cloneObject(FM.DmList.getConfiguration(this.app, config));
        } else {
            config = FM.stringPtrToObject(config);
        }
    }

    this.setProperty('config', config && FM.isObject(config) ? config : {}, false);

    // static predefined list
    var data = this.getProperty('config.data', null);
    if (data && FM.isArray(data)) {
        this._addPredefinedData(data);
    }

}

/**
 * Returns object application instance.
 * 
 * @returns {FM.AppObject}
 * 
 */
FM.DmList.prototype.getApp = function() {
    return this.app;
}

/**
 * @ignore
 * 
 */
FM.DmList.prototype.setApp = function(a) {
    this.app = FM.isset(a) && a ? a : null;
}

/**
 * @ignore
 * 
 */
FM.DmList.prototype._addPredefinedData = function(data) {
    var clsName = this.getProperty('config.responseClass', 'Object');
    var responseObjectType = FM.DmObject.getConfiguration(this.getApp(), clsName);
    if (!responseObjectType) {
        responseObjectType = FM.stringPtrToObject(clsName);
    }
    if (!FM.isFunction(responseObjectType))
        responseObjectType = FM.DmObject;
    var added = [];
    for (var i = 0; i < data.length; i++) {
        added.push(new responseObjectType(data[i]));
    }

    if (this.isStaticList()) { // Ako je static lista
        var staticlist = this.getStaticList(); // uzmi cache za tip liste

        if (FM.isset(staticlist)) {
            staticlist[this.getDataHash()] = {Added: added, Updated: {}, Removed: {}};
        }
    }

    return this.refreshList(
        {Added: added, Updated: {}, Removed: {}}, false
        );
}

// -- func AJAX --------------------------------------------------------
/**
 * Returns arguments of last AJAX call.
 * 
 * @public
 * @function
 * @returns {object}
 */
FM.DmList.prototype.getLastFetchArgs = function() {
    return this.lastFetchArgs;
}

/**
 * Returns arguments of last successful AJAX call.
 * 
 * @public
 * @function
 * @returns {object}
 */
FM.DmList.prototype.getLastFetchedArgs = function() {
    return this.lastFetchedArgs;
}

/**
 * Prepare arguments for AJAX call.
 * 
 * @public
 * @function
 * @param {boolean} [getMore=false] Add data to list or refresh complete list.
 * 
 * @returns {object} List of arguments.
 */
FM.DmList.prototype.getDataArgs = function(getMore) {
    var args = {};
    getMore = FM.isset(getMore) && getMore == true;
    this.setProperty('clearBeforeAdd', !getMore);


    // ako imamo fn pozivamo nju, inace saljemo sve atribute  
    var fnFetchArgs = this.getProperty('config.getFetchArguments', null);
    if (fnFetchArgs && FM.isString(fnFetchArgs)) {
        fnFetchArgs = FM.stringPtrToObject(fnFetchArgs);
    }
    if (fnFetchArgs && FM.isFunction(fnFetchArgs)) {
        args = fnFetchArgs({dmList: this, getMore: getMore});
    } else { // ako nemamo fn stavljamo atribute
        this.forEachAttr(function(pname, value) {
            if (!FM.isFunction(value)) {
                args[pname] = value;
            }
            return true;
        });

        // paging
        if (getMore) {
            var fromPageAttr = this.getProperty('config.pageAttribute', '');
            if (fromPageAttr != '') {
                args[fromPageAttr] = parseInt(this.getAttr(fromPageAttr, '0')) + 1;
                var pageSizeAttr = this.getProperty('config.pageSizeAttribute', '');
                if (pageSizeAttr != '') {
                    args[pageSizeAttr] = parseInt(this.getAttr(pageSizeAttr, '20'));
                }
            } else {
                var fromRowAttr = this.getProperty('config.fromRowAttribute', '');
                if (fromRowAttr != '') {
                    args[fromRowAttr] = this.getListSize();
                    var numRowsAttr = this.getProperty('config.numRowsAttribute', '');
                    if (numRowsAttr != '') {
                        args[numRowsAttr] = parseInt(this.getAttr(numRowsAttr, '20'));
                    }
                }
            }
        }
    }

    // serijaliziraj argumente
    FM.forEach(args, function(name, value) {
        if (FM.isArray(value) || FM.isObject(value)) {
            args[name] = FM.serialize(value);
        }
        return true;
    });


    // kraj
    this.lastFetchArgs = args;
    return(args);
}


/**
 * Fired on start of AJAX call.
 * 
 * @event
 * @public
 * @param {FM.UtAjax} oAjax Source of event (usualy FM.UtAjax class instance).
 * @param {object} oArgs Ajax call arguments
 */
FM.DmList.prototype.onAjaxStateStart = function(oAjax, oArgs) {
    this.log("Starting fetch ...", FM.logLevels.info, 'onAjaxStateStart');
    this.fireEvent("onListStart", new FM.DmObject(oArgs));
}

/**
 * Fired after successfull AJAX call.
 * 
 * @event
 * @public
 * @param {FM.UtAjax} oAjax Source of event (usualy FM.UtAjax class instance).
 * @param {object} response Ajax call response.
 */
FM.DmList.prototype.onAjaxStateEnd = function(oAjax, response) {
    this.log("Fetch completed.", FM.logLevels.info, 'onAjaxStateEnd');
    oAjax.removeListener(this);

    this.lastFetchEndTime = new Date().getTime();

    var isErrorResponse = this._resFn(
        this.getProperty('config.isErrorResponse', FM.DmList._isErrorResponseDef),
        {dmList: this, utAjax: oAjax, response: response}
    );

    if (isErrorResponse) {
        var errObj = this._resFn(
            this.getProperty('config.errorParser', FM.DmList._errorParserDef),
            {dmList: this, utAjax: oAjax, response: response}
        );

        if (!errObj) {
            return this.onAjaxStateError(oAjax, "Error parsing invalid response");
            errObj = new FM.DmGenericError({
                messageId: "1",
                text: "Error parsing response"
            });
        }
        return this.fireEvent("onListError", errObj);
    }

    return this.addResponseToList(response);
}

/**
 * Fired on AJAX call error.
 * 
 * @event
 * @public
 * @param {FM.UtAjax} oAjax Source of event (usualy FM.UtAjax class instance).
 * @param {string} errTxt Error description.
 */
FM.DmList.prototype.onAjaxStateError = function(oAjax, errTxt) {
    var errObj = new FM.DmGenericError({
        messageId: "-1",
        text: !FM.isset(errTxt) || !errTxt ? "Error fetching data from server" : errTxt
    });

    this.log(
        errObj.getErrorText(),
        FM.logLevels.warn, 'onAjaxStateError'
        );

    oAjax.removeListener(this);

    this.lastFetchEndTime = new Date().getTime();
    this.fireEvent("onListError", errObj);
}

/**
 * @ignore
 */
FM.DmList.prototype._checkResponseStatus = function(oAjax) {
    if (!FM.isset(oAjax) || !oAjax) {
        return true;
    }

    var respCodesStr = FM.trim(this.getAttr('config.validResponseCodes', ''));
    var responseCodes =
        respCodesStr === '' ? [] :
        this.getAttr('config.validResponseCodes', '').split(",")
        ;

    if (FM.sizeOf(responseCodes) == 0) {
        return true;
    }

    var i;
    for (i = 0; i < FM.sizeOf(responseCodes); i++) {
        if (FM.trim(responseCodes[i]) == oAjax.lastStatusCode)
            return true;
    }

    return false;
}


/**
 * Get data from server.
 * <i>FM.DmList.onListStart</i> and <i>FM.DmList.onListEnd</i> or <i>FM.DmList.onListError</i> 
 * events will be fired on start and completition of AJAX call.
 *  
 * @public
 * @function    
 * @param {boolean} [getMore=false] Add data to list or refresh complete list.
 */
FM.DmList.prototype.getData = function(getMore) {
    if (this.isStaticList()) { // Ako je static lista
        var staticlist = this.getStaticList(); // uzmi cache za tip liste

        if (staticlist) {
            var cache =
                FM.isset(staticlist[this.getDataHash()]) ?
                staticlist[this.getDataHash()] : null
                ; // uzmi iz cachea rezultate za tocno ovu listu (get parametri ili def - 0)

            if (cache) {
                return this.refreshList(cache); // refresh list with cached data    
            }
        }
    }

    // ako nema url-a ne radimo fetch
    if (this.getProperty('config.url', '') == '') {
        this.fireEvent(
            "onListEnd",
            {
                Removed: {},
                Added: {},
                Updated: {}
            });
        return true;
    }

    // args za fetch
    var args = this.getDataArgs(getMore);

    // call            
    if (args) {
        this._ajaxCall(args);
    }

    // end
    return true;
}

/** 
 * Add FM.DmObject to list.
 * 
 * @public
 * @function    
 * @param {DmObject} inmember DmObject to add
 * @param {string} [mid=inmember.getDataID()] Object data ID.
 * @param {boolean} [callevent=false] Send <i>onListEnd</i> event.
 * @param {string} [groupName=null]. 
 */
FM.DmList.prototype.addToList = function(inmember, mid, callevent, groupName) {
    var addlst = [];

    // ako je lista objekata a ne objekt
    if (FM.isArray(inmember)) {
        addlst = inmember;
    } else {
        if (FM.isset(inmember.getDataID))
            addlst.push(inmember);
    }

    return this.refreshList({Added: addlst, Updated: [], Removed: []}, false, groupName, false, callevent);

    // kraj
    return true;
}

/**
 * Remove FM.DmObject from list,
 * 
 * @public
 * @function    
 * @param {string|object} id Id of FM.DmObject to remove 
 *  or object with list od DmObjects to remove.
 * @param {boolean} [callevent=false] Send <i>onListEnd</i> event.
 * @param {string} [groupName=null]. 
 */
FM.DmList.prototype.removeFromList = function(id, callevent, groupName) {
    var rmlist = {};
    var oOldObj;

    // ako je lista objekata ili objekt a ne id objekta
    if (FM.isObject(id)) {
        if (!FM.isset(id.getDataID)) {
            rmlist = id;
        } else {
            rmlist[id.getDataID()] = id;
        }
    } else if (FM.isString(id)) { // string id
        oOldObj = this.get(id);
        if (oOldObj) {
            rmlist[oOldObj.getDataID()] = oOldObj;
        }
    }

    var nlist = {};
    var nlistIndex = [];
    var myrmlist = [];
    this.forEachListElement(
        function(index, iObj) {
            var odataid = iObj.getDataID();
            if (!FM.isset(rmlist[odataid])) {
                nlist[odataid] = iObj;
            } else {
                myrmlist.push(iObj);
            }
            return true;
        }
    );
    this.objectsList = nlist;
    FM.forEach(this.listIndex, function(i, id) {
        if (FM.isset(nlist[id])) {
            nlistIndex.push(id);
        }
        return true;
    });
    this.listIndex = nlistIndex;
    if (callevent != false) {
        this.fireEvent(
            "onListEnd",
            {
                Removed: myrmlist,
                Added: [],
                Updated: []
            });
    }

    return myrmlist;
}

/**
 * Remove all list members with <i>attr</i> attribute value equal to <i>value</i>.
 * 
 * @public
 * @function    
 * @param {string} attr Attribute name.
 * @param {string} value Attribute value.
 * @param {boolean} [callevent=false] Send <i>onListEnd</i> event.
 * @param {string} [groupName=null]. 
 */
FM.DmList.prototype.removeFromListByAttr = function(attr, value, callevent, groupid) {
    var rmlist = {};

    this.forEachListElement(
        function(index, iObj) {
            if (iObj.getAttr(attr) == value.toString()) {
                rmlist[index] = iObj;
            }
            return true;
        }
    );
    return this.removeFromList(rmlist, callevent, groupid);
}

/**
 * Empty list.
 * 
 * @public
 * @function    
 * @param {boolean} [callevent=false] Send <i>onListEnd</i> event.
 * @param {string} [groupName=null]. 
 */
FM.DmList.prototype.clearList = function(callevent, groupid) {
    return this.removeFromList(FM.cloneObject(this.objectsList), callevent, groupid);
}

/**
 * Dispose list.
 * 
 * @public
 * @function    
 */
FM.DmList.prototype.dispose = function() {
    this.clearList(false);

    // event
    this.fireEvent("onListDispose", {});

    // props & listeners
    this.removeListener();
    this.options = {};
    this.prop = {};

    // list
    this.objectsList = {};
    this.listIndex = [];

    // ajax
    this.lastFetchTime = null;
    this.lastFetchEndTime = null;
    this.lastFetchArgs = null;
    this.lastFetchedArgs = null;
}

/**
 * Get FM.DmObject from list by data ID or attribute name-value pair.
 * 
 * @public
 * @function    
 * @param {string} key Data ID of DmObject to remove or attribute value.
 * @param {string} [aname=FM.DmObject#getDataID()] Attribute name.
 * @returns {FM.DmObject} 
 */
FM.DmList.prototype.get = function(key, aname) {
    // ako je aname def onda je par name/value attributa a ne dataid
    if (FM.isset(aname) && aname && aname != '') {
        return this.findByAttr(aname, key);
    }

    // drito u listu pod dataid-u
    key = key.toString();
    if (key && key != '' && FM.isset(this.objectsList[key])) {
        return this.objectsList[key];
    }

    // nije nadjen
    return null;
}

/**
 * @ignore
 */
FM.DmList.prototype.c = function(key, aname) {
    return this.get(key, aname);
}


/**
 * Add group of FM.DmObject to list.
 * 
 * @name set&nbsp;
 * @memberOf FM.DmList#
 * @public
 * @function    
 * @param {boolean} onlyExisting Replace only. 
 * @param {FM.DmObject{}} lst List of FM.DmObject 's to add.
 * @param {String} [idattr] Attribute to use instead of data ID. 
 */

/**
 * Add FM.DmObject to list or replace object with same data ID with new one.
 * 
 * 
 * @public
 * @function    
 * @param {FM.DmObject} member FM.DmObject to add.
 * @param {string} [id=FM.DmObject#getDataID()] Id of FM.DmObject to add.
 */
FM.DmList.prototype.set = function(member, id, idattr) {
    if (FM.isBoolean(member)) {
        var onlyExisting = member;
        var olist = id;
        idattr = FM.isset(idattr) && idattr != null ? idattr : null;

        for (var k in olist) {
            var obj = olist[k];
            if (FM.isObject(obj) && FM.isset(obj.getDataID)) {
                var did = idattr ? obj.getAttr(idattr, '') : obj.getDataID();
                var oldObj = this.get(did);
                if (!onlyExisting || oldObj == null) {
                    this.set(obj, did);
                }
            }
        }
    } else {
        id = FM.isset(id) && id ? id : member.getDataID();

        if (!FM.isset(this.objectsList[id.toString()])) {
            this.listIndex.push(id.toString());
        }
        this.objectsList[id.toString()] = member;
    }
    return true;
}

/**
 * @ignore
 */
FM.DmList.prototype.l = function(member, id, idattr) {
    return this.set(member, id, idattr);
}

/**
 * Get list of all DM.Object 's.
 * 
 * @public
 * @function    
 * @returns {DM.Object{}} 
 */
FM.DmList.prototype.getList = function() {
    return this.objectsList;
}

/**
 * Find FM.DmObject 's in list.
 *  
 * @public
 * @function    
 * @param {string} aname Attribute name. 
 * @param {string} value Attribute value.
 * @param {boolean} [all=false] Return all objects (or only first that match criteria).
 * @param {object} [orderList] List index.
 *  
 * @returns {FM.DmObject|{}}
 */
FM.DmList.prototype.findByAttr = function(aname, value, all, orderList) {
    var getall = (FM.isset(all) ? all : false);
    var retarr = getall ? {} : null;

    var obj = this.forEachListElement(
        function(index, obj) {
            if (obj.getAttr(aname.toString()) == value) {
                if (getall) {
                    if (!retarr)
                        retarr = {};
                    retarr[index] = obj;
                } else {
                    retarr = obj;
                    return(false);
                }
            }
            return(true);
        }, orderList
        );

    return(retarr);
}

/**
 * Find list index of FM.DmObject with given attribute name-value pair. 
 * 
 * @public
 * @function    
 * @param {string} attrname Attribute name 
 * @param {string} attrval Attribute value
 * @returns {number} Returns -1 when no object is found.
 */
FM.DmList.prototype.findElementIndex = function(attrname, attrval) {
    var i = this.forEachListElement(
        function(index, obj) {
            if (obj.getAttr(attrname.toString()) == attrval.toString())
                return(false);
            return(true);
        },
        true
        );
    return(i);
}

/**
 * Returns list size.
 * 
 * @public
 * @function    
 * @param {function} [filterFn] Callback function for filtering (<i>filterFn(id,attr)</i>). 
 * @returns {number} 
 */
FM.DmList.prototype.getListSize = function(filterFn) {
    return FM.DmList.getListSize(this, filterFn);
}

/**
 * For each FM.DmObject in list call function <i>doFn(id,attr)</i> 
 * until end of list or <i>false</i> return value.    
 * 
 * @public
 * @function    
 * @param {function} doFn Callback function.
 * @param [boolean=false]} returnIndex Return index of DmObject instead DmObject itself
 * @param {boolean} doSort Sort index by orderAttribute (from config)
 * @return {string} In case of <i>false</i> return value of <i>doFn()</i> call 
 *  this function returns FM.DmObject (or data id of DmObject) otherwise null or -1
 */
FM.DmList.prototype.forEachListElement = function(doFn, returnIndex) {
    // pokreni
    var id, lobj, i;

    returnIndex = FM.isset(returnIndex) ? (returnIndex == true) : false;
    for (i = 0; i < this.listIndex.length; i++) {
        lobj = this.objectsList[this.listIndex[i]];
        if (FM.isset(lobj) && FM.isset(lobj.getID)) {
            if (!doFn(id, lobj))
                return(returnIndex ? id : lobj);
        }
    }

    // kraj
    return(returnIndex ? -1 : null);
}

/**
 * Create list filter.
 * 
 * @public
 * @function    
 * @param {function} callbackFn Callback for creating list
 * @param {object} startFilter Master filter
 * @returns {object} List filter
 */
FM.DmList.prototype.createListFilter = function(callbackFn, startFilter) {
    var lst = {};
    var cbFn = FM.isset(callbackFn) ? callbackFn : function() {
        return false;
    };
    var fltStart = FM.isset(startFilter) ? startFilter : null;

    this.forEachListElement(function(index, iObj) {
        if (!fltStart || FM.isset(fltStart[iObj.getDataID()])) {
            if (cbFn(iObj))
                lst[iObj.getDataID()] = iObj;
        }
        return true;
    });

    return(lst);
}


/**
 * Create list index.
 * 
 * @public
 * @function    
 * @param {string} attr Attribute name 
 * @param {string} attrtype Attribute type (STRING,DATE,NUMBER)
 * @param {boolean} asc Ascending
 * @param {object} filterTable list filter to use
 * @returns {object} List index
 */
FM.DmList.prototype.createListIndex = function(attr, attrtype, asc, filterTable) {
    var lst = [];
    this.forEachListElement(function(index, iObj) {
        if (!FM.isset(filterTable) || FM.isset(filterTable[iObj.getDataID()]))
            lst.push(iObj);
        return true;
    });

    var sortFn = function(a, b) {
        var at, bt;
        if (attrtype == 'DATE') {
            at = FM.parseDateString(a.getAttr(attr, ''), true);
            bt = FM.parseDateString(b.getAttr(attr, ''), true);
        } else if (attrtype == 'NUMBER') {
            at = parseFloat(a.getAttr(attr, '0'), true);
            bt = parseFloat(b.getAttr(attr, '0'), true);
        } else { // STRING
            at = a.getAttr(attr, '').toString();
            bt = b.getAttr(attr, '').toString();
        }

        return(
            at > bt ? 1 : (at == bt ? 0 : -1)
            );
    }

    lst.sort(sortFn);
    if (FM.isset(asc) && asc == false)
        lst.reverse();

    return(lst);
}


/**
 * Add  objects from AJAX call response to list. Fires <i>onListEnd</i> event.
 * 
 * @public
 * @function
 * @param {object} response AJAX response
 * @param {boolean} onlyExisting Replace only existing object 
 * @param {string} [groupName] Name od objects group
 * @param {boolean} protectDirty Don't change dirty objects
 */

FM.DmList.prototype.addResponseToList = function(response, onlyExisting, groupName, protectDirty) {
    response =
        FM.isset(response) && response ?
        response : null
        ;


    if (FM.isString(response)) {
        response = {value: response};
    }

    // init
    var added = [];
    var updated = [];

    // clear
    var removed = this.getProperty('clearBeforeAdd', false) ?
        this.clearList(false) : []
        ;
    this.setProperty('clearBeforeAdd', false);

    // add
    var responseParser = this.getProperty('config.responseParser', FM.DmList._parseResponseDef);
    var listType = this.getProperty('config.listType', "collection"); // collection|single

    // za svaki ili samo jednom
    var respCol = [];
    if (response && FM.isObject(response)) {
        var rlprop = this.getProperty('config.dataProperty', null);
        if (listType == 'single') {
            if (response) {
                respCol = [rlprop ? FM.getAttr(response, rlprop, null) : response];
            }
        } else if (listType == 'none') {
            respCol = [];
        } else {
            respCol = rlprop ? FM.getAttr(response, rlprop, null) : response;
            if (!FM.isObject(respCol) && !FM.isArray(respCol)) {
                respCol = [];
            }
        }
    }

    var lstObj = null;
    for (var respId = 0; respId < respCol.length; respId++) {
        lstObj = responseParser({dmList: this, response: respCol[respId], raw: response});
        if (!lstObj) {
            this.fireEvent("onListError", new FM.DmGenericError({
                messageId: -1,
                text: 'Data error: invalid response.'
            }));
            return false;
        }

        // osvjezimo listu
        // objekti se ne zamijenjuju, radi se update da ostanu reference na obj ok
        var oldObj = this.get(lstObj.getDataID());
        if (oldObj) {
            updated.push(lstObj);
        } else {
            added.push(lstObj);
        }
    }

    if (this.isStaticList()) { // Ako je static lista
        var staticlist = this.getStaticList(); // uzmi cache za tip liste

        if (FM.isset(staticlist)) {
            staticlist[this.getDataHash()] = {Added: added, Updated: updated, Removed: removed};
        }
    }

    return this.refreshList(
        {Added: added, Updated: updated, Removed: removed}, onlyExisting, groupName, protectDirty
        );
}


/**
 * Add objects to list. Fires <i>onListEnd</i> event.
 * 
 * @public
 * @function
 * @param {object} response List of updated, deleted and inserted objects (onListEnd format)
 * @param {boolean} onlyExisting Replace only existing object 
 * @param {string} groupName Name of objects group
 * @param {boolean} protectDirty Ignore changed objects
 * @param {boolean} callEvents Call events  (default is true)
 */
FM.DmList.prototype.refreshList = function(response, onlyExisting, groupName, protectDirty, callEvents) {
    var id, oValue, oOldValue;

    // def params
    onlyExisting = FM.isset(onlyExisting) && onlyExisting == true ? true : false;
    groupName = FM.isset(groupName) && groupName ? groupName : null;
    protectDirty = FM.isset(protectDirty) && protectDirty == true ? true : false;
    response =
        FM.isset(response) && response ?
        response : null
        ;
    callEvents = FM.isset(callEvents) && callEvents == false ? false : true;

    // init
    var retList = {
        listCount: 0,
        Removed: [],
        Added: [],
        Updated: []
    };

    // brisani
    if (FM.isset(response) && FM.isset(response.Removed)) {
        for (id = 0; id < response.Removed.length; id++) {
            oValue = response.Removed[id];
            oOldValue = this.get(oValue.getDataID());
            if (groupName) {
                // makni grupu
                if (oOldValue.isInGroup(groupName)) {
                    oOldValue.removeGroup(groupName);
                }
                // micemo ga samo ako je broj grupa 0
                if (oOldValue.getGroupsCount() < 1) {
                    this.removeFromList(oOldValue.getDataID(), false);
                    retList.Removed.push(oOldValue);
                    retList.listCount++;
                } else {
                    retList.Updated.push(oOldValue);
                    retList.listCount++;
                }
            } else {
                if (oOldValue) {
                    this.removeFromList(oOldValue.getDataID(), false);
                    retList.Removed.push(oOldValue);
                    retList.listCount++;
                }
            }
        }
    }

    // dodani
    if (FM.isset(response) && FM.isset(response.Added)) {
        this._refreshAdd(response.Added, retList, onlyExisting, groupName, protectDirty);
    }
    if (FM.isset(response) && FM.isset(response.Updated)) {
        this._refreshAdd(response.Updated, retList, onlyExisting, groupName, protectDirty);
    }


    // posalji evente za change
    for (id = 0; id < retList.Updated.length; id++) {
        oOldValue = retList.Updated[id];
        oOldValue.setChanged(false, true); // call ev
    }

    // ako je listType none uvijek posalji event
    if (this.getProperty('config.listType', "collection") == 'none') {
        callEvents = true;
    }
    // kraj
    if (callEvents)
        this.fireEvent("onListEnd", retList);

    // kraj
    return(true);
}


/**
 * Return the List configuration name
 * @public
 * @function    
 * @return {string} list name
 */
FM.DmList.prototype.getListConfigName = function() {
    return this.getProperty('config.listname', '');
}

/**
 * Return if the List is static (cacheable).
 * 
 * @public
 * @function    
 * @return {boolean} 
 */
FM.DmList.prototype.isStaticList = function() {
    return this.getProperty('config.isstatic', false) == true ? true : false;
}

/**
 * Return the static list data.
 * 
 * @public
 * @function    
 * @return {object} 
 */
FM.DmList.prototype.getStaticList = function() {
    var listconfig = FM.DmList.getConfiguration(this.getApp(), this.getListConfigName());

    if (listconfig) {
        if (!FM.isset(listconfig.staticlist) || !FM.isObject(listconfig.staticlist)) {
            listconfig.staticlist = {};
        }
        return listconfig.staticlist;
    }

    return null; //error
}

// -- private ------------------------------------------------------------------
/**
 * 
 * @ignore
 */
FM.DmList.prototype._resFn = function(value, args) {
    var is = value;
    if (FM.isString(is && is != 'JSON')) { // hack
        var isFn = FM.stringPtrToObject(is);
        if (isFn)
            is = isFn;
    }
    if (is && FM.isFunction(is)) {
        try {
            is = is(args);
        } catch (e) {
            this.log(e, FM.logLevels.error, 'DmList._resFn');
        }
    }

    return is;
}

/**
 * 
 * @ignore
 */
FM.DmList.prototype._ajaxCall = function(args) {
    var fnargs = {dmList: this, arguments: args};

    this.lastFetchTime = new Date().getTime();

    // resolve headers
    var hdrs = this._resFn(
        this.getProperty('config.headers', {}),
        fnargs
        );
    for (var hname in hdrs) {
        hdrs[hname] = FM.applyTemplate(
            args, hdrs[hname], false, true
            ).replace(/\s*\[\:.*?\]\s*/g, "");
    }

    var url = FM.applyTemplate(
        args,
        this._resFn(
        this.getProperty('config.url', ''),
        fnargs
        ),
        false, false
        ).replace(/\s*\[\:.*?\]\s*/g, "");


    var authArgs = this._resFn(
        this.getProperty('config.auth', {}), fnargs
        );

    // ajax config
    var utAjax = new FM.UtAjax({
        url: url,
        method: this._resFn(this.getProperty('config.method', ''), this),
        contentType: this._resFn(this.getProperty('config.contentType', 'application/x-www-form-urlencoded'), args),
        responseFormat: this._resFn(this.getProperty('config.responseFormat', 'TEXT'), args),
        validResponseCodes: this._resFn(this.getProperty('config.validResponseCodes', ''), args),
        params: this._resFn(this.getProperty('config.params', {}), args),
        headers: hdrs,
        cache: this._resFn(this.getProperty('config.cache', 'true'), this),
        auth: FM.getAttr(authArgs, 'username', '') == '' ? null : {
            username: FM.getAttr(authArgs, 'username', ''),
            password: FM.getAttr(authArgs, 'password', '')
        }
    });

    // add listener
    utAjax.addListener(this);

    // send
    utAjax.send(args);

    return true;
}

/**
 * 
 * @ignore
 */
FM.DmList.prototype._refreshAdd = function(list, retList, onlyExisting, groupid, protectDirty) {
    var id, oValue, oOldValue;

    for (id = 0; id < list.length; id++) {
        oValue = list[id];
        oOldValue = this.get(oValue.getDataID());
        if (!oOldValue || !onlyExisting) {
            if (oOldValue) { // vec postoji, ako nije editiran zamijenimo ga
                if (!oOldValue.isChanged() || !protectDirty) {
                    oValue.forEachAttr(function(name, value) {
                        oOldValue.setAttr(name, value, false); // ne zovi evente
                        return true;
                    });
                    if (groupid && !oOldValue.isInGroup(groupid)) {
                        oOldValue.addGroup(groupid);
                    }
                    retList.Updated.push(oOldValue);
                    retList.listCount++;
                }
            } else {
                if (groupid && !oValue.isInGroup(groupid)) {
                    oValue.addGroup(groupid);
                }
                this.set(oValue, oValue.getDataID());
                retList.Added.push(oValue);
                retList.listCount++;
            }
        }
    }
}

// == static ===================================================================
FM.DmList.configurations = {
    GLOBAL: {}
};

/**
 * Add new FM.DmList configuration.
 * 
 * @static
 * @function    
 * @param {String} name Name of configuration
 * @param {object} config Configuration
 * @param {String} appCls Application subclass
 */

FM.DmList.addConfiguration = function(name, config, appCls) {
    appCls = FM.isset(appCls) && FM.isString(appCls) && appCls != '' ? appCls : 'GLOBAL';
    if (!FM.isset(name) || !name || name == '')
        return false;
    if (!FM.isset(FM.DmList.configurations[appCls])) {
        FM.DmList.configurations[appCls] = {};
    }

    FM.DmList.configurations[appCls][name] = config;
    FM.DmList.configurations[appCls][name]['listname'] = name;
    return true;
}

/**
 * Returns DmList <b>config</b> configuration
 * @static
 * @function    
 * @param {object} app Application
 * @param {String} name Confiruation name
 * @return {object} list configuration or null if not found
 */
FM.DmList.getConfiguration = function(app, name) {
    var list = FM.DmList.configurations;

    var app = FM.isset(app) && app ? app : null;
    var appCls = app ? app.getSubClassName() : null;
    var appCfg = appCls && FM.isset(list[appCls]) ? list[appCls] : null;

    var obj = null;
    if (appCfg && FM.isset(appCfg[name])) {
        obj = appCfg[name];
    } else if (app && FM.isArray(app.applicationObjectsSpace)) {
        FM.forEach(app.applicationObjectsSpace, function(i, ns) {
            if (FM.isset(list[ns]) && FM.isset(list[ns][name])) {
                obj = list[ns][name];
                return false;
            }
            return true;
        });
    }

    if (!obj && FM.isset(list['GLOBAL'][name])) {
        obj = list['GLOBAL'][name];
    }

    return obj;
}

/**
 * Returns new DmList winth <b>config</b>  configuration
 * @static
 * @function    
 * @param {object} app Application instance
 * @param {object} attrs list of attributes
 * @param {String} name Configuation name
 * @return {FM.DmList} new DmList
 */
FM.DmList.newList = function(app, attrs, name) {
    var cfg = FM.DmList.getConfiguration(app, name);
    return cfg ? new FM.DmList(attrs, cfg, app) : null;
}

/**
 * For each DmObject in list call function <i>doFn(id,attr)</i> until end of list or <i>false</i> return value.    
 * @static
 * @function    
 * @param {object} list DmObject collection
 * @param {function} doFn Callback function
 * @param {boolean} returnIndex Return index of DmObject instead DmObject itself
 * @param {object} orderList List index 
 * @return {string} In case of <i>false</i> return value of <i>doFn()</i> call return DmObject (or data id of DmObject) otherwise null or -1
 */
FM.DmList.forEachListElement = function(list, doFn, returnIndex, orderList) {
    var id, lobj, i;

    returnIndex = FM.isset(returnIndex) ? (returnIndex == true) : false;
    orderList =
        FM.isset(orderList) && orderList && (FM.isArray(orderList) && orderList.length > 0) ?
        orderList : null;

    if (orderList) {
        for (i = 0; i < orderList.length; i++) {
            lobj = orderList[i];
            if (lobj && FM.isset(lobj.getDataID)) {
                id = lobj.getDataID();
                if (!doFn(id, lobj))
                    return(returnIndex ? id : lobj);
            }
        }
    } else {
        for (i = 0; i < list.length; i++) {
            lobj = list[i];
            if (FM.isset(lobj.getID)) {
                id = lobj.getDataID();
                if (!doFn(id, lobj))
                    return(returnIndex ? id : lobj);
            }
        }
    }
    return(returnIndex ? -1 : null);
}

/**
 * Get collection size.
 * 
 * @static
 * @function    
 * @param {object} list Collection
 * @param {function} filterFn Callback to filter collection
 * @returns {number} Number of elements in collection
 */
FM.DmList.getListSize = function(list, filterFn) {
    var n = 0;
    FM.DmList.forEachListElement(list, function(id, obj) {
        if (FM.isFunction(filterFn)) {
            if (filterFn(obj) == true) {
                n++;
            }
        } else {
            n++;
        }
        return true;
    });

    return n;
}

/**
 * 
 * @ignore
 */
FM.DmList._errorParserDef = function(options) {
    var errObj = null;
    var oAjax = FM.getAttr(options, 'utAjax', null);
    var oList = FM.getAttr(options, 'dmList');

    // status code
    if (!oList._checkResponseStatus(oAjax)) {
        errObj = new FM.DmGenericError({
            messageId: "1",
            text: "Invalid response code (" + oAjax.lastStatusCode + ")"
        });
    } else {
        errObj = new FM.DmGenericError({
            messageId: "1",
            text: "Error parsing response"
        });
    }

    return errObj;
}

/**
 * 
 * @ignore
 */
FM.DmList._isErrorResponseDef = function(options) {
    var oList = FM.getAttr(options, 'dmList');
    var oAjax = FM.getAttr(options, 'utAjax', null);
    return !oList._checkResponseStatus(oAjax);
}


/**
 * 
 * @ignore
 */
FM.DmList._parseResponseDef = function(options) {
    var oList = FM.getAttr(options, 'dmList');
    var oData = FM.getAttr(options, 'response', {});
    var clsName = oList.getProperty('config.responseClass', 'Object');
    var cls = FM.DmObject.getConfiguration(oList.getApp(), clsName);
    if (!cls) {
        cls = FM.stringPtrToObject(clsName);
    }
    if (!FM.isFunction(cls))
        return null;
    return new cls(oData);
}
