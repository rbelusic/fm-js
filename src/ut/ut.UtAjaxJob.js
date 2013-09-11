/**
* Ayax job class. 
* 
* @class FM.UtAjaxJob
* @extends FM.Object
* @param {object} oOwner Owner of this instance
* @param {object} initParams
* @param {object} callArguments
*/
FM.UtAjaxJob = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.UtAjaxJob,FM.Object); 

// properties
FM.UtAjaxJob.prototype.objectSubClass = "";
FM.UtAjaxJob.prototype.owner = null;
FM.UtAjaxJob.prototype.initParams = null;
FM.UtAjaxJob.prototype.callArguments = null;
FM.UtAjaxJob.prototype.ajaxConnector = null;
FM.UtAjaxJob.prototype.callTime = null;
FM.UtAjaxJob.prototype.runTime = 0;
FM.UtAjaxJob.prototype.endTime = 0;
FM.UtAjaxJob.prototype.finished = false;

FM.UtAjaxJob.prototype._init = function(oOwner,initParams,callArguments) {
    this._super("_init",callArguments);
    this.objectSubClass = "UtAjaxJob";            
    this.owner = oOwner;
    this.initParams = initParams;
    this.callArguments = callArguments;

    this.ajaxConnector = null;
    this.callTime = new Date().getTime();
    this.runTime = 0;
    this.endTime = 0;
    this.finished = false;
}

FM.UtAjaxJob.prototype.getThreadID = function() {
    return(this.owner.getID());
}

FM.UtAjaxJob.prototype.run = function() {
    this.finished = false;
    this.runTime = new Date().getTime();
    this.addListener(this.owner); // ??????
    this.ajaxConnector = new FM.UtAjax(this.initParams);
    this.ajaxConnector.addListener(this);
    this.ajaxConnector.send(this.callArguments);
    return(true);
}

FM.UtAjaxJob.prototype.stop = function() {
    this.finished = true;
    this.endTime = new Date().getTime();
}

FM.UtAjaxJob.prototype.discardJob = function(message) {
    this.stop();
    this.fireEvent("onAjaxStateError",message);
}

FM.UtAjaxJob.prototype.isJobOver = function() {
    return this.finished;
}

FM.UtAjaxJob.prototype.isJobTimeout = function() {
    return (this.callTime && new Date().getTime() - this.callTime > FM.UtAjaxJob.jobQueueTimeout);
}

FM.UtAjaxJob.prototype.isAjaxTimeout = function() {
    return (this.runTime && new Date().getTime() - this.runTime > FM.UtAjaxJob.jobTimeout);
}

FM.UtAjaxJob.prototype.isTimeout = function() {
    if(this.isJobOver()) return(false);
    return (this.isJobTimeout() || this.isAjaxTimeout());
}

FM.UtAjaxJob.prototype.onAjaxStateEnd = function(oAjax,response) {
    this.log("onAjaxStateEnd",response,FM.logLevels.info,this.getFullClassName());
    this.stop();
    this.fireEvent("onGetDataFromServer",{job: this, connection: oAjax, event: 'end', response: response});
    this.fireEvent("onAjaxStateEnd",response);
}

FM.UtAjaxJob.prototype.onAjaxStateError = function(oAjax,errmsg) {
    this.log("onAjaxStateError",errmsg,FM.logLevels.error,this.getFullClassName());
    this.fireEvent("onGetDataFromServer",{job: this, connection: oAjax, event: 'error', message: errmsg});
    this.discardJob(errmsg);
}


FM.UtAjaxJob.prototype.onAjaxStateStart = function(oAjax,data) {
    this.log("onAjaxStateStart",data,FM.logLevels.info,this.getFullClassName());
    this.fireEvent("onGetDataFromServer",{job: this, connection: oAjax, event: 'start', params: data});
    this.fireEvent("onAjaxStateStart",data);
}

// static
FM.UtAjaxJob.className = "UtAjaxJob";
FM.UtAjaxJob.fullClassName = 'ut.UtAjaxJob';
FM.UtAjaxJob.timer = null;
FM.UtAjaxJob.jobQueueTimeout = 60000; // 60 sec
FM.UtAjaxJob.jobTimeout = 20000; // 20 sec
FM.UtAjaxJob.jobMaxTrhreads = 3;
FM.UtAjaxJob.jobList = {}; // {id1: [j1,j2, ..], id2: [...], ...}
FM.UtAjaxJob.threadsList = []; // jobovi

// id je ovdje obj.getID() - to osigurava da jedna dmklasa vrti samo jedan
// job u neko vrijeme, i da istovremeno se vrte najvise x jobova        
FM.UtAjaxJob.addToQueue = function(job) {
    if(FM.UtAjaxJob.timer) {
        clearTimeout(FM.UtAjaxJob.timer);
        FM.UtAjaxJob.timer = null;
    }

    // dodaj job u listu
    if(!FM.isset(FM.UtAjaxJob.jobList[job.getThreadID()])) {
        FM.UtAjaxJob.jobList[job.getThreadID()] = [];
    }

    var jlist = FM.UtAjaxJob.jobList[job.getThreadID()];
    jlist.push(job);

    // odmah kreni u run
    FM.UtAjaxJob.__checklist__();

    // kraj
    return true;
}

FM.UtAjaxJob.__checklist__ = function() {
    // iskljuci tajmer ako radi da ne ulijecemou procesiranje tokom rada
    if(FM.UtAjaxJob.timer) {
        clearTimeout(FM.UtAjaxJob.timer);
        FM.UtAjaxJob.timer = null;
    }

    var i,job,idlist,id;

    // waiting list
    var njoblist = {};    
    for(id in FM.UtAjaxJob.jobList) {
        idlist = FM.UtAjaxJob.jobList[id];

        // iz svake liste samo jedan kandidat
        var nidlist = [];
        for(i=0; i < idlist.length; i++) {
            job = idlist[i];
            if(job.isTimeout()) {
                job.discardJob("Timeout.");
            } else if(!job.isJobOver()) {
                nidlist.push(job);
            }
        }
        if(nidlist.length > 0) {
            njoblist[id] = nidlist;
        }
    }
    FM.UtAjaxJob.jobList = njoblist;

    // running list
    var nlist = [];
    for(i=0; i < FM.UtAjaxJob.threadsList.length; i++) {
        job = FM.UtAjaxJob.threadsList[i];

        // provjeri timeoute
        if(job.isTimeout()) {
            job.discardJob("Timeout.");
        }
        if(!job.isJobOver()) {
            nlist.push(job);
        }
    }
    FM.UtAjaxJob.threadsList = nlist;

    // sad imamo listu osvjezenu
    // ako ima mjesta pokreni novi job
    if(FM.UtAjaxJob.threadsList.length <  FM.UtAjaxJob.jobMaxTrhreads) {
        var numnext = FM.UtAjaxJob.jobMaxTrhreads - FM.UtAjaxJob.threadsList.length;
        var nextJobs = [];
        for(id in FM.UtAjaxJob.jobList) {
            idlist = FM.UtAjaxJob.jobList[id];

            // iz svake liste samo jedan kandidat
            var njob = null;
            for(i=0; i < idlist.length; i++) {
                job = idlist[i];
                if(job.runTime == 0 && (njob == null || njob.callTime > job.callTime)) njob = job;
            }

            if(njob != null) {
                if(nextJobs.length < numnext) {
                    nextJobs.push(job);
                } else {
                    nextJobs.sort(function(j1,j2) {
                        return(j1.callTime - j2.callTime);
                    });
                    if(job.calltime < nextJobs[nextJobs.length-1].calltime) {
                        nextJobs[nextJobs.length-1] = job;
                    }
                }
            }
        }

        // dodaj nove jobove i pokreni ih
        for(i=0; i < nextJobs.length; i++) {
            job = nextJobs[i];
            FM.UtAjaxJob.threadsList.push(job);
            job.run();
        }
    }

    if(!FM.UtAjaxJob.timer && FM.UtAjaxJob.threadsList.length > 0) {
        setTimeout("FM.UtAjaxJob.__checklist__()",2000);
    }
}


