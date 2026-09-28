// src/pages/Map/FullScreenMap.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { getAllIssues, getOfficers } from "../../services/api";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  LayersControl,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Dummy data generator for Coimbatore, Kuniyamuthur area
const generateDummyIssues = (count = 30) => {
  // Coordinates for Kuniyamuthur and surrounding areas in Coimbatore
  const kuniyamuthurCenter = [11.0046, 76.9616];
  const locations = [
    // Kuniyamuthur and immediate surroundings
    { lat: 11.0046, lng: 76.9616, area: "Kuniyamuthur Central" },
    { lat: 11.0082, lng: 76.9587, area: "Kuniyamuthur East" },
    { lat: 11.0013, lng: 76.9648, area: "Kuniyamuthur West" },
    { lat: 11.0124, lng: 76.9552, area: "Kuniyamuthur North" },
    { lat: 10.9968, lng: 76.9683, area: "Kuniyamuthur South" },
    
    // Nearby areas
    { lat: 11.0189, lng: 76.9491, area: "Ganapathy" },
    { lat: 10.9876, lng: 76.9745, area: "Peelamedu" },
    { lat: 11.0245, lng: 76.9423, area: "Sitra" },
    { lat: 10.9923, lng: 76.9521, area: "Ramanathapuram" },
    { lat: 11.0302, lng: 76.9354, area: "Kovaipudur" },
    { lat: 10.9789, lng: 76.9823, area: "Singanallur" },
    { lat: 11.0156, lng: 76.9287, area: "Thudiyalur" }
  ];

  const categories = [
    'Roads', 'Sanitation', 'Streetlight', 'Water Leakage', 'Parks', 'Drainage',
    'Garbage', 'Public Toilets', 'Footpaths', 'Traffic Signals'
  ];
  
  const statuses = ['submitted', 'verified', 'acknowledged', 'in_progress', 'resolved', 'closed'];
  const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7', 'Ward 8'];
  
  const issues = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const locationIndex = Math.floor(Math.random() * locations.length);
    const location = locations[locationIndex];
    
    // Add some random variation to coordinates
    const lat = location.lat + (Math.random() * 0.01 - 0.005);
    const lng = location.lng + (Math.random() * 0.01 - 0.005);
    
    const randomDaysAgo = Math.floor(Math.random() * 30);
    const createdDate = new Date(now);
    createdDate.setDate(createdDate.getDate() - randomDaysAgo);
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const priority = Math.floor(Math.random() * 4) + 1; // 1-4
    
    // Calculate resolved date if status is resolved/closed
    let resolvedDate = null;
    if (status === 'resolved' || status === 'closed') {
      const resolutionDays = Math.floor(Math.random() * 14) + 1;
      resolvedDate = new Date(createdDate);
      resolvedDate.setDate(resolvedDate.getDate() + resolutionDays);
    }
    
    // Calculate SLA due date (1-7 days from creation)
    const slaDays = Math.floor(Math.random() * 7) + 1;
    const slaDueDate = new Date(createdDate);
    slaDueDate.setDate(slaDueDate.getDate() + slaDays);
    
    // Generate realistic titles based on category and location
    const title = generateIssueTitle(category, location.area);
    
    // Generate realistic descriptions
    const description = generateIssueDescription(category, location.area);
    
    issues.push({
      _id: `dummy-${i}`,
      title,
      description,
      category,
      status,
      priority,
      wardId: wards[Math.floor(Math.random() * wards.length)],
      location: {
        type: "Point",
        coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
      },
      createdAt: createdDate.toISOString(),
      updatedAt: new Date(createdDate.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedAt: resolvedDate ? resolvedDate.toISOString() : null,
      slaDueDate: slaDueDate.toISOString(),
      isDummy: true // Flag to identify dummy data
    });
  }
  
  return issues;
};

// Generate realistic issue titles
const generateIssueTitle = (category, area) => {
  const titles = {
    'Roads': [
      `Potholes on ${area} Main Road`,
      `Road damage near ${area} junction`,
      `Cracked pavement in ${area}`,
      `Uneven road surface in ${area}`,
      `Road repair needed in ${area}`
    ],
    'Sanitation': [
      `Garbage accumulation in ${area}`,
      `Sanitation issue in ${area} public area`,
      `Waste management problem in ${area}`,
      `Cleaning required in ${area} streets`
    ],
    'Streetlight': [
      `Streetlight not working in ${area}`,
      `Faulty streetlight pole in ${area}`,
      `Dark spot in ${area} due to broken light`,
      `New streetlight needed in ${area}`
    ],
    'Water Leakage': [
      `Water leakage in ${area} street`,
      `Pipe burst in ${area} area`,
      `Water wastage in ${area}`,
      `Underground water leakage in ${area}`
    ],
    'Parks': [
      `Maintenance needed in ${area} park`,
      `Broken benches in ${area} playground`,
      `Garden maintenance in ${area}`,
      `Park cleaning required in ${area}`
    ],
    'Drainage': [
      `Blocked drainage in ${area}`,
      `Drainage overflow in ${area} street`,
      `Clogged stormwater drain in ${area}`,
      `Drainage repair needed in ${area}`
    ],
    'Garbage': [
      `Garbage bin overflow in ${area}`,
      `Waste collection issue in ${area}`,
      `Stray animal problem with garbage in ${area}`,
      `Garbage disposal problem in ${area}`
    ],
    'Public Toilets': [
      `Public toilet maintenance in ${area}`,
      `Cleanliness issue in ${area} public toilet`,
      `Non-functional toilet in ${area}`,
      `New public toilet needed in ${area}`
    ],
    'Footpaths': [
      `Damaged footpath in ${area}`,
      `Uneven walking path in ${area}`,
      `Footpath obstruction in ${area}`,
      `Pedestrian safety issue in ${area}`
    ],
    'Traffic Signals': [
      `Faulty traffic signal in ${area}`,
      `Timing adjustment needed for ${area} signal`,
      `Non-working traffic light in ${area}`,
      `New traffic signal required in ${area}`
    ]
  };
  
  const categoryTitles = titles[category] || [`${category} issue in ${area}`];
  return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
};

// Generate realistic issue descriptions
const generateIssueDescription = (category, area) => {
  const descriptions = {
    'Roads': `This road issue in ${area} requires immediate attention as it poses safety risks to vehicles and pedestrians. The problem has been persisting for several days and needs urgent repair work.`,
    'Sanitation': `Sanitation problem in ${area} is causing inconvenience to residents and affecting public health. The area needs proper cleaning and waste management solutions.`,
    'Streetlight': `The streetlight issue in ${area} has created a dark spot that compromises safety during night hours. This needs to be fixed to ensure public safety.`,
    'Water Leakage': `Water leakage in ${area} is causing wastage of precious water resources and creating slippery conditions on the road. Immediate repair is necessary.`,
    'Parks': `The park in ${area} requires maintenance to ensure it remains a pleasant space for families and children. Current condition is affecting public enjoyment.`,
    'Drainage': `Drainage blockage in ${area} is causing water stagnation and potential health hazards. This needs to be cleared to prevent mosquito breeding and flooding.`,
    'Garbage': `Garbage management issue in ${area} is creating unhygienic conditions and attracting stray animals. Proper waste disposal system needs to be implemented.`,
    'Public Toilets': `The public toilet facility in ${area} is in poor condition and requires maintenance to ensure basic sanitation standards for the community.`,
    'Footpaths': `The footpath condition in ${area} is making it difficult for pedestrians, especially elderly and disabled persons. Repair work is urgently needed.`,
    'Traffic Signals': `The traffic signal issue in ${area} is causing traffic congestion and potential safety hazards. Timely repair is essential for smooth traffic flow.`
  };
  
  return descriptions[category] || `${category} related issue reported in ${area} area that requires attention from the municipal authorities.`;
};

const generateDummyOfficers = () => {
  const officers = [
    {
      _id: 'officer-1',
      fullName: 'Rajesh Kumar',
      email: 'rajesh.kumar@coimbatorecorp.gov.in',
      designation: 'Sanitation Officer',
      ward: 'Ward 3',
      isActive: true
    },
    {
      _id: 'officer-2',
      fullName: 'Priya Lakshmi',
      email: 'priya.lakshmi@coimbatorecorp.gov.in',
      designation: 'Road Inspector',
      ward: 'Ward 5',
      isActive: true
    },
    {
      _id: 'officer-3',
      fullName: 'Mohan Singh',
      email: 'mohan.singh@coimbatorecorp.gov.in',
      designation: 'Public Works Manager',
      ward: 'Ward 2',
      isActive: true
    },
    {
      _id: 'officer-4',
      fullName: 'Anitha Ravi',
      email: 'anitha.ravi@coimbatorecorp.gov.in',
      designation: 'City Planner',
      ward: 'Ward 7',
      isActive: true
    },
    {
      _id: 'officer-5',
      fullName: 'Karthik Subramanian',
      email: 'karthik.subramanian@coimbatorecorp.gov.in',
      designation: 'Traffic Engineer',
      ward: 'Ward 4',
      isActive: true
    }
  ];
  
  return officers;
};

// Custom hook for current location
function LocationMarker({ setUserLocation }) {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      setUserLocation(e.latlng);
      map.flyTo(e.latlng, 14); // Zoom to current location
    });
  }, [map, setUserLocation]);

  return position === null ? null : (
    <Marker
      position={position}
      icon={L.divIcon({
        className: "current-location-marker",
        html: `<div style="
        background-color: #2563EB;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.5);
      "></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      })}
    >
      <Popup>Your current location</Popup>
    </Marker>
  );
}

// Heatmap layer component
function HeatmapLayer({ issues, intensityBasedOn }) {
  const map = useMap();

  useEffect(() => {
    if (!window.L || !window.L.heatLayer) return;

    // Clear existing heatmap
    map.eachLayer((layer) => {
      if (layer instanceof window.L.HeatLayer) {
        map.removeLayer(layer);
      }
    });

    // Create heatmap data based on intensity setting
    const heatmapData = issues.map((issue) => {
      const lat = issue.location.coordinates[1];
      const lng = issue.location.coordinates[0];

      let intensity = 1;
      if (intensityBasedOn === "priority") {
        // Higher priority = more intensity (1-5 scale inverted)
        intensity = 6 - Math.min(Math.max(issue.priority, 1), 5);
      } else if (intensityBasedOn === "cases") {
        // All cases have same intensity for density visualization
        intensity = 1;
      }

      return [lat, lng, intensity];
    });

    if (heatmapData.length > 0) {
      window.L.heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.2: "blue",
          0.4: "cyan",
          0.6: "lime",
          0.8: "yellow",
          1.0: "red",
        },
      }).addTo(map);
    }
  }, [issues, intensityBasedOn, map]);

  return null;
}

// Custom icons for different issue statuses
const createCustomIcon = (status, priority) => {
  const statusColors = {
    submitted: "#9CA3AF", // gray
    verified: "#3B82F6", // blue
    rejected: "#EF4444", // red
    acknowledged: "#F59E0B", // yellow
    in_progress: "#F97316", // orange
    resolved: "#10B981", // green
    closed: "#8B5CF6", // purple
  };

  const prioritySizes = {
    1: 20, // Critical - largest
    2: 18, // High
    3: 16, // Medium
    4: 14, // Low
    5: 12, // Very Low - smallest
  };

  const color = statusColors[status] || "#9CA3AF";
  const size = prioritySizes[priority] || 16;

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size * 0.6}px;
      "></div>
    `,
    iconSize: [size + 6, size + 6],
    iconAnchor: [(size + 6) / 2, (size + 6) / 2],
  });
};

const FullScreenMap = () => {
  const [issues, setIssues] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedWard, setSelectedWard] = useState("all");
  const [viewMode, setViewMode] = useState("markers"); // 'markers' or 'heatmap'
  const [heatmapIntensity, setHeatmapIntensity] = useState("priority"); // 'priority' or 'cases'
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [usingDummyData, setUsingDummyData] = useState(false);

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [issuesData, officersData] = await Promise.allSettled([
        getAllIssues(),
        getOfficers(),
      ]);

      let hasMinimalData = false;
      
      // Handle issues data
      if (issuesData.status === 'fulfilled') {
        const issues = issuesData.value.issues || [];
        setIssues(issues);
        
        // Check if issues data is minimal
        if (issues.length < 5) {
          hasMinimalData = true;
        }
      } else {
        console.error('Failed to fetch issues:', issuesData.reason);
        hasMinimalData = true;
      }
      
      // Handle officers data
      if (officersData.status === 'fulfilled') {
        const officers = officersData.value.officers || [];
        setOfficers(officers);
        
        // Check if officers data is minimal
        if (officers.length < 2) {
          hasMinimalData = true;
        }
      } else {
        console.error('Failed to fetch officers:', officersData.reason);
        hasMinimalData = true;
      }
      
      // If data is minimal, generate and use dummy data
      if (hasMinimalData) {
        console.log('Using dummy data to enhance map');
        setUsingDummyData(true);
        
        // Generate dummy issues if we have minimal real issues
        if (issuesData.status !== 'fulfilled' || 
            !issuesData.value.issues || 
            issuesData.value.issues.length < 5) {
          const dummyIssues = generateDummyIssues();
          setIssues(dummyIssues);
        }
        
        // Generate dummy officers if we have minimal real officers
        if (officersData.status !== 'fulfilled' || 
            !officersData.value.officers || 
            officersData.value.officers.length < 2) {
          const dummyOfficers = generateDummyOfficers();
          setOfficers(dummyOfficers);
        }
      }
      
    } catch (err) {
      setError(err.message || "Failed to fetch map data");
      console.error("Error fetching map data:", err);
      
      // Use dummy data as fallback
      console.log('Using dummy data as fallback');
      setUsingDummyData(true);
      setIssues(generateDummyIssues());
      setOfficers(generateDummyOfficers());
    } finally {
      setLoading(false);
    }
  };

  // Filter issues based on selected filters
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const statusMatch =
        selectedStatus === "all" || issue.status === selectedStatus;
      const categoryMatch =
        selectedCategory === "all" || issue.category === selectedCategory;
      const priorityMatch =
        selectedPriority === "all" ||
        issue.priority.toString() === selectedPriority;
      const wardMatch = selectedWard === "all" || issue.wardId === selectedWard;

      return statusMatch && categoryMatch && priorityMatch && wardMatch;
    });
  }, [
    issues,
    selectedStatus,
    selectedCategory,
    selectedPriority,
    selectedWard,
  ]);

  // Get unique values for filter options
  const statusOptions = useMemo(() => {
    const statuses = [...new Set(issues.map((issue) => issue.status))];
    return statuses
      .filter((status) => status != null) // Filter out null/undefined
      .map((status) => ({
        value: status,
        label:
          status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
      }));
  }, [issues]);

  const categoryOptions = useMemo(() => {
    const categories = [...new Set(issues.map((issue) => issue.category))];
    return categories
      .filter((category) => category != null) // Filter out null/undefined
      .map((category) => ({
        value: category,
        label: category,
      }));
  }, [issues]);

  const priorityOptions = useMemo(() => {
    const priorities = [...new Set(issues.map((issue) => issue.priority))];
    return priorities
      .filter((priority) => priority != null) // Filter out null/undefined
      .sort()
      .map((priority) => ({
        value: priority.toString(),
        label: `Priority ${priority}`,
      }));
  }, [issues]);

  const wardOptions = useMemo(() => {
    const wards = [...new Set(issues.map((issue) => issue.wardId))];
    return wards
      .filter((ward) => ward != null) // Filter out null/undefined
      .map((ward) => ({
        value: ward,
        label: `Ward ${ward.toString().replace("ward", "")}`, // Convert to string before replace
      }));
  }, [issues]);

  // Get status label
  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  // Get priority label
  const getPriorityLabel = (priority) => {
    const labels = {
      1: "Critical",
      2: "High",
      3: "Medium",
      4: "Low",
      5: "Very Low",
    };
    return labels[priority] || `Priority ${priority}`;
  };

  // Get officer name by ID
  const getOfficerName = (officerId) => {
    const officer = officers.find((o) => o._id === officerId);
    return officer ? officer.fullName : "Unassigned";
  };

  // Center to current location
  const handleLocateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
        }
      );
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🗺️</div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
            Loading map data...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            {error}
          </h2>
          <button
            onClick={fetchMapData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Default center (Kuniyamuthur, Coimbatore coordinates)
  const defaultCenter = [11.0046, 76.9616];
  const defaultZoom = 13;

  return (
    <div className="h-screen flex flex-col">
      {/* Header with filters */}
      <div className="bg-white dark:bg-gray-800 shadow-md p-4">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Coimbatore Civic Issues Map
            </h2>
            {/* {usingDummyData && (
              <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                Demo Data
              </span>
            )} */}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* View mode toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("markers")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "markers"
                    ? "bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                Markers
              </button>
              <button
                onClick={() => setViewMode("heatmap")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "heatmap"
                    ? "bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                Heatmap
              </button>
            </div>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Priority filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="all">All Priorities</option>
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Ward filter */}
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="all">All Wards</option>
              {wardOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Heatmap intensity selector (only visible in heatmap mode) */}
            {viewMode === "heatmap" && (
              <select
                value={heatmapIntensity}
                onChange={(e) => setHeatmapIntensity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              >
                <option value="priority">By Priority</option>
                <option value="cases">By Case Density</option>
              </select>
            )}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredIssues.length} of {issues.length} issues
          </div>
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1 relative">
        <MapContainer
          center={userLocation || defaultCenter}
          zoom={defaultZoom}
          zoomControl={false}
          className="h-full w-full"
        >
          <ZoomControl position="bottomright" />

          {/* Current location marker */}
          {/* <LocationMarker setUserLocation={setUserLocation} /> */}

          <LayersControl position="topright">
            {/* Base layers */}
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              />
            </LayersControl.BaseLayer>

            {/* Heatmap layer */}
            {viewMode === "heatmap" && (
              <HeatmapLayer
                issues={filteredIssues}
                intensityBasedOn={heatmapIntensity}
              />
            )}

            {/* Markers layer (only in markers mode) */}
            {viewMode === "markers" && (
              <LayersControl.Overlay checked name="Issue Markers">
                {filteredIssues.map((issue) => (
                  <Marker
                    key={issue._id}
                    position={[
                      issue.location.coordinates[1],
                      issue.location.coordinates[0],
                    ]}
                    icon={createCustomIcon(issue.status, issue.priority)}
                  >
                    <Popup>
                      <div className="p-2 min-w-[250px]">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">
                          {issue.title}
                        </h3>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                issue.status === "resolved" ||
                                issue.status === "closed"
                                  ? "bg-green-100 text-green-800"
                                  : issue.status === "in_progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {getStatusLabel(issue.status)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium">
                              {issue.category}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-600">Priority:</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                issue.priority === 1
                                  ? "bg-red-100 text-red-800"
                                  : issue.priority === 2
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {getPriorityLabel(issue.priority)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-600">Assigned To:</span>
                            <span className="font-medium">
                              {getOfficerName(issue.assignedOfficerId)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-600">Reported:</span>
                            <span className="font-medium">
                              {new Date(issue.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {issue.slaDueDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">SLA Due:</span>
                              <span
                                className={`font-medium ${
                                  new Date(issue.slaDueDate) < new Date()
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {new Date(
                                  issue.slaDueDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          <div className="pt-2 border-t">
                            <p className="text-gray-600 text-sm mb-2">
                              {issue.description}
                            </p>

                            <Link
                              to={`/issues/${issue._id}`}
                              className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayersControl.Overlay>
            )}
          </LayersControl>
        </MapContainer>

        {/* Control buttons */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-[1000]">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
            title="Locate me"
          >
            {isLocating ? (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            )}
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-[1000] max-w-xs">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {viewMode === "heatmap" ? "Heatmap Legend" : "Marker Legend"}
          </h4>

          {viewMode === "heatmap" ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-amber-50">Low intensity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                <span className="text-amber-50">Medium intensity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-lime-500 rounded"></div>
                <span className="text-amber-50">High intensity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-amber-50">Very high intensity</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-amber-50">Critical intensity</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {heatmapIntensity === "priority"
                  ? "Intensity based on issue priority"
                  : "Intensity based on case density"}
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
                <span className="text-amber-50">Submitted</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                <span className="text-amber-50">Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>
                <span className="text-amber-50">Acknowledged</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                <span className="text-amber-50">In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                <span className="text-amber-50">Resolved/Closed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                <span className="text-amber-50">Rejected</span>
              </div>
              <div className="pt-2 border-t mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white"></div>
                  <span className="text-amber-50"> Your location</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullScreenMap;