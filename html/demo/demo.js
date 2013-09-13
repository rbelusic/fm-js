/* 
 * fm.js demo app
 * 
 */

// == prvo init domaina ====
fmdemo = {};

// == kreiramo aplikaciju ==
// (copy & paste)
fmdemo.AppFmDemo = function() {
    this._init.apply(this, arguments); 
}

// svaka app mora extendati FM.AppObject
FM.extendClass(fmdemo.AppFmDemo,FM.AppObject); 

// == event methods ==
/* evdata is javascript object {
        object: dmObject (host dmobject),
        callback: function(isok, o) {}
        }
        */
fmdemo.AppFmDemo.prototype.onIncreseValue = function(sender,evdata) {
    // increase value attribute in dmobject. all interested parties (listeners on this
    // dmobject (hosts & observers) will be notified with onChange event
    evdata.object.setAttr("value",
        parseInt(evdata.object.getAttr("value",0)) + 1,
        true // send onChange event
        );
}

fmdemo.AppFmDemo.prototype.onDecreaseValue = function(sender,evdata) {
    // decrease value attribute in dmobject. all interested parties (listeners on this
    // dmobject (hosts & observers) will be notified with onChange event
    evdata.object.setAttr("value",
        parseInt(evdata.object.getAttr("value",0)) -1,
        true // send onChange event
        );
}

// == napraviti ćemo statičku metodu za pokretanje app
fmdemo.AppFmDemo.startApp = function(args) {
    var app = FM.AppObject.startApp({
        appClass: 'fmdemo.AppFmDemo',
        options: args
    }); // start application instance
    if(app) {
        app.mlInit(); // read and process data bindings on html page
    }
    return app; // app object can be used to comunicate with app outside fm framework
}

