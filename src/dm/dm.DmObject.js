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

FM.DmObject.prototype.getDataID = function() {
    return this.getID();
}

// groups
FM.DmObject.prototype.addGroup = function(s,callevent) {
    if(!FM.isset(s) || !s || s == '') return false;

    this.objectGroups[s] = {
        name: s
    }

    if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    return true;
}

FM.DmObject.prototype.removeGroup = function(s,callevent) {
    if(!FM.isset(s) || !s || !FM.isset(this.objectGroups[s])) return false;
    var newglist = {};            
    FM.forEachAttr(this.objectGroups,function(name,value) {
        if(name != s) {
            newglist[name] = value;
        }
        return true;
    });

    this.objectGroups = newglist;
    if(this.defaultGroup == s) this.defaultGroup = '';
    if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    return true;
}

FM.DmObject.prototype.isInGroup = function(s) {
    return (
        FM.isset(s) && s && FM.isset(this.objectGroups[s]) ?
        true : false
        );
}

FM.DmObject.prototype.removeAllGroups = function(callevent) {
    this.objectGroups = {};
    this.defaultGroup = '';
    if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    return true;
}


FM.DmObject.prototype.getGroups = function() {
    return FM.cloneObject(this.objectGroups);
}

FM.DmObject.prototype.getGroupsCount = function() {
    return FM.sizeOf(this.objectGroups);
}

FM.DmObject.prototype.forEachGroup = function(doFn) {
    return FM.forEach(this.objectGroups,doFn);
}

FM.DmObject.prototype.setDefaultGroup = function(s,callevent) {
    s = FM.isset(s) && s ? s : '';
    if(s == '' || FM.isset(this.objectGroups[s])) {
        this.defaultGroup = s;
        if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
        return true;
    }            
    return false;
}

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
FM.DmObject.subClassTypes = {
    GLOBAL: {}
}; 

/**
* Returns DmObject <b>config</b> class function for <b>config</b> subclass type
* @static
* @function    
* @param {object} app Application
* @param {String} name Configuration name
* @return {object} object configuration or null if not found
*/   
FM.DmObject.getConfiguration = function(app,name) {
    var list = FM.DmObject.subClassTypes;

    app = FM.isset(app) && app ? app : null;
    var appCls = app ? app.getSubClassName() : null;
    var appCfg = appCls && FM.isset(list[appCls]) ? list[appCls] : null;
        
    var obj = null;
    if(appCfg && FM.isset(appCfg[name])) {
        obj = appCfg[name];
    } else if(app && FM.isArray(app.applicationObjectsSpace)) {
        FM.forEach(app.applicationObjectsSpace,function(i,ns) {
            if(FM.isset(list[ns]) && FM.isset(list[ns][name])) {
                obj = list[ns][name];
                return false;
            }
            return true;
        });
    }
    
    if(!obj && FM.isset(list['GLOBAL'][name])) {
        obj = list['GLOBAL'][name];
    }
    
    return obj;
}

FM.DmObject.newObject = function(app,clsname, oAttrs) {    
    var clsFn = FM.DmObject.getConfiguration(app,clsname);
    return clsFn ? new clsFn(oAttrs) : null;
}

FM.DmObject.getSubClassType = function(clsname,app) {
    return clsname == "" ? 
    FM.DmObject : (
        FM.isset(FM.DmObject.subClassTypes[clsname]) ? 
        FM.DmObject.subClassTypes[clsname] : 
        null
        );
}

FM.DmObject.addSubClassType = function(subclsname, clsfn,appCls) {
    appCls = FM.isset(appCls) && FM.isString(appCls) && appCls != '' ? appCls : 'GLOBAL';
    if(!FM.isset(FM.DmObject.subClassTypes[appCls])) {
        FM.DmObject.subClassTypes[appCls]= {};
    }
    
    FM.DmObject.subClassTypes[appCls][subclsname] = clsfn;
}


FM.DmObject.addSubClassType('Object',FM.DmObject,'GLOBAL');