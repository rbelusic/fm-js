/**
 * @SSCCE ob.object Observer pattern 
 */
var subject = new FM.Object();
var observer = new FM.Object();

subject.addListener(observer);
observer.onEventName = function(subject,eventData) {
                console.log("onEventName: subject with ID " + subject.getID()+ " sent message: " + eventData["message"]);
            }
subject.fireEvent("onEventName", {"message":"hello"});