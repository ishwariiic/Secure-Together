document.addEventListener('DOMContentLoaded', function() {
  // Mock data for issues
  const mockIssues = [
    {
      id: '1',
      title: 'Broken Street Light',
      description: 'The street light at the corner of MG Road and Oak Society has been out for over a week, creating a safety hazard at night.',
      category: 'infrastructure',
      location: { lat: 18.5204, lng: 73.8567 }, // Pune coordinates
      upvotes: 24,
      status: 'reported',
      createdAt: '2023-11-10T14:30:00Z',
      createdBy: {
        id: 'user1',
        name: 'Smita Apte',
        avatar: '/placeholder.svg?height=40&width=40',
      },
      comments: [
        {
          id: 'c1',
          text: 'I noticed this too. It\'s very dark at night and feels unsafe.',
          createdAt: '2023-11-11T09:15:00Z',
          user: {
            id: 'user2',
            name: 'Mahesh ',
            avatar: '/placeholder.svg?height=40&width=40',
          },
        },
      ],
    },
    {
      id: '2',
      title: 'Graffiti on Community Center',
      description: 'There\'s extensive graffiti on the north wall of the community center that appeared over the weekend.',
      category: 'vandalism',
      location: { lat: 51.51, lng: -0.1 },
      upvotes: 18,
      status: 'in-progress',
      createdAt: '2023-11-12T10:45:00Z',
      createdBy: {
        id: 'user3',
        name: 'Alka Singh',
        avatar: '/placeholder.svg?height=40&width=40',
      },
      comments: [],
    },
    {
      id: '3',
      title: 'Suspicious Activity at Park',
      description: 'Several neighbors have reported suspicious gatherings at the park after hours, possibly drug-related.',
      category: 'safety',
      location: { lat: 51.5, lng: -0.08 },
      upvotes: 42,
      status: 'reported',
      createdAt: '2023-11-09T16:20:00Z',
      createdBy: {
        id: 'user4',
        name: 'Samiksha',
        avatar: '/placeholder.svg?height=40&width=40',
      },
      comments: [
        {
          id: 'c2',
          text: 'I\'ve seen this too. It\'s happening almost every night around 11pm.',
          createdAt: '2023-11-09T18:30:00Z',
          user: {
            id: 'user5',
            name: 'Trisha',
            avatar: '/placeholder.svg?height=40&width=40',
          },
        },
        {
          id: 'c3',
          text: 'I\'ve reported this to the police non-emergency line as well.',
          createdAt: '2023-11-10T09:45:00Z',
          user: {
            id: 'user1',
            name: 'Jiya sharma',
            avatar: '/placeholder.svg?height=40&width=40',
          },
        },
      ],
    },
  ];

  // State management
  let issues = [...mockIssues];
  let searchQuery = '';
  let selectedCategory = 'all';
  let activeTab = 'all';
  let selectedLocation = { lat: 18.5204, lng: 73.8567 }; // Pune coordinates
  let expandedIssueId = null;
  let map = null;
  let modalMap = null;
  let markersLayer = null;
  let modalMarkersLayer = null;

  // DOM elements
  const issuesList = document.getElementById('issues-list');
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const reportIssueBtn = document.getElementById('report-issue-btn');
  const addIssueModal = document.getElementById('add-issue-modal');
  const closeModalBtn = document.querySelector('.close-modal');
  const cancelIssueBtn = document.getElementById('cancel-issue');
  const submitIssueBtn = document.getElementById('submit-issue');
  const issueTitleInput = document.getElementById('issue-title');
  const issueCategorySelect = document.getElementById('issue-category');
  const issueDescriptionInput = document.getElementById('issue-description');
  const selectedLocationText = document.getElementById('selected-location');

  // Initialize the application
  initMap();
  initModalMap();
  renderIssues();

  // Event listeners
  searchInput.addEventListener('input', handleSearch);
  categoryFilter.addEventListener('change', handleCategoryFilter);
  tabButtons.forEach(btn => btn.addEventListener('click', handleTabChange));
  reportIssueBtn.addEventListener('click', openAddIssueModal);
  closeModalBtn.addEventListener('click', closeAddIssueModal);
  cancelIssueBtn.addEventListener('click', closeAddIssueModal);
  submitIssueBtn.addEventListener('click', handleAddIssue);

  // Functions
  function initMap() {
    map = L.map('map').setView([18.5204, 73.8567], 13); // Pune coordinates
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    markersLayer = L.layerGroup().addTo(map);
    updateMapMarkers();
  }

  function initModalMap() {
    modalMap = L.map('modal-map').setView([18.5204, 73.8567], 13); // Pune coordinates
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(modalMap);
    
    modalMarkersLayer = L.layerGroup().addTo(modalMap);
    
    // Add click handler to set location
    modalMap.on('click', function(e) {
      selectedLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
      selectedLocationText.textContent = `Selected: ${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)}`;
      updateModalMapMarker();
    });
    
    updateModalMapMarker();
  }

  function updateMapMarkers() {
    markersLayer.clearLayers();
    
    issues.forEach(issue => {
      const { lat, lng } = issue.location;
      
      // Create custom icon
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="custom-marker-icon ${issue.category}">!</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      
      // Create marker and popup
      const marker = L.marker([lat, lng], { icon }).addTo(markersLayer);
      
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 5px;">${issue.title}</h3>
          <p style="margin-bottom: 5px; font-size: 0.9em;">${issue.description.substring(0, 100)}${issue.description.length > 100 ? '...' : ''}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <span style="font-size: 0.8em; color: #666;">Reported: ${formatDate(issue.createdAt)}</span>
            <span style="font-size: 0.8em; background: #f0f0f0; padding: 2px 6px; border-radius: 10px;">${issue.upvotes} upvotes</span>
          </div>
        </div>
      `);
    });
  }

  function updateModalMapMarker() {
    modalMarkersLayer.clearLayers();
    
    const icon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="custom-marker-icon other">+</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    
    L.marker([selectedLocation.lat, selectedLocation.lng], { icon }).addTo(modalMarkersLayer);
  }

  function renderIssues() {
    const filteredIssues = filterIssues();
    
    if (filteredIssues.length === 0) {
      issuesList.innerHTML = `
        <div class="no-issues">
          <div class="no-issues-icon">⚠️</div>
          <h3 class="no-issues-title">No issues found</h3>
          <p class="no-issues-message">
            There are no issues matching your current filters. Try adjusting your search or report a new issue.
          </p>
        </div>
      `;
      return;
    }
    
    issuesList.innerHTML = '';
    
    filteredIssues.forEach(issue => {
      const issueCard = document.createElement('div');
      issueCard.className = 'issue-card';
      issueCard.dataset.id = issue.id;
      
      const isExpanded = issue.id === expandedIssueId;
      
      issueCard.innerHTML = `
        <div class="issue-header">
          <div>
            <h3 class="issue-title">${issue.title}</h3>
            <div class="issue-badges">
              <span class="badge badge-${issue.category}">${getCategoryName(issue.category)}</span>
              <span class="badge badge-${issue.status}">${getStatusName(issue.status)}</span>
            </div>
          </div>
          <button class="upvote-btn" data-id="${issue.id}">
            👍 ${issue.upvotes}
          </button>
        </div>
        <div class="issue-content">
          <p class="issue-description">${issue.description}</p>
          <div class="issue-author">
            <div class="avatar">
              <img src="${issue.createdBy.avatar}" alt="${issue.createdBy.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><rect width=%2240%22 height=%2240%22 fill=%22%23e5e7eb%22 /><text x=%2220%22 y=%2225%22 font-size=%2220%22 text-anchor=%22middle%22 fill=%22%23666%22>${issue.createdBy.name.charAt(0)}</text></svg>'">
            </div>
            <span class="issue-meta">
              Reported by ${issue.createdBy.name} on ${formatDate(issue.createdAt)}
            </span>
          </div>
        </div>
        <div class="issue-footer">
          <button class="comments-btn" data-id="${issue.id}">
            💬 ${issue.comments.length} comments
          </button>
          <div class="issue-location">
            🗺️ ${issue.location.lat.toFixed(5)}, ${issue.location.lng.toFixed(5)}
          </div>
        </div>
        <div class="comments-section ${isExpanded ? 'active' : ''}" data-id="${issue.id}">
          <div class="comments-list">
            ${issue.comments.length > 0 ? renderComments(issue.comments) : '<p class="text-muted">No comments yet. Be the first to comment!</p>'}
          </div>
          <div class="add-comment">
            <input type="text" placeholder="Add a comment..." class="comment-input" data-id="${issue.id}">
            <button class="btn btn-primary post-comment-btn" data-id="${issue.id}">Post</button>
          </div>
        </div>
      `;
      
      issuesList.appendChild(issueCard);
    });
    
    // Add event listeners to the newly created elements
    document.querySelectorAll('.upvote-btn').forEach(btn => {
      btn.addEventListener('click', handleUpvote);
    });
    
    document.querySelectorAll('.comments-btn').forEach(btn => {
      btn.addEventListener('click', toggleComments);
    });
    
    document.querySelectorAll('.post-comment-btn').forEach(btn => {
      btn.addEventListener('click', handleAddComment);
    });
  }

  function renderComments(comments) {
    return comments.map(comment => `
      <div class="comment">
        <div class="avatar">
          <img src="${comment.user.avatar}" alt="${comment.user.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><rect width=%2240%22 height=%2240%22 fill=%22%23e5e7eb%22 /><text x=%2220%22 y=%2225%22 font-size=%2220%22 text-anchor=%22middle%22 fill=%22%23666%22>${comment.user.name.charAt(0)}</text></svg>'">
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">${comment.user.name}</span>
            <span class="comment-date">${formatDate(comment.createdAt)}</span>
          </div>
          <p class="comment-text">${comment.text}</p>
        </div>
      </div>
    `).join('');
  }

  function filterIssues() {
    return issues.filter(issue => {
      const matchesSearch = 
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
      
      let matchesTab = true;
      if (activeTab === 'trending') {
        // Sort by upvotes and take top 5
        return matchesSearch && matchesCategory;
      } else if (activeTab === 'nearby') {
        // In a real app, this would filter by proximity to user's location
        return matchesSearch && matchesCategory;
      }
      
      return matchesSearch && matchesCategory && matchesTab;
    });
  }

  function handleSearch(e) {
    searchQuery = e.target.value;
    renderIssues();
  }

  function handleCategoryFilter(e) {
    selectedCategory = e.target.value;
    renderIssues();
  }

  function handleTabChange(e) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    activeTab = e.target.dataset.tab;
    
    if (activeTab === 'trending') {
      issues.sort((a, b) => b.upvotes - a.upvotes);
    }
    
    renderIssues();
  }

  function handleUpvote(e) {
    const issueId = e.currentTarget.dataset.id;
    issues = issues.map(issue => 
      issue.id === issueId ? { ...issue, upvotes: issue.upvotes + 1 } : issue
    );
    renderIssues();
    updateMapMarkers();
  }

  function toggleComments(e) {
    const issueId = e.currentTarget.dataset.id;
    
    if (expandedIssueId === issueId) {
      expandedIssueId = null;
    } else {
      expandedIssueId = issueId;
    }
    
    renderIssues();
  }

  function handleAddComment(e) {
    const issueId = e.currentTarget.dataset.id;
    const commentInput = document.querySelector(`.comment-input[data-id="${issueId}"]`);
    const comment = commentInput.value.trim();
    
    if (!comment) return;
    
    const newComment = {
      id: `c${Date.now()}`,
      text: comment,
      createdAt: new Date().toISOString(),
      user: {
        id: 'currentUser',
        name: 'Current User',
        avatar: '/placeholder.svg?height=40&width=40',
      },
    };
    
    issues = issues.map(issue => 
      issue.id === issueId 
        ? { ...issue, comments: [...issue.comments, newComment] } 
        : issue
    );
    
    renderIssues();
  }

  function openAddIssueModal() {
    addIssueModal.classList.add('active');
    setTimeout(() => {
      modalMap.invalidateSize();
    }, 100);
  }

  function closeAddIssueModal() {
    addIssueModal.classList.remove('active');
    resetModalForm();
  }

  function resetModalForm() {
    issueTitleInput.value = '';
    issueCategorySelect.value = 'vandalism';
    issueDescriptionInput.value = '';
    selectedLocation = { lat: 18.5204, lng: 73.8567 }; // Pune coordinates
    selectedLocationText.textContent = `Selected: ${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)}`;
    updateModalMapMarker();
  }

  function handleAddIssue() {
    const title = issueTitleInput.value.trim();
    const category = issueCategorySelect.value;
    const description = issueDescriptionInput.value.trim();
    
    if (!title || !description) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newIssue = {
      id: `issue-${Date.now()}`,
      title,
      description,
      category,
      location: selectedLocation,
      upvotes: 0,
      status: 'reported',
      createdAt: new Date().toISOString(),
      createdBy: {
        id: 'currentUser',
        name: 'Current User',
        avatar: '/placeholder.svg?height=40&width=40',
      },
      comments: [],
    };
    
    issues = [newIssue, ...issues];
    closeAddIssueModal();
    renderIssues();
    updateMapMarkers();
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function getCategoryName(category) {
    switch (category) {
      case 'infrastructure': return 'Infrastructure';
      case 'vandalism': return 'Vandalism';
      case 'safety': return 'Safety';
      case 'noise': return 'Noise';
      default: return 'Other';
    }
  }

  function getStatusName(status) {
    switch (status) {
      case 'reported': return 'Reported';
      case 'in-progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      default: return 'Unknown';
    }
  }
}); 
