/* Author:         Quinn Helm
 * Student Number: 000737479
 * Date Complete:  10/11/2019 (DD/MM/YYYY)
 *
 * Statement of Authorship:
 * I, Quinn Helm, student number 000737479, certify that this material is my original work.
 * No other person's work has been used without due acknowledgement and I have not made my work available to anyone else.
 */

// default map
var defaultLocation;

// user details
var userError;
var userPin;
var userInfo;
var userLocation;

// info boxes
var infoBox;
var infoTemplate = '<div id="infobox"><h5>{title}</h5>' +
                   '<p>{description}</p></div>';

// map related stuff
var mapOnUser;
var directionsHandler;
var nearbyHandler;

// pin arrays & details
var comms = [];
var industs = []; 
var mixed = []; 
var isFiltered = false;
var pinType = "all";

// related to the textTarget box
var isNearbyHidden = true;

// nearby location queries
var sourceUrl = 'https://spatial.virtualearth.net/REST/v1/data/f22876ec257b474b82fe2ffcb8393150/NavteqNA/NavteqPOIs';
var selectedPinLocation;

function load() {
    var location;
    var pin;

    mapOnUser = new Microsoft.Maps.Map(document.getElementById('userMap'),
        {
            center: (location),
            zoom: 11
        });

    defaultLocation = new Microsoft.Maps.Location(43.3255, -79.7990);

    navigator.geolocation.getCurrentPosition(
        function (position) {
            userPin(position.coords.latitude, position.coords.longitude);
            location = new Microsoft.Maps.Location(position.coords.latitude, position.coords.longitude);
        },
        function failure(errorMessage) {
            error = errorMessage.message;
            document.getElementById("commentSection").innerHTML = error;
            document.getElementById("commentSection").className = "error";
            document.getElementById("commentsBtn").style.display = "none";
        }
    );

    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        directionsHandler = new Microsoft.Maps.Directions.DirectionsManager(mapOnUser);
        directionsHandler.setRequestOptions({ routeMode: Microsoft.Maps.Directions.RouteMode.driving });
    });
    Microsoft.Maps.loadModule('Microsoft.Maps.SpatialDataService');
    
    infoBox = new Microsoft.Maps.Infobox(mapOnUser.getCenter(), { visible: false });
    infoBox.setMap(mapOnUser);

    for (var i = 0; i < land.length; i++) {
        location = new Microsoft.Maps.Location(land[i].LATITUDE, land[i].LONGITUDE);
        pin = new Microsoft.Maps.Pushpin(location);

        metaPins(pin, land[i]);
        Microsoft.Maps.Events.addHandler(pin, 'click', pinClicked);

        if ((land[i].VACTYPE === 'Vacant Comm Land') || (land[i].VACTYPE === 'Underdeveloped Commercial')) {
            comms.push(pin);
        } else if ((land[i].VACTYPE === 'Underdeveloped Industrial') || (land[i].VACTYPE === 'Vacant Ind Land')) {
            industs.push(pin);
        } else if (land[i].VACTYPE === 'Vacant Mixed Use Land') {
            mixed.push(pin);
        }

        mapOnUser.entities.push(pin);
    }
    pinType = 'all';
}

function userPin(lat, long) {
    userLocation = new Microsoft.Maps.Location(lat, long);
    userInfo = new Microsoft.Maps.Infobox(userLocation, {
        htmlContent: infoTemplate.replace('{title}', 'Your Location').replace('{description}', 'Click other pins!'),
        visible: true
    });
    userPin = new Microsoft.Maps.Pushpin(userLocation);
    userInfo.setMap(mapOnUser);
    mapOnUser.entities.push(userPin);
}

// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~* NOT DONE *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
function setDestination(lat, long) {
    toggle('directions');

    var userWaypoint = new Microsoft.Maps.Directions.Waypoint({ location: userLocation });
    var destLocation = new Microsoft.Maps.Location(lat, long);
    var destinationWaypoint = new Microsoft.Maps.Directions.Waypoint({ location: destLocation });

    directionsHandler.addWaypoint(userWaypoint);
    directionsHandler.addWaypoint(destinationWaypoint);

    directionsHandler.setRenderOptions({ itineraryContainer: document.getElementById('textTarget') });
    directionsHandler.calculateDirections();

    if (infoBox.getVisible()) {
        infoBox.setOptions({ visible: false });
    } else if (userInfo.getVisible()) {
        userInfo.setOptions({ visible: false });
    }
}

// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~* NOT DONE *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
function nearbyTypes(load, t) {
    // filter types
    var num = 5540 + ')'; // default is gas stations
    if (t === 'coffee') {
        num = 9996 + ')';
    } else if (t === 'bus') {
        num = 4170 + ')';
    } else if (t === 'all') {
        num = '5540) or (EntityTypeID eq 9996) or (EntityTypeID eq 4170)' // lol this is silly...
    }

    var tempLoc;
    if ((load) || (load == null)) {
        tempLoc = defaultLocation;
    } else {
        tempLoc = selectedPinLocation;
    }

    var query = {
        queryUrl: sourceUrl,
        spatialFilter: {
            spatialFilterType: 'nearby',
            location: tempLoc,
            radius: 5
        },
        filter: '(EntityTypeID eq ' + num
    };

    clearPins();

    Microsoft.Maps.SpatialDataService.QueryAPIManager.search(query, mapOnUser, function (data) {
        if (isFiltered) {
            var temp;
            if (pinType === 'commercial') {
                temp = comms;
            } else if (pinType === 'industrial') {
                temp = industs;
            } else if (pinType === 'mixed') {
                temp = mixed;
            }
            if ((temp != null) && (typeof (temp) === "object")) {
                for (var i = 0; i < temp.length; i++) {
                    mapOnUser.entities.push(temp[i]);
                }
            }
        }
        mapOnUser.entities.push(data);
    }, null, false, function (status, message) {
            document.getElementById('commentSection').innerHTML += '<br />Search failed with status: ' + status;
    });
}

// this calls the nearbyTypes function three times and swaps away from directions
function allNearby() {
    toggle('nearby');
    nearbyTypes(false, 'all');
}

function pinClicked(e) {
    if (e.target.metadata) {
        if (userInfo.getVisible) {
            userInfo.setOptions({ visible: false });
        }
        infoBox.setOptions({
            location: e.target.getLocation(),
            htmlContent: infoTemplate.replace('{title}', e.target.metadata.title).replace('{description}', e.target.metadata.description),
            visible: true
        });
        selectedPinLocation = e.target.getLocation();
        getComments(e.target.metadata.obj); // if this works I hate basic javascript forever
    }
}

function metaPins(pin, jObject) {
    var details;

    if ((jObject.MEMO == null) || (jObject.MEMO == "NULL")) {
        details = "Owner: " + jObject.OWNER.trim();
    } else {
        details = "Memo: " + jObject.MEMO.trim();
    }

    pin.metadata = {
        title: jObject.VACTYPE.trim(), 
        description: 'Address: ' + jObject.ADDRESS.trim() +
            '<br />' + details +
            '<br />' + "<a href='#' onclick='return(setDestination(" +
            jObject.LATITUDE + "," + jObject.LONGITUDE + "));'>Directions</a> " +
            '<br />' + "<a href='#' onclick='return(allNearby());'>Near this place...</a>",
        obj: jObject
    }; // if I can set an object reference in metadata then javascript is BS
}

// *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~* NOT DONE *~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*
function infoSwap() {
    mapOnUser.entities.push(userPin);
    if ((userInfo != null) && (userInfo.getVisible() == false)) {
        infoBox.setOptions({ visible: false });
        userInfo.setOptions({ visible: true });
    }
}

function clearPins() {
    for (var i = mapOnUser.entities.getLength() - 1; i >= 0; i--) {
        pin = mapOnUser.entities.get(i);
        if (pin instanceof Microsoft.Maps.Pushpin) {
            mapOnUser.entities.removeAt(i);
        }
    }
}

function filterCategory(category) {
    clearPins();
    mapOnUser.entities.push(userPin);

    if (category === 'commercial') {
        if (comms != null) {
            for (var i = 0; i < comms.length; i++) {
                mapOnUser.entities.push(comms[i]);
            }
        }
    } else if (category === 'industrial') {
        if (industs != null) {
            for (var i = 0; i < industs.length; i++) {
                mapOnUser.entities.push(industs[i]);
            }
        }
    } else if (category === 'mixed') {
        if (mixed != null) {
            for (var i = 0; i < mixed.length; i++) {
                mapOnUser.entities.push(mixed[i]);
            }
        }
    } else if (category === 'all') {
        if (mixed != null) {
            for (var i = 0; i < mixed.length; i++) {
                mapOnUser.entities.push(mixed[i]);
            }
        }
        if (industs != null) {
            for (var i = 0; i < industs.length; i++) {
                mapOnUser.entities.push(industs[i]);
            }
        }
        if (comms != null) {
            for (var i = 0; i < comms.length; i++) {
                mapOnUser.entities.push(comms[i]);
            }
        }
    }
    pinType = category;
}

function toggle(x) {
    if (x === 'directions') {
        isNearbyHidden = true;
        clearTextbox();
    } else if (x === 'nearby') {
        isNearbyHidden = false;
        clearTextbox();
    }
}

function clearTextbox() {
    directionsHandler.clearAll();
    document.getElementById('textTarget').innerHTML = "";
}

function mapReset() {
    toggle('directions');
    isFiltered = false;
    if (userLocation != null) {
        selectedPinLocation = userLocation;
    } else {
        selectedPinLocation = defaultLocation;
    }
}