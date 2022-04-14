// ---------- DECLARE GLOBAL VARIABLES ---------- //

var today = dayjs(); // get current date
var formatToday = dayjs(today).format('MM/DD/YYYY');
var todayEl = document.querySelector("#today");

var searchBtn = document.querySelector("#search-btn"); // select search button
var savedCitiesArr = [];
var btnList = document.querySelector("#saved-list");
var cityHeader = document.querySelector("#city-header");
var cityToday = document.querySelector("#today-data");

// ---------- END GLOBAL VARIABLES ---------- //

$(document).ready(function(){

    // on click of search button
    $(searchBtn).click(function(event) {
        event.preventDefault();
        console.log(this);

        // select sibling textarea and return the value
        var input = $(this).siblings("#input").val();

        // format user input to capitalize first letter
        var userInput = input.charAt(0).toUpperCase() + input.slice(1)

        // update header with location selection
        cityHeader.innerHTML = "<h2 id='city-header'>" + userInput + "<span id='today'>" + formatToday + "</span></h2>"


        // ---------- SET & GET CITIES LOCAL STORAGE ---------- //
        // if lsCities already exists in local storage
        if (localStorage.getItem("cities")) {
            // retrieve current cities array
            lsCities = JSON.parse(localStorage.getItem("cities"));
            // add new city & send back to local storage
            lsCities.push(userInput);
            localStorage.setItem("cities", JSON.stringify(lsCities));

            // call function to create buttons
            btnList.innerHTML = "";
            createBtns();

        // else if nothing is in local storage
        } else {
            savedCitiesArr.push(userInput);
            lsCities = localStorage.setItem("cities", JSON.stringify(savedCitiesArr));

            btnList.innerHTML = "";
            createBtns();
        }

        // ---------- FETCH CALL FOR OPEN WEATHER API TO RETRIEVE INPUT CITY COORDINATES ---------- //
        var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + userInput + "&units=imperial&appid=8450bd340817d310b29bc7a4282140ff";

            fetch(apiUrl)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                console.log(data);
                // grab latitude and longitude coordinates
                var lon = data.coord.lon;
                var lat = data.coord.lat;

                // pass them through the coordinate fetch function
                coordinateFetch(lat, lon);
            })
    })

});

// ---------- FETCH DATA BASED ON COORDINATES ---------- //
var coordinateFetch = function(lat, lon) {

    // select span elements to hold generated data
    var tempEl = document.querySelector("#temp");
    var windEl = document.querySelector("#wind");
    var humidEl = document.querySelector("#humid");
    var uviEl = document.querySelector("#uvi");

    var coordinateApi = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=8450bd340817d310b29bc7a4282140ff";

    fetch(coordinateApi)
    .then(function(response) {
        return response.json();
    })
        
    .then(function(data) {
        console.log(data);

        // grab relevant data points
        var currentTemp = data.current.temp + " F";
        var currentWind = data.current.wind_speed + " MPH";
        var currentHumid = data.current.humidity + " %";
        var currentUV = data.current.uvi;

        // add data to corresponding elements
        tempEl.textContent = currentTemp;
        windEl.textContent = currentWind;
        humidEl.textContent = currentHumid;
        uviEl.textContent = currentUV;

        // grab 5 day forecast data
        var forecastArr = data.daily;
        console.log(forecastArr);

        // iterate through forecastArr
        for (i = 0; i < 5; i++) {
            var forecastTemp = forecastArr[i].temp.day + " F";
            var forecastWind = forecastArr[i].wind_speed + " MPH";
            var forecastHumid = forecastArr[i].humidity + " %";

            console.log(forecastTemp, forecastWind, forecastHumid);
    
        }

    })
    

}




// ---------- DYNAMICALLY CREATE BUTTONS FOR SAVED CITIES ---------- //
var createBtns = function() {
    let lsCities = JSON.parse(localStorage.getItem("cities"));

    for (var c of lsCities) {
        var newBtn = document.createElement("button");
        newBtn.textContent = c;
        newBtn.classList = "w-100 text-center py-1 my-2";
        btnList.appendChild(newBtn);
    }
}

// will need a click listnere for the button list to read text content
// and determine how to populate the weather data from a save