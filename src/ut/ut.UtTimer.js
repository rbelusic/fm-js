/**
* Timer class. <b>Ovo bi trebalo srediti da extend FM.object</b>
* 
* @class FM.UtTimer
*/
FM.UtTimer = function() {
    //this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.UtTimer,null); 

// properties
FM.UtTimer.prototype.objectSubClass = "UtTimer";

// static
FM.UtTimer.className = "UtTimer";
FM.UtTimer.fullClassName = 'ut.UtTimer';

FM.UtTimer.minPeriod = 1;
FM.UtTimer.timeoutHandle = null;
FM.UtTimer.jobsList = [];
FM.UtTimer.suspended = false;

FM.UtTimer.__checklist__ = function() {
    if(!FM.UtTimer.suspended) {
        var nlist = [];
        for(var i=0; i < FM.UtTimer.jobsList.length; i++) {
            var job = FM.UtTimer.jobsList[i];
            if(
                job.executecount != 0 && job.suspeded != false &&
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
            FM.UtTimer.timeoutHandle = setTimeout("FM.UtTimer.__checklist__()",FM.UtTimer.minPeriod * 1000);
        }else {
            FM.UtTimer.timeoutHandle = null;
        }
    } else { // za svaki slucaj
        FM.UtTimer.timeoutHandle = null;
    }
}

FM.UtTimer.suspendQueue = function() {
    FM.UtTimer.suspended = true;
}

FM.UtTimer.resumeQueue = function() {
    FM.UtTimer.suspended = false;
    FM.UtTimer.__checklist__();
}
