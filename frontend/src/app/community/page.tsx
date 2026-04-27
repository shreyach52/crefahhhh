'use client';

import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { MapPin } from 'lucide-react';

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json";

const markers = [
  { name: "Mumbai", coordinates: [72.8777, 19.0760], rejection_delta: 12, pop: "Gig workers see 12% higher rejections." },
  { name: "Delhi", coordinates: [77.2090, 28.6139], rejection_delta: 8, pop: "Freelancers face 8% higher rejections." },
  { name: "Bangalore", coordinates: [77.5946, 12.9716], rejection_delta: 15, pop: "Tech contractors report 15% bias." },
  { name: "Hyderabad", coordinates: [78.4867, 17.3850], rejection_delta: 5, pop: "5% bias against non-salaried." },
  { name: "Chennai", coordinates: [80.2707, 13.0827], rejection_delta: 9, pop: "9% increase in rejection for MSMEs." },
  { name: "Kolkata", coordinates: [88.3639, 22.5726], rejection_delta: 14, pop: "14% bias in microfinance approvals." },
  { name: "Pune", coordinates: [73.8567, 18.5204], rejection_delta: 7, pop: "7% higher rejection for education loans." },
  { name: "Ahmedabad", coordinates: [72.5714, 23.0225], rejection_delta: 10, pop: "10% bias for self-employed." }
];

export default function CommunityPage() {
  const [selectedCity, setSelectedCity] = useState<any>(null);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Community Bias Map</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Explore reported bias across India. Larger pulses indicate a higher rejection rate delta for non-traditional employment compared to salaried peers.
          </p>
        </div>

        <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-4 h-[600px] overflow-hidden flex shadow-2xl">
          
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 1000, center: [82, 22] }}
            className="w-full h-full"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth={1}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#334155', outline: 'none' },
                      pressed: { outline: 'none' }
                    }}
                  />
                ))
              }
            </Geographies>

            {markers.map((marker) => (
              <Marker key={marker.name} coordinates={marker.coordinates as [number, number]}>
                <g 
                  onClick={() => setSelectedCity(marker)}
                  className="cursor-pointer group"
                >
                  <circle
                    r={marker.rejection_delta}
                    fill="rgba(20, 184, 166, 0.3)"
                    className="animate-ping"
                  />
                  <circle
                    r={marker.rejection_delta / 2}
                    fill="#14b8a6"
                    stroke="#fff"
                    strokeWidth={1}
                  />
                </g>
              </Marker>
            ))}
          </ComposableMap>

          {/* Popup Info Panel */}
          {selectedCity && (
            <div className="absolute top-8 right-8 bg-slate-900 border border-teal-500/50 p-6 rounded-xl shadow-[0_0_30px_rgba(20,184,166,0.2)] max-w-xs animate-in fade-in slide-in-from-right-4">
              <button 
                onClick={() => setSelectedCity(null)}
                className="absolute top-3 right-3 text-slate-500 hover:text-white"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-500" />
                {selectedCity.name}
              </h3>
              <div className="text-3xl font-black text-rose-400 mb-2">
                +{selectedCity.rejection_delta}%
              </div>
              <p className="text-sm text-slate-300">
                {selectedCity.pop}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
