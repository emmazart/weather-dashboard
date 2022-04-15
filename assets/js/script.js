// ---------- DECLARE GLOBAL VARIABLES ---------- //

var today = dayjs(); // get current date
var formatToday = dayjs(today).format('MM/DD/YYYY'); // format today's date
var todayEl = document.querySelector("#today"); // select where to append date

var searchBtn = document.querySelector("#search-btn"); // select search button
var savedCitiesArr = [];
var btnList = document.querySelector("#saved-list");
var cityHeader = document.querySelector("#city-header");
var cityToday = document.querySelector("#today-data");

var fiveDayForecastArr = []; // empty array to hold forecast data
var fiveDayDivEl = document.querySelector("#five-day");

// ---------- END GLOBAL VARIABLES ---------- //

$(document).ready(function(){

    // on click of search button
    $(searchBtn).click(function(event) {
        event.preventDefault();

        // select sibling textarea and return the value
        var input = $(this).siblings("#input").val();

        // format user input to capitalize first letter
        var userInput = input.charAt(0).toUpperCase() + input.slice(1)

        // update header with location selection
        cityHeader.innerHTML = "<h2 id='city-header'>" + userInput + "<span id='today'>" + formatToday + "</span><img id='icon' /></h2>"


        // ---------- SET & GET CITIES LOCAL STORAGE ---------- //
        // if lsCities already exists in local storage
        if (localStorage.getItem("cities")) {
            // retrieve current cities array
            lsCities = JSON.parse(localStorage.getItem("cities"));
            // add new city & send back to local storage
            lsCities.push(userInput);
            localStorage.setItem("cities", JSON.stringify(lsCities));

            // call function to create buttons
            createBtns();

        // else if nothing is in local storage
        } else {
            savedCitiesArr.push(userInput);
            lsCities = localStorage.setItem("cities", JSON.stringify(savedCitiesArr));

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

    // ---------- POPULATE TODAY'S WEATHER ---------- //
    // select span elements to hold generated data
    var iconEl = document.querySelector("#icon");
    var tempEl = document.querySelector("#temp");
    var windEl = document.querySelector("#wind");
    var humidEl = document.querySelector("#humid");
    var uviEl = document.querySelector("#uvi");

    var coordinateApi = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=8450bd340817d310b29bc7a4282140ff";

    fetch(coordinateApi)
    .then(function(response) {
        return response.json();
    })
        
    // ---------- GENERATE 5 DAY FORECAST ---------- //
    .then(function(data) {
        console.log(data);

        // grab relevant data points
        var currentIcon = data.current.weather[0].icon;
        // var iconUrl = "http://openweathermap.org/img/wn/" + currentIcon + "@2x.png";
        var iconUrl = "http://openweathermap.org/img/wn/10d.png"

        var currentTemp = data.current.temp + " °F";
        var currentWind = data.current.wind_speed + " MPH";
        var currentHumid = data.current.humidity + " %";
        var currentUV = data.current.uvi;

        // add data to corresponding elements for today's weather
        iconEl.innerHTML = "<img id='icon' src=" + iconUrl + " alt='weather icon' />";
        tempEl.textContent = currentTemp;
        windEl.textContent = currentWind;
        humidEl.textContent = currentHumid;
        uviEl.textContent = currentUV;

        // format background color for UVI using bootstrap classes
        if (currentUV < 3) {
            uviEl.classList = "rounded bg-success" // green background
        } else if (currentUV >= 3 && currentUV <= 5) {
            uviEl.classList = "rounded bg-warning" // yellow background
        } else {
            uviEl.classList = "rounded bg-danger" // red background
        }

        // grab 5 day forecast data
        var forecastArr = data.daily;
        console.log(forecastArr);

        // iterate through forecastArr
        for (i = 0; i < 5; i++) {
            var forecastDayData = today.add((i + 1), 'day');
            var forecastDay = dayjs(forecastDayData).format('MM/DD/YYYY');
            var forecastTemp = "Temp: " + forecastArr[i].temp.day + " °F";
            var forecastWind = "Wind: " + forecastArr[i].wind_speed + " MPH";
            var forecastHumid = "Humidity: " + forecastArr[i].humidity + " %";

            // package data
            var forecastObj = {
                0: forecastDay,
                1: forecastTemp,
                2: forecastWind,
                3: forecastHumid
            };

            // push data to array
            fiveDayForecastArr.push(forecastObj);
        }

        // console.log(fiveDayForecastArr);
        generateForecast(fiveDayForecastArr);
    })
}

// ---------- FUNCTION FOR DYNAMICALLY CREATING FIVE DAY FORECAST ELEMENTS ---------- //

var generateForecast = function(array) {
    console.log(array);

    for (var a of array) {
        // create elements to hold each data
        console.log(a);
        var ulEl = document.createElement("ul");
        var forecastDayEl = document.createElement("p");
        var listItemTemp = document.createElement("li");
        var listItemWind = document.createElement("li");
        var listItemHumid = document.createElement("li");

        forecastDayEl.textContent = a[0];
        listItemTemp.textContent = a[1];
        listItemWind.textContent = a[2];
        listItemHumid.textContent = a[3];

        ulEl.append(forecastDayEl, listItemTemp, listItemWind, listItemHumid);
        fiveDayDivEl.appendChild(ulEl);
    }
}

// ---------- DYNAMICALLY CREATE BUTTONS FOR SAVED CITIES ---------- //

var createBtns = function() {
    btnList.innerHTML = "";
    let lsCities = JSON.parse(localStorage.getItem("cities"));

    for (var c of lsCities) {
        var newBtn = document.createElement("button");
        newBtn.textContent = c;
        newBtn.classList = "w-100 text-center py-1 my-2";
        btnList.appendChild(newBtn);
    }
}