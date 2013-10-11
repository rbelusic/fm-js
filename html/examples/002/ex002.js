/* 
 * fm.js demo app 02
 * 
 */

// == new dmobject to hold response data ====
fmdemo.DmFacebookPage = function() {
    this._init.apply(this, arguments); 
}
// extends basic Data model class
FM.extendClass(fmdemo.DmFacebookPage, FM.DmObject); 

// constructor
fmdemo.DmFacebookPage.prototype._init = function(attrs) {
    this._super("_init",attrs, { // define object attributes
        about: "",
        category: "",
        company_overview: "",
        founded: "",
        is_published: false,
        talking_about_count: 0,
        username: "",
        website: "",
        were_here_count: 0,
        id: "",
        name: "",
        link: "",
        likes: 0,
        cover: {
            cover_id: "",
            source: "",
            offset_y: 0,
            offset_x: 0
        }
    });
    this.objectSubClass = "FacebookPage";
}
        
// id attribute is unique 
fmdemo.DmFacebookPage.prototype.getDataID = function() {
    return this.getAttr('id','');
}

fmdemo.DmFacebookPage.className = "DmFacebookPage";
fmdemo.DmFacebookPage.fullClassName = 'dm.DmFacebookPage';

FM.DmObject.addSubClassType('FacebookPage',fmdemo.DmFacebookPage);

// == create dm list ==========================================
// DmList is list containing multiple DmObjects
FM.DmList.addConfiguration('getFacebookPage', {  
    url: 'https://graph.facebook.com/[:id]',
    method: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'single',
    responseObject: fmdemo.DmFacebookPage
});

// == create get method in application =========================================
fmdemo.AppFmDemo.prototype.getFacebookPage = function(id,cbfn) {
    id = FM.isset(id) && id && FM.isString(id) ? id : '';
    
    var me = this;
    var dmlist = this.dmListFactory({
            id: id
        },
        'getFacebookPage',
        true
    );
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {};
    
    // create listener 
    var lstnr = {
        onListEnd: function(sender,data) {
            // show some info in console
            me.log("End of dmList request.",FM.logLevels.info,'onListEnd');
            // get first object from list
            var oData = null;
            FM.forEach(data.Added,function(id, obj) {
                oData = obj;
                return false; // exit from loop
            });
            
            sender.dispose(); // dispose dmlist
            
            // return data
            if(oData) {
                callbackFn(true,oData);
            } else {
                alert("No data returned");
                callbackFn(false,null);
            }
            return true;
        },
        onListError: function(sender,data) {
            sender.dispose();
            alert("Error fetching data!" + FM.serialize(data.getAttr()),'onListError');
            callbackFn(false,null);
            return true;
        }
    };
    // add listener to dmlist and wait for onListEnd or onListError event
    dmlist.addListener(lstnr);
    
    // fetch data from server
    dmlist.getData();
}
