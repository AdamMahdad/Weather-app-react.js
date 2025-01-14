import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState('');
  const [availableCities, setAvailableCities] = useState([]);
  const [currentLocationCity, setCurrentLocationCity] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentLocation = async () => {
      try {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const geoResponse = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const cityName =
              geoResponse.data.address.city ||
              geoResponse.data.address.town ||
              geoResponse.data.address.village;
            setCity(cityName);
            setCurrentLocationCity(cityName);
          },
          () => {
            setError('Could not determine your location. Please enter a city manually.');
            setCurrentLocationCity('');
          }
        );
      } catch (err) {
        setError('Error fetching location. Please try again.');
      }
    };

    fetchCurrentLocation();
    setAvailableCities(['Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague', 'Eindhoven', 'Groningen']);
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    try {
      const geoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${city}&format=json&limit=1`
      );
      if (geoResponse.data.length === 0) {
        setError('City not found. Please try again.');
        setWeatherData(null);
        setLoading(false);
        return;
      }

      const { lat, lon } = geoResponse.data[0];
      const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;

      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      setWeatherData(weatherResponse.data);
    } catch (err) {
      setError('Could not fetch weather data. Please try again.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchWeather();
    }
  };

  return (
    <div className="app container h-screen w-screen flex items-center justify-center flex-col bg-gray-900 text-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-indigo-400">Weather Forecast</h1>
      <div className="search flex flex-col items-center gap-4 w-full max-w-md">
        <select
          className="w-full px-4 py-2 bg-gray-800 text-gray-100 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="" disabled>
            {currentLocationCity ? `Your Location: ${currentLocationCity}` : 'Select City'}
          </option>
          {availableCities.map((cityName, index) => (
            <option key={index} value={cityName}>
              {cityName}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="w-full px-4 py-2 bg-gray-800 text-gray-100 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for a city"
        />
        <button
          onClick={fetchWeather}
          className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded shadow-md transition"
        >
          Get Weather
        </button>
      </div>
      {loading && <p className="mt-6 text-indigo-400 animate-pulse">Loading...</p>}
      {error && <p className="mt-6 text-red-400">{error}</p>}
      {weatherData && (
        <div className="weather-info mt-8 bg-gray-800 rounded-lg p-6 shadow-md w-full max-w-md">
          <h2 className="text-2xl font-semibold text-indigo-400 mb-4">Current Weather</h2>
          <p className="mb-2">🌡️ Temperature: {Math.round(weatherData.main.temp)}°C</p>
          <p className="mb-2">☁️ Weather: {weatherData.weather[0].description}</p>
          <p className="mb-2">💧 Humidity: {weatherData.main.humidity}%</p>
          <p>💨 Wind Speed: {weatherData.wind.speed} m/s</p>
        </div>
      )}
    </div>
  );
};

export default App;
