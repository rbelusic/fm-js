/* 
 * fm.js examples, common code
 * 
 */

// set global log level
FM.setLogLevel(FM.logLevels.debug); 

// create examples namespace
fmdemo = {};

// create application
fmdemo.AppFmDemo = FM.defineClass('AppFmDemo',FM.AppObject);

// create static method for application start
fmdemo.AppFmDemo.startApp = function(args) {
    var app = FM.AppObject.startApp({
        appClass: 'fmdemo.AppFmDemo',
        options: args
    }); // start new application instance
    if(app) {
        FM.log(app,app.getAttr(),FM.logLevels.debug);
        app.mlInit(); // read and process data bindings on html page        
    }
    
    return app; // app object can be used to comunicate with app outside fm framework
}

// create static dm list
FM.DmList.addConfiguration('staticListExample', {
    responseObject: FM.DmObject,
    data: [ // for all query params
        {id:1, name: "name1",description: "description 1"},
        {id:2, name: "name2",description: "description 2"},
        {id:3, name: "name3",description: "description 3"},
        {id:4, name: "name4",description: "description 4"},
        {id:5, name: "name5",description: "description 5"},
        {id:6, name: "name6",description: "description 6"},
        {id:7, name: "name7",description: "description 7"},
        {id:8, name: "name8",description: "description 8"},
        {id:9, name: "name9",description: "description 9"}
    ]
});
