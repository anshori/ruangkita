var map, featureList, jogjaSearch = [], wisatajogjaSearch = [];

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});
      
$("#list-btn").click(function() {
  animateSidebar();
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();
  /* Loop through wisata layer and add only features which are in the map bounds */
  wisatajogja.eachLayer(function (layer) {
    if (map.hasLayer(wisatajogjaLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="23" height="32" src="assets/img/dot_pinlet.png"></td><td class="feature-name">' + layer.feature.properties.Name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}

/* Basemap Layers */
var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://cartodb.com/attributions">CartoDB</a> | <a href="http://www.github.com/maspannn">Mas Pannn</a>'
});
var google = L.tileLayer('https://mt0.google.com/vt/lyrs=r&hl=en&x={x}&y={y}&z={z}', {
  attribution: 'Google Street | <a href="https://maspannn.github.io" target="_blank">Mas Pannn</a>'
});

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

var jogjaColors = {"Tinggi":"#bd0026", "Sedang":"#fd8d3c", "Rendah":"#ffffb2"};

var jogja = L.geoJson(null, {
  style: function (feature) {
    return {
      fillColor: jogjaColors[feature.properties.klas_jml],
      fillOpacity: 0.7,
      color: "gray",
      weight: 1,
      opacity: 1,
    };
  },
  onEachFeature: function (feature, layer) {
    var content = '<table class="table table-striped table-bordered table-sm">' +
      '<tr><th>Kabupaten</th><td>' + feature.properties.KABUPATEN + '</tr>' +
      '<tr><th>Jumlah Laki-laki</th><td>' + feature.properties.LAKI_LAKI + ' Jiwa</tr>' +
      '<tr><th>Jumlah Perempuan</th><td>' + feature.properties.PEREMPUAN + ' Jiwa</tr>' +
      '<tr><th>Jumlah Penduduk</th><td>' + feature.properties.JML_PDD + ' Jiwa</tr>' +
      '<tr><th>Jumlah Keluarga</th><td>' + feature.properties.KK + '</tr>' +
      '<tr><th>Luas</th><td>' + feature.properties.Luas_km2 + ' Km<sup>2</sup></tr>' +
      '<tr><th>Kepadatan Penduduk</th><td>' + feature.properties.KPDT_PDD + ' Jiwa/Km<sup>2</sup></tr>' +
      '</table>' +
      '<small class="text-primary">Sumber: PODES BPS 2011</small>';
    layer.on({
      mouseover: function (e) { 
        var layer = e.target;
        layer.setStyle({ 
          weight: 1, 
          color: "gray", 
          opacity: 1,
          fillColor: "cyan",
          fillOpacity: 0.7, 
        });
        jogja.bindTooltip("Kel. " + feature.properties.desa + ", Kec. " + feature.properties.kecamatan , {sticky: true});
      },
      mouseout: function (e) { 
        jogja.resetStyle(e.target);
        map.closePopup();
      },
      click: function (e) {
        $("#feature-title").html("Kecamatan " + feature.properties.KECAMATAN);
        $("#feature-info").html(content);
        $("#featureModal").modal("show");
        map.setView([e.latlng.lat, e.latlng.lng], 14);
      },
    });
  }
});
$.getJSON("data/diy.geojson", function (data) {
  jogja.addData(data);
});

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});


//var iconJateng = L.AwesomeMarkers.icon({icon: 'fa-bed', prefix: 'fa', markerColor: 'darkblue'});

/* Empty layer placeholder to add to layer control for listening when to add/remove wisata to markerClusters layer */
var wisatajogjaLayer = L.geoJson(null);
var wisatajogja = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/dot_pinlet.png",
        iconSize: [23, 32],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.Name,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Nama</th><td>" + feature.properties.Name + "</td></tr>" + "<tr><th>Deskripsi</th><td>" + feature.properties.Description + "</td></tr>" + "<tr><th>Rute</th><td><a href='https://www.google.com/maps/dir/?api=1&destination=" + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + "' target='_blank' class='btn btn-info' title='Google Maps'>Google Maps</a><br><a href='http://maps.google.com/maps?q=&layer=c&cbll=" + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + "' target='_blank' class='btn btn-info' title='Google Street View' style='margin-top:5px'>Street View</a></td></tr><table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Name);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="23" height="32" src="assets/img/dot_pinlet.png"></td><td class="feature-name">' + layer.feature.properties.Name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      wisatajogjaSearch.push({
        name: layer.feature.properties.Name,
        source: "Jogja",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/wisatajogja.geojson", function (data) {
  wisatajogja.addData(data);
  map.addLayer(wisatajogjaLayer);
});

map = L.map("map", {
  zoom: 9,
  center: [-7.801389645,110.364775452],
  layers: [cartoLight, jogja, markerClusters, highlight],
  zoomControl: false,
  attributionControl: true
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === wisatajogjaLayer) {
    markerClusters.addLayer(wisatajogja);
    syncSidebar();
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === wisatajogjaLayer) {
    markerClusters.removeLayer(wisatajogja);
    syncSidebar();
  }
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://www.github.com/maspannn'>Mas Pannn</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Carto Light": cartoLight,
  "Street Map": google
};

var groupedOverlays = {
  "Points of Interest": {
    "Wisata Yogyakarta": wisatajogjaLayer,
  },
  "Peta Administrasi": {
    "Provinsi DI. Yogyakarta": jogja,
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  sizeLayerControl();
  /* Fit map to jogja bounds */
  map.fitBounds(jogja.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});

  var jogjaBH = new Bloodhound({
    name: "jogja",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: jogjaSearch,
    limit: 10
  });
  
  var wisatajogjaBH = new Bloodhound({
    name: "wisata jogja",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: wisatajogjaSearch,
    limit: 10
  });

  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=ID&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });
  jogjaBH.initialize();
  wisatajogjaBH.initialize();
  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "jogja",
    displayKey: "name",
    source: jogjaBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Kota jogja</h4>"
    }
  }, {
    name: "Jogja",
    displayKey: "name",
    source: wisatajogjaBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/dot_pinlet.png' width='23' height='32'>&nbsp;Wisata Yogyakarta</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  },
  {
    name: "GeoNames",
    displayKey: "name",
    source: geonamesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "jogja") {
      map.fitBounds(datum.bounds);
    }
    if (datum.source === "Jogja") {
      if (!map.hasLayer(wisatajogjaLayer)) {
        map.addLayer(wisatajogjaLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 14);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}