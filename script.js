// ===== CURRENCY CONVERTER =====
// Using a reliable, CORS-friendly API served via CDN

const API_BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1';

// Currency data with flags and names
const currencies = {
  'USD': { name: 'US Dollar', flag: '🇺🇸' },
  'EUR': { name: 'Euro', flag: '🇪🇺' },
  'GBP': { name: 'British Pound', flag: '🇬🇧' },
  'JPY': { name: 'Japanese Yen', flag: '🇯🇵' },
  'AUD': { name: 'Australian Dollar', flag: '🇦🇺' },
  'CAD': { name: 'Canadian Dollar', flag: '🇨🇦' },
  'CHF': { name: 'Swiss Franc', flag: '🇨🇭' },
  'CNY': { name: 'Chinese Yuan', flag: '🇨🇳' },
  'INR': { name: 'Indian Rupee', flag: '🇮🇳' },
  'LKR': { name: 'Sri Lankan Rupee', flag: '🇱🇰' },
  'SGD': { name: 'Singapore Dollar', flag: '🇸🇬' },
  'NZD': { name: 'New Zealand Dollar', flag: '🇳🇿' },
  'AED': { name: 'UAE Dirham', flag: '🇦🇪' },
  'SAR': { name: 'Saudi Riyal', flag: '🇸🇦' },
  'ZAR': { name: 'South African Rand', flag: '🇿🇦' },
  'RUB': { name: 'Russian Ruble', flag: '🇷🇺' },
  'BRL': { name: 'Brazilian Real', flag: '🇧🇷' },
  'MXN': { name: 'Mexican Peso', flag: '🇲🇽' },
  'KRW': { name: 'South Korean Won', flag: '🇰🇷' },
  'TRY': { name: 'Turkish Lira', flag: '🇹🇷' }
};

// Popular currency pairs to display
const popularPairs = [
  { from: 'USD', to: 'EUR' },
  { from: 'USD', to: 'GBP' },
  { from: 'USD', to: 'LKR' },
  { from: 'EUR', to: 'USD' },
  { from: 'GBP', to: 'USD' },
  { from: 'LKR', to: 'USD' }
];

// DOM Elements
const fromSelect = document.getElementById('fromCurrency');
const toSelect = document.getElementById('toCurrency');
const fromFlag = document.getElementById('fromFlag');
const toFlag = document.getElementById('toFlag');
const amountInput = document.getElementById('amount');
const resultBox = document.getElementById('result');

// ===== POPULATE CURRENCY SELECTS =====
function populateCurrencies() {
  const currencyCodes = Object.keys(currencies).sort();
  currencyCodes.forEach(code => {
    const flag = currencies[code].flag;
    const name = currencies[code].name;
    const fromOption = document.createElement('option');
    fromOption.value = code;
    fromOption.textContent = `${flag} ${code} - ${name}`;
    fromSelect.appendChild(fromOption);
    const toOption = document.createElement('option');
    toOption.value = code;
    toOption.textContent = `${flag} ${code} - ${name}`;
    toSelect.appendChild(toOption);
  });
  fromSelect.value = 'USD';
  toSelect.value = 'LKR';
  updateFlags();
}

// ===== UPDATE FLAGS =====
function updateFlags() {
  fromFlag.textContent = currencies[fromSelect.value]?.flag || '🌍';
  toFlag.textContent = currencies[toSelect.value]?.flag || '🌍';
}

// ===== SWAP CURRENCIES =====
function swapCurrencies() {
  const fromVal = fromSelect.value;
  const toVal = toSelect.value;
  fromSelect.value = toVal;
  toSelect.value = fromVal;
  updateFlags();
  convertCurrency();  // ✅ Auto-convert on swap!
}

// ===== MAIN CONVERSION =====
async function convertCurrency() {
  const from = fromSelect.value;
  const to = toSelect.value;
  const amount = parseFloat(amountInput.value) || 0;

  if (amount <= 0) {
    // Show empty result but don't hide
    resultBox.style.display = 'block';
    document.getElementById('resultFrom').textContent = '0';
    document.getElementById('resultTo').textContent = '0.00';
    document.getElementById('rateDisplay').textContent = `1 ${from} = ? ${to}`;
    return;
  }

  if (from === to) {
    showResult(amount, from, amount, to, 1);
    return;
  }

  showLoading();

  try {
    const url = `${API_BASE}/currencies/${from.toLowerCase()}.json`;
    console.log('Fetching:', url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const rates = data[from.toLowerCase()];
    
    if (!rates || !rates[to.toLowerCase()]) {
      throw new Error(`Rate not found for ${from} to ${to}`);
    }

    const rate = rates[to.toLowerCase()];
    const convertedAmount = amount * rate;
    showResult(amount, from, convertedAmount, to, rate);
    updatePopularRates(from);

  } catch (error) {
    console.error('Conversion Error:', error);
    showError(error.message || 'Conversion failed. Please try again.');
  }
}

// ===== UI UPDATE FUNCTIONS =====
function showResult(amount, from, converted, to, rate) {
  resultBox.style.display = 'block';
  document.getElementById('resultFrom').textContent = formatNumber(amount);
  document.getElementById('resultFromCode').textContent = from;
  document.getElementById('resultTo').textContent = formatNumber(converted);
  document.getElementById('resultToCode').textContent = to;
  document.getElementById('rateDisplay').textContent = `1 ${from} = ${formatNumber(rate)} ${to}`;
  document.getElementById('updateTime').textContent = `Updated: ${new Date().toLocaleTimeString()}`;
  resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showLoading() {
  resultBox.style.display = 'block';
  document.getElementById('resultFrom').textContent = '...';
  document.getElementById('resultTo').textContent = '...';
  document.getElementById('rateDisplay').textContent = 'Loading...';
}

function showError(message) {
  resultBox.style.display = 'block';
  document.getElementById('resultFrom').textContent = '⚠️';
  document.getElementById('resultTo').textContent = '⚠️';
  document.getElementById('rateDisplay').textContent = `❌ ${message}`;
}

function formatNumber(num) {
  if (num === 0) return '0.00';
  if (num < 1) return num.toFixed(6);
  if (num < 1000000) return num.toFixed(2);
  return num.toFixed(2);
}

// ===== POPULAR RATES =====
async function updatePopularRates(base) {
  try {
    const url = `${API_BASE}/currencies/${base.toLowerCase()}.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch popular rates');
    const data = await response.json();
    const rates = data[base.toLowerCase()];
    if (rates) {
      displayPopularRates(rates, base);
    }
  } catch (error) {
    console.error('Popular rates error:', error);
  }
}

function displayPopularRates(rates, base) {
  const container = document.getElementById('popularRates');
  const pairsToShow = popularPairs.filter(p => p.from === base || p.to === base);
  const displayPairs = pairsToShow.length > 0 ? pairsToShow : popularPairs.slice(0, 6);

  container.innerHTML = displayPairs.map(pair => {
    const from = pair.from;
    const to = pair.to;
    let rate;
    if (from === base) {
      rate = rates[to.toLowerCase()];
    } else if (to === base) {
      rate = 1 / rates[from.toLowerCase()];
    } else {
      const rateFrom = rates[from.toLowerCase()];
      const rateTo = rates[to.toLowerCase()];
      if (rateFrom && rateTo) {
        rate = rateTo / rateFrom;
      } else {
        rate = 'N/A';
      }
    }
    return `
      <div class="popular-card">
        <div class="pair">${from}/${to}</div>
        <div class="rate">${typeof rate === 'number' ? formatNumber(rate) : rate}</div>
      </div>
    `;
  }).join('');
}

// ===== AUTO-CONVERT ON INPUT =====
let debounceTimer;
amountInput.addEventListener('input', function() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    convertCurrency();  // ✅ Auto-convert!
  }, 400);
});

// ===== ENTER KEY =====
amountInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    convertCurrency();
  }
});

// ===== CURRENCY CHANGE - FIXED! =====
fromSelect.addEventListener('change', function() {
  updateFlags();
  convertCurrency();  // ✅ Auto-convert on currency change!
});

toSelect.addEventListener('change', function() {
  updateFlags();
  convertCurrency();  // ✅ Auto-convert on currency change!
});

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
  populateCurrencies();
  setTimeout(convertCurrency, 300);
});

// ===== GLOBALLY ACCESSIBLE =====
window.swapCurrencies = swapCurrencies;
window.convertCurrency = convertCurrency;