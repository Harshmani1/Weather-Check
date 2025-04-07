document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('welcomeSection').classList.add('hidden');
    document.getElementById('appSection').classList.remove('hidden');
  });
  
  const input = document.getElementById("cityInput");
  const suggestionsBox = document.getElementById("suggestions");
  
  input.addEventListener("input", () => {
    const query = input.value.trim();
    if (query.length < 2) return suggestionsBox.classList.add("hidden");
  
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}`)
      .then((res) => res.json())
      .then((data) => {
        suggestionsBox.innerHTML = "";
        if (!data.results || data.results.length === 0) return suggestionsBox.classList.add("hidden");
  
        data.results.slice(0, 5).forEach((place) => {
          const li = document.createElement("li");
          li.className = "px-4 py-2 hover:bg-blue-100 cursor-pointer";
          li.textContent = `${place.name}, ${place.country}`;
          li.addEventListener("click", () => {
            input.value = place.name;
            suggestionsBox.classList.add("hidden");
          });
          suggestionsBox.appendChild(li);
        });
        suggestionsBox.classList.remove("hidden");
      });
  });
  
  document.getElementById('searchButton').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) return alert("Please enter a city name");
  
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
      .then(res => res.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          const { latitude, longitude, name, country } = data.results[0];
          getWeather(latitude, longitude, name, country);
        } else {
          alert("City not found.");
        }
      });
  });
  
  function getWeather(lat, lon, city, country) {
    const today = new Date();
    const startPast = new Date(today);
    startPast.setDate(today.getDate() - 7);
    const endPast = new Date(today);
    endPast.setDate(today.getDate() - 1);
  
    const startFuture = new Date(today);
    const endFuture = new Date(today);
    endFuture.setDate(today.getDate() + 6);
  
    const pastUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${formatDate(startPast)}&end_date=${formatDate(endPast)}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
  
    const futureUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${formatDate(startFuture)}&end_date=${formatDate(endFuture)}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
  
    Promise.all([
      fetch(pastUrl).then(res => res.json()),
      fetch(futureUrl).then(res => res.json())
    ]).then(([pastData, futureData]) => {
      displayWeather(pastData.daily, "pastWeather");
      displayWeather(futureData.daily, "futureWeather");
    });
  }
  
  function displayWeather(data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
  
    data.time.forEach((date, i) => {
      const max = data.temperature_2m_max[i];
      const min = data.temperature_2m_min[i];
      const icon = getWeatherIcon(data.weathercode[i]);
  
      const card = `
        <div class="bg-white/20 p-4 rounded-lg shadow hover:scale-105 transform transition duration-300">
          <h4 class="text-md font-semibold mb-1">${new Date(date).toDateString()}</h4>
          <div class="text-4xl">${icon}</div>
          <p>Max: ${max}°C</p>
          <p>Min: ${min}°C</p>
        </div>
      `;
      container.innerHTML += card;
    });
  }
  
  function getWeatherIcon(code) {
    const icons = {
      0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
      45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️',
      55: '🌧️', 56: '🌧️', 57: '🌧️', 61: '🌧️',
      63: '🌧️', 65: '🌧️', 66: '❄️', 67: '❄️',
      71: '❄️', 73: '❄️', 75: '❄️', 77: '❄️',
      80: '🌧️', 81: '🌧️', 82: '🌧️', 85: '🌨️',
      86: '🌨️', 95: '⛈️', 96: '⛈️', 99: '⛈️'
    };
    return icons[code] || '❓';
  }
  
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }
  