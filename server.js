
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Serve Weather App files
app.use(express.static(__dirname));

// Home page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/weather.html");
});

// TiDB Cloud connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 4000,
    ssl: {
        minVersion: "TLSv1.2"
    },
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test database connection
db.query("SELECT 1", (err) => {
    if (err) {
        console.log("MySQL connection failed:", err);
        return;
    }

    console.log("MySQL connected successfully!");
});

// Get weather from OpenWeather
app.get("/api/weather", async (req, res) => {

    const city = req.query.city;

    if (!city) {
        return res.status(400).json({
            message: "City name is required"
        });
    }

    const API_KEY = process.env.OPENWEATHER_API_KEY;

    try {

        const URL =
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const response = await fetch(URL);
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                message: data.message || "City not found"
            });
        }

        res.json(data);

    } catch (error) {

        console.log("Weather API Error:", error);

        res.status(500).json({
            message: "Weather service error"
        });
    }
});

// Save weather history
app.post("/api/weather-history", (req, res) => {

    const {
        city,
        temperature,
        humidity,
        wind_speed,
        weather_condition
    } = req.body;

    const sql = `
        INSERT INTO weather_history
        (city, temperature, humidity, wind_speed, weather_condition)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [city, temperature, humidity, wind_speed, weather_condition],
        (err, result) => {

            if (err) {
                console.log("Database error:", err);

                return res.status(500).json({
                    message: "Data save nahi hua"
                });
            }

            res.json({
                message: "Weather data saved successfully!"
            });
        }
    );
});

// Start server
app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});