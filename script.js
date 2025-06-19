// Main Application Script for Bread N' Brew

// Application State
let cartItems = [];
let selectedPickupDay = "today";
let selectedPickupTime = "";
let currentFilter = "All";
let tipInfo = { type: "percent", value: 0 };
let toastTimer;

// DOM Elements
const menuGrid = document.getElementById("menu-grid");
const filterContainer = document.getElementById("filter-container");
const searchBar = document.getElementById("search-bar");
const cartElement = document.getElementById("cart");
const floatingCartBtn = document.getElementById("floating-cart-btn");
const cartItemCount = document.getElementById("cart-item-count");
const toastWrapper = document.getElementById("toast-wrapper");
const toastMessage = document.getElementById("toast-message");
const modal = document.getElementById("custom-modal");
const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");

// Utility Functions
function calculateAndRoundPickupTime() {
  const now = new Date();
  const earliestPickup = new Date(
    now.getTime() + APP_CONFIG.MIN_PICKUP_TIME * 60000,
  );
  const minutes = earliestPickup.getMinutes();
  const remainder = minutes % APP_CONFIG.PICKUP_TIME_INCREMENT;
  if (remainder !== 0) {
    earliestPickup.setMinutes(
      earliestPickup.getMinutes() +
        (APP_CONFIG.PICKUP_TIME_INCREMENT - remainder),
    );
  }
  earliestPickup.setSeconds(0, 0);
  return earliestPickup;
}

function generateTimeSlotButtons(day, showAll = false) {
  const timeSlotContainer = document.getElementById("time-slot-container");
  const laterButtonContainer = document.getElementById(
    "later-button-container",
  );
  if (!timeSlotContainer) return;

  timeSlotContainer.innerHTML = "";
  if (laterButtonContainer) laterButtonContainer.innerHTML = "";

  let startHour, startMinute;
  if (day === "today") {
    const earliestTime = calculateAndRoundPickupTime();
    startHour = earliestTime.getHours();
    startMinute = earliestTime.getMinutes();
    if (startHour >= APP_CONFIG.STORE_HOURS.close) {
      timeSlotContainer.innerHTML =
        '<p class="text-center text-gray-500 col-span-full">Sorry, ordering for today is closed.</p>';
      return;
    }
    if (startHour < APP_CONFIG.STORE_HOURS.open) {
      startHour = APP_CONFIG.STORE_HOURS.open;
      startMinute = 0;
    }
  } else {
    startHour = APP_CONFIG.STORE_HOURS.open;
    startMinute = 0;
  }

  let slotsGenerated = 0;
  let moreSlotsAvailable = false;

  // Add ASAP button
  const nowButton = document.createElement("button");
  nowButton.className =
    "time-slot-btn bg-white border-2 border-amber-600 text-amber-800 px-4 py-2 rounded-full font-semibold touch-target";
  nowButton.textContent = "ASAP";
  nowButton.dataset.time = "ASAP";
  timeSlotContainer.appendChild(nowButton);
  slotsGenerated++;

  // Generate time slots
  for (let hour = startHour; hour < APP_CONFIG.STORE_HOURS.close; hour++) {
    for (
      let minute = hour === startHour ? startMinute : 0;
      minute < 60;
      minute += APP_CONFIG.PICKUP_TIME_INCREMENT
    ) {
      if (!showAll && slotsGenerated >= APP_CONFIG.MAX_INITIAL_TIME_SLOTS) {
        moreSlotsAvailable = true;
        break;
      }
      const timeString = `${hour % 12 === 0 ? 12 : hour % 12}:${minute.toString().padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
      const button = document.createElement("button");
      button.className =
        "time-slot-btn bg-white border-2 border-amber-600 text-amber-800 px-4 py-2 rounded-full font-semibold touch-target";
      button.textContent = timeString;
      button.dataset.time = timeString;
      timeSlotContainer.appendChild(button);
      slotsGenerated++;
    }
    if (
      !showAll &&
      slotsGenerated >= APP_CONFIG.MAX_INITIAL_TIME_SLOTS &&
      moreSlotsAvailable
    )
      break;
  }

  // Add "Show more times" button if needed
  if (moreSlotsAvailable && !showAll && laterButtonContainer) {
    const laterButton = document.createElement("button");
    laterButton.className =
      "show-later-btn text-amber-800 hover:underline font-semibold touch-target";
    laterButton.textContent = "Show more times";
    laterButtonContainer.appendChild(laterButton);
  }
}

function renderMenuFilters() {
  const categories = [
    "All",
    ...new Set(menuItems.map((item) => item.category)),
  ];
  filterContainer.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = `filter-btn px-3 sm:px-4 py-2 border-2 rounded-full font-semibold whitespace-nowrap touch-target text-sm sm:text-base ${currentFilter === category ? "selected" : "border-amber-600 text-amber-800"}`;
    button.textContent = category;
    button.dataset.category = category;
    filterContainer.appendChild(button);
  });
}

function createMenuItemCard(item) {
  const card = document.createElement("div");
  card.className =
    "bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform flex flex-col h-full";

  let customizationOptions = "";
  if (item.customizations) {
    if (item.customizations.toast) {
      customizationOptions += `
                <div class="flex gap-2 mt-2">
                    ${item.customizations.toast
                      .map(
                        (option) =>
                          `<button class="custom-btn px-3 py-1 border border-amber-600 text-amber-800 rounded-full text-sm touch-target" data-type="toast" data-value="${option}">${option}</button>`,
                      )
                      .join("")}
                </div>
            `;
    }
    if (item.customizations.temperature) {
      customizationOptions += `
                <div class="flex gap-2 mt-2">
                    ${item.customizations.temperature
                      .map(
                        (option) =>
                          `<button class="custom-btn px-3 py-1 border border-amber-600 text-amber-800 rounded-full text-sm touch-target" data-type="temperature" data-value="${option}">${option}</button>`,
                      )
                      .join("")}
                </div>
            `;
    }
    if (item.customizations.slice) {
      customizationOptions += `
                <div class="flex gap-2 mt-2">
                    ${item.customizations.slice
                      .map(
                        (option, index) =>
                          `<button class="custom-btn px-3 py-1 border border-amber-600 text-amber-800 rounded-full text-sm touch-target ${index === 0 ? "selected" : ""}" data-type="slice" data-value="${option.name}">${option.name} ($${(item.price + option.price).toFixed(2)})</button>`,
                      )
                      .join("")}
                </div>
            `;
    }
  }

  const quantityButtons = `
        <div class="flex items-center gap-3 mt-4">
            <button class="quantity-change bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center font-bold touch-target" data-item-id="${item.id}" data-change="-1">-</button>
            <input type="number" id="quantity-${item.id}" value="1" min="1" max="${APP_CONFIG.MAX_QUANTITY_PER_ITEM}" class="w-16 text-center border rounded py-1">
            <button class="quantity-change bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center font-bold touch-target" data-item-id="${item.id}" data-change="1">+</button>
            ${
              item.customizations && item.customizations.toppings
                ? `<button class="customize-btn bg-gray-200 text-gray-800 font-bold py-2 px-3 rounded-full hover:bg-gray-300 transition touch-target text-sm" data-item-id="${item.id}">Customize</button>`
                : ""
            }
        </div>
    `;

  card.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="menu-item-img w-full h-48 sm:h-56">
        <div class="p-4 sm:p-6 flex flex-col flex-grow">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg sm:text-xl font-display">${item.name}</h3>
                <span id="price-${item.id}" class="text-lg sm:text-xl font-bold text-amber-800">$${item.price.toFixed(2)}</span>
            </div>
            <p class="text-gray-600 text-sm sm:text-base mb-3">${item.description}</p>
            ${customizationOptions}
            <div class="flex-grow"></div>
            ${quantityButtons}
            <div class="flex gap-2 mt-4">
                <button class="add-to-cart-btn flex-1 bg-amber-800 text-white font-bold py-2 px-4 rounded-full hover:bg-amber-900 transition touch-target" data-item-id="${item.id}">Add to Cart</button>
                <button class="allergens-btn bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm hover:bg-blue-200 transition touch-target" data-item-id="${item.id}">Allergens</button>
            </div>
        </div>
    `;

  return card;
}

function renderMenuItems(items = menuItems) {
  menuGrid.innerHTML = "";

  if (currentFilter === "All") {
    const categoryOrder = [
      "Pastries",
      "Breads",
      "Coffee",
      "Sweets",
      "Tea",
      "Seasonal",
      "Breakfast",
      "Lunch",
      "Pizza",
    ];
    const filteredItems = items;

    categoryOrder.forEach((category) => {
      const categoryItems = filteredItems.filter(
        (item) => item.category === category,
      );
      if (categoryItems.length === 0) return;

      const categoryHeader = document.createElement("div");
      categoryHeader.className = "col-span-full mb-4 mt-8 first:mt-0";
      categoryHeader.innerHTML = `
                <h3 class="text-2xl sm:text-3xl font-bold font-display text-amber-800 mb-4 text-center">${category}</h3>
                <div class="w-16 h-1 bg-amber-800 mx-auto mb-6"></div>
            `;
      menuGrid.appendChild(categoryHeader);

      categoryItems.forEach((item) => {
        const card = createMenuItemCard(item);
        menuGrid.appendChild(card);
      });
    });
  } else {
    const filteredItems = items.filter(
      (item) => item.category === currentFilter,
    );
    filteredItems.forEach((item) => {
      const card = createMenuItemCard(item);
      menuGrid.appendChild(card);
    });
  }
}

function renderCart() {
  updateFloatingCartButton();

  if (cartItems.length === 0) {
    cleanupScrollButtons();

    cartElement.innerHTML = `
      <div class="flex items-center justify-between p-4 sm:p-6 border-b-2 border-amber-100 bg-gradient-to-r from-amber-50 to-amber-100">
        <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-gray-900">Your Cart</h2>
        <button id="close-cart" class="text-gray-600 hover:text-gray-800 p-2 hover:bg-white rounded-full touch-target transition-colors">
          <i data-lucide="x" class="w-6 h-6"></i>
        </button>
      </div>
      <div class="flex-1 flex items-center justify-center p-8 bg-white">
        <div class="text-center">
          <div class="bg-gray-100 rounded-full p-6 mx-auto mb-6 w-fit">
            <i data-lucide="shopping-cart" class="w-16 h-16 text-gray-400 mx-auto"></i>
          </div>
          <p class="text-gray-700 text-xl font-semibold mb-2">Your cart is empty</p>
          <p class="text-gray-500 text-base mb-6">Add some delicious items to get started!</p>
          <button id="continue-shopping-empty" class="bg-amber-800 text-white font-bold py-3 px-6 rounded-full hover:bg-amber-900 transition touch-target">
            Continue Shopping
          </button>
        </div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Cart Header
  const header = document.createElement("div");
  header.className =
    "flex items-center justify-between p-4 sm:p-6 border-b-2 border-amber-100 bg-gradient-to-r from-amber-50 to-amber-100";
  header.innerHTML = `
    <div class="flex items-center gap-3">
      <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-gray-900">Your Cart</h2>
      <span class="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold">${cartItems.length} item${cartItems.length !== 1 ? "s" : ""}</span>
    </div>
    <button id="close-cart" class="text-gray-600 hover:text-gray-800 p-2 hover:bg-white rounded-full touch-target transition-colors">
      <i data-lucide="x" class="w-6 h-6"></i>
    </button>
  `;

  // Cart Items Container
  const itemsContainer = document.createElement("div");
  itemsContainer.className = "cart-items-container bg-white relative";
  itemsContainer.id = "cart-items-scroll-container";

  const itemsList = document.createElement("div");
  itemsList.className = "p-4 sm:p-6 space-y-4";

  // Order Review Section
  const orderReviewHeader = document.createElement("div");
  orderReviewHeader.className = "mb-6";
  orderReviewHeader.innerHTML = `
    <h3 class="text-lg font-bold font-display text-gray-900 mb-2">Order Review</h3>
    <p class="text-sm text-gray-600">Review your items below</p>
  `;
  itemsList.appendChild(orderReviewHeader);

  // Render each cart item with enhanced display
  cartItems.forEach((cartItem) => {
    const menuItem = menuItems.find((item) => item.id === cartItem.id);
    if (!menuItem) return;

    const itemDiv = document.createElement("div");
    itemDiv.className =
      "bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-amber-300 transition-all";

    // Build customization display
    let customizationDisplay = "";
    if (cartItem.customizations) {
      const customs = [];
      Object.entries(cartItem.customizations).forEach(([key, value]) => {
        if (key === "toppings" && Array.isArray(value) && value.length > 0) {
          customs.push(`Add: ${value.join(", ")}`);
        } else if (value && key !== "toppings") {
          customs.push(value);
        }
      });
      if (customs.length > 0) {
        customizationDisplay = `
          <div class="mt-2">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Options:</span>
            <p class="text-sm text-gray-700 font-medium">${customs.join(" • ")}</p>
          </div>
        `;
      }
    }

    itemDiv.innerHTML = `
      <div class="flex gap-4">
        <!-- Product Image -->
        <div class="flex-shrink-0">
          <img src="${menuItem.img}" alt="${menuItem.name}" class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-gray-300">
        </div>

        <!-- Product Details -->
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-lg text-gray-900 mb-1">${menuItem.name}</h4>
          ${customizationDisplay}
          <div class="flex items-center justify-between mt-3">
            <div class="text-sm text-gray-600">
              <span class="font-medium">$${cartItem.price.toFixed(2)} each</span>
            </div>
            <div class="text-lg font-bold text-amber-800">
              $${(cartItem.price * cartItem.quantity).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <!-- Quantity Controls -->
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-gray-700">Quantity:</span>
          <div class="flex items-center gap-2">
            <button type="button" class="cart-quantity-change bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold touch-target transition-colors" data-unique-id="${cartItem.uniqueId}" data-change="-1">-</button>
            <span class="w-8 text-center font-bold text-lg text-gray-900">${cartItem.quantity}</span>
            <button type="button" class="cart-quantity-change bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold touch-target transition-colors" data-unique-id="${cartItem.uniqueId}" data-change="1">+</button>
          </div>
        </div>
        <button type="button" class="cart-remove-item text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg touch-target transition-colors" data-unique-id="${cartItem.uniqueId}">
          <i data-lucide="trash-2" class="w-5 h-5"></i>
        </button>
      </div>
    `;

    itemsList.appendChild(itemDiv);
  });

  itemsContainer.appendChild(itemsList);

  // Cart Footer with comprehensive checkout options
  const footer = document.createElement("div");
  footer.id = "cart-footer";
  footer.className = "cart-footer border-t-2 border-gray-200 bg-white";

  footer.innerHTML = `
    <div id="checkout-view" class="p-4 sm:p-6">

      <!-- Fulfillment Method Section -->
      <div class="mb-6">
        <h3 class="text-lg font-bold font-display text-gray-900 mb-4">Fulfillment Method</h3>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <button class="pickup-btn bg-amber-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-900 transition touch-target">
            <i data-lucide="map-pin" class="w-5 h-5 mx-auto mb-1"></i>
            Pickup
          </button>
          <button class="delivery-btn bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition touch-target">
            <i data-lucide="truck" class="w-5 h-5 mx-auto mb-1"></i>
            Delivery
          </button>
        </div>

        <!-- Pickup Options -->
        <div id="pickup-options" class="space-y-4">
          <div class="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div class="flex items-start gap-3">
              <i data-lucide="map-pin" class="w-5 h-5 text-amber-600 mt-1"></i>
              <div>
                <p class="font-semibold text-gray-900">512 Springfield Ave</p>
                <p class="text-sm text-gray-600">Berkeley Heights, NJ 07922</p>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-semibold mb-2 text-gray-900">Pickup Day:</h4>
            <div class="flex gap-2">
              <button class="date-btn bg-amber-800 text-white px-4 py-2 rounded-lg font-semibold touch-target" data-day="today">Today</button>
              <button class="date-btn bg-white border-2 border-amber-600 text-amber-800 px-4 py-2 rounded-lg font-semibold touch-target" data-day="tomorrow">Tomorrow</button>
            </div>
          </div>

          <div>
            <h4 class="font-semibold mb-2 text-gray-900">Pickup Time:</h4>
            <div id="time-slot-container" class="flex flex-wrap gap-2 mb-2"></div>
            <div id="later-button-container" class="text-center"></div>
          </div>
        </div>

        <!-- Delivery Options -->
        <div id="delivery-options" class="hidden bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center gap-3 mb-3">
            <i data-lucide="info" class="w-5 h-5 text-blue-600"></i>
            <p class="text-blue-800 font-medium">Delivery coming soon!</p>
          </div>
          <p class="text-sm text-blue-700">We're working on delivery options. For now, please select pickup.</p>
        </div>
      </div>

      <!-- Promo Code Section -->
      <div class="mb-6">
        <h4 class="font-semibold mb-3 text-gray-900">Promo Code</h4>
        <div class="flex gap-2">
          <input type="text" id="promo-code-input" placeholder="Enter promo code" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent">
          <button id="apply-promo-btn" class="bg-amber-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-900 transition touch-target">Apply</button>
        </div>
        <div id="promo-message" class="mt-2 text-sm hidden"></div>
      </div>

      <!-- Order Summary -->
      <div class="mb-6">
        <h3 class="text-lg font-bold font-display text-gray-900 mb-4">Order Summary</h3>
        <div class="bg-gray-50 rounded-lg p-4 space-y-3">
          <div class="flex justify-between text-base">
            <span class="text-gray-600">Subtotal:</span>
            <span id="cart-subtotal" class="font-medium">$0.00</span>
          </div>
          <div id="promo-discount-row" class="flex justify-between text-base text-green-600 hidden">
            <span>Promo Discount:</span>
            <span id="cart-discount">-$0.00</span>
          </div>
          <div class="flex justify-between text-base">
            <span class="text-gray-600">Delivery Fee:</span>
            <span id="cart-delivery-fee" class="font-medium">$0.00</span>
          </div>
          <div class="flex justify-between text-base">
            <span class="text-gray-600">Tax:</span>
            <span id="cart-tax" class="font-medium">$0.00</span>
          </div>
          <div class="flex justify-between text-base">
            <span class="text-gray-600">Tip:</span>
            <span id="cart-tip" class="font-medium">$0.00</span>
          </div>
          <div class="border-t border-gray-300 pt-3">
            <div class="flex justify-between font-bold text-xl">
              <span>Grand Total:</span>
              <span id="cart-total" class="text-amber-800">$0.00</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tip Section -->
      <div class="mb-6">
        <h4 class="font-semibold mb-3 text-gray-900">Add a Tip</h4>
        <div class="grid grid-cols-4 gap-2 mb-3">
          <button class="tip-btn bg-white border-2 border-gray-300 text-gray-700 py-2 px-3 rounded-lg font-semibold touch-target hover:border-amber-600 hover:text-amber-800 transition" data-tip="15">15%</button>
          <button class="tip-btn bg-white border-2 border-gray-300 text-gray-700 py-2 px-3 rounded-lg font-semibold touch-target hover:border-amber-600 hover:text-amber-800 transition" data-tip="18">18%</button>
          <button class="tip-btn bg-white border-2 border-gray-300 text-gray-700 py-2 px-3 rounded-lg font-semibold touch-target hover:border-amber-600 hover:text-amber-800 transition" data-tip="20">20%</button>
          <button class="tip-btn bg-white border-2 border-gray-300 text-gray-700 py-2 px-3 rounded-lg font-semibold touch-target hover:border-amber-600 hover:text-amber-800 transition" data-tip="custom">Custom</button>
        </div>
        <div id="custom-tip-container" class="hidden">
          <input type="number" id="custom-tip-input" placeholder="Enter tip amount ($)" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600" min="0" step="0.50">
        </div>
      </div>

      <!-- Special Instructions -->
      <div class="mb-6">
        <h4 class="font-semibold mb-3 text-gray-900">Special Instructions</h4>
        <textarea id="special-instructions" placeholder="Any special requests? (e.g., allergies, birthday message, etc.)" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none" rows="3"></textarea>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <!-- Primary Checkout Button -->
        <button class="checkout-continue-btn w-full bg-green-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-green-700 transition text-lg touch-target shadow-lg">
          <i data-lucide="credit-card" class="w-5 h-5 inline mr-2"></i>
          Proceed to Payment
        </button>

        <!-- Express Payment Options -->
        <div class="grid grid-cols-2 gap-3">
          <button class="express-payment-btn bg-black text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition touch-target">
            <i data-lucide="smartphone" class="w-4 h-4 inline mr-2"></i>
            Apple Pay
          </button>
          <button class="express-payment-btn bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition touch-target">
            <i data-lucide="smartphone" class="w-4 h-4 inline mr-2"></i>
            Google Pay
          </button>
        </div>

        <!-- Continue Shopping Link -->
        <button id="continue-shopping-btn" class="w-full text-amber-800 font-semibold py-2 hover:underline transition">
          ← Continue Shopping
        </button>
      </div>
    </div>

    <!-- Payment View (existing) -->
    <div id="payment-view" class="hidden">
      <div class="max-h-screen overflow-y-auto">
        <div class="p-6 bg-amber-50 border-b-2 border-amber-200">
          <h3 class="font-bold font-display text-xl mb-4 text-gray-900">Order Summary</h3>
          <div id="payment-order-items" class="space-y-3 mb-4"></div>
          <div class="bg-white rounded-lg p-4 border-2 border-amber-200">
            <div class="space-y-2">
              <div class="flex justify-between text-base font-medium">
                <span>Subtotal:</span>
                <span id="payment-subtotal" class="font-bold">$0.00</span>
              </div>
              <div class="flex justify-between text-base font-medium">
                <span>Tax:</span>
                <span id="payment-tax" class="font-bold">$0.00</span>
              </div>
              <div class="flex justify-between text-base font-medium">
                <span>Tip:</span>
                <span id="payment-tip" class="font-bold">$0.00</span>
              </div>
              <div class="border-t-2 border-amber-200 pt-2 mt-2">
                <div class="flex justify-between font-bold text-xl">
                  <span>Total:</span>
                  <span id="payment-total" class="text-amber-800">$0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-6 bg-white">
          <h4 class="font-bold font-display text-2xl mb-6 text-gray-900">Select Payment Method</h4>
          <div class="space-y-4 mb-8">
            <button class="payment-btn w-full flex items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-amber-300 touch-target transition-all text-lg font-semibold">
              <i data-lucide="credit-card" class="mr-3 w-6 h-6"></i> Debit/Credit Card
            </button>
            <button class="payment-btn w-full flex items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-amber-300 touch-target transition-all text-lg font-semibold">
              <i data-lucide="smartphone" class="mr-3 w-6 h-6"></i> Apple/Google Pay
            </button>
          </div>
          <button class="back-to-checkout-btn w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors touch-target">← Back to Order Options</button>
        </div>
      </div>
    </div>
  `;

  cartElement.innerHTML = "";
  cartElement.appendChild(header);
  cartElement.appendChild(itemsContainer);
  cartElement.appendChild(footer);

  generateTimeSlotButtons(selectedPickupDay);
  updateCartTotals();
  lucide.createIcons();
}

function updateCartTotals() {
  const subtotalElement = document.getElementById("cart-subtotal");
  const taxElement = document.getElementById("cart-tax");
  const tipElement = document.getElementById("cart-tip");
  const totalElement = document.getElementById("cart-total");
  const deliveryFeeElement = document.getElementById("cart-delivery-fee");
  const discountElement = document.getElementById("cart-discount");
  const discountRow = document.getElementById("promo-discount-row");

  if (!subtotalElement) return;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Calculate promo discount
  let discount = 0;
  if (window.appliedPromo) {
    if (window.appliedPromo.type === "percent") {
      discount = (subtotal * window.appliedPromo.value) / 100;
    } else {
      discount = window.appliedPromo.value;
    }
    discount = Math.min(discount, subtotal); // Can't discount more than subtotal
  }

  const discountedSubtotal = subtotal - discount;

  // Delivery fee (currently $0 for pickup only)
  const deliveryFee = 0;

  const tax = discountedSubtotal * APP_CONFIG.NJ_SALES_TAX_RATE;
  const tip =
    tipInfo.type === "percent"
      ? (discountedSubtotal * tipInfo.value) / 100
      : tipInfo.value;
  const total = discountedSubtotal + deliveryFee + tax + tip;

  subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  taxElement.textContent = `$${tax.toFixed(2)}`;
  tipElement.textContent = `$${tip.toFixed(2)}`;
  totalElement.textContent = `$${total.toFixed(2)}`;

  if (deliveryFeeElement) {
    deliveryFeeElement.textContent = `$${deliveryFee.toFixed(2)}`;
  }

  // Show/hide discount row
  if (discount > 0 && discountElement && discountRow) {
    discountElement.textContent = `-$${discount.toFixed(2)}`;
    discountRow.classList.remove("hidden");
  } else if (discountRow) {
    discountRow.classList.add("hidden");
  }

  // Update header cart counts
  const headerCartCount = document.getElementById("header-cart-count");
  const mobileCartCount = document.getElementById("mobile-cart-count");
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (headerCartCount) headerCartCount.textContent = totalQuantity;
  if (mobileCartCount) mobileCartCount.textContent = totalQuantity;

  // Update payment view totals if elements exist
  updatePaymentTotals(discountedSubtotal, tax, tip, total);
}

function updatePaymentTotals(subtotal, tax, tip, total) {
  const paymentSubtotal = document.getElementById("payment-subtotal");
  const paymentTax = document.getElementById("payment-tax");
  const paymentTip = document.getElementById("payment-tip");
  const paymentTotal = document.getElementById("payment-total");

  if (paymentSubtotal) paymentSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  if (paymentTax) paymentTax.textContent = `$${tax.toFixed(2)}`;
  if (paymentTip) paymentTip.textContent = `$${tip.toFixed(2)}`;
  if (paymentTotal) paymentTotal.textContent = `$${total.toFixed(2)}`;
}

function updatePaymentOrderSummary() {
  const paymentOrderItems = document.getElementById("payment-order-items");
  if (!paymentOrderItems) return;

  paymentOrderItems.innerHTML = "";

  cartItems.forEach((cartItem) => {
    const menuItem = menuItems.find((item) => item.id === cartItem.id);
    if (!menuItem) return;

    let customizationText = "";
    if (cartItem.customizations) {
      const customs = [];
      Object.entries(cartItem.customizations).forEach(([key, value]) => {
        if (key === "toppings" && Array.isArray(value) && value.length > 0) {
          customs.push(value.join(", "));
        } else if (value && key !== "toppings") {
          customs.push(value);
        }
      });
      if (customs.length > 0) {
        customizationText = `<p class="text-sm text-gray-600 font-medium">${customs.join(", ")}</p>`;
      }
    }

    const orderItem = document.createElement("div");
    orderItem.className =
      "flex justify-between items-center bg-white p-3 rounded-lg border border-amber-200";
    orderItem.innerHTML = `
            <div class="flex-1">
                <h5 class="font-semibold text-gray-900">${menuItem.name}</h5>
                ${customizationText}
                <p class="text-sm text-gray-600">Qty: ${cartItem.quantity} × $${cartItem.price.toFixed(2)}</p>
            </div>
            <div class="text-right">
                <p class="font-bold text-amber-800">$${(cartItem.price * cartItem.quantity).toFixed(2)}</p>
            </div>
        `;
    paymentOrderItems.appendChild(orderItem);
  });
}

function updateFloatingCartButton() {
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  if (totalQuantity > 0) {
    cartItemCount.textContent = totalQuantity;
    floatingCartBtn.classList.add("visible");
  } else {
    floatingCartBtn.classList.remove("visible");
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  toastMessage.textContent = message;
  toastWrapper.classList.add("visible");
  toastTimer = setTimeout(() => {
    toastWrapper.classList.remove("visible");
  }, 3000);
}

function showModal(
  title,
  body,
  actions = '<button class="modal-close-btn bg-amber-800 text-white font-bold py-2 px-8 rounded-full touch-target">OK</button>',
) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = body;
  document.getElementById("modal-actions").innerHTML = actions;
  modal.classList.remove("hidden");
}

function hideModal() {
  modal.classList.add("hidden");
}

function cleanupScrollButtons() {
  const scrollUpBtn = document.getElementById("cart-scroll-up");
  const scrollDownBtn = document.getElementById("cart-scroll-down");

  if (scrollUpBtn) {
    scrollUpBtn.remove();
  }
  if (scrollDownBtn) {
    scrollDownBtn.remove();
  }
}

function lockBodyScroll() {
  // Store current scroll position
  const scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
  document.body.setAttribute("data-scroll-y", scrollY.toString());
}

function unlockBodyScroll() {
  // Restore scroll position
  const scrollY = document.body.getAttribute("data-scroll-y");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  document.body.style.overflow = "";
  document.body.removeAttribute("data-scroll-y");

  if (scrollY) {
    window.scrollTo(0, parseInt(scrollY));
  }
}

function setupCartScrolling() {
  const scrollContainer = document.getElementById(
    "cart-items-scroll-container",
  );
  const scrollUpBtn = document.getElementById("cart-scroll-up");
  const scrollDownBtn = document.getElementById("cart-scroll-down");

  if (!scrollContainer || !scrollUpBtn || !scrollDownBtn) return;

  // Check if content is scrollable and show/hide buttons
  function updateScrollButtons() {
    const isScrollable =
      scrollContainer.scrollHeight > scrollContainer.clientHeight;
    const isAtTop = scrollContainer.scrollTop <= 10;
    const isAtBottom =
      scrollContainer.scrollTop >=
      scrollContainer.scrollHeight - scrollContainer.clientHeight - 10;

    if (isScrollable) {
      // Show/hide up button
      if (isAtTop) {
        scrollUpBtn.classList.add("opacity-0", "pointer-events-none");
      } else {
        scrollUpBtn.classList.remove("opacity-0", "pointer-events-none");
      }

      // Show/hide down button
      if (isAtBottom) {
        scrollDownBtn.classList.add("opacity-0", "pointer-events-none");
      } else {
        scrollDownBtn.classList.remove("opacity-0", "pointer-events-none");
      }
    } else {
      // Hide both buttons if content doesn't need scrolling
      scrollUpBtn.classList.add("opacity-0", "pointer-events-none");
      scrollDownBtn.classList.add("opacity-0", "pointer-events-none");
    }
  }

  // Scroll up function
  scrollUpBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    scrollContainer.scrollBy({
      top: -200,
      behavior: "smooth",
    });
  });

  // Scroll down function
  scrollDownBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    scrollContainer.scrollBy({
      top: 200,
      behavior: "smooth",
    });
  });

  // Listen for scroll events to update button visibility
  scrollContainer.addEventListener("scroll", updateScrollButtons);

  // Initial check
  setTimeout(updateScrollButtons, 100);

  // Re-check when window resizes
  window.addEventListener("resize", updateScrollButtons);
}

function addToCart(item, quantity, customizations) {
  let price = item.price;
  if (customizations.toppings) {
    customizations.toppings.forEach((toppingName) => {
      const topping = item.customizations.toppings.find(
        (t) => t.name === toppingName,
      );
      if (topping) price += topping.price;
    });
  }
  if (customizations.slice === "Slice") {
    const sliceOption = item.customizations.slice.find(
      (s) => s.name === "Slice",
    );
    if (sliceOption) price += sliceOption.price;
  }

  showToast("Item added to your cart!");
  const uniqueId = `${item.id}-${JSON.stringify(customizations)}`;
  const existingItem = cartItems.find(
    (cartItem) => cartItem.uniqueId === uniqueId,
  );
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cartItems.push({ id: item.id, uniqueId, quantity, customizations, price });
  }
  renderCart();
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu toggle
  mobileMenuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("mobile-menu-hidden");
    mobileMenu.classList.toggle("mobile-menu-visible");
  });

  // Close mobile menu when clicking on a link
  mobileMenu.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      mobileMenu.classList.add("mobile-menu-hidden");
      mobileMenu.classList.remove("mobile-menu-visible");
    }
  });

  // Handle clicks on cart overlay to close cart
  cartElement.addEventListener("click", (e) => {
    // If clicking on the overlay background (not the cart content), close cart
    if (e.target === cartElement) {
      cleanupScrollButtons();
      cartElement.classList.add("cart-hidden");
      unlockBodyScroll();
    }
  });

  // Menu grid event listener
  menuGrid.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;

    const card = e.target.closest(".bg-white");

    if (button.classList.contains("quantity-change")) {
      const itemId = parseInt(button.dataset.itemId);
      const change = parseInt(button.dataset.change);
      const input = document.getElementById(`quantity-${itemId}`);
      let currentValue = parseInt(input.value);
      currentValue = Math.max(
        1,
        Math.min(APP_CONFIG.MAX_QUANTITY_PER_ITEM, currentValue + change),
      );
      input.value = currentValue;
    } else if (button.classList.contains("add-to-cart-btn")) {
      const itemId = parseInt(button.dataset.itemId);
      const item = menuItems.find((i) => i.id === itemId);
      const quantity = parseInt(
        document.getElementById(`quantity-${itemId}`).value,
      );
      const customizations = { toppings: [] };

      card.querySelectorAll(".custom-btn.selected").forEach((btn) => {
        customizations[btn.dataset.type] = btn.dataset.value;
      });

      const cardImage = card.querySelector(".menu-item-img");
      if (
        customizations.toppings &&
        customizations.toppings.includes("Add Bacon") &&
        item.customizations &&
        item.customizations.toppings &&
        item.customizations.toppings[0].img
      ) {
        cardImage.src = item.customizations.toppings[0].img;
      }

      addToCart(item, quantity, customizations);
    } else if (button.classList.contains("custom-btn")) {
      const type = button.dataset.type;
      const value = button.dataset.value;
      const parent = button.parentElement;
      parent
        .querySelectorAll(`.custom-btn[data-type="${type}"]`)
        .forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");

      // Update price display for slice customization
      if (type === "slice") {
        const itemId = parseInt(
          card.querySelector(".add-to-cart-btn").dataset.itemId,
        );
        const item = menuItems.find((i) => i.id === itemId);
        const priceElement = document.getElementById(`price-${itemId}`);

        if (
          item &&
          item.customizations &&
          item.customizations.slice &&
          priceElement
        ) {
          const sliceOption = item.customizations.slice.find(
            (option) => option.name === value,
          );
          if (sliceOption) {
            const newPrice = item.price + sliceOption.price;
            priceElement.textContent = `$${newPrice.toFixed(2)}`;
          }
        }
      }
    } else if (button.classList.contains("allergens-btn")) {
      const item = menuItems.find((i) => i.id == button.dataset.itemId);
      const allergensList =
        item.allergens.length > 0
          ? item.allergens.join(", ")
          : "No common allergens listed.";
      showModal(
        "Allergen Information",
        `Contains: ${allergensList}`,
        '<button class="modal-close-btn bg-amber-800 text-white font-bold py-2 px-8 rounded-full touch-target">OK</button>',
      );
    } else if (button.classList.contains("customize-btn")) {
      const item = menuItems.find((i) => i.id == button.dataset.itemId);
      let modalBody = '<div class="space-y-2 text-left">';
      if (item.customizations && item.customizations.toppings) {
        item.customizations.toppings.forEach((topping) => {
          modalBody += `<label class="flex items-center space-x-3">
                                        <input type="checkbox" class="topping-checkbox h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500" data-name="${topping.name}" data-price="${topping.price}">
                                        <span>${topping.name} (+$${topping.price.toFixed(2)})</span>
                                     </label>`;
        });
      }
      modalBody += "</div>";
      const actions = `<button class="modal-close-btn bg-gray-500 text-white font-bold py-2 px-6 rounded-full touch-target">Cancel</button>
                                 <button id="save-customizations-btn" data-item-id="${item.id}" class="bg-amber-800 text-white font-bold py-2 px-6 rounded-full touch-target">Add to Cart</button>`;
      showModal(`Customize ${item.name}`, modalBody, actions);
    }
  });

  // Modal event listener
  modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-close-btn")) {
      hideModal();
    } else if (e.target.id === "save-customizations-btn") {
      const itemId = parseInt(e.target.dataset.itemId);
      const item = menuItems.find((i) => i.id === itemId);
      const quantity = 1;
      const customizations = { toppings: [] };

      document
        .querySelectorAll(".topping-checkbox:checked")
        .forEach((checkbox) => {
          customizations.toppings.push(checkbox.dataset.name);
        });

      addToCart(item, quantity, customizations);
      hideModal();
    }
  });

  // Cart event listener
  cartElement.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;

    // Prevent any default behavior and stop propagation for all cart buttons
    e.preventDefault();
    e.stopPropagation();

    if (button.closest("#close-cart")) {
      cleanupScrollButtons();
      cartElement.classList.add("cart-hidden");
      unlockBodyScroll();
    } else if (button.classList.contains("cart-quantity-change")) {
      const uniqueId = button.dataset.uniqueId;
      const change = parseInt(button.dataset.change);
      const itemInCart = cartItems.find((item) => item.uniqueId === uniqueId);
      if (itemInCart) {
        itemInCart.quantity += change;
        if (itemInCart.quantity <= 0) {
          cartItems = cartItems.filter((item) => item.uniqueId !== uniqueId);
        }
      }
      renderCart();
    } else if (button.classList.contains("cart-remove-item")) {
      const uniqueId = button.dataset.uniqueId;
      cartItems = cartItems.filter((item) => item.uniqueId !== uniqueId);
      renderCart();
    } else if (button.classList.contains("delivery-btn")) {
      document.getElementById("delivery-options").classList.remove("hidden");
      document.getElementById("pickup-options").classList.add("hidden");
      document.querySelectorAll(".delivery-btn, .pickup-btn").forEach((btn) => {
        btn.classList.remove("bg-amber-800", "text-white");
        btn.classList.add("bg-gray-200", "text-gray-800");
      });
      button.classList.remove("bg-gray-200", "text-gray-800");
      button.classList.add("bg-amber-800", "text-white");
    } else if (button.classList.contains("pickup-btn")) {
      document.getElementById("delivery-options").classList.add("hidden");
      document.getElementById("pickup-options").classList.remove("hidden");
      document.querySelectorAll(".delivery-btn, .pickup-btn").forEach((btn) => {
        btn.classList.remove("bg-amber-800", "text-white");
        btn.classList.add("bg-gray-200", "text-gray-800");
      });
      button.classList.remove("bg-gray-200", "text-gray-800");
      button.classList.add("bg-amber-800", "text-white");
    } else if (button.classList.contains("date-btn")) {
      selectedPickupDay = button.dataset.day;
      document.querySelectorAll(".date-btn").forEach((btn) => {
        btn.classList.remove("bg-amber-800", "text-white");
        btn.classList.add(
          "bg-white",
          "border-2",
          "border-amber-600",
          "text-amber-800",
        );
      });
      button.classList.add("bg-amber-800", "text-white");
      button.classList.remove(
        "bg-white",
        "border-2",
        "border-amber-600",
        "text-amber-800",
      );
      generateTimeSlotButtons(selectedPickupDay);
    } else if (button.classList.contains("time-slot-btn")) {
      document
        .querySelectorAll(".time-slot-btn")
        .forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
      selectedPickupTime = button.dataset.time;
    } else if (button.classList.contains("show-later-btn")) {
      generateTimeSlotButtons(selectedPickupDay, true);
    } else if (button.classList.contains("tip-btn")) {
      const tipValue = button.dataset.tip;
      document
        .querySelectorAll(".tip-btn")
        .forEach((b) => b.classList.remove("selected"));
      button.classList.add("selected");
      const customTipContainer = document.getElementById(
        "custom-tip-container",
      );
      const customTipInput = document.getElementById("custom-tip-input");
      if (tipValue === "custom") {
        customTipContainer.classList.remove("hidden");
        tipInfo = {
          type: "fixed",
          value: parseFloat(customTipInput.value) || 0,
          isCustom: true,
        };
      } else {
        customTipContainer.classList.add("hidden");
        customTipInput.value = "";
        tipInfo = {
          type: "percent",
          value: parseInt(tipValue),
          isCustom: false,
        };
      }
      updateCartTotals();
    } else if (button.classList.contains("checkout-continue-btn")) {
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      if (subtotal > APP_CONFIG.MAX_ORDER_AMOUNT) {
        showModal(
          "Order Limit Exceeded",
          `Our max online order amount is $${APP_CONFIG.MAX_ORDER_AMOUNT} before taxes & tips. Please call us at <a href="tel:${CONTACT_INFO.phone}" class="text-amber-800 font-bold hover:underline">${CONTACT_INFO.phone}</a> to place a larger order.`,
          '<button class="modal-close-btn bg-amber-800 text-white font-bold py-2 px-8 rounded-full touch-target">OK</button>',
        );
        return;
      }
      updatePaymentOrderSummary();
      document.getElementById("checkout-view").classList.add("hidden");
      document.getElementById("payment-view").classList.remove("hidden");
    } else if (button.classList.contains("back-to-checkout-btn")) {
      document.getElementById("checkout-view").classList.remove("hidden");
      document.getElementById("payment-view").classList.add("hidden");
    } else if (button.classList.contains("payment-btn")) {
      showModal(
        "Online Ordering",
        "Our full online ordering system is launching soon! Please call us or visit in person to place an order.",
        '<button class="modal-close-btn bg-amber-800 text-white font-bold py-2 px-8 rounded-full touch-target">OK</button>',
      );
    } else if (button.classList.contains("express-payment-btn")) {
      showModal(
        "Express Payment",
        "Express payment options are coming soon! Please use the regular checkout for now.",
        '<button class="modal-close-btn bg-amber-800 text-white font-bold py-2 px-8 rounded-full touch-target">OK</button>',
      );
    } else if (
      button.id === "continue-shopping-btn" ||
      button.id === "continue-shopping-empty"
    ) {
      cleanupScrollButtons();
      cartElement.classList.add("cart-hidden");
      unlockBodyScroll();
      // Scroll to menu section
      document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
    } else if (button.id === "apply-promo-btn") {
      const promoInput = document.getElementById("promo-code-input");
      const promoMessage = document.getElementById("promo-message");
      const promoCode = promoInput.value.trim().toUpperCase();

      // Simple promo code validation (you can expand this)
      const validPromoCodes = {
        WELCOME10: {
          type: "percent",
          value: 10,
          message: "10% off your order!",
        },
        FIRST5: { type: "fixed", value: 5, message: "$5 off your order!" },
        STUDENT: {
          type: "percent",
          value: 15,
          message: "15% student discount!",
        },
      };

      if (promoCode && validPromoCodes[promoCode]) {
        window.appliedPromo = validPromoCodes[promoCode];
        promoMessage.textContent = validPromoCodes[promoCode].message;
        promoMessage.className = "mt-2 text-sm text-green-600 font-medium";
        promoMessage.classList.remove("hidden");
        promoInput.disabled = true;
        button.textContent = "Applied";
        button.disabled = true;
        button.classList.add("bg-green-600", "hover:bg-green-600");
        button.classList.remove("bg-amber-800", "hover:bg-amber-900");
      } else if (promoCode) {
        promoMessage.textContent = "Invalid promo code. Please try again.";
        promoMessage.className = "mt-2 text-sm text-red-600 font-medium";
        promoMessage.classList.remove("hidden");
      } else {
        promoMessage.textContent = "Please enter a promo code.";
        promoMessage.className = "mt-2 text-sm text-gray-600 font-medium";
        promoMessage.classList.remove("hidden");
      }

      updateCartTotals();
    }
  });

  // Cart input event listener
  cartElement.addEventListener("input", (e) => {
    if (e.target.id === "custom-tip-input") {
      const value = parseFloat(e.target.value) || 0;
      tipInfo = {
        type: "percent",
        value: value >= APP_CONFIG.MIN_TIP_PERCENTAGE ? value : 0,
        isCustom: true,
      };
      updateCartTotals();
    }
  });

  // Filter container event listener
  filterContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-btn")) {
      currentFilter = e.target.dataset.category;
      document
        .querySelectorAll(".filter-btn")
        .forEach((btn) => btn.classList.remove("selected"));
      e.target.classList.add("selected");
      renderMenuItems();
    }
  });

  // Search bar event listener
  searchBar.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredItems = menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm),
    );
    renderMenuItems(filteredItems);
  });

  // Floating cart button event listener
  floatingCartBtn.addEventListener("click", () => {
    cartElement.classList.remove("cart-hidden");
    lockBodyScroll();
  });

  // Header cart button event listeners
  const headerCartBtn = document.getElementById("header-cart-btn");
  const mobileCartBtn = document.getElementById("mobile-cart-btn");

  if (headerCartBtn) {
    headerCartBtn.addEventListener("click", () => {
      cartElement.classList.remove("cart-hidden");
      lockBodyScroll();
    });
  }

  if (mobileCartBtn) {
    mobileCartBtn.addEventListener("click", () => {
      cartElement.classList.remove("cart-hidden");
      lockBodyScroll();
      // Close mobile menu
      mobileMenu.classList.add("mobile-menu-hidden");
      mobileMenu.classList.remove("mobile-menu-visible");
    });
  }

  // Catering form event listener
  document.getElementById("catering-form").addEventListener("submit", (e) => {
    e.preventDefault();
    showModal(
      "Thank You!",
      "Your catering inquiry has been submitted. We'll be in touch with you soon!",
      '<button class="modal-close-btn bg-amber-800 text-white font-bold py-2 px-8 rounded-full touch-target">OK</button>',
    );
    e.target.reset();
  });

  // Initialize the application
  renderMenuFilters();
  renderMenuItems();
  renderCart();
  lucide.createIcons();
});
