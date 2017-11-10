

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
                    ludElement.innerText = lud.format('LLLL');
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

    // console.log(moment.locale());

    var city = GetCity();
    if(city == null || city.length == 0)
    {
        alert('No City defined! Please do it in the parameter page.')
        // var containerElement = document.getElementById("container");
        // container.innerText = 'No City defined! Please do it in the parameter page.';
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
        var generatedURL = GenerateRequestTodayWeatherByCity(city);

        TodayWeatherRequest(generatedURL);
    }
    else{
        var responseText = GetResponseText();
        AnalyzeTodayRequest(responseText, false);
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

function GenerateRequestTodayWeatherByCity(city)
{
    var appID = parameters.WeatherappID;
    var url = parameters.TodayWeatherApiURL + "q=" + city + '&appid=' + appID + parameters.urlParameters;
    return url;
}

// can't request to using lat & long why api key limit with free usage?
// function GenerateRequestWeatherByLatLong()
// {
//     var appID = parameters.WeatherappID;
//     var url = parameters.TodayWeatherApiURL +"lat=" + parameters.GeolocationLat +"&long=" +  parameters.GeolocationLong + '&appid=' + appID + parameters.urlParameters;
//     return url;{}
// }


function TodayWeatherRequest(url)
{   
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);

    xhr.onreadystatechange = function() {
        if (this.status == 200) {
            var responseTxt = this.responseText;
            console.log(responseTxt);
            SetResponseText(responseTxt);
            
            AnalyzeTodayRequest(responseTxt, true);
        }
    };
    xhr.send();
}

function AnalyzeTodayRequest(responseTxt, updateDate)
{
    var jsonObject = JSON.parse(responseTxt);
    console.log(jsonObject);
    SetTodayWeatherInfo(jsonObject);
    if(updateDate == true)
        SetLastResponseDate();
    // console.log("request:"+updateDate?"oui":"non");
}

function SetTodayWeatherInfo(jsonObject) {
    var geoJson = ConvertTodayJsonToTodayGeoJson(jsonObject);
    var degres = '&#8451;';
    var spanDegres = '<span class="temp-degres-weather-panel">' + degres + '</span>';
    var now = moment();
    var wpt = document.getElementById('weatherpaneltemp');
    var curDate = document.getElementById('CurrentDate');
    var weatherimgElement = document.getElementById('weatherimg');
    // var wpmm = document.getElementById('WeatherPanelMinMax');
    var wtmax =  document.getElementById('WeatherTempMax');
    var wtmin = document.getElementById('WeatherTempMin');
    var wpd = document.getElementById('WeatherPanelDescription');

    var flagElement =  document.getElementById('CityFlag');
    // var cityElement = document.getElementById('WeatherCity');
    // var weatherIconElement = document.getElementById('WeatherIcon');
    // var weatherDescriptionElement = document.getElementById('WeatherDescription');
    // var temperatureElement = document.getElementById('WeatherTemperature');
    // var temperatureMinMaxElement = document.getElementById('WeatherTempMinMax');
    // var now = moment();
    // var classNameHour = 'Sky-hour-' + now.hour();

    var weather = geoJson.properties.weather.toLowerCase();

    if(weather == "clouds"){
        weather = 'cloudy';
    }
    else if(weather == "mist"){
        weather = 'hazy';
    }
    else if(weather == "drizzle"){
        weather = 'chancerain';
    }
    
    wpt.innerHTML = geoJson.properties.temperature + spanDegres + ' &#124; <span class="weather-city-panel">' + geoJson.properties.city + '</span>';
    weatherimgElement.classList.add('wu-'+weather);
    curDate.innerHTML = '<span>' + now.format('LL') + '</span>';
    // wpmm.innerHTML = '<p>Min: ' + geoJson.properties.min + degres + '</p><p>Max: ' + geoJson.properties.max + degres + '</p>' ;
    wtmin.innerHTML = '<span>' + geoJson.properties.min + degres + '</span>';
    wtmax.innerHTML = '<span>' + geoJson.properties.max + degres + '</span>';
    wpd.innerHTML = '<span>' + geoJson.properties.description + '</span>';
    
    flagElement.classList.add('flag');
    flagElement.classList.add('flag-' + geoJson.properties.country.toLowerCase());
    // cityElement.innerHTML = geoJson.properties.city;
    // weatherIconElement.innerHTML = '<i class="wi wi-owm-' + geoJson.properties.iconId + '"></i>';
    // weatherDescriptionElement.innerText = geoJson.properties.description;
    // temperatureElement.innerHTML = geoJson.properties.temperature + degres;
    // temperatureMinMaxElement.innerHTML = "Min:" + geoJson.properties.min + degres + "<br />Max:" + geoJson.properties.max + degres;
}


function ConvertTodayJsonToTodayGeoJson (todayJsonItem) {
    var feature = {
    type: "Feature",
    properties: {
        iconId: todayJsonItem.weather[0].id,
        city: todayJsonItem.name,
        weather: todayJsonItem.weather[0].main,
        description: todayJsonItem.weather[0].description,
        temperature: Math.round(todayJsonItem.main.temp*10)/10,
        min: todayJsonItem.main.temp_min,
        max: todayJsonItem.main.temp_max,
        humidity: todayJsonItem.main.humidity,
        pressure: todayJsonItem.main.pressure,
        windSpeed: todayJsonItem.wind.speed,
        windDegrees: todayJsonItem.wind.deg,
        windGust: todayJsonItem.wind.gust,
        cloudiness: todayJsonItem.clouds.all,
        // icon: parameters.WeatherIcon
        //     + todayJsonItem.weather[0].icon  + parameters.WeatherIconExtension,
        coordinates: [todayJsonItem.coord.Lon, todayJsonItem.coord.Lat],
        country: todayJsonItem.sys.country
    },
    geometry: {
        type: "Point",
        coordinates: [todayJsonItem.coord.Lon, todayJsonItem.coord.Lat]
    }
    };

    // returns object
    return feature;
}


function ConvertDayJsonToGeoJson(dayJsonItem){
    var newJson = {
        type : "PartDay",
        IsDay: dayJsonItem.pod == "d" ? true : false,
        forecastedDate : moment(dayJsonItem.dt),
        calculationDate : moment(dayJsonItem, "YYYY-MM-DD HH:mm:SS"),    
        properties :{
            iconId : dayJsonItem.weather[0].id,
            weather: dayJsonItem.weather[0].main,
            description: dayJsonItem.weather[0].description,
            temperature: Math.round(dayJsonItem.main.temp*10)/10,
            min: dayJsonItem.main.temp_min,
            max: dayJsonItem.main.temp_max,
            humidity: dayJsonItem.main.humidity,
            pressure: dayJsonItem.main.pressure,
            windSpeed: dayJsonItem.wind.speed,
            windDegrees: dayJsonItem.wind.deg,
            cloudiness: dayJsonItem.clouds.all            
        }
    };
}

function AnalyseForescastJsonArray(forecastArray){
    var filteredDayArray = new Array(forecastArray.length);
    for(i = 0; i < forecastArray.length; i++){

        var elementDay = {
            dayDate: forecastArray[i].dayDate,
            infoDay: GenerateWeatherInfoDay(forecastArray[i].dayWeatherTable)
        };

        filteredDayArray.push(elementDay);
    }

    return filteredDayArray;
}

function GenerateWeatherInfoDay(forecastWeatherElementArray){
    var weatherInfoDay = {
        tempMin: -1,
        tempMax: -1,
        midDayTemp: -1,
        midDayWeather: null,
        midDayWeatherDescription : null
    };

    for(i=0; i < forecastWeatherElementArray.length; i++){
        if(i == 0){
            weatherInfoDay.tempMin = forecastWeatherElementArray[i].properties.min;
            weatherInfoDay.tempMax = forecastWeatherElementArray[i].properties.max;
            weatherInfoDay.midDayTemp = forecastWeatherElementArray[i].properties.temperature;
            weatherInfoDay.midDayWeather = forecastWeatherElementArray[i].properties.weather;
            weatherInfoDay.midDayWeatherDescription = forecastWeatherElementArray[i].properties.description;
        }
        else{
            if(forecastWeatherElementArray[i].properties.min < weatherInfoDay.tempMin){
                weatherInfoDay.tempMin = forecastWeatherElementArray[i].properties.min;
            }

            if(forecastWeatherElementArray[i].properties.max > weatherInfoDay.tempMax){
                weatherInfoDay.tempMax = forecastWeatherElementArray[i].properties.max;
            }

            // TODO Get hour moment == 12 am
            if(forecastWeatherElementArray[i].IsDay == true && forecastWeatherElementArray[i].forecastedDate.hour() == 12){
                weatherInfoDay.midDayTemp = forecastWeatherElementArray[i].properties.temperature;
                weatherInfoDay.midDayWeather = forecastWeatherElementArray[i].properties.weather;
                weatherInfoDay.midDayWeatherDescription = forecastWeatherElementArray[i].properties.description;
            }
        }
    }
}



function ConvertForecastJsonToForescastJsonArray(forecastJsonItem) {
    var forecastArray = new Array();
    var max = forecastJsonItem.cnt;
    var tab = new Array();
    var currentDate;
    for(i = 0; i < max; i++){
        var element = ConvertTodayJsonToTodayGeoJson(forecastJsonItem.list[i]);
        if(i == 0)
        {
            currentDate = element.forecastedDate;
            tab.push(element);
        }
        else
        {
            var otherDate = element.forecastedDate;
            
            // if(currentday.format(parameters.DateFormat) == otherDate.format(parameters.DateFormat)){
            if(currentDate.isSame(otherDate, 'day')){
                tab.push(element);
            }
            else{
                var forecastElement = {
                    dayDate : currentDate,
                    dayWeatherTable : tab
                };

                forecastArray.push(forecastElement);

                currentDate = otherDate;
                tab = new Array();
                tab.push(element);
            }
        }
    }
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