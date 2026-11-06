/**
 * Indian Celebritie - Shared Multi-Product E-Commerce Cart & Dispatch Engine
 * Inspired by Bella Vita Luxury E-Commerce Architecture
 */

// Catalog of products
const IC_CATALOG = {
  'love-drop': {
    id: 'love-drop',
    title: 'Love Drop Eau De Parfum (100ml)',
    subtitle: 'Romantic Floral • Jasmine & Sandalwood',
    slug: 'love-drop.html',
    price: 825,
    mrp: 1499,
    savings: 674,
    discount: '45% OFF',
    rating: 5.0,
    reviewCount: 4,
    image: 'public/assets/products/love-drop/product_shot_1.jpg',
    badge: 'BESTSELLER FOR HER'
  },
  'teen-hug': {
    id: 'teen-hug',
    title: 'Teen Hug 100ml Eau De Parfum',
    subtitle: 'Bold Modern Oud • Exotic Woody Scent',
    slug: 'teen-hug.html',
    price: 1337,
    mrp: 2499,
    savings: 1162,
    discount: '46% OFF',
    rating: 5.0,
    reviewCount: 5,
    image: 'public/assets/products/teen-hug/product_shot_1.jpg',
    badge: 'SIGNATURE OUD'
  },
  'fifty-shades': {
    id: 'fifty-shades',
    title: 'Fifty Shades Eau De Parfum (100ml)',
    subtitle: 'Warm Gourmand • Roasted Coffee & Vanilla',
    slug: 'fifty-shades.html',
    price: 1337,
    mrp: 2499,
    savings: 1162,
    discount: '46% OFF',
    rating: 4.9,
    reviewCount: 10,
    image: 'public/assets/products/fifty-shades/product_shot_1.jpg',
    badge: 'ICONIC BESTSELLER'
  },
  'complete-trio': {
    id: 'complete-trio',
    title: 'The Signature Grand Trio (3 x 100ml)',
    subtitle: 'Fifty Shades + Teen Hug + Love Drop (Gift Box)',
    slug: 'index.html#bestsellers',
    price: 2499,
    mrp: 6497,
    savings: 3998,
    discount: '61% OFF',
    rating: 5.0,
    reviewCount: 19,
    image: 'public/assets/branding/store_banner.jpg',
    badge: 'MEGA VALUE TRIO'
  }
};

// Global Cart State
let icCart = [];
let icPaymentMode = 'UPI / Online Payment (Fast Dispatch)';

// Initialize Cart on page load
function initCart() {
  try {
    const saved = localStorage.getItem('ic_multi_cart');
    if (saved) {
      icCart = JSON.parse(saved);
    } else {
      // Default initial item: Fifty Shades
      icCart = [{
        id: 'fifty-shades',
        title: IC_CATALOG['fifty-shades'].title,
        subtitle: IC_CATALOG['fifty-shades'].subtitle,
        price: IC_CATALOG['fifty-shades'].price,
        image: IC_CATALOG['fifty-shades'].image,
        quantity: 1
      }];
      saveCart();
    }
  } catch (e) {
    icCart = [];
  }

  // Load customer delivery data if saved
  try {
    const savedCust = localStorage.getItem('ic_customer_data');
    if (savedCust) {
      const data = JSON.parse(savedCust);
      if (document.getElementById('cust-name') && data.name) document.getElementById('cust-name').value = data.name;
      if (document.getElementById('cust-phone') && data.phone) document.getElementById('cust-phone').value = data.phone;
      if (document.getElementById('cust-address') && data.address) document.getElementById('cust-address').value = data.address;
      if (document.getElementById('cust-city') && data.city) document.getElementById('cust-city').value = data.city;
      if (document.getElementById('cust-pincode') && data.pincode) document.getElementById('cust-pincode').value = data.pincode;
    }
  } catch(e){}

  renderCart();
  startSaleCountdown();
}

function saveCart() {
  localStorage.setItem('ic_multi_cart', JSON.stringify(icCart));
  updateCartCounters();
}

function updateCartCounters() {
  const totalQty = icCart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-badge-count').forEach(el => {
    el.textContent = totalQty;
    el.classList.remove('scale-125');
    void el.offsetWidth;
    el.classList.add('scale-125');
    setTimeout(() => el.classList.remove('scale-125'), 200);
  });
}

function addToCart(productId, qty = 1, customPrice = null, customTitle = null) {
  const itemDef = IC_CATALOG[productId];
  if (!itemDef && !customPrice) return;

  const title = customTitle || (itemDef ? itemDef.title : 'Luxury Flacon');
  const price = customPrice !== null ? customPrice : (itemDef ? itemDef.price : 1337);
  const image = itemDef ? itemDef.image : 'public/assets/products/fifty-shades/product_shot_1.jpg';
  const subtitle = itemDef ? itemDef.subtitle : '100ml Eau De Parfum';

  const existingIndex = icCart.findIndex(i => i.id === productId && i.title === title);
  if (existingIndex > -1) {
    icCart[existingIndex].quantity += qty;
  } else {
    icCart.push({
      id: productId,
      title: title,
      subtitle: subtitle,
      price: price,
      image: image,
      quantity: qty
    });
  }

  saveCart();
  renderCart();
  toggleCartDrawer(true);
}

function updateCartItemQty(index, change) {
  if (icCart[index]) {
    icCart[index].quantity += change;
    if (icCart[index].quantity <= 0) {
      icCart.splice(index, 1);
    }
    saveCart();
    renderCart();
  }
}

function removeCartItem(index) {
  if (icCart[index]) {
    icCart.splice(index, 1);
    saveCart();
    renderCart();
  }
}

function renderCart() {
  const container = document.getElementById('cart-items-list');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  const emptyState = document.getElementById('cart-empty-state');
  const fullState = document.getElementById('cart-full-state');

  updateCartCounters();

  if (!container) return;

  if (icCart.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (fullState) fullState.classList.add('hidden');
    container.innerHTML = '';
    if (subtotalEl) subtotalEl.textContent = '₹0';
    if (totalEl) totalEl.textContent = '₹0';
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (fullState) fullState.classList.remove('hidden');

  let subtotal = 0;
  let html = '';

  icCart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    html += `
      <div class="flex items-center space-x-3.5 p-3.5 rounded-xl bg-brand-charcoal border border-stone-800 transition-all hover:border-brand-gold/30">
        <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-contain rounded-lg bg-brand-noir p-1 border border-stone-800 shrink-0">
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider truncate pr-2">${item.title}</h4>
            <button onclick="removeCartItem(${index})" class="text-stone-500 hover:text-red-400 p-0.5" title="Remove">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
          <div class="text-[10px] text-brand-amber truncate mt-0.5">${item.subtitle || ''}</div>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs font-bold text-brand-gold">₹${itemTotal.toLocaleString('en-IN')}</span>
            <div class="flex items-center border border-stone-700 rounded-lg overflow-hidden bg-brand-dark">
              <button onclick="updateCartItemQty(${index}, -1)" class="px-2 py-0.5 text-stone-300 hover:text-white hover:bg-stone-800 text-xs font-bold">-</button>
              <span class="px-2.5 py-0.5 text-xs text-white font-bold">${item.quantity}</span>
              <button onclick="updateCartItemQty(${index}, 1)" class="px-2 py-0.5 text-stone-300 hover:text-white hover:bg-stone-800 text-xs font-bold">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (subtotalEl) subtotalEl.textContent = '₹' + subtotal.toLocaleString('en-IN');
  if (totalEl) totalEl.textContent = '₹' + subtotal.toLocaleString('en-IN');
}

function toggleCartDrawer(open) {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  if (!drawer || !overlay) return;

  if (open) {
    drawer.classList.remove('translate-x-full');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100');
    renderCart();
  } else {
    drawer.classList.add('translate-x-full');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    overlay.classList.remove('opacity-100');
    showCartStep(1);
  }
}

function showCartStep(stepNumber) {
  const step1 = document.getElementById('cart-step-1');
  const step2 = document.getElementById('cart-step-2');
  const btn1 = document.getElementById('cart-step-1-btn');
  const btn2 = document.getElementById('cart-step-2-btn');

  if (!step1 || !step2) return;

  if (stepNumber === 2) {
    if (icCart.length === 0) {
      alert('Your cart is empty! Please add a perfume first.');
      return;
    }
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
    if (btn1) btn1.classList.add('hidden');
    if (btn2) btn2.classList.remove('hidden');
  } else {
    step1.classList.remove('hidden');
    step2.classList.add('hidden');
    if (btn1) btn1.classList.remove('hidden');
    if (btn2) btn2.classList.add('hidden');
  }
}

function handlePaymentModeChange(mode) {
  const labelUpi = document.getElementById('label-pay-upi');
  const labelCod = document.getElementById('label-pay-cod');
  if (mode === 'UPI') {
    icPaymentMode = 'UPI / Online Payment (Fast Dispatch)';
    if (labelUpi) {
      labelUpi.classList.add('border-2', 'border-brand-gold');
      labelUpi.classList.remove('border-stone-700');
    }
    if (labelCod) {
      labelCod.classList.remove('border-2', 'border-brand-gold');
      labelCod.classList.add('border-stone-700');
    }
  } else {
    icPaymentMode = 'Cash on Delivery (COD)';
    if (labelCod) {
      labelCod.classList.add('border-2', 'border-brand-gold');
      labelCod.classList.remove('border-stone-700');
    }
    if (labelUpi) {
      labelUpi.classList.remove('border-2', 'border-brand-gold');
      labelUpi.classList.add('border-stone-700');
    }
  }
}

function dispatchWhatsAppOrder() {
  const nameEl = document.getElementById('cust-name');
  const phoneEl = document.getElementById('cust-phone');
  const addrEl = document.getElementById('cust-address');
  const cityEl = document.getElementById('cust-city');
  const pinEl = document.getElementById('cust-pincode');

  const name = nameEl ? nameEl.value.trim() : '';
  const phone = phoneEl ? phoneEl.value.trim() : '';
  const address = addrEl ? addrEl.value.trim() : '';
  const city = cityEl ? cityEl.value.trim() : '';
  const pincode = pinEl ? pinEl.value.trim() : '';

  if (!name || !phone || !address || !city || !pincode) {
    alert('Please complete all delivery fields (Name, Phone, Address, City, PIN) to proceed with dispatch.');
    return;
  }

  // Persist customer data
  localStorage.setItem('ic_customer_data', JSON.stringify({
    name, phone, address, city, pincode
  }));

  const subtotal = icCart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  let itemsList = '';
  icCart.forEach((item, idx) => {
    itemsList += `• ${item.title} (x${item.quantity}) — ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n`;
  });

  const orderMsg = 
`👑 *NEW ORDER — INDIAN CELEBRITIE* 👑
━━━━━━━━━━━━━━━━━━━━━━━━━━
🛍️ *ITEMS ORDERED:*
${itemsList}
💰 *Total Payable:* ₹${subtotal.toLocaleString('en-IN')} (Free Pan-India Courier)
💳 *Payment Mode:* ${icPaymentMode}
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Customer Name:* ${name}
📞 *Customer Phone:* ${phone}
📍 *Delivery Address:* ${address}
🏙️ *City & State:* ${city}
📮 *PIN Code:* ${pincode}
━━━━━━━━━━━━━━━━━━━━━━━━━━
Please confirm my order and share dispatch / tracking details!`;

  const waUrl = `https://wa.me/917973437997?text=${encodeURIComponent(orderMsg)}`;
  window.open(waUrl, '_blank');
}

// Sale Countdown Timer (Bella Vita Style)
function startSaleCountdown() {
  const hoursEl = document.getElementById('timer-hours');
  const minsEl = document.getElementById('timer-mins');
  const secsEl = document.getElementById('timer-secs');
  if (!hoursEl) return;

  let totalSeconds = 2 * 3600 + 45 * 60 + 30; // 2h 45m 30s loop
  setInterval(() => {
    if (totalSeconds <= 0) totalSeconds = 3 * 3600;
    totalSeconds--;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0') + 'h';
    if (minsEl) minsEl.textContent = String(m).padStart(2, '0') + 'm';
    if (secsEl) secsEl.textContent = String(s).padStart(2, '0') + 's';
  }, 1000);
}

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', initCart);
