//api urls and keys
var URLs = {
	YUMMLY_KEY: "https://api.yummly.com/v1/api/recipes?_app_id=fb72c077&_app_key=f6ef20b35813502c3869ff8b2341d09e",
	YUMMLY: "https://api.yummly.com/v1/api/recipe/",

	GOOGLE_PLACES: "https://maps.googleapis.com/maps/api/place/nearbysearch/json?",
	GOOGLE_PLACES_KEY: "AIzaSyCaUxW3O4_A3uGXc-MXGcGWZf1HMdWQR9M",
}

//prevent these properties from being changed
Object.freeze(URLs);

//checkbox bool variables
var allergyCB = {
	dairy: false,
	egg: false,
	gluten: false,
	peanut: false,
	seafood: false,
	soy: false,
	treeNut: false,
}

//urls for food allergies
var allergyURL = {
	dairy: "396^Dairy-Free",
	egg: "397^Egg-Free",
	gluten: "393^Gluten-Free",
	peanut: "394^Peanut-Free",
	seafood: "398^Seafood-Free",
	soy: "400^Soy-Free",
	treeNut: "395^Tree Nut-Free",
}

var map = {
	div: undefined,
	mapLoaded: false,
	infoWindow: undefined,
	markers: [],
	radius: 0,
	miles: 10,
	type: undefined,
	pos: {
		lat: undefined,
		lng: undefined
	},
	options: {
		center: {
			lat: 39.828127,
			lng: -98.579404
		},
		zoom: 12
	}
}


//variables used with the maps api
window.onload = function () {
	const app = new Vue({
		el: '#app',
		data: {
			url: URLs,
			closed: false,
			firstSearch: false,

			map: map,
			currentPos: map.pos,
			infoWindow: map.infoWindow,
			markers: map.markers,

			allergiesCB: allergyCB,
			allergiesArray: "&allowedAllergy[]=",
			allergiesURL: allergyURL,
		},
		mounted() {

			this.setMap();
			this.getLocation();
			this.clearMarkers();
		},
		methods: {
			setMap() {
				this.map.div = document.getElementById('mapDiv');
				this.map = new google.maps.Map(this.map.div, this.map.options);
				this.infoWindow = new google.maps.InfoWindow({
					map: this.map
				});
			},
			clearMarkers() {
				//close info winow if it exists
				if (this.infoWindow) this.infoWindow.close();


				if (this.markers.length != 0 || this.markers.length == undefined) {
					//loop through markers array
					for (var i = 0; i < this.markers.length; i++) {
						//call .setMap(null) on each marker to remove it from map
						this.markers[i].setMap(null);
					}
					//empty or re-initialize markers array
					this.markers = [];
				}
			},
			getLocation() {
				var geoLocation = navigator.geolocation;
				if (geoLocation) {
					geoLocation.getCurrentPosition(
						(position) => {
							this.currentPos = {
								lat: position.coords.latitude,
								lng: position.coords.longitude
							};

							this.infoWindow.setPosition(this.currentPos);
							this.infoWindow.setContent('Your Location.');
							this.map.setCenter(this.currentPos);
						}
					);
					return;
				}
				// else Browser doesn't support Geolocation
				window.alert("Geolocation is not supported by this browser.");
			},
			searchFoodURL() {

			},
			searchRestaurantURL() {

			}
		}
	})
}