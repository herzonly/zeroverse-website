document.addEventListener('DOMContentLoaded', function() {
  initParticles();
  fetchServerStatus();
  
  const updateInterval = setInterval(fetchServerStatus, 2000);

  const refreshButton = document.getElementById('refresh-players');
  if (refreshButton) {
      refreshButton.addEventListener('click', fetchServerStatus);
  }

  const serverAddress = document.getElementById('server-address');
  if (serverAddress) {
      serverAddress.textContent = 'zeroversehc.biz.id:19133';
  }

  const copyButtons = document.querySelectorAll('.copy-ip');
  copyButtons.forEach(button => {
      button.addEventListener('click', function() {
          copyToClipboard('zeroversehc.biz.id:19133');
      });
  });

  const scrollLinks = document.querySelectorAll('nav a');
  scrollLinks.forEach(link => {
      link.addEventListener('click', function(e) {
          e.preventDefault();

          const targetId = this.getAttribute('href');
          const targetSection = document.querySelector(targetId);
          
          if (targetSection) {
              window.scrollTo({
                  top: targetSection.offsetTop - 80,
                  behavior: 'smooth'
              });
          }

          scrollLinks.forEach(link => link.classList.remove('active'));
          this.classList.add('active');
      });
  });

  window.addEventListener('scroll', function() {
      const header = document.querySelector('header');
      if (window.scrollY > 50) {
          header.style.padding = '10px 5%';
          header.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
      } else {
          header.style.padding = '15px 5%';
          header.style.backgroundColor = 'rgba(10, 10, 10, 0.9)';
      }

      const sections = document.querySelectorAll('section');
      let current = '';

      sections.forEach(section => {
          const sectionTop = section.offsetTop - 100;
          const sectionHeight = section.offsetHeight;
          if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
              current = '#' + section.getAttribute('id');
          }
      });

      scrollLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === current) {
              link.classList.add('active');
          }
      });
  });
});

function initParticles() {
  if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
          particles: {
              number: {
                  value: 80,
                  density: {
                      enable: true,
                      value_area: 800
                  }
              },
              color: {
                  value: "#ff3030"
              },
              shape: {
                  type: "circle",
                  stroke: {
                      width: 0,
                      color: "#000000"
                  }
              },
              opacity: {
                  value: 0.5,
                  random: true,
                  anim: {
                      enable: true,
                      speed: 1,
                      opacity_min: 0.1,
                      sync: false
                  }
              },
              size: {
                  value: 3,
                  random: true,
                  anim: {
                      enable: true,
                      speed: 2,
                      size_min: 0.1,
                      sync: false
                  }
              },
              line_linked: {
                  enable: true,
                  distance: 150,
                  color: "#ff3030",
                  opacity: 0.4,
                  width: 1
              },
              move: {
                  enable: true,
                  speed: 2,
                  direction: "none",
                  random: true,
                  straight: false,
                  out_mode: "out",
                  bounce: false,
                  attract: {
                      enable: false,
                      rotateX: 600,
                      rotateY: 1200
                  }
              }
          },
          interactivity: {
              detect_on: "canvas",
              events: {
                  onhover: {
                      enable: true,
                      mode: "repulse"
                  },
                  onclick: {
                      enable: true,
                      mode: "push"
                  },
                  resize: true
              },
              modes: {
                  grab: {
                      distance: 400,
                      line_linked: {
                          opacity: 1
                      }
                  },
                  bubble: {
                      distance: 400,
                      size: 40,
                      duration: 2,
                      opacity: 8,
                      speed: 3
                  },
                  repulse: {
                      distance: 100,
                      duration: 0.4
                  },
                  push: {
                      particles_nb: 4
                  },
                  remove: {
                      particles_nb: 2
                  }
              }
          },
          retina_detect: true
      });
  }
}

function fetchServerStatus() {
  const apiUrl = 'https://api.mcstatus.io/v2/status/java/zeroversehc.biz.id:19133';

  fetch(apiUrl)
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => updateServerInfo(data))
      .catch(error => {
          updateServerOffline();
      });
}

function updateServerInfo(data) {
  const onlineStatus = document.getElementById('online-status');
  const playerCount = document.getElementById('player-count');
  const onlineCount = document.getElementById('online-count');
  const maxCount = document.getElementById('max-count');
  const playerGrid = document.getElementById('player-grid');

  if (data.online) {
      if (onlineStatus) {
          onlineStatus.innerHTML = '<span class="online-status online">Online</span>';
      }

      if (playerCount) {
          playerCount.textContent = `${data.players.online}/${data.players.max}`;
      }

      if (onlineCount) {
          onlineCount.textContent = data.players.online;
      }

      if (maxCount) {
          maxCount.textContent = data.players.max;
      }

      if (playerGrid) {
          playerGrid.innerHTML = '';

          if (data.players.list && data.players.list.length > 0) {
              data.players.list.forEach(player => {
                  const playerName = player.name_clean || player.name_raw;
                  const isBedrock = playerName.startsWith('.');
                  const playerType = isBedrock ? 'bedrock' : 'java';
                  const displayName = playerName;

                  const avatarUrl = `https://mc-heads.net/avatar/${encodeURIComponent(playerName)}/100`;

                  const playerCard = document.createElement('div');
                  playerCard.className = `player-card ${playerType}`;

                  playerCard.innerHTML = `
                      <div class="player-avatar">
                          <img src="${avatarUrl}" alt="${displayName}" onerror="this.src='assets/img/default-avatar.png'">
                      </div>
                      <div class="player-name">${displayName}</div>
                      <div class="player-type ${playerType}">${playerType.charAt(0).toUpperCase() + playerType.slice(1)}</div>
                  `;

                  playerGrid.appendChild(playerCard);
              });
          } else {
              playerGrid.innerHTML = '<div class="no-players">No players online</div>';
          }
      }

  } else {
      updateServerOffline();
  }
}

function updateServerOffline() {
  const onlineStatus = document.getElementById('online-status');
  const playerCount = document.getElementById('player-count');
  const onlineCount = document.getElementById('online-count');
  const maxCount = document.getElementById('max-count');
  const playerGrid = document.getElementById('player-grid');

  if (onlineStatus) {
      onlineStatus.innerHTML = '<span class="online-status offline">Offline</span>';
  }

  if (playerCount) {
      playerCount.textContent = '0/0';
  }

  if (onlineCount) {
      onlineCount.textContent = '0';
  }

  if (maxCount) {
      maxCount.textContent = '0';
  }

  if (playerGrid) {
      playerGrid.innerHTML = '<div class="server-offline">Server is currently offline</div>';
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
      showNotification('IP copied to clipboard!');
  }).catch(err => {
      showNotification('Failed to copy. Please try again.');
  });
}

function showNotification(message) {
  const notification = document.getElementById('notification');
  const notificationMessage = document.getElementById('notification-message');

  notificationMessage.textContent = message;
  notification.classList.add('show');

  setTimeout(() => {
      notification.classList.remove('show');
  }, 3000);
}
