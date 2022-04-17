// ---------- DECLARE GLOBAL VARIABLES ---------- //

var today = dayjs(); // get current date
var formatToday = dayjs(today).format('MM/DD/YYYY'); // format today's date
var todayEl = document.querySelector("#today"); // select where to append date

var searchBtn = document.querySelector("#search-btn"); // select search button
var savedCitiesArr = [];
var btnList = document.querySelector("#saved-list");
var cityHeader = document.querySelector("#city-header");
var cityToday = document.querySelector("#today-data");

// select span elements to hold generated data for current weather
var iconEl = document.querySelector("#icon");
var tempEl = document.querySelector("#temp");
var windEl = document.querySelector("#wind");
var humidEl = document.querySelector("#humid");
var uviEl = document.querySelector("#uvi");

var fiveDayForecastArr = []; // empty array to hold forecast data
var fiveDayDivEl = document.querySelector("#five-day");

// ---------- END GLOBAL VARIABLES ---------- //

$(document).ready(function(){

    // ---------- CHECK LOCAL STORAGE FOR SAVED CITIES ---------- //

    if (localStorage.getItem("cities")) {
        // retrieve current cities array
        lsCities = JSON.parse(localStorage.getItem("cities"));
        // call function to create buttons
        createBtns();
    } else {
        // nothing
    }

    // ---------- CLICK LISTENER FOR SEARCH BUTTON ---------- //

    $(searchBtn).click(function(event) {
        event.preventDefault();
        var lsCities = JSON.parse(localStorage.getItem("cities"));

        // select sibling textarea and return the value
        var input = $(this).siblings("#input").val();
        // reset textarea value to empty to prepare for next input
        $(this).siblings("#input").val("");

        // format user input to capitalize first letter
        var userInput = input.charAt(0).toUpperCase() + input.slice(1)

        // update header with location selection
        cityHeader.innerHTML = "<h2 id='city-header'>" + userInput + "<span id='today'>" + formatToday + "</span><img id='icon' /></h2>"


        // ---------- SET & GET CITIES LOCAL STORAGE ---------- //
        // if nothing is in local storage
        if (!localStorage.getItem("cities")) {
            savedCitiesArr.push(userInput);
            lsCities = localStorage.setItem("cities", JSON.stringify(savedCitiesArr));

            createBtns();
        } else if (lsCities.includes(userInput)) {
            console.log("nothing");
        } else {
            lsCities.push(userInput);
            localStorage.setItem("cities", JSON.stringify(lsCities));

            createBtns();
        };

        checkWeather(userInput);
    })

});

// ---------- FETCH CALL FOR OPEN WEATHER API TO RETRIEVE INPUT CITY COORDINATES ---------- //
var checkWeather = function(userInput) {
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
        .catch(error => {
            console.error("There has been an error with your request:", error);

            cityHeader.innerHTML = "<h2 id='city-header'>There has been an error with your request. <br /> Please enter a valid city.</h2>"
            tempEl.textContent = "";
            windEl.textContent = "";
            humidEl.textContent = "";
            uviEl.textContent = "";

            let btns = document.getElementsByClassName("saved");

            for (var b of btns) {
                errorInput = b.textContent
                console.log(errorInput);

                if (errorInput == userInput) {
                    console.log("delete this button");
                    b.remove();
                } 
                else {
                    console.log("this button is fine")
                }
            }    
        });
    };



// ---------- FETCH DATA BASED ON COORDINATES ---------- //
var coordinateFetch = function(lat, lon) {

    // ---------- POPULATE TODAY'S WEATHER ---------- //
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
        var iconUrl = "http://openweathermap.org/img/wn/" + currentIcon + ".png";

        var currentTemp = data.current.temp + " °F";
        var currentWind = data.current.wind_speed + " MPH";
        var currentHumid = data.current.humidity + " %";
        var currentUV = data.current.uvi;

        // add data to corresponding elements for today's weather
        iconEl.setAttribute("src", iconUrl);
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
        fiveDayForecastArr = []; // reset array to empty to prep for new pushes
        fiveDayDivEl.innerHTML = ""; // clear out div

        // iterate through forecastArr
        for (i = 0; i < 5; i++) {
            var forecastDayData = today.add((i + 1), 'day');
            var forecastIcon = forecastArr[i].weather[0].icon;
            var forecastIconUrl = "http://openweathermap.org/img/wn/" + forecastIcon + ".png"
            var forecastDay = dayjs(forecastDayData).format('MM/DD/YYYY');
            var forecastTemp = "Temp: " + forecastArr[i].temp.day + " °F";
            var forecastWind = "Wind: " + forecastArr[i].wind_speed + " MPH";
            var forecastHumid = "Humidity: " + forecastArr[i].humidity + " %";

            // package data
            var forecastObj = {
                0: forecastDay,
                1: forecastIconUrl,
                2: forecastTemp,
                3: forecastWind,
                4: forecastHumid
            };

            // push data to array
            fiveDayForecastArr.push(forecastObj);
        }

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
        var forecastIcon = document.createElement("img");
        var listItemTemp = document.createElement("li");
        var listItemWind = document.createElement("li");
        var listItemHumid = document.createElement("li");    

        forecastDayEl.textContent = a[0];
        forecastIcon.setAttribute("src", a[1])
        listItemTemp.textContent = a[2];
        listItemWind.textContent = a[3];
        listItemHumid.textContent = a[4];

        ulEl.classList = "col-12 col-lg-2";

        ulEl.append(forecastDayEl, forecastIcon, listItemTemp, listItemWind, listItemHumid);
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
        // newBtn.setAttribute("id", "saved")
        newBtn.classList = "saved w-100 text-center py-1 my-2";
        btnList.appendChild(newBtn);
    }

    // event listener for save buttons
    console.log(lsCities);
    $(btnList).click(function(event) {
        console.log("you clicked a saved button");

        var target = event.target.textContent;

        // update header with location selection
        cityHeader.innerHTML = "<h2 id='city-header'>" + target + "<span id='today'>" + formatToday + "</span><img id='icon' /></h2>"

        fiveDayDivEl.textContent = ""; // clear data
        checkWeather(target); // pass target to checkWeather
    });
}
