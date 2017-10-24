var parameters = {
    "WeatherappID": "fbf8b4acf5729aded8ba18679e6bad12", 
    "WeatherUrl":"http://api.openweathermap.org/data/2.5/weather?",
    "urlParameters": "&units=metric&lang=fr",
    "WeatherIcon" : "http://openweathermap.org/img/w/",
    "WeatherIconExtension" : ".png",
    "CitiesFilePath" : "cities.txt",
    "City" : "Tournai"
    // "GeolocationLat" : 91.91,
    // "GeolocationLong" : 181.181,
    // "GoogleMapAPIGeocodeKey" : "AIzaSyC6y4iPFzwgKlmY9aOWGc3Oou7idbrWZc0"
};

function onLoad() {
    // var content = readFile();
    // console.log(content);
    //document.addEventListener("deviceready", onDeviceReady, false);
  
    LoadHome();
}

function loadPage(url) {
    var xmlhttp = new XMLHttpRequest();

    // Callback function when XMLHttpRequest is ready
    xmlhttp.onreadystatechange=function(){
        if (xmlhttp.readyState === 4){
            if (xmlhttp.status === 200) {
                document.getElementById('container').innerHTML = xmlhttp.responseText;
            }
        }
    };
    xmlhttp.open("GET", url , true);
    xmlhttp.send();
}

function LoadHome()
{
    var elIconHome = document.getElementById("icon-home");
    var elIconSettings = document.getElementById("icon-settings");    

    elIconSettings.classList.remove("active");
    elIconHome.classList.add("active");

    loadPage("html/home.html");

    var city = parameters.City;
    var generatedURL = GenerateRequestWeatherByCity(city);
    WeatherRequest(generatedURL);
}

function LoadSettings()
{
    var elIconHome = document.getElementById("icon-home");
    var elIconSettings = document.getElementById("icon-settings");

    elIconSettings.classList.add("active");
    elIconHome.classList.remove("active");

    loadPage("html/about.html");
}

// function onDeviceReady() {
//     navigator.geolocation.getCurrentPosition(OnSuccessGeolocation, OnErrorGeolocation);
// }

function OnSearchClick()
{
   // var defaultLocation = document.getElementById('chkDefaultLocation').checked;

    // var generatedURL = defaultLocation == true ? GenerateRequestWeatherByLatLong() : GenerateRequestWeatherByCity();
    var city = document.getElementById('SelectedCity').value;

    parameters.City = city;
    LoadHome();
    // var generatedURL = GenerateRequestWeatherByCity(city);
    
    // var cities = [city];
    // console.log(generatedURL);
    // WeatherRequest(generatedURL);
    // writeFile(city);
}

function GenerateRequestWeatherByCity(city)
{
    var appID = parameters.WeatherappID;
    var url = parameters.WeatherUrl + "q=" + city + '&appid=' + appID + parameters.urlParameters;
    return url;
}

// can't request to using lat & long why api key limit with free usage?
// function GenerateRequestWeatherByLatLong()
// {
//     var appID = parameters.WeatherappID;
//     var url = parameters.WeatherUrl +"lat=" + parameters.GeolocationLat +"&long=" +  parameters.GeolocationLong + '&appid=' + appID + parameters.urlParameters;
//     return url;{}
// }

function WeatherRequest(url)
{
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);

    xhr.onreadystatechange = function() {
        if (this.status == 200) {
            var responseTxt = this.responseText
            console.log(responseTxt);
            var jsonObject = JSON.parse(responseTxt);

            myFunction(jsonObject)  
        }
    };
    xhr.send();
}

function myFunction(arr) {
    var geoJson = jsonToGeoJson(arr);
    var degres = "°C";
    var cityElement = document.getElementById('WeatherCity');
    var weatherIconElement = document.getElementById('WeatherIcon');
    var temperatureElement = document.getElementById('WeatherTemperature');
    var temperatureMinMaxElement = document.getElementById('WeatherTempMinMax');

    cityElement.innerHTML = geoJson.properties.city;
    // weatherIconElement.innerHTML = '<div class="center"><i class="wi wi-owm-' + geoJson.properties.iconId + '"></i></div>';
    weatherIconElement.innerHTML = '<i class="wi wi-owm-' + geoJson.properties.iconId + '"></i>';    
    temperatureElement.innerText = geoJson.properties.temperature + degres;
    temperatureMinMaxElement.innerText = geoJson.properties.min + degres + " / " + geoJson.properties.max + degres;
}


function jsonToGeoJson (weatherItem) {
    var feature = {
    type: "Feature",
    properties: {
        iconId: weatherItem.weather[0].id,
        city: weatherItem.name,
        weather: weatherItem.weather[0].main,
        description: weatherItem.weather[0].description,
        temperature: weatherItem.main.temp,
        min: weatherItem.main.temp_min,
        max: weatherItem.main.temp_max,
        humidity: weatherItem.main.humidity,
        pressure: weatherItem.main.pressure,
        windSpeed: weatherItem.wind.speed,
        windDegrees: weatherItem.wind.deg,
        windGust: weatherItem.wind.gust,
        icon: parameters.WeatherIcon
            + weatherItem.weather[0].icon  + parameters.WeatherIconExtension,
        coordinates: [weatherItem.coord.Lon, weatherItem.coord.Lat],
        country: weatherItem.sys.country
    },
    geometry: {
        type: "Point",
        coordinates: [weatherItem.coord.Lon, weatherItem.coord.Lat]
    }
    };

    // returns object
    return feature;
}

function CheckDefaultLocation()
{
    var defaultLocation = document.getElementById('chkDefaultLocation').checked;
    document.getElementById('SelectedCity').readOnly = defaultLocation;
    if(defaultLocation == true){
        document.getElementById('SelectedCity').value = "Current Position";
    }
    else{
        document.getElementById('SelectedCity').value = "";
        // TODO get first city ==> cookie!
    }
}

/* some problem are encountered when use weather api with coordinate ! Free Api Key limit?s
function OnSuccessGeolocation(position)
{
    // alert('Latitude: '          + position.coords.latitude          + '\n' +
    // 'Longitude: '         + position.coords.longitude         + '\n' +
    // 'Altitude: '          + position.coords.altitude          + '\n' +
    // 'Accuracy: '          + position.coords.accuracy          + '\n' +
    // 'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
    // 'Heading: '           + position.coords.heading           + '\n' +
    // 'Speed: '             + position.coords.speed             + '\n' +
    // 'Timestamp: '         + position.timestamp);
    parameters.GeolocationLat = Math.round(position.coords.latitude*100)/100;
    parameters.GeolocationLong = Math.round(position.coords.longitude*100)/100;
}


/// Geolocation functions
function OnErrorGeolocation(error)
{
    parameters.GeolocationLat = "error";
    parameters.GeolocationLong = "error";
    alert('code: '    + error.code    + '\n' +
    'message: ' + error.message + '\n');
}*/

function SaveCities(cities)
{
    var filename = 'cities.json'
    writeFile(cities);
}

function getCities()
{
    var cities = ["Tournai"];
    return cities;
}

/**
 * Files Methods
 */
function createFile() {
    var type = window.PERSISTENT;
    var size = 5*1024*1024;
    window.requestFileSystem(type, size, successCallback, errorCallback)
 
    function successCallback(fs) {
        var filePath = parameters.CitiesFilePath;
        fs.root.getFile(filePath, {create: true, exclusive: true}, function(fileEntry) {
            console.log('File creation successfull!')
        }, errorCallback);
    }

    function errorCallback(error) {
        console.log("ERROR: " + error.code);
    }
 }

 function writeFile(cities) {
    var type = window.PERSISTENT;
    var size = 5*1024*1024;
    window.requestFileSystem(type, size, successCallback, errorCallback)
 
    function successCallback(fs) {        
        var filePath =  parameters.CitiesFilePath;
        fs.root.getFile(filePath, {create: true}, function(fileEntry) {
    
            fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = function(e) {
                    console.log('Write completed.');
                };
    
                fileWriter.onerror = function(e) {
                    console.log('Write failed: ' + e.toString());
                };
    
                var blob = new Blob(cities, {type: 'text/plain'});
                fileWriter.write(blob);
                //fileWriter.write(cities);
            }, errorCallback);
        }, errorCallback);
    }

    function errorCallback(error) {
        console.log("ERROR: " + error.code);
    }
 }

 function readFile() {
    var filecontent  = new Blob();
    var type = window.PERSISTENT;
    var size = 5*1024*1024;
    window.RequestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem; 

    window.RequestFileSystem(type, size, successCallback, errorCallback)

    function successCallback(fs) {
        var filePath =  parameters.CitiesFilePath;
        fs.root.getFile(filePath, {}, function(fileEntry) {
    
            fileEntry.file(function(file) {
                var reader = new FileReader();
    
                reader.onloadend = function(e) {
                    this.readAsText(filecontent);
                };
                reader.readAsText(file);
            }, errorCallback);
        }, errorCallback);
    }
 
    function errorCallback(error) {
       alert("ERROR: " + error.code)
    }
    return filecontent;
 }