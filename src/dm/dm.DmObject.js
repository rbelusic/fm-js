/** 
 * -----------------------------------------------------------------------------
 * 
 * @review isipka
 * 
 * -----------------------------------------------------------------------------
 */


/**
* Basic DM class. Provide groups. 
* 
* @class FM.DmObject
* @extends FM.Object
* @memberOf FM
* @param {object} attrs list of attribute name and values
* @param {object} [flds] allowed attributes
*/    
FM.DmObject = FM.defineClass('DmObject',FM.Object);


// methods
FM.DmObject.prototype._init = function(attrs,flds) {            
    this.objectGroups = {};
    this.defaultGroup = '';               

    this._super("_init",attrs,flds);
    this.objectSubClass = "Object";
}

/**
 * Returns data ID of data model. 
 * Data ID is usulay value of some attribute with unique value.
 * 
 * @public     
 * @function 
 * @returns {string} 
 */
FM.DmObject.prototype.getDataID = function() {
    return this.getID();
}

/**
 * Add object to group. 
 * 
 * @public     
 * @function 
 * @param {string} gname Group name.
 * @param {boolean} [callevent=false] Fire <i>onChange</i> event.
 * @returns {boolean} Returns <i>true</i> if object is successfully added to gruop. 
 */
FM.DmObject.prototype.addGroup = function(gname,callevent) {
    if(!FM.isset(gname) || !gname || gname == '') return false;

    this.objectGroups[gname] = {
        name: gname
    }

    if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    return true;
}

/**
 * Remove object from group. 
 * 
 * @public     
 * @function 
 * @param {string} gname Group name.
 * @param {boolean} [callevent=false] Fire <i>onChange</i> event.
 * @returns {boolean} Returns <i>true</i> if object is successfully removed. 
 */
FM.DmObject.prototype.removeGroup = function(gname,callevent) {
    if(!FM.isset(gname) || !gname || !FM.isset(this.objectGroups[gname])) return false;
    var newglist = {};            
    FM.forEachAttr(this.objectGroups,function(name,value) {
        if(name != gname) {
            newglist[name] = value;
        }
        return true;
    });

    this.objectGroups = newglist;
    if(this.defaultGroup == gname) this.defaultGroup = '';
    if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    return true;
}

/**
 * Check if object is in named group.
 * 
 * @public     
 * @function 
 * @param {string} gname Group name.
 * @returns {boolean} 
 */
FM.DmObject.prototype.isInGroup = function(gname) {
    return (
        FM.isset(gname) && gname && FM.isset(this.objectGroups[gname]) ?
        true : false
        );
}

/**
 * Remove object from all groups. 
 * 
 * @public     
 * @function 
 * @param {boolean} [callevent=false] Fire <i>onChange</i> event.
 * @returns {boolean} Returns <i>true</i> if object is successfully removed. 
 */
FM.DmObject.prototype.removeAllGroups = function(callevent) {
    this.objectGroups = {};
    this.defaultGroup = '';
    if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    return true;
}


/**
 * Get list of all groups object belongs to.
 * 
 * @public     
 * @function 
 * @returns {Object} 
 */
FM.DmObject.prototype.getGroups = function() {
    return FM.cloneObject(this.objectGroups);
}

/**
 * Returns object group count.
 * 
 * @public     
 * @function 
 * @returns {number} 
 */
FM.DmObject.prototype.getGroupsCount = function() {
    return FM.sizeOf(this.objectGroups);
}

/** 
 * For each object group call function <i>doFn(groupName,groupObject)</i> 
 * until end of list or <i>false</i> is returned.    
 * 
 * @public
 * @function 
 * @param {function} [doFn={}]
 */
FM.DmObject.prototype.forEachGroup = function(doFn) {
    return FM.forEach(this.objectGroups,doFn);
}


/** 
 * Set default object group.
 * 
 * @public
 * @function 
 * @param {string} gname Group name.
 * @returns {boolean}
 */
FM.DmObject.prototype.setDefaultGroup = function(s,callevent) {
    s = FM.isset(s) && s ? s : '';
    if(s == '' || FM.isset(this.objectGroups[s])) {
        this.defaultGroup = s;
        if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
        return true;
    }            
    return false;
}

/**
 * Returns default group.
 * 
 * @public     
 * @function 
 * @returns {Object} 
 */
FM.DmObject.prototype.getDefaultGroup = function() {
    if(this.defaultGroup != '') {
        return FM.getAttr(this.objectGroups,this.defaultGroup,null);
    }

    // ako nema def ili nije vidljiv
    var defgrp = null;
    FM.forEach(this.objectGroups,function(name,value) {
        // prvi u listi
        defgrp = value;
        return false;
    }); 
    return defgrp;
}        
// == static ===================================================================
/**
 * @ignore
 */
FM.DmObject.subClassTypes = {
    GLOBAL: {}
}; 

/**
* Returns DmObject class function for <b>sctype</b> subclass type.
* @static
* @function    
* @param {object} app Application.
* @param {String} sctype Subclass type.
* @return {function} Class function.
*/   
FM.DmObject.getConfiguration = function(app,sctype) {
    var list = FM.DmObject.subClassTypes;

    app = FM.isset(app) && app ? app : null;
    var appCls = app ? app.getSubClassName() : null;
    var appCfg = appCls && FM.isset(list[appCls]) ? list[appCls] : null;
        
    var obj = null;
    if(appCfg && FM.isset(appCfg[sctype])) {
        obj = appCfg[sctype];
    } else if(app && FM.isArray(app.applicationObjectsSpace)) {
        FM.forEach(app.applicationObjectsSpace,function(i,ns) {
            if(FM.isset(list[ns]) && FM.isset(list[ns][sctype])) {
                obj = list[ns][sctype];
                return false;
            }
            return true;
        });
    }
    
    if(!obj && FM.isset(list['GLOBAL'][sctype])) {
        obj = list['GLOBAL'][sctype];
    }
    
    return obj;
}

/**
* Returns new instance of chosen <b>sctype</b> subclass type.
* 
* @static
* @public
* @function    
* @param {object} app Application.
* @param {String} sctype Subclass type.
* @return {object} Class function.
*/   
FM.DmObject.newObject = function(app,sctype, oAttrs) {    
    var clsFn = FM.DmObject.getConfiguration(app,sctype);
    return clsFn ? new clsFn(oAttrs) : null;
}

/**
* Returns application registered subclass type function.
* 
* @static
* @public
* @function    
* @param {string} [sctype="Object"] Subclass type.
* @param {string} [scapp="GLOBAL"] Application subclass type.
* @return {function} Class function or <i>FM.DmObject</i> if <i>sctype</i> 
*  is ommited, empty string or null.
*/   
FM.DmObject.getSubClassType = function(sctype,scapp) {
    if(!FM.isset(sctype) || sctype == '') {
        return FM.DmObject;
    } 
    scapp = FM.isset(scapp) && scapp != '' ? scapp : 'GLOBAL';
    if(!FM.isset(FM.DmObject.subClassTypes[scapp])) {
        return null;
    }
    
    var appcfg = FM.DmObject.subClassTypes[scapp];
    
    return FM.isset(appcfg[sctype]) ? appcfg[sctype] : null;
}

/**
* Register application subclass type.
* 
* @static
* @public
* @function    
* @param {string} sctype Subclass type.
* @param {function} clsFn DM Class to register.
* @param {string} [scapp="GLOBAL"] Application subclass.
*/   
FM.DmObject.addSubClassType = function(sctype, clsFn,scapp) {
    scapp = FM.isset(scapp) && FM.isString(scapp) && scapp != '' ? scapp : 'GLOBAL';
    if(!FM.isset(FM.DmObject.subClassTypes[scapp])) {
        FM.DmObject.subClassTypes[scapp]= {};
    }
    
    FM.DmObject.subClassTypes[scapp][sctype] = clsFn;
}


FM.DmObject.addSubClassType('Object',FM.DmObject,'GLOBAL');
