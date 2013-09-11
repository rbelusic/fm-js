/**
* GPS class. 
* 
* @class FM.UtGps
*/
FM.UtGps = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.UtGps,FM.Object); 

// properties
FM.UtGps.prototype.objectSubClass = "UtGps";

// static
FM.UtGps.className = "UtGps";
FM.UtGps.fullClassName = 'ut.UtGps';

FM.UtGps.prototype._init = function(opt) {            
    this.gpsObject = null;
    this.gpsStatus = false;
    this._super("_init",opt);
    this.objectSubClass = "UtGps";
}

FM.UtGps.prototype._sendGpsEvent = function(p) {
    this.fireEvent("onGpsPosition",{
        xpos:       FM.getAttr(p,'coords.longitude',''),
        ypos:       FM.getAttr(p,'coords.latitude',''),
        zpos:       FM.getAttr(p,'coords.altitude',''),
        xyacc:      FM.getAttr(p,'coords.accuracy',''),
        zacc:       FM.getAttr(p,'coords.altitudeAccuracy',''),
        speed:      FM.getAttr(p,'coords.speed',''),
        heading:    FM.getAttr(p,'coords.heading',''),
        tstamp:     new Date().getTime()
    });
}

FM.UtGps.prototype._sendGpsErrorEvent = function(errormsg) {
    this.fireEvent("onGpsError",errormsg);
}


FM.UtGps.prototype.isStarted = function() {
    return this.gpsObject != null && this.gpsStatus;
}

FM.UtGps.prototype.stopService = function(sendEvent) {
    if(this.gpsObject) {
        navigator.geolocation.clearWatch(this.gpsObject);
        this.gpsObject = null;
    }
    this.gpsStatus = false;
    if(FM.isset(sendEvent) && sendEvent == true) {
        this.fireEvent("onGpsServiceStopped",this);
    }
}

FM.UtGps.prototype.startService = function(sendEvent) {
    if(this.isStarted()) this.stopService();

    var me = this;
    this.gpsObject = navigator.geolocation.watchPosition(function(p) {
        me._sendGpsEvent(p);
    },function(error) {
        me._sendGpsErrorEvent(error.message);
    });
    this.gpsStatus = true;
    if(FM.isset(sendEvent) && sendEvent == true) this.fireEvent("onGpsServiceStarted","");
}

FM.UtGps.prototype.getPosition = function(cbFn) {
    var me = this;
    var callbackFn = isset(cbFn) && cbFn ? cbFn : function() {};
    var stsrv = this.isStarted();
    if(stsrv) this.stopService(false);
    navigator.geolocation.getCurrentPosition(function(p) {
        if(stsrv) me.startService(false);
        if(callbackFn) {
            callbackFn({
                xpos:       FM.getAttr(p,'coords.longitude',''),
                ypos:       FM.getAttr(p,'coords.latitude',''),
                zpos:       FM.getAttr(p,'coords.altitude',''),
                xyacc:      FM.getAttr(p,'coords.accuracy',''),
                zacc:       FM.getAttr(p,'coords.altitudeAccuracy',''),
                speed:      FM.getAttr(p,'coords.speed',''),
                heading:    FM.getAttr(p,'coords.heading',''),
                tstamp:     new Date().getTime()
            },null);
        } else {
            me._sendGpsEvent(p);
        }
    },function(error) {
        if(stsrv) me.startService(false);
        if(callbackFn) callbackFn(null,error.message);
        else me.sendGpsErrorEvent(error.message);
    },{
        timeout:10000
    });
}



FM.UtGps.className = "UtGps";
FM.UtGps.fullClassName = "ut.UtGps";

