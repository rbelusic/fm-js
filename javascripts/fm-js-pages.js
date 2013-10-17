FM.DmList.addConfiguration('getReleases', {
    url: "/fm-js/data/releases.json",
    // ajax config
    method: 'GET',
    responseFormat: 'JSON'
});


function startApp(args) {
    $(".nav-link").click(function(){
        $(".nav-link").parents().removeClass("active")
        $(this.parentNode).addClass("active");
    });
    
    var app = FM.AppObject.startApp({
        options: args
    }); // start application instance
    if(app) {
        app.mlInit(); // read and process data bindings on html page        
    }
    
    return app; // app object can be used to comunicate with app outside fm framework
}