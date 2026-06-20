import { useEffect, useRef, useState } from "react";

const stops = [
  { name: "Chamonix",               lat: 45.9237, lon: 6.8694, country: "FR", overnight: true },
  { name: "Les Houches",            lat: 45.8903, lon: 6.7981, country: "FR", waypoint: true },
  { name: "Bellevue",               lat: 45.8797, lon: 6.7714, country: "FR", waypoint: true },
  { name: "Col du Tricot",          lat: 45.8506, lon: 6.7539, country: "FR", waypoint: true },
  { name: "Refuge de Miage",       lat: 45.8391, lon: 6.7600, country: "FR", overnight: true },
  { name: "Les Contamines",         lat: 45.8214, lon: 6.7278, country: "FR", waypoint: true },
  { name: "Notre Dame de la Gorge", lat: 45.7961, lon: 6.7114, country: "FR", waypoint: true },
  { name: "Refuge de la Balme",    lat: 45.7573, lon: 6.7110, country: "FR", overnight: true },
  { name: "Croix de Bonhomme",      lat: 45.7214, lon: 6.7397, country: "FR", waypoint: true },
  { name: "Col des Fours",          lat: 45.7147, lon: 6.7503, country: "FR", waypoint: true },
  { name: "Tête des Nord Fours",    lat: 45.7111, lon: 6.7556, country: "FR", waypoint: true },
  { name: "Ville des Glaciers",     lat: 45.7206, lon: 6.7819, country: "FR", waypoint: true },
  { name: "Refuge des Mottets",     lat: 45.7370, lon: 6.7792, country: "FR", overnight: true },
  { name: "Col de la Seigne",       lat: 45.7167, lon: 6.8489, country: "IT", waypoint: true },
  { name: "Courmayeur",             lat: 45.7908, lon: 6.9709, country: "IT", overnight: true, nights: 2 },
  { name: "Italian Val Ferret",     lat: 45.8203, lon: 7.0328, country: "IT", waypoint: true },
  { name: "Col Grand Ferret",       lat: 45.8983, lon: 7.0683, country: "CH", waypoint: true },
  { name: "Ferret, Switzerland",    lat: 45.9500, lon: 7.1333, country: "CH", overnight: true },
  { name: "La Fouly",               lat: 45.9272, lon: 7.1006, country: "CH", waypoint: true },
  { name: "Champex-Lac",            lat: 46.0297, lon: 7.1173, country: "CH", overnight: true, nights: 2 },
  { name: "Fenêtre d'Arpette",      lat: 45.9989, lon: 7.0681, country: "CH", waypoint: true },
  { name: "Bovine",                 lat: 46.0611, lon: 7.0508, country: "CH", waypoint: true },
  { name: "Trient",                 lat: 46.0556, lon: 6.9960, country: "CH", overnight: true },
  { name: "Col de Balme",           lat: 46.0194, lon: 6.9286, country: "FR", waypoint: true },
  { name: "Col des Posettes",       lat: 45.9986, lon: 6.9278, country: "FR", waypoint: true },
  { name: "Montroc",                lat: 45.9814, lon: 6.9175, country: "FR", waypoint: true },
  { name: "Chamonix (return)",      lat: 45.9237, lon: 6.8694, country: "FR", overnight: true, isReturn: true },
];

const countryColor = { FR: "#4A90D9", IT: "#E05C3A", CH: "#E8B030" };

let nightCount = 0;
const stopsWithNights = stops.map(s => {
  if (s.overnight) {
    const n = s.nights || 1;
    const label = Array.from({ length: n }, (_, i) => nightCount + 1 + i).join(",");
    nightCount += n;
    return { ...s, nightLabel: label };
  }
  return { ...s, nightLabel: null };
});

const SHOW_IN_LIST = new Set(["Les Houches", "Col Grand Ferret"]);
const listStops = stopsWithNights.filter(s => s.overnight || SHOW_IN_LIST.has(s.name));

export default function TMBMap() {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsWide(mq.matches);
    const handler = e => setIsWide(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (instanceRef.current) return;

    const linkEl = document.createElement("link");
    linkEl.rel = "stylesheet";
    linkEl.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(linkEl);

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => {
      const L = window.L;
      const map = L.map(mapRef.current, { center: [45.875, 6.94], zoom: 11, zoomControl: true });
      instanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const mainRoute = stopsWithNights.filter(s => s.name !== "Fenêtre d'Arpette");
      const latlngs = mainRoute.map(s => [s.lat, s.lon]);
      L.polyline(latlngs, { color: "white", weight: 7, opacity: 0.2 }).addTo(map);
      L.polyline(latlngs, { color: "#FF4500", weight: 3.5, opacity: 0.95 }).addTo(map);

      L.polyline([[46.0297, 7.1173], [45.9989, 7.0681], [46.0297, 7.1173]], {
        color: "#FF4500", weight: 2, opacity: 0.5, dashArray: "5,5"
      }).addTo(map);

      // Waypoint dots
      stopsWithNights.forEach(stop => {
        if (!stop.waypoint) return;
        const svg = `<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
          <circle cx="7" cy="7" r="5" fill="#888" stroke="white" stroke-width="1.5"/>
        </svg>`;
        L.marker([stop.lat, stop.lon], {
          icon: L.divIcon({ html: svg, className: "", iconSize: [14,14], iconAnchor: [7,7] })
        }).addTo(map).bindPopup(`<b>${stop.name}</b>`);
      });

      // Overnight markers merged by coords
      const merged = {};
      stopsWithNights.forEach(stop => {
        if (stop.waypoint) return;
        const key = `${stop.lat},${stop.lon}`;
        if (!merged[key]) merged[key] = { ...stop, nightLabels: [stop.nightLabel] };
        else merged[key].nightLabels.push(stop.nightLabel);
      });

      Object.values(merged).forEach(stop => {
        const color = countryColor[stop.country] || "#888";
        const label = stop.nightLabels.filter(Boolean).join(",");
        const wide = label.length > 3;
        const w = wide ? 36 : 26, h = 26, rx = w / 2;

        const svg = stop.isReturn
          ? `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
               <circle cx="${rx}" cy="13" r="10" fill="none" stroke="${color}" stroke-width="2.5"/>
               <circle cx="${rx}" cy="13" r="4" fill="${color}"/>
             </svg>`
          : `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
               <rect x="1" y="1" width="${w-2}" height="${h-2}" rx="${(h-2)/2}" fill="${color}" stroke="white" stroke-width="2"/>
               <text x="${rx}" y="17" text-anchor="middle" font-size="${wide ? 8 : 10}" font-weight="bold" fill="white" font-family="sans-serif">${label}</text>
             </svg>`;

        L.marker([stop.lat, stop.lon], {
          icon: L.divIcon({ html: svg, className: "", iconSize: [w,h], iconAnchor: [rx, h/2] })
        }).addTo(map).bindPopup(`<b>${stop.name}</b><br>Night(s) ${label}`);
      });
    };
    document.head.appendChild(script);
  }, []);

  // Invalidate map size when layout shifts between mobile/desktop
  useEffect(() => {
    if (instanceRef.current) {
      setTimeout(() => instanceRef.current.invalidateSize(), 50);
    }
  }, [isWide]);

  const listItems = listStops.map((stop, i) => {
    const color = countryColor[stop.country];
    if (stop.waypoint) return { key: i, color: "#888", badge: null, name: stop.name, isReturn: false, isWaypoint: true };
    return { key: i, color, badge: stop.nightLabel, name: stop.name, isReturn: stop.isReturn, isWaypoint: false };
  });

  const renderItem = (item) => (
    <div key={item.key} style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
      {item.isReturn ? (
        <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, border: `2px solid ${item.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.color }} />
        </div>
      ) : item.isWaypoint ? (
        <div style={{ width: 16, height: 16, borderRadius: "50%", flexShrink: 0, background: "#333", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#888" }} />
        </div>
      ) : (
        <div style={{ height: 16, minWidth: 16, padding: "0 4px", borderRadius: "8px", flexShrink: 0, background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>
          {item.badge}
        </div>
      )}
      <span style={{ fontSize: isWide ? "12px" : "10px", color: item.isWaypoint ? "#666" : "#ddd", whiteSpace: "nowrap" }}>
        {item.name}
      </span>
    </div>
  );

  const legend = (
    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <h2 style={{ margin: "0 0 2px 0", fontSize: isWide ? "16px" : "13px", fontWeight: "bold", color: "white", whiteSpace: "nowrap" }}>
        Tour du Mont Blanc
      </h2>
      <p style={{ color: "#777", margin: "0 0 10px 0", fontSize: isWide ? "11px" : "9px", whiteSpace: "nowrap" }}>
        FieldHouse Adventures · 12 days
      </p>

      {/* Stop list — 3 cols on mobile, 1 col on desktop sidebar */}
      {isWide ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {listItems.map(renderItem)}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 8px", marginBottom: "8px" }}>
          {[listItems.slice(0,4), listItems.slice(4,8), listItems.slice(8)].map((col, i) => (
            <div key={i}>{col.map(renderItem)}</div>
          ))}
        </div>
      )}

      {/* Country key */}
      <div style={{ display: "flex", flexDirection: isWide ? "column" : "row", gap: isWide ? "5px" : "10px", flexWrap: "wrap", marginTop: isWide ? "16px" : "6px" }}>
        {[["FR","France"],["IT","Italy"],["CH","Switzerland"]].map(([code, name]) => (
          <div key={code} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: countryColor[code] }} />
            <span style={{ fontSize: "9px", color: "#666" }}>{name}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: 14, height: 2, background: "#FF4500", borderRadius: 1 }} />
          <span style={{ fontSize: "9px", color: "#666" }}>Route</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#555" }} />
          <span style={{ fontSize: "9px", color: "#666" }}>Waypoint</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "sans-serif", background: "#1a1a2e", height: "100dvh", padding: "12px", boxSizing: "border-box", color: "white", display: "flex", flexDirection: isWide ? "row" : "column", gap: "12px" }}>
      {isWide ? (
        // Desktop/tablet: sidebar left, map fills remaining space
        <>
          <div style={{ width: "200px", flexShrink: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
            {legend}
          </div>
          <div ref={mapRef} style={{ flex: 1, borderRadius: "8px", overflow: "hidden" }} />
        </>
      ) : (
        // Mobile: legend on top, map fills remaining space
        <>
          {legend}
          <div ref={mapRef} style={{ flex: 1, minHeight: "300px", borderRadius: "8px", overflow: "hidden" }} />
        </>
      )}
    </div>
  );
}
