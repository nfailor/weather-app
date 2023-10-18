// "api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}"
var apiKey = "b62f6e1198cc25658990097cf6763f8c";
var cityInput = document.getElementById("cityInput");
var getWeatherButton = document.getElementById("getWeatherButton");
var weatherInfo = document.getElementById("weatherInfo");
var forecastInfo = document.getElementById("forecastInfo");
var savedCities = JSON.parse(localStorage.getItem("savedCities")) || [];

function updateSavedCitiesList() {
    var searchList = document.getElementById("searchList");

    searchList.innerHTML = "";

    // using Set here will not allow duplicate entries into the string array of saved cities
    var uniqueCities = new Set(savedCities);

    // for all unique cities searches, create a list item on the html with the city name
    uniqueCities.forEach(function(savedCity) {
        var li = document.createElement("li");
        li.textContent = savedCity;
        li.addEventListener("click", function() {
            cityInput.value = this.textContent;
            getWeatherButton.click();
        });
        searchList.appendChild(li);
    });
}

// run the function to update the list
updateSavedCitiesList();

getWeatherButton.addEventListener("click", function () {
    // Get the user's input from the input field
    var city = cityInput.value;

    // clearing search bar after use
    cityInput.value = "";

    // only adding an entry if that entry is not already included in the local storage
    if (!savedCities.includes(city)) {
        // Push the new city into the saved cities array
        savedCities.push(city);
        // Save the updated array back to local storage
        localStorage.setItem("savedCities", JSON.stringify(savedCities));
    }

    // Update the list of saved cities
    updateSavedCitiesList();

    var currentWeatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;

    var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + apiKey;

    // upon running the api request, return data or throw an error, determined by the response status
    fetch(currentWeatherURL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(function (data) {
        //process the data and update the weatherInfo element
        // var temperature = data.main.temp;
        var temperatureKelvin = data.main.temp;
        var temperatureFahrenheit = ((temperatureKelvin - 273.15) * 9) / 5 + 32;
        var humidity = data.main.humidity;
        var windSpeedMPS = data.wind.speed;
        var windSpeedMPH = windSpeedMPS * 2.237;
        var currentWeatherCode = data.weather[0].icon;

        var iconURL = `https://openweathermap.org/img/w/${currentWeatherCode}.png`;

        var weatherHtml = `
            <p>Description: <img src="${iconURL}" alt="Weather Icon"></p>
            <p>Temperature: ${temperatureFahrenheit.toFixed(2)} °F</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind Speed: ${windSpeedMPH.toFixed(1)} mph</p>
        `;

        weatherInfo.querySelector(".card-body").innerHTML = weatherHtml;

        fetch(forecastURL)
          .then(function (response) {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then(function (forecastData) {
            // Process and display the 5-day forecast

            var forecastHtml = "";
            // creating a blank array to put information inside
            var processedDates = [];

            // Loop through the forecast data (assuming it's an array)
            forecastData.list.forEach(function (forecastEntry) {
              // Extract relevant information from each forecast entry
              var timestamp = forecastEntry.dt * 1000; // Convert timestamp to milliseconds
              var date = new Date(timestamp);
              // Format date to display in a user-friendly way
              var formattedDate = date.toLocaleDateString();

              var weatherConditionCode = forecastEntry.weather[0].icon;


              if (!processedDates.includes(formattedDate)) {
                var temperatureKelvin = forecastEntry.main.temp;
                var temperatureFahrenheit = ((temperatureKelvin - 273.15) * 9) / 5 + 32;
                var humidity = forecastEntry.main.humidity;
                var windSpeedMPS = forecastEntry.wind.speed;
                var windSpeedMPH = windSpeedMPS * 2.237;

                var iconURL = `https://openweathermap.org/img/w/${weatherConditionCode}.png`;

                var cardHtml = `
                    <div class="col-md-2">
                        <div class="card">
                            <div class="card-header">${formattedDate}</div>
                            <div class="card-body">
                                <p>Description: <img src="${iconURL}" alt="Weather Icon"></p>
                                <p>Temperature: ${temperatureFahrenheit.toFixed(2)} °F</p>
                                <p>Humidity: ${humidity}%</p>
                                <p>Wind Speed: ${windSpeedMPH.toFixed(1)} mph</p>
                            </div>
                        </div>
                    </div>
                    `;
              
              // Append the entry's HTML to the overall forecast HTML
              forecastHtml += cardHtml;

              processedDates.push(formattedDate);
            };
        });

            // Update the "forecastInfo" element with the built HTML
            forecastInfo.innerHTML = forecastHtml;
          })
          .catch(function (error) {
            console.log(
              "There was a problem with the forecast fetch operation: ",
              error
            );
          });
      });
  });