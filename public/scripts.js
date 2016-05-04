var x = document.getElementById("demo");


function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(savePosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
var userLocation;

function savePosition(position) {
    userLocation = [position.coords.latitude, position.coords.longitude];

    eventview.on("child_added", function (newSnapshot) {
        onAdd(newSnapshot, userLocation);
    });

}


var firebaseRef = new Firebase("https://free-food.firebaseio.com/");
var geoFire = new GeoFire(firebaseRef);

eventview = firebaseRef.limitToLast(35);

function storeLocation() {
    var event = document.getElementById("event");
    var food = document.getElementById("food");
    var org = document.getElementById("organization");

    if (event.value.trim() == "" || food.value.trim() == "" || org.value.trim() == "") {
        alert("Fields cannot be left blank!");
    } else {
        eventview.off("child_added");
        firebaseRef.once("value", function (snapshot) {
            if (snapshot.child(event.value.trim()).exists()) {
                alert("The event " + event.value.trim() + " already exists!");
            } else {

                geoFire.set(event.value, userLocation).then(function () {

                }, function (error) {
                    console.log("error: " + error);
                });

                storeEvent(event);
            }
        });
    }
}
function storeEvent(event) {
    eventview.on("child_changed", function (newSnapshot) {
        onAdd(newSnapshot, userLocation);
    });
    var food = document.getElementById("food");
    var org = document.getElementById("organization");

    firebaseRef.child(event.value).update({
        description: event.value,
        organization: org.value,
        food: food.value
    });
}
var htmlForPath = {};
var EventLocation = [];

function onAdd(snapshot, userloc) {
    EventLocation = snapshot.val().l;
    console.log(snapshot.val());
    var distance = GeoFire.distance(EventLocation, userloc);
    distance = distance.toFixed(2);
    var newRow = $('<tr/>');
    newRow.append($("<td/>").append($("<em/>")).text(snapshot.val().description));
    newRow.append($("<td/>").text(snapshot.val().food));
    newRow.append($("<td/>").text(snapshot.val().organization));
    newRow.append($("<td/>").text(distance));
    htmlForPath[snapshot.key()] = newRow;


    $('#events tbody').append(newRow);


}


function onRemove(snapshot) {
    var removedRow = htmlForPath[snapshot.key()];
    removedRow.remove();
    delete htmlForPath[snapshot.key()];
}


setTimeout(function() {$('table').tablesorter({sortList: [[3,0]]});}, 5000);


