/**
* Basic LM class. 
* 
* @class FM.LmObject
* @extends FM.Object
* @memberOf FM
* @param {FM.AppObject} app application object
* @param {object} [options] Options
*/    
FM.LmObject = FM.defineClass('LmObject',FM.Object);

FM.LmObject.prototype._init = function(app,opt) {            
    this.setExecuted(false);
    this.setApp(app);
    this.setDmObject();

    this._super("_init",opt);
    this.objectSubClass = "Object";
}

FM.LmObject.prototype.run = function() {
    this._super("run");
    this.setExecuted(true);
}

FM.LmObject.prototype.dispose = function() { 
    // reset
    this.setExecuted(false);
    this.setDmObject();
    this.setApp();            
    this._super("dispose");
}

FM.LmObject.prototype.isExecuted = function() {
    return this.executed;
}
FM.LmObject.prototype.setExecuted = function(e) {
    this.executed = FM.isset(e) && e == true;
}

FM.LmObject.prototype.getApp = function() {
    return this.app;
}

FM.LmObject.prototype.setApp = function(a) {
    this.app = FM.isset(a) && a ? a : null;
}

FM.LmObject.prototype.getDmObject = function() {
    return this.dmObject;
}

FM.LmObject.prototype.setDmObject = function(o,addListener) {
    if(o && o === this.dmObject) return;
    
    if(this.dmObject) {
        this.dmObject.removeListener(this);
        if(this.getProperty('dmObjectCreated','true') === 'true') {
            this.dmObject.dispose();
        }
    }
    
    this.dmObject = FM.isset(o) && o ? o : null;
    if(this.dmObject && FM.isset(addListener) && addListener) {
        this.dmObject.addListener(this);
    }    
}

FM.LmObject.prototype.getRegistryRoot = function() {
    return  "/" + (this.app ? this.app.getSubClassName() : "APP") + 
            "/sClass" +
            "/" + this.getSubClassName()
    ;    
}

FM.LmObject.prototype.getRegistryValue = function(key,dval) {
    return this.app ? this.app.appRegistry.get(
         this.getRegistryRoot() +
         key,
         dval
     ) : dval;    
}

FM.LmObject.prototype.setRegistryValue = function(key,val) {
    if(this.app) this.app.appRegistry.set(
         this.getRegistryRoot() +
         key,
         val
     );        
}
