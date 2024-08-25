//API key
const apiKey = "fa037e083460948eb9263013a25860b7";

//function to fetch weather data
async function getWeatherData(cityName) {
    
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;
    
    try {
        //fetch current weather data
        const currentWeatherResponse = await fetch(currentWeatherUrl);
       

        if(!currentWeatherResponse.ok) {
            throw new Error("!CITY NOT FOUND");
        }

        const currentWeatherData = await currentWeatherResponse.json();
        console.log("Current Weather Data:", currentWeatherData);

        //fetch 5-day forecast data
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        //display weather data
        displayWeatherData(currentWeatherData, forecastData);

        //clear any previous error messages
        displayErrorMessage("");

        //save city to local storage and update dropdown
        saveCityToStorage(cityName);
        updateDropdown();

    } catch (error) {
        console.error("Error fetching weather data: ", error);
        displayErrorMessage(error.message);

        clearWeatherDetails();
    }
}

function clearWeatherDetails() {
    document.getElementById('weather-details').innerHTML = "";
    document.getElementById('fivedayweather').innerHTML = "";
}

//function to get weather data based on coordinates/location
async function getWeatherDataByCoords(latitude, longitude) {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    try {
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        if (!currentWeatherResponse.ok) {
            throw new Error("Unable to retrive weather data for your location");
        }
        const currentWeatherData = await currentWeatherResponse.json();

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        displayWeatherData(currentWeatherData , forecastData);

        displayErrorMessage("");
    } catch (error) {
        console.error("Error fetching weather data:", error);
        displayErrorMessage(error.message);
    }
}

//function to handle the current location 
document.querySelector('button[onclick="getCurrentLocation()"]').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            getWeatherDataByCoords(latitude, longitude);
        }, function(error) {
            displayErrorMessage("Unable to retrieve your location. Please allow location access.");
            console.error("Geolocation error:", error);
        });
    } else {
        displayErrorMessage("Geolocation is not supported by your browser.");
    }
});

//function to display error messages in the HTML
function displayErrorMessage(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    if (message) {
        errorDiv.classList.remove('hidden');
    } else {
        errorDiv.classList.add('hidden');
    }
}

//function to save searched city on localStorage
function saveCityToStorage(cityName) {
    let cities = JSON.parse(localStorage.getItem('recentCities')) || [];

    if (!cities.includes(cityName)) {
        cities.push(cityName);
        localStorage.setItem('recentCities', JSON.stringify(cities));
    }
}

//function to update the dropdown menu with recently searched cities
function updateDropdown() {
    const cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    const dropdown = document.getElementById('recent-cities');

    if (cities.length > 0) {
        dropdown.classList.remove('hidden');
        dropdown.innerHTML = cities.map(city => `<option value="${city}">${city}</option>`).join('');
    } else {
        dropdown.classList.add('hidden');
    }
}

//function to display weather data in HTML
function displayWeatherData(currentWeather, forecast) {
    const weatherDetailsDiv = document.getElementById('weather-details');

    const currentWeatherIcon = `http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`;

     // Current weather
     const currentWeatherHtml = `
        <div class="bg-white shadow-md rounded-lg p-4 max-w-md text-center transition transform hover:scale-105">
            <h2 class="text-lg font-semibold">Current Weather in ${currentWeather.name}</h2>
            <img src="${currentWeatherIcon}" alt="${currentWeather.weather[0].description}" class="weather-icon m-auto">
            <p>Temperature: ${currentWeather.main.temp}°C</p>
            <p>Humidity: ${currentWeather.main.humidity}%</p>
            <p>Wind Speed: ${currentWeather.wind.speed} m/s</p>
            <p>Description: ${currentWeather.weather[0].description}</p>
        </div>
     `; 

     // 5-day forecast (filtered to show one forecast per day)
    const forecastHtml = forecast.list
    .filter((item, index) => index % 8 === 0) // Filter to get one forecast per day
    .map(item => {
     const forecastIcon = `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
        return `
            <div class="bg-cyan-100 text-black shadow-md rounded-lg p-4 w-48 h-60 flex flex-col justify-between items-center m-4 transition transform hover:scale-105">
                <h3 class="text-md font-semibold">${new Date(item.dt_txt).toLocaleDateString()}</h3>
                <img src="${forecastIcon}" alt="${item.weather[0].description}" class="weather-icon w-16 h-16">
                <p class="text-lg font-bold">${item.main.temp}°C</p>
                <p class="text-sm">Humidity: ${item.main.humidity}%</p>
                <p class="text-sm">Wind: ${item.wind.speed} m/s</p>
                <p class="text-sm text-gray-700">${item.weather[0].description}</p>
            </div>
        `;
    }).join('');

    // Add the content to the page
    weatherDetailsDiv.innerHTML = currentWeatherHtml;
    document.getElementById("fivedayweather").innerHTML = `
        <div class="text-lg font-bold text-center mt-6">
            Next five days Forecast:
        </div>
        ${forecastHtml}
    `;
}

//event listener for the search button
document.getElementById('search-btn').addEventListener('click', function() {
    const cityName = document.getElementById('search-city').value.trim();

    if (!cityName) {
        displayErrorMessage("!PLEASE ENTER A CITY NAME");
        clearWeatherDetails();
        return;
    }

    getWeatherData(cityName);
});

//event listener for the dropdown menu
document.getElementById('recent-cities').addEventListener('change', function() {
    const selectedCity = this.ariaValueMax;
    if (selectedCity) {
        getWeatherData(selectedCity);
    }
});

//Initialize the dropdown when the page loads
window.onload = function() {
    updateDropdown();
    displayErrorMessage("");
}