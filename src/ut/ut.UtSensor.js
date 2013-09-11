/**
* Sensor class. 
* 
* @class FM.UtSensor
*/
FM.UtSensor = function() {
    this._init.apply(this, arguments); // new poziva _init()
}

FM.extendClass(FM.UtSensor,FM.Object); 

// properties
FM.UtSensor.prototype.objectSubClass = "UtSensor";
FM.UtSensor.prototype.lastReceivedData = null;

// static
FM.UtSensor.className = "UtSensor";
FM.UtSensor.fullClassName = 'ut.UtSensor';

FM.UtSensor.prototype._init = function(opt) {   
    //console.log("UtSensor:" + JSON.stringify(opt));
    this.sensorStatus = false;
    this.lastReceivedData = null;
    this._super("_init",opt);
    this.objectSubClass = "UtSensor";
}

FM.UtSensor.prototype._sendSensorEvent = function(p) {    
    if(this.sensorStatus != true) return;

    console.log("_sendSensorEvent:" + FM.serialize(p, {}));
    this.lastReceivedData = new FM.DmSensorData({
        sensor: FM.getAttr(p,'type','UNKNOWN'),
        l_tstamp: FM.getAttr(p,'tstamp',''),
        v1: parseFloat(FM.getAttr(p,'values.0','0')),
        v2: parseFloat(FM.getAttr(p,'values.1','0')),
        v3: parseFloat(FM.getAttr(p,'values.2','0')),
        v: 0,
        azimuth: parseFloat(FM.getAttr(p,'orientation.0','0')),
        pitch: parseFloat(FM.getAttr(p,'orientation.1','0')),
        roll: parseFloat(FM.getAttr(p,'orientation.2','0'))        
    });
    
    this.fireEvent("onSensorData",this.lastReceivedData);
}

FM.UtSensor.prototype._sendSensorErrorEvent = function(errormsg) {
    this.fireEvent("onSensorError",errormsg);
}


FM.UtSensor.prototype.isStarted = function() {
    return this.sensorStatus;
}

FM.UtSensor.prototype.stopService = function(sendEvent) {
    if(this.isStarted()) {
        this.sensorStatus = false;
        fmRemoveSensorListener(this.getID(),this.getAttr("type",""));
        console.log("UtSensor stopped:" + this.getAttr("type",""));
        if(FM.isset(sendEvent) && sendEvent == true) {
            this.fireEvent("onSensorServiceStopped",this);
        }
    }
}

FM.UtSensor.prototype.startService = function(sendEvent) {
    if(!this.isStarted()) {
        var me = this;
        this.sensorStatus = true;
        fmAddSensorListener(
            this.getID(),
            this.getAttr("type",""),
            function(p) {
                me._sendSensorEvent(JSON.parse(p));
            },function(error) {
                me._sendSensorErrorEvent(error.message);
            }
        );        

        if(FM.isset(sendEvent) && sendEvent == true) this.fireEvent("onSensorServiceStarted","");
        console.log("UtSensor started:" + this.getAttr("type",""));
    }
}

FM.UtSensor.prototype.get = function() {
    return this.lastReceivedData;
}


FM.UtSensor.className = "UtSensor";
FM.UtSensor.fullClassName = "ut.UtSensor";

