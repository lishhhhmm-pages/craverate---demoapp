import React, { useState, useEffect, useRef } from 'react';
import { Navigation, Star, Footprints, ChevronRight, MapPin, SlidersHorizontal, Flame, Coffee, Pizza, Cherry, Search } from 'lucide-react';
import { BUSINESSES } from '../mockData';
import { Business, SearchRadius } from '../types';
import L from 'leaflet';

interface MapViewProps {
  onOpenProfile: (id: string, isBusiness: boolean) => void;
}

export const MapView: React.FC<MapViewProps> = ({ onOpenProfile }) => {
  const USER_START_LOC: [number, number] = [37.9715, 23.7257];
  
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [focusPoint, setFocusPoint] = useState<[number, number]>(USER_START_LOC);
  const [currentMapCenter, setCurrentMapCenter] = useState<[number, number]>(USER_START_LOC);
  const [customPin, setCustomPin] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState<SearchRadius>(1000);
  const [isRadiusSelectorOpen, setIsRadiusSelectorOpen] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const focusCircleRef = useRef<L.Circle | null>(null);
  const customPinMarkerRef = useRef<L.Marker | null>(null);

  const filterCategories = [
    { name: 'Trending', icon: Flame },
    { name: 'Greek', icon: Cherry },
    { name: 'Coffee', icon: Coffee },
    { name: 'Street Food', icon: Pizza },
  ];

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false, center: USER_START_LOC, zoom: 15 });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);
    
    const userIcon = L.divIcon({
      className: 'user-icon',
      html: `<div class="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    L.marker(USER_START_LOC, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setCustomPin([lat, lng]);
      setFocusPoint([lat, lng]);
      setSelectedBiz(null);
    });

    // Track the map center, but don't automatically update focusPoint (the search area)
    map.on('move', () => {
      const center = map.getCenter();
      setCurrentMapCenter([center.lat, center.lng]);
    });

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (focusCircleRef.current) focusCircleRef.current.remove();
    // Anchor circle to focusPoint (blue dot or custom pin), NOT map center
    focusCircleRef.current = L.circle(focusPoint, { 
        radius: radius, 
        color: '#f97316', 
        fillColor: '#f97316', 
        fillOpacity: 0.1, 
        weight: 2, 
        dashArray: '5, 10' 
    }).addTo(map);

    if (customPinMarkerRef.current) customPinMarkerRef.current.remove();
    if (customPin) {
      const pinIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="flex flex-col items-center animate-bounce-short">
                 <div class="bg-orange-600 p-2 rounded-full border-2 border-white shadow-xl">
                    <MapPin className="w-5 h-5 text-white fill-white" />
                 </div>
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      customPinMarkerRef.current = L.marker(customPin, { icon: pinIcon, zIndexOffset: 2000 }).addTo(map);
    }
  }, [focusPoint, radius, customPin]);

  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    Object.values(BUSINESSES).forEach(biz => {
      if (!biz.latLng) return;
      const dist = calculateDistance(focusPoint, biz.latLng);
      if (dist > radius) return;
      if (activeFilter && activeFilter !== 'Trending' && !biz.category.toLowerCase().includes(activeFilter.toLowerCase())) return;

      const isSelected = selectedBiz?.id === biz.id;
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="relative flex flex-col items-center transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
                 <div class="w-11 h-11 rounded-full border-2 ${isSelected ? 'border-orange-500' : 'border-white'} shadow-xl overflow-hidden bg-white">
                    <img src="${biz.avatarUrl}" class="w-full h-full object-cover" />
                 </div>
               </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });
      const marker = L.marker(biz.latLng, { icon });
      marker.on('click', (e) => { L.DomEvent.stopPropagation(e); setSelectedBiz(biz); });
      marker.addTo(layer);
    });
  }, [focusPoint, radius, activeFilter, selectedBiz]);

  const calculateDistance = (p1: [number, number], p2: [number, number]) => {
    const R = 6371e3;
    const φ1 = p1[0] * Math.PI/180;
    const φ2 = p2[0] * Math.PI/180;
    const Δφ = (p2[0]-p1[0]) * Math.PI/180;
    const Δλ = (p2[1]-p1[1]) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleRecenter = () => {
    setCustomPin(null);
    setFocusPoint(USER_START_LOC);
    setSelectedBiz(null);
    mapInstanceRef.current?.flyTo(USER_START_LOC, 15, { duration: 1 });
  };

  const handleSearchHere = () => {
    const center = mapInstanceRef.current?.getCenter();
    if (center) {
        setFocusPoint([center.lat, center.lng]);
        setCustomPin([center.lat, center.lng]);
    }
  };

  // Show "Search this area" if we've panned far from the current focus point
  const isFarFromFocus = calculateDistance(currentMapCenter, focusPoint) > 200;

  return (
    <div className="h-full w-full relative bg-gray-50 overflow-hidden">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
      
      {/* MAP CONTROLS & FILTERS */}
      <div className="absolute top-24 left-0 right-0 p-4 z-10 space-y-3 pointer-events-none">
          <div className="flex space-x-2 overflow-x-auto no-scrollbar pointer-events-auto pb-1">
             {filterCategories.map(cat => (
                <button 
                    key={cat.name} 
                    onClick={() => setActiveFilter(activeFilter === cat.name ? null : cat.name)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl backdrop-blur-xl border transition-all whitespace-nowrap shadow-lg active:scale-95 ${activeFilter === cat.name ? 'bg-orange-600 border-orange-500 text-white' : 'bg-white/90 border-white/50 text-gray-700'}`}
                >
                    <cat.icon className="w-4 h-4" />
                    <span className="text-xs font-bold">{cat.name}</span>
                </button>
             ))}
          </div>

          <div className="flex justify-between items-start pointer-events-none">
              <div className="pointer-events-auto">
                {isFarFromFocus && (
                    <button 
                      onClick={handleSearchHere} 
                      className="bg-white/95 backdrop-blur-xl text-gray-900 border border-white/50 px-5 py-3 rounded-full shadow-2xl flex items-center space-x-2 animate-fade-in hover:bg-white transition-all active:scale-95"
                    >
                        <Search className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-black uppercase tracking-widest">Search here</span>
                    </button>
                )}
              </div>
              <button 
                onClick={() => setIsRadiusSelectorOpen(!isRadiusSelectorOpen)} 
                className={`p-3.5 rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl border border-white/80 transition-all duration-300 pointer-events-auto ${isRadiusSelectorOpen ? 'bg-orange-600 text-white border-orange-500' : 'text-orange-600'}`}
              >
                  <SlidersHorizontal className="w-5 h-5" />
              </button>
          </div>
      </div>

      {isRadiusSelectorOpen && (
          <div className="absolute top-48 left-4 right-4 z-20 bg-white/95 backdrop-blur-2xl p-5 rounded-[2rem] shadow-2xl border border-white/80 animate-[slideDown_0.2s_ease-out] pointer-events-auto">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Discovery Range</h4>
              <div className="grid grid-cols-4 gap-2">
                  {[500, 1000, 2000, 5000].map(val => (
                      <button key={val} onClick={() => { setRadius(val as any); setIsRadiusSelectorOpen(false); }} className={`py-3 rounded-2xl text-[11px] font-black transition-all ${radius === val ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {val < 1000 ? `${val}m` : `${val/1000}km`}
                      </button>
                  ))}
              </div>
          </div>
      )}

      {/* SELECTED BUSINESS OVERLAY - SMALL INFO CARD */}
      <div className={`absolute bottom-32 left-4 right-4 z-20 transition-all duration-500 ${selectedBiz ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95 pointer-events-none'}`}>
          {selectedBiz && (
              <div onClick={() => onOpenProfile(selectedBiz.id, true)} className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-4 shadow-2xl border border-white/80 flex gap-4 cursor-pointer active:scale-95 transition-all">
                  <img src={selectedBiz.coverImageUrl} className="w-20 h-24 rounded-3xl object-cover bg-gray-100 shadow-md" />
                  <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-lg font-black text-gray-900 leading-tight">{selectedBiz.name}</h3>
                      <p className="text-xs text-gray-500 font-bold mb-3">{selectedBiz.category}</p>
                      <div className="flex items-center space-x-3">
                           <div className="flex items-center text-[9px] font-black text-green-700 bg-green-500/10 px-2.5 py-1.5 rounded-xl">
                               <Footprints className="w-3 h-3 mr-1.5" /> {selectedBiz.walkingTime}
                           </div>
                           <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{selectedBiz.distance} away</span>
                      </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-300 self-center mr-2" />
              </div>
          )}
      </div>

      <div className={`absolute right-4 flex flex-col space-y-4 transition-all duration-300 ${selectedBiz ? 'bottom-[13rem]' : 'bottom-32'} z-10 pointer-events-auto`}>
          <button onClick={handleRecenter} className="w-14 h-14 bg-white/95 backdrop-blur-xl rounded-full shadow-2xl flex items-center justify-center text-orange-600 border border-white/80 active:scale-90 transition-transform">
              <Navigation className={`w-6 h-6 transition-all ${!customPin ? 'fill-current' : 'text-gray-400'}`} />
          </button>
      </div>
    </div>
  );
};