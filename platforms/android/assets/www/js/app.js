var parameters = {
    "WeatherappID": "fbf8b4acf5729aded8ba18679e6bad12", 
    "WeatherUrl":"http://api.openweathermap.org/data/2.5/weather?",
    "urlParameters": "&units=metric&lang=fr",
    "WeatherIcon" : "http://openweathermap.org/img/w/",
    "WeatherIconExtension" : ".png",
    "DateTimeFormat" : "YYYYMMDDHHmmss",
    "MaxHoursRequest" : 6,
    "ForcedRefresh" : false
    // "GeolocationLat" : 91.91,
    // "GeolocationLong" : 181.181,
    // "GoogleMapAPIGeocodeKey" : "AIzaSyC6y4iPFzwgKlmY9aOWGc3Oou7idbrWZc0"
};

function onLoad() {
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
                if(url == "html/home.html"){

                    RefreshWeatherDetector();
                }
                else{
                    var ludElement = document.getElementById('LastUpdateDate');
                    var lud = GetLastResponseDate();
                    ludElement.innerText = lud.toString();
                }
            }
        }
    };
    xmlhttp.open("GET", url , true);
    xmlhttp.send();
}

function LoadHome()
{
    var elHeader = document.getElementById("headerApp");
    var elIconHome = document.getElementById("icon-home");
    var elIconSettings = document.getElementById("icon-settings");    

    elHeader.innerText = "Home";
    elIconSettings.classList.remove("active");
    elIconHome.classList.add("active");    

    var city = GetCity();
    if(city == null || city.length == 0)
    {
        //alert('No City defined! Please do it in the parameter page.')
        var containerElement = document.getElementById("container");
        container.innerText = 'No City defined! Please do it in the parameter page.';
    }
    else
    {
        loadPage("html/home.html");
    }   
}

function RefreshWeatherDetector()
{
    var updatePage = PageMustBeUpdated();
    
    if(updatePage == true){
        var city = GetCity();
        var generatedURL = GenerateRequestWeatherByCity(city);

        WeatherRequest(generatedURL);
    }
    else{
        var responseText = GetResponseText();
        AnalyzeRequest(responseText, false);
    }
}

function PageMustBeUpdated()
{
    var lastUpdatedDate = GetLastResponseDate();
    var updatePage = false;
    if(parameters.ForcedRefresh == false){
        if(lastUpdatedDate == null){
            updatePage = true;
        }
        else{
            var now = moment();
            var nbHours = now.diff(lastUpdatedDate, 'hours');
            updatePage = nbHours > parameters.MaxHoursRequest;
        }
    }
    else{
        updatePage = true;
        parameters.ForcedRefresh = false;
    }

    return updatePage;
}

function LoadSettings()
{
    var elHeader = document.getElementById("headerApp");
    var elIconHome = document.getElementById("icon-home");
    var elIconSettings = document.getElementById("icon-settings");    

    elHeader.innerText = "Settings";
    elIconSettings.classList.add("active");
    elIconHome.classList.remove("active");

    loadPage("html/about.html");
}

// function onDeviceReady() {
//     navigator.geolocation.getCurrentPosition(OnSuccessGeolocation, OnErrorGeolocation);
// }

function OnGetWeatherClick()
{
   // var defaultLocation = document.getElementById('chkDefaultLocation').checked;

    // var generatedURL = defaultLocation == true ? GenerateRequestWeatherByLatLong() : GenerateRequestWeatherByCity();
    var city = document.getElementById('SelectedCity').value;

    SetCity(city);
    parameters.ForcedRefresh = true;
    console.log("must be updated!")
    LoadHome();
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
            SetResponseText(responseTxt);
            
            AnalyzeRequest(responseTxt, true);
        }
    };
    xhr.send();
}

function AnalyzeRequest(responseTxt, updateDate)
{
    var jsonObject = JSON.parse(responseTxt);
    console.log(jsonObject);
    SetWeatherInfo(jsonObject);
    if(updateDate == true)
        SetLastResponseDate();
    // console.log("request:"+updateDate?"oui":"non");
}

function SetWeatherInfo(jsonObject) {
    var geoJson = jsonToGeoJson(jsonObject);
    var degres = '&#8451;';
    var spanDegres = '<span class="temp-degres-weather-panel">' + degres + '</span>';
    var wpt = document.getElementById('weatherpaneltemp');
    var curDate = document.getElementById('CurrentDate');
    var weatherimgElement = document.getElementById('weatherimg');
    var wpmm = document.getElementById('WeatherPanelMinMax');
    var wpd = document.getElementById('WeatherPanelDescription');

    var flagElement =  document.getElementById('CityFlag');
    // var cityElement = document.getElementById('WeatherCity');
    // var weatherIconElement = document.getElementById('WeatherIcon');
    // var weatherDescriptionElement = document.getElementById('WeatherDescription');
    // var temperatureElement = document.getElementById('WeatherTemperature');
    // var temperatureMinMaxElement = document.getElementById('WeatherTempMinMax');
    // var now = moment();
    // var classNameHour = 'Sky-hour-' + now.hour();
    
    wpt.innerHTML = geoJson.properties.temperature + spanDegres + ' &#124; <span class="weather-city-panel">' + geoJson.properties.city + '</span>';
    weatherimgElement.classList.add('wu-'+geoJson.properties.weather.toLowerCase());
    curDate.innerHTML = '<span>' + moment().format('LL') + '</span>';
    wpmm.innerHTML = '<p>Min: ' + geoJson.properties.min + degres + '</p><p>Max: ' + geoJson.properties.max + degres + '</p>' ;
    wpd.innerHTML = '<span>' + geoJson.properties.description + '</span>';
    
    flagElement.classList.add('flag');
    flagElement.classList.add('flag-' + geoJson.properties.country.toLowerCase());
    // cityElement.innerHTML = geoJson.properties.city;
    // weatherIconElement.innerHTML = '<i class="wi wi-owm-' + geoJson.properties.iconId + '"></i>';
    // weatherDescriptionElement.innerText = geoJson.properties.description;
    // temperatureElement.innerHTML = geoJson.properties.temperature + degres;
    // temperatureMinMaxElement.innerHTML = "Min:" + geoJson.properties.min + degres + "<br />Max:" + geoJson.properties.max + degres;
}


function jsonToGeoJson (weatherItem) {
    var feature = {
    type: "Feature",
    properties: {
        iconId: weatherItem.weather[0].id,
        city: weatherItem.name,
        weather: weatherItem.weather[0].main,
        description: weatherItem.weather[0].description,
        temperature: Math.round(weatherItem.main.temp*10)/10,
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

// function CheckDefaultLocation()
// {
//     var defaultLocation = document.getElementById('chkDefaultLocation').checked;
//     document.getElementById('SelectedCity').readOnly = defaultLocation;
//     if(defaultLocation == true){
//         document.getElementById('SelectedCity').value = "Current Position";
//     }
//     else{
//         document.getElementById('SelectedCity').value = "";
//     }
// }

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

function SetCity(city)
{
    localStorage.setItem('SavedCity', city);
}

function GetCity()
{
    var city = localStorage.getItem('SavedCity');
    return city;
}

function SetLastResponseDate()
{
    var now = moment();

    localStorage.setItem('LastResponseDate', now.format(parameters.DateTimeFormat));
}

function GetLastResponseDate()
{
    var dateString = localStorage.getItem('LastResponseDate');

    return new moment(dateString, parameters.DateTimeFormat);
}

function SetResponseText(responseText)
{
    localStorage.setItem('LastResponseText', responseText);
}

function GetResponseText()
{
    var responseText = localStorage.getItem('LastResponseText');
    return responseText;
}