(function(){
    "use strict";
    
    //url, id, search params
    var YUMMLY_URL = "https://api.yummly.com/v1/api/recipes?_app_id=fb72c077&_app_key=f6ef20b35813502c3869ff8b2341d09e";
    
    var GET_RECIPE_URL = "https://api.yummly.com/v1/api/recipe/";

    var GOOGLE_PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";
    
    var GOOGLEPLACES_URL_KEY = "AIzaSyCungfivBrAQpvrF-jwK092ZPvLyNwPvFM";
    
    //checkbox bool variables
    var dairyCheck = false,
        eggCheck = false,
        glutenCheck = false,
        peanutCheck = false,
        seafoodCheck = false,
        soyCheck = false,
        treeNutCheck= false;
    
    var allergyUrl= "&allowedAllergy[]=";
    var dairyUrl = "396^Dairy-Free",
        eggUrl = "397^Egg-Free",
        glutenUrl = "393^Gluten-Free",
        peanutUrl = "394^Peanut-Free",
        seafoodUrl = "398^Seafood-Free",
        soyUrl = "400^Soy-Free",
        treeNutUrl = "395^Tree Nut-Free";
    
    //variables for user input
    var searchItem = undefined,
        cuisineOption = undefined,
        courseOption = undefined;
    
    //url for recipe id
    var recipeID= undefined;
    
    //variables to use with the food api
    var ingredientArray = [],
        checkedIngredients = undefined;
    
    //variables used with the maps api
    var map,
        infoWindow,
        markers=[],
        radius = 0,
        miles = 10,
        type = undefined,
        pos= {
            lat: undefined,
            lng: undefined
        };
    
    var firstSearch= false;
    var closed = false;

    function init(){
        //getting the allergies check box options by calling getCheckBox
        getCheckBox("#dairy", function(v) { dairyCheck = v; });
        getCheckBox("#gluten", function(v) { glutenCheck = v; });
        getCheckBox("#peanut", function(v) { peanutCheck = v; });
        getCheckBox("#seafood", function(v) { seafoodCheck = v; });
        getCheckBox("#soy", function(v) { soyCheck = v; });
        getCheckBox("#treeNut", function(v) { treeNutCheck = v; });
        
        //checks if the user uses the enter or left or right arrow keys
        document.onkeydown = checkKey;
        
        //hide the map and lazy button
        document.querySelector('#mapDiv').style.display= 'none';
        document.querySelector('#mapPage').style.display= 'none';
        document.querySelector('#lazyButton').style.display= 'none';
        
        //call respective functions when buttons are pressed
        document.querySelector('#searchButton').onclick = function(){
//            if($(window).width() <=800){
//                document.querySelector('.menu').style.height = "33em"; 
//            }
//            
//            firstSearch = true;
            searchFoodURL();
            
        }
        document.querySelector('#lazyButton').onclick = searchRestaurantURL;
        
        
        //set up map stuff
        var mapOptions = {
          center: {lat: 39.828127, lng: -98.579404},
          zoom: 12
        };
        
        map= new google.maps.Map(document.getElementById('mapDiv'), mapOptions);
        infoWindow = new google.maps.InfoWindow({map: map});
        
        //get user's current loction with HTML5 geolocation
        getLocation();
        clearMarkers();
        
    }
    
    //==============method creates an URL FOR YUMMLY to load info based on user input=============================
    function searchFoodURL(){
        // build food URL
        var url = YUMMLY_URL;
        //get the values of each selection
        searchItem = document.querySelector('#searchBar').value;
        cuisineOption = document.querySelector('#cuisine').value;
        courseOption = document.querySelector('#course').value;
        
        //check to see if user entered an item to search
        if(searchItem != null || searchItem != ""){
            url += "&q=";
            url += searchItem.trim().replace(" ", "+");
            url += "&requirePictures=true";
        }
        
        //Add to url for different select options
        if(cuisineOption != "null"){
            url += "&allowedCuisine[]=cuisine^cuisine-";
            url +=  cuisineOption;
        }
        if(courseOption != "null"){
            url += "&allowedCourse[]=course^course-";
            url += courseOption.replace(" ", "+");
        }
         
        //Add to url for diffferent allergens
        if(dairyCheck){
            url += allergyUrl + dairyUrl;
        }   
        if(eggCheck){
            url += allergyUrl + eggUrl;
        }
        if(glutenCheck){
            url += allergyUrl + glutenUrl;
        }
        if(peanutCheck){
            url += allergyUrl + peanutUrl;
        }
        if(seafoodCheck){
            url += allergyUrl + seafoodUrl;
        }
        if(soyCheck){
            url += allergyUrl + soyUrl;
        }
        if(treeNutCheck){
            url += allergyUrl + treeNutUrl;
        }
        
        //send the url and call the function with the info
        getData(url, foodJsonLoaded);     
    }
    
    //===========method creates an URL FOR RESTAURANTS to load info based on user input====================================
    function searchRestaurantURL(){
        // build food URL
        var url = GOOGLE_PLACES_URL;
        //get the values of each selection
        cuisineOption = document.querySelector('#cuisine').value;
        //in meters --- milesx1609.344 = meter
        radius = miles*1609.344;
        type = 'restaurant';
        
        url += "location=" + pos.lat + "," +pos.lng;
        url += "&radius=" + radius;
        url += "&type=" + type;
        url += "&keyword=" + cuisineOption;
        url += "&key=" + GOOGLEPLACES_URL_KEY;
        
        var googleURL = encodeURIComponent(url);
                               
        var nodeURL = "https://mcs2515-project3.herokuapp.com/?url=" + googleURL;
        
        // Add circle overlay and bind to marker
        var circle = new google.maps.Circle({
          map: map,
          radius: radius,    // metres
          fillColor: 'rgba(5,0,255, .5)',
          center: pos,
          strokeOpacity: 0.3,
          strokeWeight: 2,
        });
        
        //send the url and call the function with the info
        getData(nodeURL, mapsJsonLoaded);
    } 
    
    //===================LOADS THE JSON and functions based on the url sent to it==================================
    function getData(url, func) {
        //get the json
        //console.log("loading " + url); //print out the url to json
        $(".results").fadeOut(500);   //give animation
        $("#mapPage").fadeOut(500);   //give animation
        
        $.ajax({
          dataType: "json",
          url: url,
          data: null,
          success: func
        });
        
     }
    
    //======================CREATE BODY HTML based on the food obj's info==============================================
    function foodJsonLoaded(obj){
        
        // if there's an error, print a message and return
        if(obj.error){
          var status = obj.status;
          var description = obj.description;
          document.querySelector(".results").innerHTML = "<h3 class='issues'><b>Error!</b></h3>" + "<p class='issues'><i>" + status + "</i><p>" + "<p><i>" + description + "</i><p>";
          $(".results").fadeIn(500);
          return; // Bail out
        }

        // if there are no results, print a message and return
        if(obj.matches == 0){
          var status = "No results found";
          document.querySelector(".results").innerHTML = "<p class='issues'><i>" + status + "</i><p>" + "<p><i>";
          $(".results").fadeIn(500);
          return; // Bail out
        }
        
        if(obj.total_items == 1){
            var object = [obj.event]; 
            return object;
        }
        
        // If there is an array of results, loop through them
        var alldishes = obj.matches;

        //clear the results section 
        document.querySelector(".results").innerHTML = "";
        
        
        // loop through recipe ids
        for(var i= 0 ; i <alldishes.length; i++){
            
            recipeID = alldishes[i].id;
            console.log(recipeID);
            
            var recipeUrl = GET_RECIPE_URL; //reset the recipeURL
            recipeUrl += recipeID + "?";  //add on new recipe id to url
            recipeUrl += "_app_id=fb72c077&_app_key=f6ef20b35813502c3869ff8b2341d09e";  //add my id and key

            //call method to load the json for the recipe id
            getData(recipeUrl, recipeLoaded);    
					
        }
        //activateSlick();
        //hide the map and show the arrows and lazy button
        document.querySelector('#lazyButton').style.display= 'block';
        document.querySelector('#mapDiv').style.display= 'none';
        document.querySelector('#mapPage').style.display= 'none';
        $(".results").fadeIn(500);
        
    }
    
    //======================LOADS DETAILED DISH INFO==================================================================
    function recipeLoaded(obj){
        unSlick();
        //create a unique div box for each recipe id
        var divBox = document.createElement('div');
        divBox.className = "dish";
        
        //console.log(div);
        var bigString= "<img class= 'bookmark' src=media/bookmark.png >"
        bigString += "<h4>" + obj.name + "</h4>";
       
        bigString += "<br>";
        bigString += "<div class='food_image'><img src=\"" + obj.images[0].hostedLargeUrl + "\" /></div>";
        bigString += "<div class= 'detail_div'>";
        
        if(obj.cookTime){
            bigString += "<h5><span class='bold'>Cook time:</span> " + obj.cookTime + "</h5>";
        }
       
        bigString += "<h5><span class='bold'>Ingredients:</span></h5>";

        //create a new set to check for duplicates
        ingredientArray = Array.from(new Set(obj.ingredientLines));

        bigString+= "<ul class='ingredients'>";
        for(var i=0; i<ingredientArray.length; i++){
                bigString += "<li>"+ingredientArray[i]+"</li>";
            }
        bigString+= "</ul>";
        bigString += "</div>";
        
        //add a link to the dish
        if(obj.attribution.url){
            bigString += "<div class='yummly_link'><p><a id= href=" + obj.attribution.url + " target= '_blank'>  More at Yummly Link </a></p></div>";
        }

        divBox.innerHTML = bigString;
        //add div to page
        document.querySelector(".results").appendChild(divBox);
        activateSlick();
		}
    
    function activateSlick(){
        if(!$(".results").hasClass('slick-initialized')){
            $(".results").slick({
                dots: true,
                arrows: false,
                infinite: true,
            });
        }
    }
    
    function unSlick(){
        if($(".results").hasClass('slick-initialized')){
            $(".results").slick("destroy");
        }
    }
    
    //=======================CHECKS FOR FOOD ALLERGENS OPTIONS==========================================================
    function getCheckBox(id, food){
        document.querySelector(id).onchange = function(e) {
            food(e.target.checked);
        };
    }
    
    //=======================LOADS RESTAURANT LOCATIONS=================================================================
     function mapsJsonLoaded(obj){
			 var div = document.querySelector("#mapTitle");
			 // If there is an array of results, loop through them
			 var allrestaurants = obj.results;
			 clearMarkers();
			 
			 //console.log("allrestaurants.length = " + allrestaurants.length);
			 //console.dir(obj);
        
        var bigString = "<h4 id = 'mapTitle'> Here are nearby restaurants within " + miles+" miles</h4>";
        bigString += "<br>";
        
        div.innerHTML = bigString;
        
        for(var i= 0 ; i <16/*allrestaurants.length*/; i++){

            var title= allrestaurants[i].name + "<br>"+ allrestaurants[i].vicinity;
            var latitude=Number(allrestaurants[i].geometry.location.lat);
            var longitude=Number(allrestaurants[i].geometry.location.lng);

            if(latitude&&longitude){
                addMarker(latitude, longitude, title);
            } 
         }
         
        document.querySelector('#lazyButton').style.display= 'none';
        document.querySelector('#mapPage').style.display= 'block';
        document.querySelector('#mapDiv').style.display= 'block';
        $("#mapPage").fadeIn(500);
        map.setZoom(11);
    }
    
    //======================HTML5 GEOLOCATION=========================================================================
    function getLocation(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                pos = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude};

                infoWindow.setPosition(pos);
                infoWindow.setContent('Your Location.');
                map.setCenter(pos);
              });
        }
        else {
          // Browser doesn't support Geolocation
          window.alert("Geolocation is not supported by this browser.");
        }
    }
    
    //===================CREATES MARKERS for each lat and lng you send to it==========================================
    function addMarker(latitude, longitude, title){
//      console.log(latitude + ", " + longitude + ", " + title + ", " + map);
        var position = {lat: latitude, lng: longitude};
        var marker = new google.maps.Marker({position: position, map:map});
        marker.setTitle(title);
        
        //add a listener for the click event
        google.maps.event.addListener(marker, 'click', function(e){
            //have an info window pop up
            makeInfoWindow(this.position, this.title);
        });
    
      //add the marker
      markers.push(marker);
    }
    
    //====================DISPLAY name and adress in the INFO WINDOW==========================================================
     function makeInfoWindow(position, msg){
        //close old infowindow if it exists
        if(infoWindow)infoWindow.close();

        //make a new infowindow
        infoWindow=new google.maps.InfoWindow({
            map: map,
            position: position,
            content: "<b>" + msg + "</br>"
        });
    }
    
    function clearMarkers(){
        //console.log("erasing");
        //close info winow if it exists
        if(infoWindow)infoWindow.close();
        
        //loop through markers array
        for(var i=0; i< markers.length; i++){
        //call .setMap(null) on each marker to remove it from map
            markers[i].setMap(null);
        }
        //empty or re-initialize markers array
        markers = [];
     }
    
    //=================CHECKS FOR KEYBOARD INPUT and triggers an event===============================================
     function checkKey(e) {
        e = e || window.event;
         
        //ENTER key 
        if(event.keyCode == 13){
            $("#searchButton").click();
        }
         // left arrow
        else if (e.keyCode == '37') {
            $("#prevArrow").click();
        }
         //right arrow
        else if (e.keyCode == '39') {
            $("#nextArrow").click();
        }
    }
    
    window.addEventListener("load",init);
})();