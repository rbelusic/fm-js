/**
* GPS cell class. 
* 
* @class FM.UtWiFi
*/
FM.UtWiFi = function() {
    this._init.apply(this, arguments); // new poziva _init()
}

FM.extendClass(FM.UtWiFi,FM.Object); 

// properties
FM.UtWiFi.prototype.objectSubClass = "UtWiFi";

// static
FM.UtWiFi.className = "UtWiFi";
FM.UtWiFi.fullClassName = 'ut.UtWiFi';

FM.UtWiFi.prototype._init = function(opt) {            
    this.wifiObject = null;
    this.wifiStatus = false;
    this._super("_init",opt);
    this.objectSubClass = "UtWiFi";
}

FM.UtWiFi.prototype._sendWiFiEvent = function(i) {
    var lst = [];
    FM.forEach(i, function(i,obj) {
        lst.push(new FM.DmWiFiData(obj));
        return true;
    });
    console.log("_sendWiFiEvent:" + JSON.stringify(i));
    this.fireEvent("onWiFiInfo",lst);
}

FM.UtWiFi.prototype._sendWiFiErrorEvent = function(errormsg) {
    this.fireEvent("onWiFiError",errormsg);
}


FM.UtWiFi.prototype.isStarted = function() {
    return this.wifiObject != null && this.wifiStatus;
}

FM.UtWiFi.prototype.stopService = function(sendEvent) {
    if(this.wifiObject) {
        fmRemoveWiFiListener(this.getID());
        this.wifiObject = null;
    }
    this.wifiStatus = false;
    if(FM.isset(sendEvent) && sendEvent == true) {
        this.fireEvent("onWiFiServiceStopped",this);
    }
}

FM.UtWiFi.prototype.startService = function(sendEvent) {
    if(this.isStarted()) this.stopService();

    var me = this;
    fmAddWiFiListener(
        this.getID(),
        function(p) {
             console.log("new UtWiFi");
            me._sendWiFiEvent(JSON.parse(p));
        },function(error) {
            me._sendWiFiErrorEvent(error.message);
        }
        );        
    this.wifiStatus = true;
    
    if(FM.isset(sendEvent) && sendEvent == true) this.fireEvent("onWiFiServiceStarted","");
}

FM.UtWiFi.className = "UtWiFi";
FM.UtWiFi.fullClassName = "ut.UtWiFi";

