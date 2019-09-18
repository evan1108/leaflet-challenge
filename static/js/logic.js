
// endpoint URL
const link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(link).then((data) => {
    createFeatures(data.features);
});


function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    const satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: "pk.eyJ1IjoiZXZhbnN0cm9oIiwiYSI6ImNrMDlwY3dydjBiN2gzY21nNmx2dmV4eXYifQ.e_Fy3PvcpXIhZTWFE7-3SQ"
    });

    const outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: "pk.eyJ1IjoiZXZhbnN0cm9oIiwiYSI6ImNrMDlwY3dydjBiN2gzY21nNmx2dmV4eXYifQ.e_Fy3PvcpXIhZTWFE7-3SQ"
    });

    // Define a baseMaps object to hold our base layers
    const baseMaps = {
        "Satellite Map": satellite,
        "Outdoors Map": outdoors
    };

    // Create overlay object to hold our overlay layer
    const overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    const myMap = L.map("map", {
        center: [
        37.09, -95.71
        ],
        zoom: 5,
        layers: [outdoors, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
    

    var legend = L.control({position: 'bottomright'});

    function getColor(d) {
        return d > 4.9  ? 'red' :
               d > 3.9   ? 'orange' :
               d > 2.9   ? 'yellow' :
               d > 1.9   ? 'green' :
                          '#7FFF00';
    }

    legend.onAdd = function (myMap) {

	var div = L.DomUtil.create('div', 'info legend'),
		grades = [0, 2, 3, 4, 5],
		labels = [];

	// loop through our density intervals and generate a label with a colored square for each interval
	for (var i = 0; i < grades.length; i++) {
		div.innerHTML +=
			'<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
			grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	}

	return div;
    };

    legend.addTo(myMap);

}



function createFeatures(earthquakeData) {
    console.log(earthquakeData);

    function onEachFeature(feature, layer){

        const popup = `
        <h1>Magnitude: ${feature.properties.mag}</h1>
        <hr/>
        <h3>Time UTC: ${(new Date(feature.properties.time)).toUTCString()}</h3>
        `;
        layer.bindPopup(popup)

    }

    const layerToMap = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            let fillcolor = '#7FFF00';
            let radius = 7*(feature.properties.mag/2);

            if (feature.properties.mag > 5){
                fillcolor = 'red';
            }
            else if (feature.properties.mag > 4){
                fillcolor = 'orange';
            }
            else if (feature.properties.mag > 3){
                fillcolor = 'yellow';
            }
            else if (feature.properties.mag > 2){
                fillcolor = 'green';
            }
            return L.circleMarker(latlng, {radius: 8,
                fillColor: fillcolor,
                color: "#000",
                weight: 1,
                opacity: 1,
                radius: radius,
                fillOpacity: 0.8});
        }
    });
    createMap(layerToMap);
}