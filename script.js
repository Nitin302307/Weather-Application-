async function getWeather() {
    const city = document.getElementById("cityInput").value.trim();

    if (city === "") {
        alert("Please enter a city name");
        return;
    }

    try {
        const response = await fetch(
            `/api/weather?city=${encodeURIComponent(city)}`
        );

        const data = await response.json();

        if (!response.ok) {
            alert("Error: " + data.message);
            return;
        }

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

        // Save weather history
        await fetch("/api/weather-history", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                city: data.name + ", " + data.sys.country,
                temperature: data.main.temp,
                humidity: data.main.humidity,
                wind_speed: data.wind.speed,
                weather_condition: data.weather[0].main
            })
        });

    } catch (error) {
        console.log(error);
        alert("Something went wrong. Please try again.");
    }
}