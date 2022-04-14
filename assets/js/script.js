// ---------- DECLARE GLOBAL VARIABLES ---------- //

var searchBtn = document.querySelector("#search-btn"); // select search button
var savedCitiesArr = [];
var btnList = document.querySelector("#saved-list");

// ---------- END GLOBAL VARIABLES ---------- //

$(document).ready(function(){

    // on click of search button
    $(searchBtn).click(function(event) {
        event.preventDefault();
        console.log(this);

        // select sibling textarea and return the value
        var userInput = $(this).siblings("#input").val();

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

        // insert user input into fetch url
// ---------- FETCH CALL FOR OPEN WEATHER API ---------- //
        // Documentation for OpenWeather: https://openweathermap.org/api/one-call-api
        var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + userInput + "&appid=8450bd340817d310b29bc7a4282140ff";


        fetch(apiUrl)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                console.log(data);
            });

    })

});

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