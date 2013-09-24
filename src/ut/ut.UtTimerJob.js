/**
* Timer job class. 
* 
* @class FM.UtTimerJob
* @extends FM.Object
* @param {String} event Event to send
* @param {any} evdata Data to send with event
* @param {number} period Period in seconds
* @param {number} number of times to execute
*/    
FM.UtTimerJob = FM.defineClass('UtTimerJob',FM.Object);
FM.UtTimerJob.className = "UtTimerJob";

FM.UtTimerJob.prototype._init = function(event,evdata,period,executecount) {
    this.objectSubClass = "TimerJob";
    this.event = '';
    this.evdata = null;
    this.period = -1;
    this.executecount = -1;
    this.suspended = false;
    this.started = false;
    this.lastRun = 0;

    this._super("_init",evdata);

    this.event = event;
    this.evdata = evdata;
    this.period = period < FM.UtTimer.minPeriod ? FM.UtTimer.minPeriod : period;
    this.executecount = FM.isset(executecount) ? executecount : -1;
    this.suspended = false;
    this.started = false;
    this.lastRun = 0;
}

FM.UtTimerJob.prototype.start = function() {
    this.started = true;
    FM.UtTimer.jobsList.push(this);
    if(!FM.UtTimer.timeoutHandle) {
        FM.UtTimer.__checklist__();
    }
}

FM.UtTimerJob.prototype.isStarted = function() {
    return this.started;
}

FM.UtTimerJob.prototype.isSuspended = function() {
    return this.suspended;
}

FM.UtTimerJob.prototype.suspend = function() {
    this.suspended = true;
}

FM.UtTimerJob.prototype.resume = function() {
    if(!this.isStarted()) this.start();
    this.suspended = false;
}

FM.UtTimerJob.prototype.dispose = function() {    
    FM.UtTimer.suspended = true;
    
    this.suspended = true;
    this.started = false;
    
    var nlist = [];
    for(var i=0; i < FM.UtTimer.jobsList.length; i++) {
        if(FM.UtTimer.jobsList[i] != this) {
            nlist.push(FM.UtTimer.jobsList[i]);
        }
    }
    FM.UtTimer.jobsList = nlist;
    
    this.removeAllListeners();
    
}


