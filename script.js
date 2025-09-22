// Dark Mode Toggle Functionality
const checkbox = document.getElementById("checkbox");
const body = document.body;

// Check if dark mode was previously set and apply it
if (localStorage.getItem("darkMode") === "enabled") {
  body.classList.add("dark-mode");
  checkbox.checked = true;
  body.setAttribute("data-theme", "dark");
} else {
  body.setAttribute("data-theme", "light");
}

// Event Listener for Toggle Button
checkbox.addEventListener("change", () => {
  if (checkbox.checked) {
    body.classList.add("dark-mode");
    localStorage.setItem("darkMode", "enabled");
    body.setAttribute("data-theme", "dark");
  } else {
    body.classList.remove("dark-mode");
    localStorage.setItem("darkMode", "disabled");
    body.setAttribute("data-theme", "light");
  }
});

// Hamburger Menu
const hamburgerMenu = document.getElementById('hamburger-menu');
const navLinks = document.getElementById('nav-links');
// Toggle the visibility of the navigation menu on small screens
hamburgerMenu.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Google Translator  
const dropdown = document.getElementById('customDropdown');
const dropdownHeader = document.getElementById('dropdownHeader');
const dropdownList = document.getElementById('langList');
const arrowIcon = document.getElementById('arrowIcon');
const selectedLangText = document.getElementById('selectedLangText');

// Toggle dropdown open/close
function toggleDropdown() {
  const expanded = dropdown.getAttribute('aria-expanded') === 'true';
  if (expanded) {
    closeDropdown();
  } else {
    openDropdown();
  }
}

function openDropdown() {
  dropdown.setAttribute('aria-expanded', 'true');
  dropdownList.classList.add('show');
  arrowIcon.classList.add('up');
  // Focus first item
  const firstItem = dropdownList.querySelector('.dropdown-item');
  if (firstItem) {
    firstItem.setAttribute('tabindex', '0');
    firstItem.focus();
  }
}

function closeDropdown() {
  dropdown.setAttribute('aria-expanded', 'false');
  dropdownList.classList.remove('show');
  arrowIcon.classList.remove('up');
  // Reset tabindex on options
  dropdownList.querySelectorAll('.dropdown-item').forEach(item => {
    item.setAttribute('tabindex', '-1');
    item.setAttribute('aria-selected', 'false');
  });
  dropdownHeader.focus();
}

dropdownHeader.addEventListener('click', toggleDropdown);
dropdownHeader.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeDropdown();
  }
});

// Close dropdown on click outside
document.addEventListener('click', (e) => {
  if (!dropdown.contains(e.target)) {
    closeDropdown();
  }
});

// Keyboard navigation and selection
dropdownList.addEventListener('keydown', (e) => {
  const items = Array.from(dropdownList.querySelectorAll('.dropdown-item'));
  let index = items.findIndex(item => item === document.activeElement);

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    let nextIndex = (index + 1) % items.length;
    items[nextIndex].focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    let prevIndex = (index - 1 + items.length) % items.length;
    items[prevIndex].focus();
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (document.activeElement.classList.contains('dropdown-item')) {
      selectLanguage(document.activeElement);
    }
  } else if (e.key === 'Escape') {
    closeDropdown();
  }
});

// Handle item click or keyboard select
dropdownList.querySelectorAll('.dropdown-item').forEach(item => {
  item.addEventListener('click', () => selectLanguage(item));
});

function selectLanguage(item) {
  const langCode = item.getAttribute('data-value');
  selectedLangText.textContent = item.textContent.trim();

  // Close dropdown after selection
  closeDropdown();

  // Call Google Translate API or simulate language selection
  if (typeof google !== 'undefined' && google.translate) {
    const combo = document.querySelector('#google_translate_element select');
    if (!combo) return console.warn('Google translate select not found!');

    // Change language in Google translate element
    combo.value = langCode;
    combo.dispatchEvent(new Event('change'));
  } else {
    // Fallback: Log selection
    console.log('Selected language code:', langCode);
  }
}
// NON-TRANSLATE
document.getElementById('customDropdown').classList.add('notranslate');
document.querySelectorAll('.dropdown-item').forEach(item => {
  item.classList.add('notranslate');
});

// Hero Section - 1
(() => {
  const canvas = document.getElementById('chart-bg');
  const ctx = canvas.getContext('2d');

  // Configuration for candlesticks
  const candleWidth = 10;
  const candleSpacing = 4;
  const candleTotalWidth = candleWidth + candleSpacing;
  const canvasHeightOffset = 110; // vertical bottom padding

  let candles = [];

  // Resize canvas to fit hero size and set scaling for retina
  function resize() {
    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    initCandles(); // Reinitialize candles on resize
  }

  // Generate a candle data object
  function generateCandle(prevClose = 100) {
    const maxChange = 8;
    let open = prevClose;
    let close = open + (Math.random() * maxChange * 2 - maxChange);
    close = Math.min(Math.max(close, 50), 150); // Price limits
    let high = Math.max(open, close) + Math.random() * 5;
    let low = Math.min(open, close) - Math.random() * 5;

    high = Math.min(high, 150);
    low = Math.max(low, 50);

    const bullish = close >= open;

    return { open, close, high, low, bullish };
  }

  // Initialize array of candles with starting prices
  function initCandles() {
    candles = [];
    let prevClose = 100 + Math.random() * 10;
    const numberOfCandles = Math.floor(canvas.width / candleTotalWidth) + 5; // Adjust based on canvas width
    for (let i = 0; i < numberOfCandles; i++) {
      const candle = generateCandle(prevClose);
      candles.push(candle);
      prevClose = candle.close;
    }
  }

  // Convert price to canvas Y coordinate
  function priceToY(price) {
    const chartHeight = canvas.clientHeight - canvasHeightOffset;
    const maxPriceOffset = 30;
    return (
      maxPriceOffset + ((150 - price) / (150 - 50)) * chartHeight
    );
  }

  // Draw a single candle at x position with candle data
  function drawCandle(x, candle) {
    const openY = priceToY(candle.open);
    const closeY = priceToY(candle.close);
    const highY = priceToY(candle.high);
    const lowY = priceToY(candle.low);
    const candleColor = candle.bullish ? '#4CAF50' : '#F44336';

    // Draw wick
    ctx.strokeStyle = candleColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + candleWidth / 2, highY);
    ctx.lineTo(x + candleWidth / 2, lowY);
    ctx.stroke();

    // Draw body
    const bodyTop = Math.min(openY, closeY);
    const bodyBottom = Math.max(openY, closeY);
    const bodyHeight = Math.max(bodyBottom - bodyTop, 2); // minimum height for visibility
    ctx.fillStyle = candleColor;
    ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
  }

  let offset = 0; // horizontal offset for animation

  // Animate candles rolling to left
  function animate() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.clientHeight);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#101820'); // slightly different dark tone for subtlety
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    offset += 0.7; // reduced speed for slow steady movement
    if (offset >= candleTotalWidth) {
      offset = 0;
      const lastClose = candles[candles.length - 1].close;
      candles.shift();
      candles.push(generateCandle(lastClose));
    }

    // Draw candles
    // Starting x position shifted by offset from the right
    let startX = canvas.clientWidth - offset - candleTotalWidth * candles.length;

    for (let i = 0; i < candles.length; i++) {
      let x = startX + i * candleTotalWidth;
      drawCandle(x, candles[i]);
    }

    requestAnimationFrame(animate);
  }

  function init() {
    resize();
    initCandles();
    animate();
  }

  window.addEventListener('resize', () => {
    resize();
  });

  // Initial setup
  init();
})();
