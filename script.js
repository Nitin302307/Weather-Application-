async function getWeather() {

    let city = document.getElementById("cityInput").value.trim();

    if (city === "") {
        alert("Please enter a city name");
        return;
    }

    try {

        // Get weather from our Node.js backend
        const response = await fetch(
            `http://localhost:3000/api/weather?city=${encodeURIComponent(city)}`
        );

        const data = await response.json();

        if (!response.ok) {
            alert("Error: " + data.message);
            return;
        }

        // Display weather
        document.getElementById("cityName").innerText =
            data.name + ", " + data.sys.country;

        document.getElementById("temperature").innerText =
            Math.round(data.main.temp) + "°C";

        document.getElementById("condition").innerText =
            data.weather[0].main;

        document.getElementById("humidity").innerText =
            data.main.humidity + "%";

        document.getElementById("wind").innerText =
            data.wind.speed + " m/s";


        // Save weather data into MySQL
        const weatherData = {
            city: data.name + ", " + data.sys.country,
            temperature: data.main.temp,
            humidity: data.main.humidity,
            wind_speed: data.wind.speed,
            weather_condition: data.weather[0].main
        };

        const saveResponse = await fetch(
            "http://localhost:3000/api/weather-history",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(weatherData)
            }
        );

        const saveResult = await saveResponse.json();

        console.log(saveResult.message);

    } catch (error) {

        console.log("Error:", error);
        alert("Something went wrong. Please try again.");

    }
}