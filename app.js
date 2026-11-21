/**
 * NAVA JYOTHI BINDING WORKS - MASTER JAVASCRIPT & E-COMMERCE ENGINE
 * Location: Pulipativari St, Kaleswara Rao Market, One Town, Vijayawada
 * Contact: +91 98491 40554
 */

// ==========================================================================
// 1. GLOBAL STATE & INITIALIZATION
// ==========================================================================
let cart = JSON.parse(localStorage.getItem('nj_cart')) || [];
let currentOrderReceipt = null;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initHeaderScroll();
  initActiveNavSpy();
  calculateEstimate(); // Run initial specification setup
  setupKeyboardEvents();
  updateCurrentYear();
  updateCartBadge();
  renderCart();
  initInteractiveMap(); // 100% Reliable Leaflet Map
});

function updateCurrentYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// ==========================================================================
// 2. THEME SWITCHER (LIGHT / DARK MODE)
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('nj_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('nj_theme', newTheme);
  updateThemeIcon(newTheme);
  showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (icon) {
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
      icon.style.color = '#f59e0b';
    } else {
      icon.className = 'fa-solid fa-moon';
      icon.style.color = 'inherit';
    }
  }
}

// ==========================================================================
// 3. HEADER SCROLL & SCROLL SPY
// ==========================================================================
function initHeaderScroll() {
  const header = document.getElementById('mainHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

function initActiveNavSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

// ==========================================================================
// 4. MOBILE DRAWER NAVIGATION
// ==========================================================================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
const closeMobileNav = document.getElementById('closeMobileNav');

if (mobileMenuBtn && mobileNavBackdrop) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileNavBackdrop.classList.add('active');
  });
}

if (closeMobileNav && mobileNavBackdrop) {
  closeMobileNav.addEventListener('click', closeMobileMenu);
  mobileNavBackdrop.addEventListener('click', (e) => {
    if (e.target === mobileNavBackdrop) closeMobileMenu();
  });
}

function closeMobileMenu() {
  if (mobileNavBackdrop) {
    mobileNavBackdrop.classList.remove('active');
  }
}

// ==========================================================================
// 5. E-COMMERCE CART MANAGEMENT (SPECIFICATION & QUANTITY BASED)
// ==========================================================================
function saveCart() {
  localStorage.setItem('nj_cart', JSON.stringify(cart));
  updateCartBadge();
  renderCart();
}

function updateCartBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cartCountBadge');
  const mobileBadge = document.getElementById('mobileCartCount');
  if (badge) badge.textContent = totalItems;
  if (mobileBadge) mobileBadge.textContent = totalItems;
}

function toggleCartDrawer(e) {
  if (e && e.target !== e.currentTarget && e.currentTarget.id === 'cartBackdrop') return;
  const drawer = document.getElementById('cartBackdrop');
  if (drawer) {
    drawer.classList.toggle('active');
  }
}

function addToCart(title, image, category, isCustom = false, specs = '') {
  const existingIdx = cart.findIndex(item => item.title === title && (item.specs || '') === (specs || ''));
  if (existingIdx > -1) {
    cart[existingIdx].quantity += 1;
  } else {
    cart.push({
      title,
      image: image || 'assets/images/storefront-entrance.jpg',
      category: category || 'General Stationery',
      quantity: 1,
      isCustom: !!isCustom,
      specs: specs || ''
    });
  }
  saveCart();
  showToast(`Added "${title}" to your order list!`);
}

function buyNow(title, image, category, isCustom = false, specs = '') {
  addToCart(title, image, category, isCustom, specs);
  const drawer = document.getElementById('cartBackdrop');
  if (drawer && !drawer.classList.contains('active')) {
    drawer.classList.add('active');
  }
}

function addCalculatedOrderToCart() {
  const data = window.currentEstimateData;
  if (!data) return;

  const title = `${data.serviceName} (${data.pageCount} Pgs)`;
  const qty = data.quantity || 1;
  const specs = `${data.coverName}, ${data.paperGsm} GSM, ${data.turnaroundTime}`;

  const imgMap = {
    hardcover: 'assets/images/thesis-hardcover-gold.jpg',
    spiral: 'assets/images/spiral-binding-wire.jpg',
    ledger: 'assets/images/nj-marble-binding-books.jpg',
    stitched: 'assets/images/school-notebooks-bundle.jpg',
    softcover: 'assets/images/thesis-hardcover-gold.jpg',
    shagun: 'assets/images/shagun-money-covers.jpg'
  };
  const itemImage = (data && data.serviceType && imgMap[data.serviceType]) || 'assets/images/thesis-hardcover-gold.jpg';

  const existingIdx = cart.findIndex(item => item.title === title && item.specs === specs);
  if (existingIdx > -1) {
    cart[existingIdx].quantity += qty;
  } else {
    cart.push({
      title,
      image: itemImage,
      category: 'Custom Binding',
      quantity: qty,
      isCustom: true,
      specs: specs
    });
  }

  saveCart();
  showToast(`Custom Order for ${title} added!`);
  const drawer = document.getElementById('cartBackdrop');
  if (drawer && !drawer.classList.contains('active')) {
    drawer.classList.add('active');
  }
}

function changeCartQty(index, delta) {
  if (cart[index]) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCart();
  }
}

function removeFromCart(index) {
  if (cart[index]) {
    const title = cart[index].title;
    cart.splice(index, 1);
    saveCart();
    showToast(`Removed "${title}" from cart`);
  }
}

function renderCart() {
  const container = document.getElementById('cartItemsContainer');
  const subtotalEl = document.getElementById('cartSubtotal');
  const grandTotalEl = document.getElementById('cartGrandTotal');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state">
        <i class="fa-solid fa-basket-shopping"></i>
        <h4>Your Order List is Empty</h4>
        <p style="font-size: 0.85rem; margin-top: 0.35rem;">Select notebooks, register books, binding services, or wholesale paper goods to build your order.</p>
        <button class="btn btn-primary btn-sm" style="margin-top: 1.25rem;" onclick="toggleCartDrawer()">
          <i class="fa-solid fa-store"></i> Browse Products & Services
        </button>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '0 Items';
    if (grandTotalEl) grandTotalEl.textContent = 'Direct Wholesale / Retail Order';
    updateCartBadge();
    return;
  }

  container.innerHTML = cart.map((item, index) => {
    return `
      <div class="cart-item-row">
        <div class="cart-item-thumb">
          <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="cart-item-details">
          <h4>${item.title}</h4>
          <div style="font-size: 0.8rem; color: var(--accent-amber); font-weight: 600;">${item.category}</div>
          ${item.specs ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">${item.specs}</div>` : ''}
          <div class="cart-qty-ctrl">
            <button class="cart-qty-btn" onclick="changeCartQty(${index}, -1)" title="Decrease">-</button>
            <span class="cart-qty-num">${item.quantity}</span>
            <button class="cart-qty-btn" onclick="changeCartQty(${index}, 1)" title="Increase">+</button>
          </div>
        </div>
        <div>
          <button class="cart-remove-item" onclick="removeFromCart(${index})" title="Remove item">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  updateCartTotals();
}

function updateCartTotals() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const fulfillment = document.getElementById('cartFulfillment')?.value || 'pickup';
  const fulfillmentText = fulfillment === 'delivery' 
    ? 'Home / Office Delivery' 
    : 'Store Pickup (Pulipativari St)';

  const subtotalEl = document.getElementById('cartSubtotal');
  const grandTotalEl = document.getElementById('cartGrandTotal');

  if (subtotalEl) {
    subtotalEl.textContent = `${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}`;
  }
  if (grandTotalEl) {
    grandTotalEl.textContent = fulfillmentText;
  }

  window.currentCartTotals = {
    totalItems,
    fulfillment,
    fulfillmentText
  };
}

// ==========================================================================
// 6. ONLINE CHECKOUT PROCESS & PAYMENT METHODS
// ==========================================================================
let selectedPaymentMethod = 'upi';

function proceedToCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty. Please add items first.");
    return;
  }
  toggleCartDrawer(); // Close drawer
  
  const modal = document.getElementById('checkoutModal');
  if (modal) {
    goToCheckoutStep1();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function goToCheckoutStep1() {
  document.getElementById('checkoutStep1').style.display = 'block';
  document.getElementById('checkoutStep2').style.display = 'none';
  document.getElementById('checkoutStep3').style.display = 'none';

  document.getElementById('step1Indicator').className = 'step-indicator active';
  document.getElementById('step2Indicator').className = 'step-indicator';
  document.getElementById('step3Indicator').className = 'step-indicator';
}

function goToCheckoutStep2() {
  const name = document.getElementById('chkName').value.trim();
  const phone = document.getElementById('chkPhone').value.trim();

  if (!name || !phone) {
    showToast("Please enter your Name and Mobile Number to proceed.");
    return;
  }

  document.getElementById('checkoutStep1').style.display = 'none';
  document.getElementById('checkoutStep2').style.display = 'block';
  document.getElementById('checkoutStep3').style.display = 'none';

  document.getElementById('step1Indicator').className = 'step-indicator active';
  document.getElementById('step2Indicator').className = 'step-indicator active';
  document.getElementById('step3Indicator').className = 'step-indicator';

  const totals = window.currentCartTotals || { totalItems: cart.reduce((sum, it) => sum + it.quantity, 0), fulfillmentText: 'Store Pickup' };
  const chkAmount = document.getElementById('chkPayableAmount');
  if (chkAmount) {
    chkAmount.textContent = `${totals.totalItems} Items (${totals.fulfillmentText || 'Store Pickup'})`;
  }

  // Dynamic UPI QR code pointing to shop UPI: 9849140554@ybl
  const upiUrl = `upi://pay?pa=9849140554@ybl&pn=Nava%20Jyothi%20Binding%20Works&cu=INR`;
  const qrImg = document.getElementById('dynamicUpiQr');
  const upiLink = document.getElementById('upiIntentLink');

  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;
  }
  if (upiLink) {
    upiLink.href = upiUrl;
  }
}

function selectPaymentTab(method) {
  selectedPaymentMethod = method;
  const tabs = ['upi', 'card', 'cod'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const content = document.getElementById(`paymentContent${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (btn) btn.classList.toggle('active', t === method);
    if (content) content.style.display = t === method ? 'block' : 'none';
  });
}

function copyUpiId() {
  navigator.clipboard.writeText('9849140554@ybl').then(() => {
    showToast("Merchant UPI ID copied: 9849140554@ybl");
  }).catch(() => {
    showToast("UPI ID: 9849140554@ybl");
  });
}

function processOrderPayment() {
  const name = document.getElementById('chkName').value.trim();
  const phone = document.getElementById('chkPhone').value.trim();
  const address = document.getElementById('chkAddress').value.trim() || 'Store Pickup at Pulipativari St, 1 Town';
  const totals = window.currentCartTotals || { totalItems: cart.reduce((sum, it) => sum + it.quantity, 0) };

  let payModeText = "UPI Instant Pay (9849140554@ybl)";
  let utrText = document.getElementById('upiRefId')?.value?.trim() || 'UPI-ORDER-CONFIRMED';

  if (selectedPaymentMethod === 'card') {
    payModeText = "Online Card / Net Banking (Verified)";
    utrText = "CARD-CONFIRMED";
  } else if (selectedPaymentMethod === 'cod') {
    payModeText = "Pay at Shop on Pickup (Pulipativari St)";
    utrText = "PAY-ON-PICKUP";
  }

  const orderId = `NJ-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getDate()}`;
  const orderDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  currentOrderReceipt = {
    orderId,
    orderDate,
    name,
    phone,
    address,
    payModeText,
    utrText,
    totalItems: totals.totalItems,
    items: [...cart]
  };

  // Render Receipt in Step 3
  document.getElementById('recOrderId').textContent = orderId;
  document.getElementById('recDate').textContent = orderDate;
  document.getElementById('recName').textContent = name;
  document.getElementById('recPhone').textContent = phone;
  document.getElementById('recPaymentMode').textContent = payModeText;
  
  const grandTotalEl = document.getElementById('recGrandTotal');
  if (grandTotalEl) {
    grandTotalEl.textContent = `${totals.totalItems} Items Total`;
  }

  const recList = document.getElementById('recItemsList');
  if (recList) {
    recList.innerHTML = cart.map(item => `
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
        <span>${item.quantity}x ${item.title}</span>
        <strong style="color: var(--accent-amber);">${item.category}</strong>
      </div>
    `).join('');
  }

  // Switch to Step 3
  document.getElementById('checkoutStep1').style.display = 'none';
  document.getElementById('checkoutStep2').style.display = 'none';
  document.getElementById('checkoutStep3').style.display = 'block';

  document.getElementById('step1Indicator').className = 'step-indicator active';
  document.getElementById('step2Indicator').className = 'step-indicator active';
  document.getElementById('step3Indicator').className = 'step-indicator active';

  // Clear Cart
  cart = [];
  saveCart();

  showToast("Order submitted & confirmed successfully!");
}

function sendOrderReceiptToWhatsApp() {
  if (!currentOrderReceipt) return;
  const o = currentOrderReceipt;

  const itemsFormatted = o.items.map(it => `• ${it.quantity}x ${it.title} (${it.category}${it.specs ? ' - ' + it.specs : ''})`).join('\n');

  const text = `*NAVA JYOTHI BINDING WORKS - ONLINE ORDER CONFIRMATION*
Order ID: *${o.orderId}*
Date: ${o.orderDate}

👤 *Customer Details:*
• Name: ${o.name}
• Phone: ${o.phone}
• Delivery/Pickup: ${o.address}

📦 *Items Ordered:*
${itemsFormatted}

📋 *Order Quantity:* ${o.totalItems} Items
💳 *Payment/Order Mode:* ${o.payModeText} (Ref: ${o.utrText})

📍 *Store:* D.No: 11-40-54, Pulipativari St, One Town, Vijayawada - 520001
Kindly process my order and notify me once ready!`;

  const waUrl = `https://wa.me/919849140554?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
}

function printReceipt() {
  window.print();
}

// ==========================================================================
// 7. INTERACTIVE BINDING SPECIFICATION ESTIMATOR
// ==========================================================================
const PAGE_STEPS = [10, 50, 100, 150, 200, 250, 300, 450, 600];

function onPageSliderStep(stepVal) {
  const idx = Math.max(0, Math.min(PAGE_STEPS.length - 1, parseInt(stepVal, 10)));
  const pages = PAGE_STEPS[idx];
  setExactPageCount(pages, false);
}

function setExactPageCount(val, updateSlider = true) {
  let num = parseInt(val, 10);
  if (isNaN(num) || num < 5) num = 5;
  if (num > 2000) num = 2000;

  const slider = document.getElementById('calcPageCount');
  const numInput = document.getElementById('exactPageNumberInput');
  const display = document.getElementById('pageCountDisplay');

  if (updateSlider && slider) {
    let closestIdx = 0;
    let minDiff = Infinity;
    PAGE_STEPS.forEach((stepVal, i) => {
      const diff = Math.abs(stepVal - num);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });
    slider.value = closestIdx;
  }

  if (numInput && parseInt(numInput.value, 10) !== num) {
    numInput.value = num;
  }
  if (display) {
    display.textContent = `${num} Pages`;
  }

  // Update preset buttons active state
  document.querySelectorAll('.page-preset-btn').forEach(btn => {
    const pVal = parseInt(btn.getAttribute('data-pages'), 10);
    if (pVal === num) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  calculateEstimate();
}

function updatePageCount(val) {
  setExactPageCount(val);
}

function calculateEstimate() {
  const serviceType = document.getElementById('calcServiceType').value;
  const numInput = document.getElementById('exactPageNumberInput');
  const slider = document.getElementById('calcPageCount');
  let pageCount = 150;
  if (numInput && !isNaN(parseInt(numInput.value, 10))) {
    pageCount = parseInt(numInput.value, 10);
  } else if (slider) {
    const idx = parseInt(slider.value, 10);
    pageCount = PAGE_STEPS[idx] || 150;
  }
  const quantity = Math.max(1, parseInt(document.getElementById('calcQuantity').value, 10) || 1);
  const turnaround = document.getElementById('calcTurnaround').value;
  const coverFinish = document.getElementById('calcCoverFinish').value;
  
  const selectedPaperEl = document.querySelector('input[name="paperType"]:checked');
  const paperGsm = selectedPaperEl ? parseInt(selectedPaperEl.value, 10) : 70;

  let serviceName = "Hardcover Thesis";
  let coverName = "Rexine + Gold Foil";

  switch (serviceType) {
    case 'hardcover':
      serviceName = "Hardcover Thesis (Rexine & Gold)";
      break;
    case 'spiral':
      serviceName = "Spiral / Wire-O Binding";
      break;
    case 'ledger':
      serviceName = "Marble Binding Book / Register (మార్బుల్ బైండింగ్)";
      break;
    case 'stitched':
      serviceName = "Stitched Note Books (కుట్టు పుస్తకాలు)";
      break;
    case 'softcover':
      serviceName = "Softcover / Thermal Binding";
      break;
    case 'shagun':
      serviceName = "Custom Money Gift Covers (Pack)";
      break;
    default:
      serviceName = "Custom Binding";
  }

  const coverSelect = document.getElementById('calcCoverFinish');
  if (coverSelect) {
    coverName = coverSelect.options[coverSelect.selectedIndex].text.split('(')[0].trim();
  }

  let turnaroundTime = "Ready in 24-48 Hours";
  if (turnaround === 'express') {
    turnaroundTime = "Same-Day Express (2–4 Hours)";
  } else if (turnaround === 'wholesale') {
    turnaroundTime = "Scheduled Wholesale Delivery";
  }

  const bulkTag = document.getElementById('bulkDiscountTag');
  if (quantity >= 50) {
    if (bulkTag) bulkTag.textContent = "Wholesale Batch Tier";
  } else if (quantity >= 20) {
    if (bulkTag) bulkTag.textContent = "Bulk Commercial Tier";
  } else if (quantity >= 5) {
    if (bulkTag) bulkTag.textContent = "Multi-Copy Pack";
  } else {
    if (bulkTag) bulkTag.textContent = "Single Unit";
  }

  const sumService = document.getElementById('sumService');
  const sumPages = document.getElementById('sumPages');
  const sumCover = document.getElementById('sumCover');
  const sumQuantity = document.getElementById('sumQuantity');
  const sumTotalTier = document.getElementById('sumTotalTier');
  const summaryPriceDisplay = document.getElementById('summaryPriceDisplay');
  const turnaroundPill = document.getElementById('summaryTurnaroundPill');
  const badgeLabel = document.getElementById('serviceBadgeLabel');

  if (sumService) sumService.textContent = serviceName;
  if (badgeLabel) badgeLabel.textContent = serviceName.split('(')[0].trim();
  if (sumPages) sumPages.textContent = `${pageCount} Pages / Copy (${paperGsm} GSM)`;
  if (sumCover) sumCover.textContent = coverName;
  if (sumQuantity) sumQuantity.textContent = `${quantity} ${quantity === 1 ? 'Copy' : 'Copies'}`;
  if (sumTotalTier) sumTotalTier.textContent = `Custom Wholesale / Retail Quote`;
  
  if (summaryPriceDisplay) {
    summaryPriceDisplay.innerHTML = `<i class="fa-solid fa-file-invoice"></i> Direct Factory Quote on Request`;
  }

  if (turnaroundPill) {
    turnaroundPill.innerHTML = `<i class="fa-solid fa-bolt"></i> ${turnaroundTime}`;
  }

  window.currentEstimateData = {
    serviceName,
    pageCount,
    paperGsm,
    coverName,
    quantity,
    turnaroundTime
  };
}

function sendOrderToWhatsApp() {
  const data = window.currentEstimateData || {};
  const phone = "919849140554";

  const message = `Hello Nava Jyothi Binding Works!
I configured an order specification on your website and would like to confirm quotation & timing:

📋 *Order Specifications:*
• *Item:* ${data.serviceName || 'Book Binding'}
• *Pages:* ${data.pageCount || 50} Pages (${data.paperGsm || 70} GSM)
• *Cover Style:* ${data.coverName || 'Rexine Gold Foil'}
• *Quantity:* ${data.quantity || 1} ${data.quantity === 1 ? 'Copy' : 'Copies'}
• *Timeline:* ${data.turnaroundTime || 'Standard'}

📍 *Delivery/Pickup:* D.No: 11-40-54, Pulipativari St, One Town, Vijayawada - 520001
Please let me know how to share my document/PDF and confirm turnaround!`;

  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
}

function printEstimate() {
  window.print();
}

// ==========================================================================
// 8. SERVICES & PRODUCTS FILTERING
// ==========================================================================
function filterServices(category, btnElement) {
  const cards = document.querySelectorAll('.service-card[data-category]');
  const buttons = document.querySelectorAll('.services-filter-nav .filter-btn');

  buttons.forEach(b => b.classList.remove('active'));
  if (btnElement) {
    btnElement.classList.add('active');
  }

  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (category === 'all' || cardCat === category) {
      card.style.display = 'flex';
      card.style.opacity = '0';
      setTimeout(() => {
        card.style.transition = 'opacity 0.4s ease';
        card.style.opacity = '1';
      }, 20);
    } else {
      card.style.display = 'none';
    }
  });
}

// ==========================================================================
// 9. PHOTO GALLERY LIGHTBOX & ZOOM
// ==========================================================================
function openLightbox(imageSrc, caption) {
  const modal = document.getElementById('imageLightboxModal');
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');

  if (modal && img) {
    img.src = imageSrc;
    img.alt = caption || 'Nava Jyothi Binding Works Gallery View';
    if (cap) cap.textContent = caption || '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  const modal = document.getElementById('imageLightboxModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

const lightboxModalEl = document.getElementById('imageLightboxModal');
if (lightboxModalEl) {
  lightboxModalEl.addEventListener('click', (e) => {
    if (e.target === lightboxModalEl) {
      closeLightbox();
    }
  });
}

// ==========================================================================
// 10. COPY ACTIONS & TOAST NOTIFICATION
// ==========================================================================
function copyGoogleMapsLink() {
  const url = "https://www.google.com/maps/place/Nava+Jyothi+Binding+Works/@16.5141945,80.6080327,890m/data=!3m1!1e3!4m6!3m5!1s0x3a35efe064edd6d5:0xef2914bc3e58b458!8m2!3d16.5141582!4d80.610601!16s%2Fg%2F1q62hq3cl?entry=ttu";
  navigator.clipboard.writeText(url).then(() => {
    showToast("Google Maps place link copied to clipboard!");
  }).catch(() => {
    showToast("Place Link: Pulipativari St, One Town, Vijayawada");
  });
}

function copyContactDraft() {
  const name = document.getElementById('custName').value || 'Customer';
  const phone = document.getElementById('custPhone').value || 'N/A';
  const category = document.getElementById('custCategory').value || 'Binding Inquiry';
  const msg = document.getElementById('custMsg').value || 'Please send pricing and turnaround.';

  const draft = `Inquiry for Nava Jyothi Binding Works
Name: ${name}
Phone: ${phone}
Service: ${category}
Message: ${msg}
Shop: Pulipativari Street, One Town, Vijayawada (098491 40554)`;

  navigator.clipboard.writeText(draft).then(() => {
    showToast("Inquiry draft copied to clipboard!");
  }).catch(() => {
    showToast("Inquiry ready!");
  });
}

function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  if (toast && toastMsg) {
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
}

// ==========================================================================
// 11. QUICK CONTACT FORM SUBMISSION
// ==========================================================================
function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const category = document.getElementById('custCategory').value;
  const msg = document.getElementById('custMsg').value.trim();

  if (!name || !phone) {
    showToast("Please provide your name and phone number.");
    return;
  }

  const message = `Hi Nava Jyothi Binding Works!
My name is ${name}.
Phone: ${phone}
Requirement: ${category}
Details: ${msg || 'Looking for pricing and turnaround time.'}

Kindly assist me with the order. Thank you!`;

  const waUrl = `https://wa.me/919849140554?text=${encodeURIComponent(message)}`;
  
  showToast("Opening WhatsApp with your inquiry...");
  setTimeout(() => {
    window.open(waUrl, '_blank');
  }, 400);
}

// ==========================================================================
// 12. KEYBOARD ACCESSIBILITY
// ==========================================================================
function setupKeyboardEvents() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeMobileMenu();
      closeCheckoutModal();
    }
  });
}

// ==========================================================================
// 13. INTERACTIVE LEAFLET MAP (100% RELIABLE - NEVER BLANK)
// ==========================================================================
function initInteractiveMap() {
  const mapContainer = document.getElementById('interactiveMap');
  if (!mapContainer || typeof L === 'undefined') return;

  const lat = 16.5141582;
  const lng = 80.610601;

  try {
    const map = L.map('interactiveMap', {
      center: [lat, lng],
      zoom: 17,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: '<div style="background: #ef4444; color: white; width: 38px; height: 38px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.45); border: 2.5px solid #ffffff;"><i class="fa-solid fa-book" style="transform: rotate(45deg); font-size: 15px;"></i></div>',
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

    const popupHtml = `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 6px; min-width: 220px;">
        <strong style="color: #0b1528; font-size: 14px; display: block; margin-bottom: 2px;">NAVA JYOTHI BINDING WORKS</strong>
        <span style="color: #b45309; font-size: 12px; font-weight: 700; display: block; margin-bottom: 6px;">నవ జ్యోతి బైండింగ్ వర్క్స్</span>
        <p style="margin: 0 0 10px; font-size: 11px; color: #475569; line-height: 1.4;">
          #11-40-54, Pulipativari St, 1 Town, Kaleswara Rao Market, Tarapet, Vijayawada - 520001
        </p>
        <div style="display: flex; gap: 8px;">
          <a href="https://www.google.com/maps/dir//Nava+Jyothi+Binding+Works,+11-40-54,+Pulipativari+St,+1+Town,+Vijayawada+520001/@16.5141582,80.610601,17z" target="_blank" style="background: #0284c7; color: white; padding: 5px 10px; border-radius: 4px; font-size: 11px; text-decoration: none; font-weight: 700;">Get Directions</a>
          <a href="tel:+919849140554" style="background: #10b981; color: white; padding: 5px 10px; border-radius: 4px; font-size: 11px; text-decoration: none; font-weight: 700;">Call Store</a>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml).openPopup();

    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  } catch (err) {
    console.warn('Map initialization:', err);
  }
}


/* ==========================================================================
   SCROLL TO EXPLORE NAVA JYOTHI INVENTORY LOGIC
   ========================================================================== */
function scrollInventory(direction) {
  const container = document.getElementById('inventoryScrollContainer');
  if (!container) return;
  const scrollAmount = 330 * direction;
  container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

function updateInventoryProgress() {
  const container = document.getElementById('inventoryScrollContainer');
  const progressFill = document.getElementById('invScrollProgress');
  if (!container || !progressFill) return;
  
  const maxScroll = container.scrollWidth - container.clientWidth;
  if (maxScroll <= 0) {
    progressFill.style.width = '100%';
    return;
  }
  const pct = Math.min(100, Math.max(10, (container.scrollLeft / maxScroll) * 100));
  progressFill.style.width = `${pct}%`;
}

function filterInventoryCards(category, btn) {
  // Update button active states
  const buttons = document.querySelectorAll('.inv-filter-btn');
  buttons.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  // Filter cards
  const cards = document.querySelectorAll('.inv-scroll-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-inv-cat');
    if (category === 'all' || cardCat === category || cardCat === 'all') {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });

  // Reset scroll to start
  const container = document.getElementById('inventoryScrollContainer');
  if (container) {
    container.scrollTo({ left: 0, behavior: 'smooth' });
    setTimeout(updateInventoryProgress, 100);
  }
}

function scrollToProduct(productId) {
  const target = document.getElementById(productId);
  if (!target) return;
  
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target.classList.remove('flash-highlight');
  // Trigger reflow to restart animation
  void target.offsetWidth;
  target.classList.add('flash-highlight');

  showToast('Viewing specifications in store!');
}

// Mouse drag to scroll implementation
function initInventoryDragScroll() {
  const slider = document.getElementById('inventoryScrollContainer');
  if (!slider) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener('scroll', updateInventoryProgress);

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('grabbing');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.classList.remove('grabbing');
  });

  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.classList.remove('grabbing');
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5;
    slider.scrollLeft = scrollLeft - walk;
  });
}

// Initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInventoryDragScroll);
} else {
  initInventoryDragScroll();
}
