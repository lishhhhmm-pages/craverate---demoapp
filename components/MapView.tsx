
import React, { useState, useEffect, useRef } from 'react';
import { Navigation, Star, Footprints, ChevronRight, MapPin, SlidersHorizontal, Flame, Coffee, Pizza, Cherry, Search, List, Map as MapIcon, X, Compass } from 'lucide-react';
import { BUSINESSES, MOCK_FEED } from '../mockData';
import { Business, SearchRadius, Review } from '../types';
import L from 'leaflet';
import { TikTokFeedItem } from './TikTokFeedItem';

interface MapViewProps {
  onOpenProfile: (id: string, isBusiness: boolean) => void;
  onSaveClick?: (id: string) => void;
  onCommentsClick?: (id: string) => void;
  onShareClick?: () => void;
  onReadMore?: (item: Review) => void;
  onTagClick?: (tag: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({ 
  onOpenProfile,
  onSaveClick,
  onCommentsClick,
  onShareClick,
  onReadMore,
  onTagClick
}) => {
  const USER_START_LOC: [number, number] = [37.9715, 23.7257];
  
  const [viewMode, setViewMode] = useState<'map' | 'scroll'>('map');
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [focusPoint, setFocusPoint] = useState<[number, number]>(USER_START_LOC);
  const [currentMapCenter, setCurrentMapCenter] = useState<[number, number]>(USER_START_LOC);
  const [customPin, setCustomPin] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState<SearchRadius>(1000);
  const [isRadiusSelectorOpen, setIsRadiusSelectorOpen] = useState(false);
  const [currentFeedIndex, setCurrentFeedIndex] = useState(0);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const focusCircleRef = useRef<L.Circle | null>(null);
  const customPinMarkerRef = useRef<L.Marker | null>(null);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  const filterCategories = [
    { name: 'Trending', icon: Flame },
    { name: 'Greek', icon: Cherry },
    { name: 'Coffee', icon: Coffee },
    { name: 'Street Food', icon: Pizza },
  ];

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

  const nearbyBusinesses = Object.values(BUSINESSES).filter(biz => {
    if (!biz.latLng) return false;
    const dist = calculateDistance(focusPoint, biz.latLng);
    if (dist > radius) return false;
    if (activeFilter && activeFilter !== 'Trending' && !biz.category.toLowerCase().includes(activeFilter.toLowerCase())) return false;
    return true;
  });

  const nearbyBusinessIds = new Set(nearbyBusinesses.map(b => b.id));
  const localizedFeed = MOCK_FEED.filter(item => nearbyBusinessIds.has(item.businessId));

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
    
    nearbyBusinesses.forEach(biz => {
      if (!biz.latLng) return;
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
  }, [focusPoint, radius, activeFilter, selectedBiz, nearbyBusinesses]);

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPos = container.scrollTop;
    const itemHeight = container.clientHeight;
    if (itemHeight > 0) {
      const index = Math.round(scrollPos / itemHeight);
      if (index !== currentFeedIndex) {
        setCurrentFeedIndex(index);
      }
    }
  };

  const isFarFromFocus = calculateDistance(currentMapCenter, focusPoint) > 200;

  return (
    <div className="h-full w-full relative bg-gray-100 overflow-hidden">
      
      {/* MAP LAYER */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${viewMode === 'map' ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}>
          <div ref={mapContainerRef} className="absolute inset-0" />
          
          {/* DISCOVERY CLUSTER - Swapped Rows */}
          <div className="absolute top-[6.5rem] left-0 right-0 px-4 z-[1001] pointer-events-none flex flex-col space-y-3">
              
              {/* ROW 1: INTEGRATED FILTERS STRIP (Now on top) */}
              <div className="pointer-events-auto -mx-4 px-4">
                  <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
                     {filterCategories.map(cat => (
                        <button 
                            key={cat.name} 
                            onClick={() => setActiveFilter(activeFilter === cat.name ? null : cat.name)}
                            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl backdrop-blur-xl border transition-all whitespace-nowrap shadow-lg active:scale-95 ${activeFilter === cat.name ? 'bg-orange-600 border-orange-500 text-white' : 'bg-white/70 border-white/20 text-gray-800 font-bold'}`}
                        >
                            <cat.icon className={`w-3.5 h-3.5 ${activeFilter === cat.name ? 'text-white' : 'text-orange-500'}`} />
                            <span className="text-[10px] uppercase tracking-wider">{cat.name}</span>
                        </button>
                     ))}
                  </div>
              </div>

              {/* ROW 2: PRIMARY CONTROLS ROW (Now below filters) */}
              <div className="flex items-center justify-between pointer-events-auto">
                  
                  {/* Delicate Minimalist Mode Switch */}
                  <div className="flex bg-black/5 backdrop-blur-xl rounded-2xl border border-white/40 p-1 shadow-sm ring-1 ring-black/5">
                      <button 
                        onClick={() => setViewMode('map')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ${viewMode === 'map' ? 'bg-white text-orange-600 shadow-lg shadow-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <MapIcon className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest leading-none">Map</span>
                      </button>
                      <button 
                        onClick={() => setViewMode('scroll')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ${viewMode === 'scroll' ? 'bg-white text-orange-600 shadow-lg shadow-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <List className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest leading-none">Feed</span>
                      </button>
                  </div>

                  {/* Radius Button */}
                  <button 
                    onClick={() => setIsRadiusSelectorOpen(!isRadiusSelectorOpen)} 
                    className={`flex items-center space-x-2 px-4 py-3 rounded-2xl backdrop-blur-xl transition-all duration-300 pointer-events-auto border shadow-xl ${isRadiusSelectorOpen ? 'bg-orange-600 text-white border-orange-500' : 'bg-white/80 text-gray-700 border-white/50'}`}
                  >
                      <Compass className={`w-4 h-4 ${isRadiusSelectorOpen ? 'animate-spin-slow' : ''}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                        {radius < 1000 ? `${radius}m` : `${radius/1000}km`}
                      </span>
                  </button>
              </div>

              {/* SEARCH HERE BUTTON */}
              <div className="flex justify-center pointer-events-none mt-1">
                {isFarFromFocus && (
                    <button 
                      onClick={handleSearchHere} 
                      className="bg-gray-900/90 backdrop-blur-xl text-white px-6 py-2.5 rounded-full shadow-2xl flex items-center space-x-2 animate-fade-in hover:bg-black transition-all active:scale-95 pointer-events-auto border border-white/10"
                    >
                        <Search className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Search This Area</span>
                    </button>
                )}
              </div>
          </div>

          {/* RADIUS SELECTOR */}
          {isRadiusSelectorOpen && (
              <div className="absolute top-[12rem] left-4 right-4 z-[1002] bg-white/95 backdrop-blur-3xl p-5 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-white animate-[scaleIn_0.2s_ease-out] pointer-events-auto">
                  <div className="flex items-center justify-between mb-4 px-1">
                      <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Range</h4>
                      <button onClick={() => setIsRadiusSelectorOpen(false)}><X className="w-4 h-4 text-gray-300" /></button>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5">
                      {[500, 1000, 2000, 5000].map(val => (
                          <button key={val} onClick={() => { setRadius(val as any); setIsRadiusSelectorOpen(false); }} className={`py-3.5 rounded-2xl text-[11px] font-black transition-all ${radius === val ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                              {val < 1000 ? `${val}m` : `${val/1000}km`}
                          </button>
                      ))}
                  </div>
              </div>
          )}

          {/* RECENTER BUTTON */}
          <div className={`absolute right-4 flex flex-col space-y-4 transition-all duration-300 ${selectedBiz ? 'bottom-[13.5rem]' : 'bottom-32'} z-[1001] pointer-events-auto`}>
              <button onClick={handleRecenter} className="w-14 h-14 bg-white/95 backdrop-blur-xl rounded-full shadow-[0_15px_35px_-5px_rgba(0,0,0,0.15)] flex items-center justify-center text-orange-600 border border-white active:scale-90 transition-all hover:shadow-orange-200">
                  <Navigation className={`w-6 h-6 transition-all ${!customPin ? 'fill-current' : 'text-gray-400'}`} />
              </button>
          </div>

          {/* SELECTED INFO CARD */}
          <div className={`absolute bottom-32 left-4 right-4 z-[1001] transition-all duration-500 ${selectedBiz ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95 pointer-events-none'}`}>
              {selectedBiz && (
                  <div onClick={() => onOpenProfile(selectedBiz.id, true)} className="bg-white/95 backdrop-blur-3xl rounded-[2.5rem] p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.2)] border border-white flex gap-4 cursor-pointer active:scale-95 transition-all">
                      <div className="relative">
                          <img src={selectedBiz.coverImageUrl} className="w-20 h-24 rounded-3xl object-cover bg-gray-100 shadow-md" />
                          <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-md rounded-full px-1.5 py-0.5 flex items-center space-x-0.5 border border-black/5">
                              <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                              <span className="text-[9px] font-black">{selectedBiz.rating}</span>
                          </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                          <h3 className="text-lg font-black text-gray-900 leading-tight">{selectedBiz.name}</h3>
                          <p className="text-xs text-gray-400 font-bold mb-3">{selectedBiz.category}</p>
                          <div className="flex items-center space-x-3">
                               <div className="flex items-center text-[9px] font-black text-emerald-700 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl">
                                   <Footprints className="w-3 h-3 mr-1.5" /> {selectedBiz.walkingTime}
                               </div>
                               <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{selectedBiz.distance}</span>
                          </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gray-300 self-center mr-2" />
                  </div>
              )}
          </div>
      </div>

      {/* SCROLL VIEW LAYER */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-500 ${viewMode === 'scroll' ? 'opacity-100 z-[1100]' : 'opacity-0 -z-10'}`}>
          <div className="absolute top-28 left-4 z-[1200] pointer-events-auto">
             <button 
                onClick={() => setViewMode('map')}
                className="flex items-center space-x-2 px-5 py-2.5 bg-white/10 backdrop-blur-2xl rounded-full border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all"
             >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Return to Map</span>
             </button>
          </div>

          <div 
            ref={feedContainerRef} 
            className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar" 
            onScroll={handleScroll}
          >
            {localizedFeed.length > 0 ? (
                localizedFeed.map((item, index) => (
                    <TikTokFeedItem 
                      key={item.id} 
                      item={item} 
                      isActive={viewMode === 'scroll' && index === currentFeedIndex} 
                      onOpenProfile={onOpenProfile}
                      onSaveClick={() => onSaveClick?.(item.id)}
                      onCommentsClick={() => onCommentsClick?.(item.id)}
                      onShareClick={onShareClick}
                      onReadMore={() => onReadMore?.(item)}
                      onTagClick={onTagClick}
                      onInteractionComplete={() => {
                        if (feedContainerRef.current) {
                            const itemHeight = feedContainerRef.current.clientHeight;
                            feedContainerRef.current.scrollTo({
                                top: (currentFeedIndex + 1) * itemHeight,
                                behavior: 'smooth'
                            });
                        }
                      }}
                    />
                ))
            ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-white p-10 text-center space-y-6">
                    <div className="p-10 bg-white/5 rounded-full border border-white/5 backdrop-blur-3xl">
                        <MapPin className="w-12 h-12 opacity-30 text-orange-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black uppercase tracking-[0.2em]">Area is Quiet</h3>
                        <p className="text-sm text-white/40 font-medium">There are no reviews in this radius yet. Try expanding your range!</p>
                    </div>
                    <button 
                        onClick={() => { setRadius(5000); setViewMode('map'); setIsRadiusSelectorOpen(true); }}
                        className="px-10 py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl active:scale-95 transition-all shadow-xl"
                    >
                        Expand Search
                    </button>
                </div>
            )}
          </div>
      </div>

    </div>
  );
};
