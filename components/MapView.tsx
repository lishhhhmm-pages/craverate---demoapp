import React, { useState, useEffect, useRef } from 'react';
import { Navigation, Compass, Search, Star, Clock, Footprints, ChevronRight, MapPin } from 'lucide-react';
import { BUSINESSES } from '../mockData';
import { Business } from '../types';
import L from 'leaflet';

interface MapViewProps {
  onOpenProfile: (id: string, isBusiness: boolean) => void;
}

export const MapView: React.FC<MapViewProps> = ({ onOpenProfile }) => {
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  // Defaulting to Athens center for demo purposes so you see the data. 
  // In a real app, initialize with null and wait for geolocation.
  const [userLocation, setUserLocation] = useState<[number, number]>([37.9715, 23.7257]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const categories = [
    { label: 'Open Now', icon: <Clock className="w-3 h-3" /> },
    { label: 'Top Rated', icon: <Star className="w-3 h-3" /> },
    { label: 'Coffee', icon: <span className="text-xs">☕️</span> },
    { label: 'Restaurants', icon: <span className="text-xs">🍽️</span> },
  ];

  // --- 1. Initialize Map ---
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      center: userLocation,
      zoom: 15,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
    }).addTo(map);

    // Create a LayerGroup for easy marker management (clearing/adding)
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    map.on('click', () => {
      setSelectedBiz(null);
    });

    // Attempt to get real location (Optional: Comment out to keep demo in Athens)
    /*
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        // Don't fly immediately if it's far from mock data, or handle it gracefully
      });
    }
    */

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // --- 2. Update User Location Marker (Blue Dot) ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    // Remove old user marker if exists
    if (userMarkerRef.current) {
        userMarkerRef.current.remove();
    }

    const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative flex items-center justify-center w-6 h-6">
            <div class="absolute w-full h-full bg-blue-500 rounded-full opacity-20 animate-ping"></div>
            <div class="relative w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-md"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    const marker = L.marker(userLocation, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
    userMarkerRef.current = marker;

  }, [userLocation]);


  // --- 3. Filter & Render Business Markers ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    // Clear existing markers
    layer.clearLayers();

    // Filter Logic
    const filteredBusinesses = Object.values(BUSINESSES).filter(biz => {
        if (!activeFilter) return true;
        if (activeFilter === 'Open Now') return biz.isOpen;
        if (activeFilter === 'Top Rated') return (biz.rating || 0) >= 4.5;
        if (activeFilter === 'Coffee') return biz.category.toLowerCase().includes('coffee');
        if (activeFilter === 'Restaurants') {
            const cat = biz.category.toLowerCase();
            return cat.includes('restaurant') || cat.includes('taverna') || cat.includes('food');
        }
        return true;
    });

    // Add Markers
    filteredBusinesses.forEach((biz) => {
       if (!biz.coordinates) return;

       // Mock logic to convert 0-100 coord system to LatLng near Athens center
       const latOffset = (biz.coordinates.y - 50) * -0.0002;
       const lngOffset = (biz.coordinates.x - 50) * 0.0002;
       const position: [number, number] = [37.9715 + latOffset, 23.7257 + lngOffset];

       const isSelected = selectedBiz?.id === biz.id;

       const iconHtml = `
         <div class="relative flex flex-col items-center group transition-all duration-300 ${isSelected ? 'scale-110 z-50' : 'hover:scale-110 z-10'}">
            <!-- Image Bubble -->
            <div class="w-11 h-11 rounded-full border-[3px] shadow-lg overflow-hidden relative z-10 bg-white box-border ${isSelected ? 'border-orange-500' : 'border-white'}">
                <img src="${biz.avatarUrl}" class="w-full h-full object-cover" />
            </div>
            <!-- Rating Badge -->
            <div class="absolute -top-1 -right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white shadow-sm flex items-center ${isSelected ? 'bg-orange-500 text-white' : 'bg-green-600 text-white'}">
                ${biz.rating} ★
            </div>
            <!-- Stick -->
            <div class="w-0.5 h-3 bg-gray-800 -mt-0.5 shadow-sm"></div>
         </div>
       `;

       const icon = L.divIcon({
         className: 'custom-div-icon',
         html: iconHtml,
         iconSize: [40, 60],
         iconAnchor: [20, 60],
       });

       const marker = L.marker(position, { icon });
       
       marker.on('click', (e) => {
         L.DomEvent.stopPropagation(e);
         setSelectedBiz(biz);
         map.flyTo(position, 16, { duration: 0.5 });
       });

       marker.addTo(layer);
    });

  }, [selectedBiz, activeFilter]); // Re-run when selection or filter changes

  // Handle re-center
  const handleRecenter = () => {
      if (mapInstanceRef.current && userLocation) {
          mapInstanceRef.current.flyTo(userLocation, 15, { duration: 0.8 });
      }
  };

  return (
    <div className="h-full w-full relative bg-[#f5f5f5] overflow-hidden">
      
      {/* MAP CONTAINER */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
      
      {/* --- Top Overlays --- */}
      <div className="absolute top-0 left-0 right-0 p-4 space-y-3 z-10 bg-gradient-to-b from-white/95 via-white/80 to-transparent pb-16 pointer-events-none">
        
        {/* Context Header */}
        <div className="flex items-center justify-center space-x-2 text-xs font-bold text-gray-600 mb-1 pointer-events-auto bg-white/80 backdrop-blur-md py-1.5 px-4 rounded-full mx-auto w-fit shadow-sm border border-white/40">
             <MapPin className="w-3 h-3 fill-current text-blue-600" />
             <span>Near Athens, Greece</span>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-3 flex items-center border border-gray-100 backdrop-blur-md pointer-events-auto transition-transform hover:scale-[1.02]">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input 
                type="text" 
                placeholder="Search cravings nearby..." 
                className="flex-1 text-sm bg-transparent outline-none text-gray-800 font-medium placeholder-gray-400"
            />
            <div className="w-px h-6 bg-gray-200 mx-3" />
            <button className="text-orange-600 font-bold text-xs bg-orange-50 px-2 py-1 rounded-md hover:bg-orange-100 transition-colors">FILTER</button>
        </div>

        {/* Filter Chips */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 pointer-events-auto pl-1">
            <button 
                onClick={() => setActiveFilter(null)}
                className={`flex-shrink-0 backdrop-blur-md shadow-sm border px-3.5 py-2 rounded-full flex items-center space-x-1.5 active:scale-95 transition-all
                    ${!activeFilter ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white/95 border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50/30'}`}
            >
                <span className="text-xs font-bold">All</span>
            </button>
            {categories.map((cat, i) => {
                const isActive = activeFilter === cat.label;
                return (
                    <button 
                        key={i} 
                        onClick={() => setActiveFilter(isActive ? null : cat.label)}
                        className={`flex-shrink-0 backdrop-blur-md shadow-sm border px-3.5 py-2 rounded-full flex items-center space-x-1.5 active:scale-95 transition-all
                            ${isActive ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white/95 border-gray-200 hover:border-orange-200 hover:bg-orange-50/30'}`}
                    >
                        <span className={isActive ? 'text-white' : 'text-gray-600'}>{cat.icon}</span>
                        <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>{cat.label}</span>
                    </button>
                );
            })}
        </div>
      </div>

      {/* --- Preview Card (Bottom Sheet) --- */}
      <div 
        className={`absolute bottom-20 left-0 right-0 p-4 z-20 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${selectedBiz ? 'translate-y-0' : 'translate-y-[120%]'}`}
        onClick={(e) => e.stopPropagation()} 
      >
         {selectedBiz && (
             <div 
                className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 border border-white/50 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => onOpenProfile(selectedBiz.id, true)}
             >
                <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-20 h-24 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 shadow-sm relative">
                        <img src={selectedBiz.coverImageUrl} className="w-full h-full object-cover" alt="" />
                         <div className="absolute top-1 left-1 bg-black/60 backdrop-blur text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {selectedBiz.priceLevel}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-black text-gray-900 leading-tight">{selectedBiz.name}</h3>
                            <div className="flex items-center text-xs font-bold text-gray-900 bg-yellow-100 px-1.5 py-0.5 rounded">
                                <Star className="w-3 h-3 text-yellow-600 fill-yellow-600 mr-1" />
                                {selectedBiz.rating}
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-1">{selectedBiz.category}</p>
                        
                        {/* Context Row */}
                        <div className="flex items-center space-x-3 mt-3">
                             <div className="flex items-center text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-lg">
                                 <Footprints className="w-3 h-3 mr-1" />
                                 {selectedBiz.walkingTime} walk
                             </div>
                             <div className="flex items-center text-xs text-gray-400">
                                 <span className="w-1 h-1 rounded-full bg-gray-300 mr-2" />
                                 {selectedBiz.distance} away
                             </div>
                        </div>
                    </div>
                    
                    {/* Arrow */}
                    <div className="flex items-center text-gray-300">
                        <ChevronRight className="w-6 h-6" />
                    </div>
                </div>
             </div>
         )}
      </div>

      {/* --- Map Controls --- */}
      <div className={`absolute right-4 flex flex-col space-y-3 transition-all duration-300 ${selectedBiz ? 'bottom-56' : 'bottom-24'} z-10`}>
         <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 active:scale-95 transition-transform border border-gray-100" onClick={handleRecenter}>
             <Compass className="w-5 h-5" />
         </button>
         <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-600 active:scale-95 transition-transform border border-gray-100">
             <Navigation className="w-5 h-5 fill-blue-600" />
         </button>
      </div>

    </div>
  );
};