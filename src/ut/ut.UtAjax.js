/**
* Ajax class. 
* 
* @class FM.UtAjax
* @extends FM.Object
* @param {object} config Options
* 
* Valid options:
*
* cache: true/false
* url: url,
* method: POST/GET/...
* contentType: application/x-www-form-urlencoded
* auth {
*  username: '',
*  password:''
* }
* responseFormat: JSON/TEXT
* params: { // _body: za for post body
*  a: true, 
*  b:true
*  } 
* headers:{}
 
*/    

FM.UtAjax = FM.defineClass('UtAjax',FM.Object);

// methods
FM.UtAjax.prototype._init = function(config) {            
    this._super("_init",config);
    this.objectSubClass = "Ajax";

    this.http = null;
    this.lastStatusCode = "0";
}

FM.UtAjax.prototype.send = function(args) {
    var url = this.getAttr('url','');
    var params = this.getAttr('params',{});
    var headers = this.getAttr('headers',{});
    
    var pline = "";
    
    if(FM.isObject(args)) {
        var val;
        for(var pname in args) {
            if(FM.isset(params[pname])) {
                val = FM.getAttr(args,pname,'');
                if(pname === "_body" && this.getAttr("method","POST") == 'POST') {
                    pline = val;
                    break;
                } else {
                    pline = pline + (pline == "" ? "" : "&") + pname + "=" + encodeURIComponent(val);
                }
            }
        }
    }
    
    this.http = this.executeCall(url, pline, headers);

    return true;
}     

FM.UtAjax.prototype.getLastStatus = function() {
    return this.lastStatusCode;
}

FM.UtAjax.prototype.executeCall = function(url, params, headers) {
    var ajaxOptions = {
        global: false,
        cache: this.getAttr("cache","false").toLowerCase() == 'true',
        accepts: {},
        beforeSend: function(jqXHR, settings) {
            return this.fireEvent("onAjaxStateStart",params);            
        },
        error: function(jqXHR,textStatus,errorThrown) {
            this.lastStatusCode = textStatus;
            return this.fireEvent("onAjaxStateError", errorThrown);
        },
        success: function(data,textStatus, jqXHR) {
            this.lastStatusCode = textStatus;
            return this.fireEvent(
                "onAjaxStateEnd", data
            );
        },
        url: url,
        type: this.getAttr("method","POST").toLowerCase(),
        contentType: this.getAttr('contentType',"application/x-www-form-urlencoded"),
        context: this,
        data: params,
        headers: headers,
        username: this.getAttr('auth.username',''),
        password: this.getAttr('auth.password',''),
        dataType: this.getAttr('responseFormat','TEXT').toLowerCase() 
    };
    
    return $.ajax(ajaxOptions);
}
