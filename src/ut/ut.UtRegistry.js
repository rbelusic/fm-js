/**
* Registry class. 
* 
* @class FM.UtRegistry
* @extends FM.Object
* @param {object} opt Options
*/    

FM.UtRegistry = FM.defineClass('UtRegistry',FM.Object);
FM.UtRegistry.className = "UtRegistry";

FM.UtRegistry.prototype._init = function(opt) {            
    this.cookieName = '';
    this.registry = null;

    this._super("_init",opt);
    this.objectSubClass = "Registry";

    this.cookieName = this.getAttr('cookieName','fmRegistry');
    this.registry = null;
}

FM.UtRegistry.prototype.set = function(pkey,val) {
    if(this.registry == null) {
        var cookie = FM.loadCookie(this.cookieName);
        if(FM.isset(cookie.reg)) this.registry = FM.unserialize(cookie.reg);
        if(this.registry == null || !FM.isObject(this.registry)) this.registry = {};
    }
    pkey = FM.trim(pkey);
    if(FM.startsWith(pkey, "/")) {
        pkey = pkey.substr(1);
    }
    if(FM.endsWith(pkey, "/")) {
        pkey = pkey.substr(0,pkey.length -1);
    }
    var keyArr = pkey.split('/');
    var keyIndex = keyArr.length -1;
    var cur = this.registry;
    FM.forEach(keyArr,function(i,k) {       
       var c = FM.isset(cur[k]) ? cur[k] : null;       
       if(!c || !FM.isObject(c) || i == keyIndex) {
           cur[k] = i != keyIndex ? {} : val;
       }
       cur = cur[k];
       return true;
    });
    FM.saveCookie(this.cookieName,{reg: FM.serialize(this.registry)});

    return true;
}

FM.UtRegistry.prototype.get = function(pkey,defv) {
    if(this.registry == null) {
        var cookie = FM.loadCookie(this.cookieName);
        if(FM.isset(cookie.reg)) this.registry = FM.unserialize(cookie.reg);
        if(this.registry == null || !FM.isObject(this.registry)) this.registry = {};
    }
    
    pkey = FM.trim(pkey);
    if(FM.startsWith(pkey, "/")) {
        pkey = pkey.substr(1);
    }
    if(FM.endsWith(pkey, "/")) {
        pkey = pkey.substr(0,pkey.length -1);
    }
    pkey = pkey.replace(/\//g,'.');
    var val = FM.getAttr(this.registry,pkey,defv);

    return val;
}

FM.UtRegistry.prototype.remove = function(pkey) {
    if(this.registry == null) {
        var cookie = FM.loadCookie(this.cookieName);
        if(FM.isset(cookie.reg)) this.registry = FM.unserialize(cookie.reg);
        if(this.registry == null || !FM.isObject(this.registry)) this.registry = {};
    }

    var ndef = FM.UtRegistry.findKey(this.registry,pkey);
    if(!ndef.node) return false;

    var nnode = {};
    for(var en in ndef.node) {
        if(en != ndef.keyName) {
            nnode[en] = ndef.node[en];
        }
    }

    if(ndef.parent) ndef.parent[ndef.nodeKey] = nnode;
    else this.registry = nnode;

    FM.saveCookie(this.cookieName,{reg: FM.serialize(this.registry)});
    return true;
}

FM.UtRegistry.prototype.findKey = function(key,force) {
    return FM.UtRegistry(this.registry,key,force);
}

// static
FM.UtRegistry.findKey = function(reg,key,force) {
    
    var retc = {found: false, node: null, nodeKey: '', parent: null, keyName: '', keyValue: null};
    force = FM.isset(force) && force == true ? true: false;

    if(!FM.isset(reg) || !reg || !FM.isObject(reg)) return retc;
    if(!FM.isset(key) || !key || key == '') return retc;

    var apath_f = key.split("/");
    var apath = [];
    for(var k=0; k < apath_f.length; k++) {
        if(apath_f[k] != null && apath_f[k] != '') {
            apath.push(apath_f[k]);
        }
    }
    if(apath.length < 1) return retc;

    var ndirs = apath.length -1;

    retc.keyName = apath[apath.length -1];
    retc.node = reg;
    for(var i = 0; i < ndirs; i++) {
        var nname = apath[i];
        if(!FM.isset(retc.node[nname]) || !FM.isObject(retc.node[nname])) {
            if(force) retc.node[nname] = {};
            else return retc;
        }
        retc.parent = retc.node;
        retc.nodeKey = nname;
        retc.node = retc.node[nname];
    }

    if(FM.isset(retc.node[retc.keyName])) {
        retc.found = true;
        retc.keyValue = retc.node[retc.keyName];
    }

    return retc;
}

