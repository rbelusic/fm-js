/**
* Timer class. 
* 
* @class FM.UtTimer
*/

FM.UtTimer = FM.defineClass('UtTimer',FM.Object);

FM.UtTimer.minPeriod = 1;
FM.UtTimer.timeoutHandle = null;
FM.UtTimer.jobsList = [];
FM.UtTimer.suspended = false;


FM.UtTimer.__checklist__ = function() {
    if(!FM.UtTimer.isQueueSuspended()) {
        var nlist = [];
        for(var i=0; i < FM.UtTimer.jobsList.length; i++) {
            var job = FM.UtTimer.jobsList[i];
            if(
                job.executecount != 0 && !job.isSuspended() &&
                job.lastRun + job.period * 1000 < new Date().getTime()
            ) {
                job.lastRun = new Date().getTime();
                job.executecount--;
                if(job.executecount != 0) nlist.push(job);
                job.fireEvent(job.event, job.evdata);
            } else {
                if(job.executecount != 0) nlist.push(job);
            }
        }
        FM.UtTimer.jobsList = nlist;

        if(FM.UtTimer.jobsList.length > 0) {
            FM.UtTimer.timeoutHandle = setTimeout(
                "FM.UtTimer.__checklist__()",
                FM.UtTimer.minPeriod * 1000
            );
        }else {
            FM.UtTimer.timeoutHandle = null;
        }
    } else { // za svaki slucaj
        FM.UtTimer.timeoutHandle = null;
    }
}

FM.UtTimer.removeFromQueue = function(job) {
    var nlist = [];
    for(var i=0; i < FM.UtTimer.jobsList.length; i++) {
        if(FM.UtTimer.jobsList[i] != job) {
            nlist.push(FM.UtTimer.jobsList[i]);
        }
    }
    FM.UtTimer.jobsList = nlist;    
}

FM.UtTimer.addToQueue = function(job) {
    FM.UtTimer.jobsList.push(job);
    if(!FM.UtTimer.timeoutHandle) {
        FM.UtTimer.__checklist__();
    }    
}

FM.UtTimer.isQueueSuspended = function() {
    return FM.UtTimer.suspended;
}

FM.UtTimer.suspendQueue = function() {
    FM.UtTimer.suspended = true;
}

FM.UtTimer.resumeQueue = function() {
    FM.UtTimer.suspended = false;
    FM.UtTimer.__checklist__();
}
