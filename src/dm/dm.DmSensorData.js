//-- SensorData ----------------------------------------------------------------
FM.DmSensorData = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(FM.DmSensorData, FM.DmObject); 

// properties
FM.DmSensorData.prototype.objectSubClass = "";

// methods
FM.DmSensorData.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        sensor: '',
        l_tstamp: '',
        v1: '',
        v2: '',
        v3: '',
        v: '',
        azimuth: '',
        pitch: '',
        roll: ''
    });
    this.objectSubClass = "SensorData";
}
        
FM.DmSensorData.prototype.getDataID = function() {
    return this.getID();
}

FM.DmSensorData.className = "DmSensorData";
FM.DmSensorData.fullClassName = 'dm.DmSensorData';

FM.DmObject.addSubClassType('SensorData',FM.DmSensorData,'GLOBAL');

