import { useState, useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MapPin, Wind, CloudRain, History, AlarmClock, LayoutDashboard, Bell } from "lucide-react";

export default function WeatherDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [weatherData, setWeatherData] = useState([]);
  const [selectedZip, setSelectedZip] = useState("");
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: "AIzaSyBMYMUD0d_gVXSJHbThDnq5nAh9wXP1rB8",
      version: "weekly",
    });

    loader.load().then(() => {
      const mapInstance = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 39.8283, lng: -98.5795 },
        zoom: 5,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#1e1e1e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#1e1e1e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#f9fafb" }] }
        ],
        disableDefaultUI: false,
      });
      setMap(mapInstance);
    });
  }, []);

  const fetchWeather = () => {
    fetch(`https://weather-backend-dusky.vercel.app/api/weather-alerts?zip=${selectedZip}`)
      .then((res) => res.json())
      .then((data) => {
        setWeatherData(data);
        if (map) {
          markers.forEach(marker => marker.setMap(null));
          const newMarkers = data.map((event) => {
            const iconColor = event.severity === "High" ? "red" : event.severity === "Medium" ? "orange" : "yellow";
            const marker = new window.google.maps.Marker({
              position: { lat: event.latitude, lng: event.longitude },
              map,
              title: `${event.zipCode} - ${event.description}`,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: iconColor,
                fillOpacity: 0.8,
                strokeWeight: 0,
              },
            });

            const infoWindow = new window.google.maps.InfoWindow({
              content: `<div><strong>${event.zipCode}</strong><br/>${event.description}<br/>Severity: ${event.severity}</div>`,
            });

            marker.addListener("click", () => {
              infoWindow.open(map, marker);
            });

            return marker;
          });

          setMarkers(newMarkers);

          if (data.length > 0) {
            map.setCenter({ lat: data[0].latitude, lng: data[0].longitude });
            map.setZoom(10);
          }
        }
      });
  };

  return (
    <div className="flex h-screen text-white bg-[#0f172a]">
      <aside className="w-64 bg-[#1e293b] flex flex-col p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-6">StormTrack AI</h1>
        <button onClick={() => setActiveTab("dashboard")} className="flex items-center gap-2 hover:text-blue-400">
          <LayoutDashboard /> Dashboard
        </button>
        <button onClick={() => setActiveTab("recent")} className="flex items-center gap-2 hover:text-blue-400">
          <Bell /> Recent Reports
        </button>
        <button onClick={() => setActiveTab("historical")} className="flex items-center gap-2 hover:text-blue-400">
          <History /> Historical
        </button>
        <button onClick={() => setActiveTab("alerts")} className="flex items-center gap-2 hover:text-blue-400">
          <AlarmClock /> Alerts
        </button>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="p-4 bg-[#1e293b] flex justify-between items-center">
          <input
            className="p-2 bg-[#334155] rounded text-white w-1/2"
            placeholder="Search by ZIP or City..."
            value={selectedZip}
            onChange={(e) => setSelectedZip(e.target.value)}
          />
          <button onClick={fetchWeather} className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
            Search
          </button>
        </div>

        <div id="map" className="flex-1" style={{ height: "60vh" }}></div>

        <div className="p-4 overflow-y-auto h-[40vh] bg-[#1e293b]">
          {activeTab === "dashboard" && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Storm Reports</h2>
              {weatherData.map((event, index) => (
                <div key={index} className="p-4 mb-3 bg-[#334155] rounded shadow-md">
                  <div className="flex items-center gap-2 text-lg">
                    <MapPin className="text-blue-400" /> <strong>{event.zipCode}</strong>
                  </div>
                  <div className="mt-1">Severity: <span className="text-yellow-300">{event.severity}</span></div>
                  <div className="flex items-center gap-2 mt-1">
                    {event.type === "Wind" ? <Wind /> : <CloudRain />} {event.description}
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === "recent" && <p className="text-sm text-gray-300">Recent storm reports will show here...</p>}
          {activeTab === "historical" && <p className="text-sm text-gray-300">Search past reports by date range here...</p>}
          {activeTab === "alerts" && <p className="text-sm text-gray-300">Manage SMS/email alerts for specific ZIPs.</p>}
        </div>
      </main>
    </div>
  );
}
