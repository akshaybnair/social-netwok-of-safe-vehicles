var map;
var url = "https://192.168.1.100:443/api";


function placeMarker(location,option) {
    var marker = new google.maps.Marker({
        position: location, 
        map: map,
        visible:true
    });
    if(option){
        $('html, body').animate({
            scrollTop: $("#lat").offset().top
        }, 2000);
    }
    $('#lat').val(location.lat);
    $('#lng').val(location.lng);
 
 }

$(document).ready(function() {
    //$('select').formSelect();
    
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
    placeMarker({"lat":position.coords.latitude,"lng":position.coords.longitude},false);
    google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(event.latLng,true);
    });

//   var url = "https://192.168.1.100:443/api";
  $.ajax({
    'url' : "/api",
    'type' : "get",
    data:{
        'lat':position.coords.latitude,
        'lng':position.coords.longitude,
    },
    success:function(data){
        console.log(data)
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
            marker.addListener('click', function(evt) {
                console.log("current location "+marker.getPosition());
                $.ajax({
                    'url':"/api/one",
                    'type' : "get",
                    data:{
                        'lat':evt.latLng.lat,
                        'lng':evt.latLng.lng,
                    },
                    success:function(result){
                        console.log(result);
                        $("#loc").html(result.location.coordinates[1] +","+result.location.coordinates[0]);
                        $("#rtype").html(result.roadtype);
                        if(result.positiveVotes){
                            $("#up").html(result.positiveVotes);
                        }else{
                            $("#up").html(0);
                        }
                        if(result.negetiveVotes){
                            $("#down").html(result.negetiveVotes);
                        }else{
                            $("#down").html(0);
                        }
                        $('html, body').animate({
                            scrollTop: $("#loc").offset().top
                        }, 2000);
                    
                    },
                    error:function(xhr){
                        alert("nothing");
                    }
                });
              });
      
        }
    },
    error:function(xhr){
        alert("Error fetching data");
    }
  } );
}

function addNew(){
    var lat = $('#lat').val();
    var lng = $('#lng').val();
    var roadtype = $('#roadtype').val();
    if(lat&&lng&&roadtype){
        $.ajax({
            "url": "/api",
            type:"post",
            data:{
                "lat":lat,
                "lng":lng,
                "roadtype":roadtype
            },
            success:function(response){
                alert("added");
                location.reload(); 
            },
            error:function(xhr){
                alert("error");
                location.reload(); 
            }
        });
    }
    else{
        alert("error");
    }
}






function up(){
    if($('#loc').html() == "Select a Marker to vote"){
        alert("Select a marker");
    }
    else{
        var lat = $('#loc').html().split(",")[0];
        var lng = $('#loc').html().split(",")[1];
        $.ajax({
            'url':"/api/upvote",
            'type':"post",
            data:{
                'lat':lat,
                'lng':lng
            },
            success:function(response){
                alert("up voted");
                location.reload();
            },
            error:function(xhr){
                console.log("error");
                alert("error");
            }
        });
    }
    
}

function down(){
    if($('#loc').html() == "Select a Marker to vote"){
        alert("Select a marker");
    }
    else{
        var lat = $('#loc').html().split(",")[0];
        var lng = $('#loc').html().split(",")[1];
        $.ajax({
            'url':"/api/downvote",
            'type':"post",
            data:{
                'lat':lat,
                'lng':lng
            },
            success:function(response){
                alert("down  voted");
                location.reload();
            },
            error:function(xhr){
                alert("error")
            }
        });
    }
}