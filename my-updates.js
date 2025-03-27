document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded');
  
  // Sample updates data
  const mockUpdates = [
    {
      id: 1,
      type: 'news',
      title: 'New Metro Line Extension in Pune',
      description: 'Pune Metro Rail Corporation announces plans for a new metro line extension connecting Hinjewadi to Shivaji Nagar. The project is expected to be completed by 2025.',
      location: { lat: 18.5204, lng: 73.8567 },
      priority: 'high',
      createdAt: '2024-03-15T10:00:00Z',
      source: 'Local News',
      engagement: { likes: 45, comments: 12 }
    },
    {
      id: 2,
      type: 'event',
      title: 'Pune International Film Festival 2024',
      description: 'The 12th edition of PIFF will be held at various venues across Pune from March 20-25. The festival will showcase over 200 films from 50 countries.',
      location: { lat: 18.5314, lng: 73.8446 },
      priority: 'medium',
      createdAt: '2024-03-14T15:30:00Z',
      source: 'Event Calendar',
      engagement: { likes: 89, comments: 23 }
    },
    {
      id: 3,
      type: 'issue',
      title: 'Traffic Congestion on JM Road',
      description: 'Heavy traffic congestion reported on JM Road due to ongoing construction work. Commuters advised to use alternative routes during peak hours.',
      location: { lat: 18.5267, lng: 73.8617 },
      priority: 'high',
      createdAt: '2024-03-13T09:15:00Z',
      source: 'Community Report',
      engagement: { likes: 67, comments: 18 }
    },
    {
      id: 4,
      type: 'news',
      title: 'New IT Park in Hinjewadi',
      description: 'Major tech companies to set up offices in the new IT park being developed in Hinjewadi Phase 3. Expected to create over 10,000 jobs.',
      location: { lat: 18.5913, lng: 73.7389 },
      priority: 'medium',
      createdAt: '2024-03-12T14:20:00Z',
      source: 'Business News',
      engagement: { likes: 34, comments: 8 }
    },
    {
      id: 5,
      type: 'event',
      title: 'Pune Marathon 2024',
      description: 'Annual Pune Marathon to be held on April 7th. Registration open for all categories. Proceeds to benefit local charities.',
      location: { lat: 18.5362, lng: 73.8931 },
      priority: 'low',
      createdAt: '2024-03-11T11:00:00Z',
      source: 'Sports Events',
      engagement: { likes: 156, comments: 45 }
    },
    {
      id: 6,
      type: 'issue',
      title: 'Water Supply Interruption in Kothrud',
      description: 'Scheduled maintenance work to affect water supply in Kothrud area for 24 hours starting tomorrow. Water tankers to be arranged.',
      location: { lat: 18.5089, lng: 73.8272 },
      priority: 'high',
      createdAt: '2024-03-10T16:45:00Z',
      source: 'Municipal Corporation',
      engagement: { likes: 92, comments: 28 }
    }
  ];

  // State management
  let map;
  let markersLayer;
  let currentLocation = { lat: 18.5204, lng: 73.8567 }; // Default to Pune
  let selectedUpdateType = 'all';
  let selectedTimeFrame = 'week';
  let updates = [...mockUpdates]; // Store updates in state

  // DOM elements
  const mapContainer = document.getElementById('map');
  const updatesList = document.getElementById('updates-list');
  const compactUpdatesList = document.querySelector('.compact-updates-list');
  const updateTypeFilter = document.getElementById('update-type-filter');
  const timeFilter = document.getElementById('time-filter');
  const useCurrentLocationBtn = document.getElementById('use-current-location');
  const locationSearchInput = document.getElementById('location-search');
  const searchLocationBtn = document.getElementById('search-location');

  // Initialize the application
  function init() {
    console.log('Initializing application...');
    initMap();
    setupEventListeners();
    renderUpdates();
    renderCompactUpdates();
  }

  // Initialize the map
  function initMap() {
    console.log('Initializing map...');
    if (!mapContainer) {
      console.error('Map container not found');
      return;
    }

    map = L.map('map').setView([currentLocation.lat, currentLocation.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    updateMarkers();
  }

  // Set up event listeners
  function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    if (updateTypeFilter) {
      updateTypeFilter.addEventListener('change', handleUpdateTypeFilter);
    }
    
    if (timeFilter) {
      timeFilter.addEventListener('change', handleTimeFilter);
    }
    
    if (useCurrentLocationBtn) {
      useCurrentLocationBtn.addEventListener('click', handleUseCurrentLocation);
    }
    
    if (searchLocationBtn) {
      searchLocationBtn.addEventListener('click', handleLocationSearch);
    }
  }

  // Handle update type filter changes
  function handleUpdateTypeFilter(e) {
    selectedUpdateType = e.target.value;
    renderUpdates();
    renderCompactUpdates();
    updateMarkers();
  }

  // Handle time filter changes
  function handleTimeFilter(e) {
    selectedTimeFrame = e.target.value;
    renderUpdates();
    renderCompactUpdates();
    updateMarkers();
  }

  // Handle using current location
  function handleUseCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.setView([currentLocation.lat, currentLocation.lng], 13);
          updateMarkers();
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please try again.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }

  // Handle location search
  function handleLocationSearch() {
    const location = locationSearchInput.value.trim();
    if (location) {
      // In a real application, you would use a geocoding service
      // For now, we'll just show an alert
      alert('Location search would be implemented here');
    }
  }

  // Filter updates based on current filters
  function filterUpdates() {
    return updates.filter(update => {
      const matchesType = selectedUpdateType === 'all' || update.type === selectedUpdateType;
      const updateDate = new Date(update.createdAt);
      const now = new Date();
      let matchesTime = true;

      switch (selectedTimeFrame) {
        case 'today':
          matchesTime = updateDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          matchesTime = updateDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          matchesTime = updateDate >= monthAgo;
          break;
      }

      return matchesType && matchesTime;
    });
  }

  // Update map markers
  function updateMarkers() {
    console.log('Updating map markers...');
    if (!markersLayer) {
      console.error('Markers layer not found');
      return;
    }

    markersLayer.clearLayers();
    const filteredUpdates = filterUpdates();
    console.log('Filtered updates:', filteredUpdates);

    filteredUpdates.forEach(update => {
      const marker = L.marker([update.location.lat, update.location.lng], {
        icon: L.divIcon({
          className: `custom-marker-icon ${update.priority}`,
          html: update.priority === 'high' ? '!' : update.priority === 'medium' ? '?' : '•',
          iconSize: [24, 24]
        })
      });

      marker.bindPopup(`
        <div class="marker-popup">
          <h3>${update.title}</h3>
          <p>${update.description}</p>
          <div class="marker-meta">
            <span class="badge badge-${update.priority}">${update.priority}</span>
            <span>${new Date(update.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      `);

      marker.addTo(markersLayer);
    });
  }

  // Render updates in the main list
  function renderUpdates() {
    console.log('Rendering updates...');
    if (!updatesList) {
      console.error('Updates list container not found');
      return;
    }

    const filteredUpdates = filterUpdates();
    updatesList.innerHTML = filteredUpdates.map(update => `
      <div class="update-card">
        <div class="update-header">
          <h3 class="update-title">${update.title}</h3>
          <span class="badge badge-${update.priority}">${update.priority}</span>
        </div>
        <div class="update-content">
          <p class="update-description">${update.description}</p>
        </div>
        <div class="update-footer">
          <div class="update-meta">
            <span>${new Date(update.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>${update.source}</span>
          </div>
          <div class="update-actions">
            <button>
              <span>👍</span> ${update.engagement.likes}
            </button>
            <button>
              <span>💬</span> ${update.engagement.comments}
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Render compact updates
  function renderCompactUpdates() {
    console.log('Rendering compact updates...');
    if (!compactUpdatesList) {
      console.error('Compact updates container not found');
      return;
    }

    const filteredUpdates = filterUpdates();
    compactUpdatesList.innerHTML = filteredUpdates.map(update => `
      <div class="compact-update-item" data-id="${update.id}">
        <div class="compact-update-title">
          <span class="compact-update-priority ${update.priority}"></span>
          ${update.title}
        </div>
        <div class="compact-update-meta">
          <span>${new Date(update.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>${update.source}</span>
        </div>
      </div>
    `).join('');

    // Add click handlers to compact update items
    document.querySelectorAll('.compact-update-item').forEach(item => {
      item.addEventListener('click', () => {
        const update = updates.find(u => u.id === parseInt(item.dataset.id));
        if (update) {
          map.setView([update.location.lat, update.location.lng], 15);
          // Find and open the marker popup
          markersLayer.eachLayer(layer => {
            if (layer instanceof L.Marker && 
                layer.getLatLng().lat === update.location.lat && 
                layer.getLatLng().lng === update.location.lng) {
              layer.openPopup();
            }
          });
        }
      });
    });
  }

  // Initialize the application
  init();
}); 