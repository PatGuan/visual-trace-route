google.maps.event.addDomListener(window, 'load', initMap);


function initMap() {
  map = new google.maps.Map(document.getElementById('googleMap'), {
    center: {lat: 43.6889, lng: -79.4507},
    zoom: 15
  });
  var map = new google.maps.Map(document.getElementById("googleMap"),initMap);
};

function getTraceRoute() {
	var websiteInput = $("#websiteInput").val();
	toggleInputFieldAndButton(true);
	$.ajax({
		url: "/traceIp",
		data: {"website" : websiteInput},
		dataType: 'json',
		type: "POST",
		success: function(response) {
			console.log(response);
			toggleInputFieldAndButton(false);
			informTimedOutRequests(response.timedOutRequests);
			var parsedTraceRouteDetailsList = extractTracerouteDetailsFromResponse(response.websiteData);
			mapAllMarkersOnMap(parsedTraceRouteDetailsList);
		},
		error: function() {
			console.log("error");
			toggleInputFieldAndButton(false);
		}
	});
}

function informTimedOutRequests(timedOutRequests) {
	if (timedOutRequests.length > 0) {
		for (var i = 0; i < timedOutRequests.length; i++) {
			//TO-DO: Find a better way to show these timed out requests. Not clean putting html tags in JS.
			$("#additionalInfo").append("<h2> Request " + timedOutRequests[i] + " has timed out while travelling between " + (timedOutRequests[i]-1) + " and " + (timedOutRequests[i]+1) + "</h2>");
		}
	}
}

function extractTracerouteDetailsFromResponse(response) {
	var tracerouteDetails = []
	for (var i = 0; i < response.length; i++) {
		tracerouteDetails.push(JSON.parse(response[i]));
	}
	return tracerouteDetails;
}

function toggleInputFieldAndButton(isDisabled) {
	$("#websiteInput").prop("disabled", isDisabled);
	if (isDisabled) {
		$("#theButton").prop("disabled", isDisabled).html("Tracing...");
	}
	else {
		$("#theButton").prop("disabled", isDisabled).html("Trace");
	}
}

function mapAllMarkersOnMap(latAndLongArray) {

	//Get the middle of the trip.
	var middleIndexOfTraceroute = Math.ceil(latAndLongArray.length/2);
	var middleLatAndLon = new google.maps.LatLng(latAndLongArray[middleIndexOfTraceroute].lat, latAndLongArray[middleIndexOfTraceroute].lon);

	var mapConfig = {
		zoom: 5,
		center: middleLatAndLon,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	map = new google.maps.Map(document.getElementById("googleMap"), mapConfig);
	var infoWindow = new google.maps.InfoWindow();

	for (var i = 0; i < latAndLongArray.length; i++) {
		if (latAndLongArray[i].status != "fail") {
			createMapMarker(latAndLongArray[i], map, infoWindow, i);
		}
	}
}

function createMapMarker(traceRouteItem, map, infoWindow, i) {
	var latlng = new google.maps.LatLng(traceRouteItem.lat, traceRouteItem.lon);
	var traceRouteOrder = i + 1;
	var marker = new google.maps.Marker({
		position: latlng,
		map: map,
		title: traceRouteItem.city,
		label: traceRouteOrder.toString()
	});

	google.maps.event.addListener(marker, 'click', (function(marker) {
        return function() {
          infowindow.setContent(marker.title);
          infowindow.open(map, marker);
        }
    })(marker));
}

$(document).ready(function() {
	$("#theButton").click(function() {
		getTraceRoute();
	})
})
