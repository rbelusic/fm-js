/* 
 * fm.js examples, common code
 * 
 */

// == prvo init domaina ====
fmdemo = {};

// == kreiramo aplikaciju ==
// (copy & paste)
fmdemo.AppFmDemo = function() {
    this._init.apply(this, arguments); 
    this.setLogLevel(FM.logLevels.debug);
}

// svaka app mora extendati FM.AppObject
FM.extendClass(fmdemo.AppFmDemo,FM.AppObject); 

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

