/* 
 * fm.js examples, common code
 * 
 */

FM.setLogLevel(FM.logLevels.debug); // set global log level

// == prvo init domaina ====
fmdemo = {};

// == kreiramo aplikaciju ==
// data-fmml-tag za startanje app
// 
// (copy & paste)
fmdemo.AppFmDemo = FM.defineClass('AppFmDemo',FM.AppObject);

// == napraviti ćemo statičku metodu za pokretanje app
fmdemo.AppFmDemo.startApp = function(args) {
    var app = FM.AppObject.startApp({
        appClass: 'fmdemo.AppFmDemo',
        options: args
    }); // start application instance
    if(app) {
        FM.log(app,app.getAttr(),FM.logLevels.debug);
        app.mlInit(); // read and process data bindings on html page        
    }
    
    return app; // app object can be used to comunicate with app outside fm framework
}

// == create static dm list ==========================================
FM.DmList.addConfiguration('staticListExample', {
    responseObject: FM.DmObject,
    data: [ // for all query params
        {id:1, name: "name1",description: "description 1"},
        {id:2, name: "name2",description: "description 2"},
        {id:3, name: "name3",description: "description 3"},
        {id:4, name: "name4",description: "description 4"}
    ]
});
