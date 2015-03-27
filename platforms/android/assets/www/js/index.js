var carp0052_midtermApp = {
    loadCount: 0,
    latitude: "",
    longitude: "",
    myContacts: [],
    
    initialize: function() {
        carp0052_midtermApp.bindEvents();
    },
    
    bindEvents: function() {   
//        document.addEventListener("DOMContentLoaded", carp0052_midtermApp.onDeviceReady, false);
        document.addEventListener("DOMContentLoaded", function(){
            carp0052_midtermApp.loadCount++;
            if(carp0052_midtermApp.loadCount === 2){
                carp0052_midtermApp.onDeviceReady();
            }
            //carp0052_midtermApp.onDeviceReady();
        })
        
        document.addEventListener('deviceready', carp0052_midtermApp.onDeviceReady, false);
        document.addEventListener('deviceready', function(){
            carp0052_midtermApp.loadCount++;
            if(carp0052_midtermApp.loadCount === 2){
                carp0052_midtermApp.onDeviceReady();
            }
        })
    },
    
    onDeviceReady: function(){
        // document.querySelector("[data-role=listview]").addEventListener("click", carp0052_midtermApp.contactInfo);
//        document.querySelector("[data-role=listview]").addEventListener("click", carp0052_midtermApp.displayMap);
        window.addEventListener("popstate", carp0052_midtermApp.browserBackButton, false);
        
        var ul = document.querySelector("[data-role=listview]");
        var mc = new Hammer.Manager(ul);
        
        mc.add( new Hammer.Tap({ event: 'doubletap', taps: 2 }) );
            // Single tap recognizer
        mc.add( new Hammer.Tap({ event: 'singletap' }) );
        mc.get('doubletap').recognizeWith('singletap');
        // we only want to trigger a tap, when we don't have detected a doubletap
        mc.get('singletap').requireFailure('doubletap');

        mc.on("singletap doubletap", function(ev) {
            if( ev.type == "singletap"){
                //single tap
                carp0052_midtermApp.contactInfo(ev);
            }else{
                //double tap
                carp0052_midtermApp.displayMap(ev);
            }
    	   console.log(ev.type +" gesture detected.");
        });
        
        document.getElementById("btnCancel").addEventListener("click", carp0052_midtermApp.cancel);
        
        document.getElementById("btnBack").addEventListener("click", carp0052_midtermApp.browserBackButton);
        
        if( navigator.geolocation ){
            var params = {enableHighAccuracy: false, timeout:60000, maximumAge:60000};
            navigator.geolocation.getCurrentPosition( carp0052_midtermApp.reportPosition, carp0052_midtermApp.gpsError, params);
            //If it doesn't alert the user with the following message.
        }else{
            alert("Sorry, but your browser does not support location based awesomeness.")
        }
        
        if(localStorage.getItem("carp0052-store") === null){    
            var options = new ContactFindOptions();
            options.filter = "";  //leaving this empty will find return all contacts
            options.multiple = true;  //return multiple results
            var filter = ["displayName"];    //an array of fields to compare against the options.filter 
            navigator.contacts.find(filter, carp0052_midtermApp.successFunc, carp0052_midtermApp.errFunc, options);
        }else{
            var storedInfo = JSON.parse(localStorage.getItem("carp0052-store"));
            for (i = 0; i < 13; i++) {

                var li = document.createElement("li");
                li.dataset.ref = i;
                li.innerHTML = storedInfo[i].name; 
                document.querySelector("[data-role=listview]").appendChild(li); 
            }
        }
    },
    
    cancel: function(ev){
        document.querySelector("[data-role=modal]").style.display="none";
        document.querySelector("[data-role=overlay]").style.display="none";
    },
    
    browserBackButton: function(){
     
        document.querySelector("#location").className = "hidden";
        document.querySelector("#contacts").className = "show";
    },
    
    contactInfo: function(ev){
    
        document.querySelector("[data-role=modal]").style.display="block";
        document.querySelector("[data-role=overlay]").style.display="block";
        
        var storedInfo = JSON.parse(localStorage.getItem("carp0052-store"));
    
        var item = ev.target.getAttribute("data-ref");
        var itemVal = ev.target.innerHTML;

    
        document.querySelector("[data-role=modal] h3").innerHTML = itemVal;
        document.getElementById("number1").innerHTML = storedInfo[item].numbers[0].type + ": " + storedInfo[item].numbers[0].value;
        document.getElementById("number2").innerHTML = storedInfo[item].numbers[1].type + ": " + storedInfo[item].numbers[1].value;
    },
    
    displayMap: function(ev){
        console.log("Find my location!");
        document.querySelector("#contacts").className = "hidden";
        document.querySelector("#location").className = "show";
        
        var myLatlng = new google.maps.LatLng(carp0052_midtermApp.latitude, carp0052_midtermApp.longitude);   
        var myOptions = {
            zoom: 14,
			center: myLatlng,
			mapTypeControl: true,
			zoomControl: true,
			mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        
        //create the map
	    var map = new google.maps.Map(document.getElementById("map"), myOptions);
        
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(carp0052_midtermApp.latitude, carp0052_midtermApp.longitude), 
            draggable :true,
            animation: google.maps.Animation.BOUNCE
        });
        
        marker.setMap(map);
    },
    
    reportPosition:function( position ){
        carp0052_midtermApp.latitude = position.coords.latitude;
        carp0052_midtermApp.longitude = position.coords.longitude;
        
    },
    
    gpsError:function ( error ){
        var errors = {
            1: 'Permission denied',
            2: 'Position unavailable',
            3: 'Request timeout'
        }; 
            alert("Error: " + errors[error.code]);
    },
        
    successFunc:function(matches){
        for (i = 0; i < 13; i++) { 
            var contacts = {}; 
            contacts.name = matches[i].displayName;
            contacts.numbers = [matches[i].phoneNumbers[0], matches[i].phoneNumbers[1]];
            contacts.lat = null;
            contacts.lng = null;
            
            carp0052_midtermApp.myContacts.push(contacts); 
            localStorage.setItem("carp0052-store", JSON.stringify(carp0052_midtermApp.myContacts)); 
            
            var li = document.createElement("li"); 
            li.dataset.ref = i;
            li.innerHTML = matches[i].displayName;
            
            document.querySelector("[data-role=listview]").appendChild(li); 
        }
    },
    
    
    errFunc:function (){
        alert("Unable to load contacts at this time.")

    }    
}

carp0052_midtermApp.initialize();
