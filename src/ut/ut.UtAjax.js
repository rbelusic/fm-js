/**
* Ajax class. 
* 
* @class FM.UtAjax
* @extends FM.Object
* @param {object} config Options
* 
* Valid options:
* 
*/    

FM.UtAjax = FM.defineClass('UtAjax',FM.Object);
FM.UtAjax.className = "UtAjax";

// methods
FM.UtAjax.prototype._init = function(config) {            
    this._super("_init",config);
    this.objectSubClass = "UtAjax";

    this.http = null;
}

FM.UtAjax.prototype._ajaxCallback = function(data,status) {
    var responseObject = data;                
    var respCodesStr = FM.trim(this.getAttr('validResponseCodes',''));            
    var responseCodes = 
        respCodesStr == '' ? [] : 
        this.getAttr('validResponseCodes','').split(",")
    ;
    var i;
    for(i=0;i < FM.sizeOf(responseCodes); i++) {
        if(FM.trim(responseCodes[i]) == status) break;
    }
    if(i != 0 && i == FM.sizeOf(responseCodes)) {
        return this.fireEvent("onAjaxStateError",new FM.DmGenericError({
            messageId: "1",
            text: "Invalid response code (found:" + status + 
                ", expected:" + responseCodes + ")"
        }));
    }
            
    // all ok
    return this.fireEvent(
        "onAjaxStateEnd",
        new FM.DmGenericValue({
            value: responseObject
        })
    );
    
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

FM.UtAjax.prototype.executeCall = function(url, params, headers) {
    var ajaxOptions = {
        global: false,
        cache: this.getAttr("cache","false").toLowerCase() == 'true',
        accepts: {},
        beforeSend: function(jqXHR, settings) {
            return this.fireEvent("onAjaxStateStart",new FM.DmGenericValue({
                value: params
            }));            
        },
        error: function(jqXHR,textStatus,errorThrown) {
            return this.fireEvent("onAjaxStateError",new FM.DmGenericError({
                messageId: "1",
                text: errorThrown
            }));
        },
        success: function(data,textStatus, jqXHR) {
            this._ajaxCallback(data,jqXHR.status);
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
