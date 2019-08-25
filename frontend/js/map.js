var map;
var marker;

var arr=[];

var lat;
var lng;
var dt=[];
var velocity;


var rpm;
var radius;

var url = "http://localhost:3000/api";
function setVal(val){
    $("#rpmip").val(val);
}

function placeMarker(location) {
    
    if (!marker || !marker.setPosition) {
        marker = new google.maps.Marker({
            position: location, 
            map: map,
            visible:true
        });
      } else {
        marker.setPosition(location);
      }
   
    $('#lat').val(location.lat);
    $('#lng').val(location.lng);


    rpm = $("#rpmip").val();
    tyreRadius = $("#radius").val();


    var wheelBase = $("#base").val();
    var front = $("#front").val();
    var rear = $("#rear").val();
    var groundClearance = $("#gdclearance").val();
    var turningRadius = $("#turning_radius").val();
    


    velocity = 2*Math.PI*tyreRadius*rpm/(1000*60);
    console.log("velocity = "+ velocity);

    var index = getNearByPothole(velocity);
    console.log("nearby point is :");
    console.log(dt[index]);
    if(index >= 0){
        //toast
        var distance = getDistanceFromLatLonInM(lat,lng,dt[index].location.coordinates[1],dt[index].location.coordinates[0]);
        var head = "";
        if(dt[index].roadtype =="pothole"){
            head = "Pothole ahead in "+parseInt(distance) +" meters.";
        }else if (dt[index].roadtype =="hump"){
            head = "Hump ahead in "+parseInt(distance) +" meters.  ";
        }
        var body = "Reduce your speed to 30 km per hour";

        $("#toast-header").html(head );
        $("#toast-body").html(body);
        $("#toast").toast('show');
        //voice command

        var msg = new SpeechSynthesisUtterance(head + body);
        window.speechSynthesis.speak(msg);
    }
 
 }

$(document).ready(function() {
    
    
}); 



function init(){
    navigator.geolocation.getCurrentPosition(showPosition);
}

function showPosition(position){
    var options = {
        zoom:18,
        center: new google.maps.LatLng(position.coords.latitude,position.coords.longitude)
    };
    map = new google.maps.Map( document.getElementById('map'),options);
    placeMarker({"lat":position.coords.latitude,"lng":position.coords.longitude});
    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(event.latLng);
    });

  var url = "/api";
  $.ajax({
    'url' : url,
    'type' : "get",
    data:{
        'lat':position.coords.latitude,
        'lng':position.coords.longitude,
    },
    success:function(data){
        console.log(data)
        dt = data;
        for(var i = 0; i < data.length; i++){
            if(data[i].roadtype == "hump"){
                var image = {size: new google.maps.Size(32, 32),
                    scaledSize: new google.maps.Size(32, 32),
                    url: "https://cdn2.iconfinder.com/data/icons/traffic-signs-1/100/roadsigns-38-512.png"
                };
            }
            else if(data[i].roadtype == "pothole"){
                var image = {size: new google.maps.Size(32, 32),
                    scaledSize: new google.maps.Size(32, 32),
                    url: "https://static.thenounproject.com/png/753-200.png"
                };
            }
            else{
                var image = {size: new google.maps.Size(50, 50),
                    scaledSize: new google.maps.Size(50, 50),
                    url: "https://images.vexels.com/media/users/3/132525/isolated/preview/fb67b7c950ae96bfa81505c6640ab9cc-triple-speed-breaker-icon-by-vexels.png"
                };
            }

            var marker = new google.maps.Marker({
                position : new google.maps.LatLng(data[i].location.coordinates[1],data[i].location.coordinates[0]),
                map:map,
                visible: true,  
                icon:image
            });      
        }
    },
    error:function(xhr){
        console.log(xhr);
        alert("Error fetching data");
    }
  } );
}





function getNearByPothole(velocity){
    lat=parseFloat($('#lat').val());
    lng=parseFloat($('#lng').val());

    console.log(lat+","+lng);
    var minDistanceIndex = -1;
    var distance = velocity * 15; //distance that can be coveres in 15 seconds
    console.log("threshold distance = " +distance);
    for( var i = 0; i< dt.length; i++){
        console.log("inside");  

        var lat1 = parseFloat(dt[i].location.coordinates[1]);
        var lng1 = parseFloat(dt[i].location.coordinates[0]);
        console.log(dt);

        console.log("coords during each iter :");
        console.log(lat1+":"+lng1);
        var calculatedDistance = getDistanceFromLatLonInM(lat,lng,lat1,lng1);
        console.log("distance" + calculatedDistance);
        if(  calculatedDistance < distance){
            minDistanceIndex = i;
            distance = calculatedDistance;
            console.log("found one");
        }
    }
    return minDistanceIndex;

}

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d*1000;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }