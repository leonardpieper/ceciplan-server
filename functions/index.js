const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.sendMessage = functions.database.ref("vPlan/{stufe}/{vPlanDay}").onWrite(event => {
    var eventMessage;
    var fach;
    

    
    //Eine neue Vertretung wurde hinzugefügt:
    if(!event.data.previous.exists()){
        fach = event.data.child("Fach").val();
        
        var d = new Date();
        //Zwischen Sonntag 0:00 und Montag 10:00 sollen keine Benachrichtigungen geschickt werden
        if(d.getDate()==0 || (d.getDate()==1&&d.getHours()==10)){
            return;
        }else{
            eventMessage = isEntfallOrVertretung(event.data.child("Lehrer").val()) + " in " + fach;
        }
    //Eine Vertretung wurde gelöscht:
    }else if(!event.data.exists()){
        fach = event.data.previous.child("Fach").val();
        eventMessage = "Unterricht findet in " + fach + " doch statt";
    }
    //Eine Vertretung wurde bearbeitet:
    else if(event.data.exists()&&event.data.previous.exists()){
        fach = event.data.child("Fach").val();
    
        eventMessage = "Es gab eine Änderung in " + fach;
    }

    var fachTopic = fach.replace(" ", "%20");
    fachTopic = fachTopic.toLowerCase();
    

    payload = {
        notification: {
            title: eventMessage,
            body: "Sieh in der App nach"
        }
    };
    // sendMessage();
    admin.messaging().sendToTopic(fachTopic, payload)
    .then(function(response) {
        // See the MessagingTopicResponse reference documentation for the
        // contents of response.
        console.log("Successfully sent message:", response);
    })
    .catch(function(error) {
        console.log("Error sending message:", error);
    });
});

function isEntfallOrVertretung(lehrer){
    if(lehrer=="+"||lehrer=="-"){
        return "Entfall";
    }else{
        return "Vertretung";
    }
}