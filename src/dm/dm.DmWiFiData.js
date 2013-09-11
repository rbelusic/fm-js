//-- WiFiData ----------------------------------------------------------------
FM.DmWiFiData = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(FM.DmWiFiData, FM.DmObject); 

// properties
FM.DmWiFiData.prototype.objectSubClass = "";

// methods
FM.DmWiFiData.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        bssid: '',
        ssid: '',
        frequency: '',
        level: '',
        l_tstamp: ''
    });
    this.objectSubClass = "WiFiData";
}
        
FM.DmWiFiData.prototype.getDataID = function() {
    return this.getAttr('bssid');
}

FM.DmWiFiData.className = "DmWiFiData";
FM.DmWiFiData.fullClassName = 'dm.DmWiFiData';

FM.DmObject.addSubClassType('WiFiData',FM.DmWiFiData,'GLOBAL');

