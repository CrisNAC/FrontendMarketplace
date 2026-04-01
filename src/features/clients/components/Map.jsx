import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icon issue once for Leaflet default markers.
if (!L.Icon.Default.prototype.__iconPatched) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
  });
  L.Icon.Default.prototype.__iconPatched = true;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").trim();
const DEFAULT_CENTER = [-27.3340, -55.8655];

// Captura clicks para seleccionar un punto en modo selector.
function SinglePointSelector({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}

// Captura clicks para agregar puntos en modo distancia.
function DistanceSelector({ setPoints }) {
  useMapEvents({
    click(e) {
      setPoints(prev => {
        if (prev.length >= 2) return prev; // máximo 2 puntos
        return [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }];
      });
    },
  });

  return null;
}

export default function MapView({
  mode = "distance",
  selectedPoint = null,
  onPointChange,
  heightClass = "h-[400px]",
  initialCenter = DEFAULT_CENTER,
  initialZoom = 13,
  allowFullscreen = true,
  showDistancePanel = true,
}) {
  const isSinglePointMode = mode === "single-point";
  const [singlePoint, setSinglePoint] = useState(selectedPoint);
  const [points, setPoints] = useState([]);
  const [distance, setDistance] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isSinglePointMode) {
      setSinglePoint(selectedPoint ?? null);
    }
  }, [selectedPoint, isSinglePointMode]);

  const currentPoint = useMemo(() => {
    if (!isSinglePointMode) return null;
    return singlePoint ?? null;
  }, [isSinglePointMode, singlePoint]);

  const handleSinglePointSelect = (point) => {
    setSinglePoint(point);
    onPointChange?.(point);
  };

  const calculateDistance = async () => {
    if (isSinglePointMode) return;
    if (points.length < 2) return;
    
    setError(null);

    const coords = points.map(p => [p.lng, p.lat]);

    try {
      const res = await fetch(`${API_BASE_URL}/api/distances`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            points: coords
          })
        }
      );

      if (!res.ok) {
        throw new Error(`Error en la API: ${res.statusText}`);
      }

      const data = await res.json();
      setDistance(data.distance_km);
    } catch (err) {
      console.error("Error calculando distancia:", err);
      setError("No se pudo calcular la distancia. Intente nuevamente");
    }
  };

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-[999]"
          : `relative ${heightClass} w-full rounded-xl overflow-hidden`
      }
    >
      {allowFullscreen && (
        <button
          onClick={() => setFullscreen(!fullscreen)}
          className="absolute top-4 right-4 z-[1000] bg-black text-white px-3 py-1 rounded"
        >
          {fullscreen ? "Salir" : "Pantalla completa"}
        </button>
      )}

      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {isSinglePointMode ? (
          <>
            <SinglePointSelector onSelect={handleSinglePointSelect} />
            {currentPoint && (
              <Marker position={currentPoint}>
                <Popup>
                  Punto seleccionado <br />
                  {currentPoint.lat}, {currentPoint.lng}
                </Popup>
              </Marker>
            )}
          </>
        ) : (
          <>
            <DistanceSelector setPoints={setPoints} />

            {points.map((pos, i) => (
              <Marker
                key={i}
                position={pos}
                eventHandlers={{
                  click: () => {
                    setPoints(prev =>
                      prev.filter((_, index) => index !== i)
                    );
                    setDistance(null);
                  }
                }}
              >
                <Popup>
                  Punto {i + 1} <br />
                  {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)} <br />
                  (Click para eliminar)
                </Popup>
              </Marker>
            ))}
          </>
        )}
      </MapContainer>

      {!isSinglePointMode && showDistancePanel && (
        <div className="absolute top-4 left-4 bg-white p-4 rounded shadow z-[1000]">
          <button
            onClick={calculateDistance}
            disabled={points.length < 2}
            className={`text-white px-3 py-2 rounded w-full ${
              points.length < 2 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
            }`}
          >
            Calcular distancia
          </button>

          <button
            onClick={() => {
              setPoints([]);
              setDistance(null);
              setError(null);
            }}
            className="bg-red-500 text-white px-3 py-2 rounded w-full mt-2"
          >
            Limpiar puntos
          </button>

          {distance !== null && (
            <p className="mt-2">
              Distancia: <strong>{distance} km</strong>
            </p>
          )}

          {error && (
            <p className="mt-2 text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}