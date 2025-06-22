// Main Application Script for Bread N' Brew

// Application State
let cartItems = [];
let selectedPickupDay = "today";
let selectedPickupTime = "";
let currentFilter = "All";
let tipInfo = { type: "percent", value: 0 };
let toastTimer;

// Global promo system
window.appliedPromo = null;

// DOM Elements
const menuGrid = document.getElementById("menu-grid");
const featuredGrid = document.getElementById("featured-grid");
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

// Cart Management Functions
function openCart() {
  if (!cartElement) return;

  const backdrop = document.getElementById("cart-backdrop");
  cartElement.classList.remove("cart-hidden");
  if (backdrop) {
    backdrop.classList.add("visible");
  }
  document.body.style.overflow = "hidden";
}

function closeCart() {
  if (!cartElement) return;

  const backdrop = document.getElementById("cart-backdrop");
  cartElement.classList.add("cart-hidden");
  if (backdrop) {
    backdrop.classList.remove("visible");
  }
  document.body.style.overflow = "";
}

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

  const nowButton = document.createElement("button");
  nowButton.className =
    "time-slot-btn bg-white border-2 border-amber-600 text-amber-800 px-4 py-2 rounded-full font-semibold touch-target";
  nowButton.textContent = "ASAP";
  nowButton.dataset.time = "ASAP";
  timeSlotContainer.appendChild(nowButton);
  slotsGenerated++;

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
    if (!showAll && slotsGenerated >= APP_CONFIG.MAX_INITIAL_TIME_SLOTS) {
      break;
    }
  }

  if (moreSlotsAvailable && laterButtonContainer) {
    const laterButton = document.createElement("button");
    laterButton.className =
      "bg-amber-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-amber-700 transition touch-target";
    laterButton.textContent = "More Times";
    laterButton.addEventListener("click", () => {
      generateTimeSlotButtons(day, true);
      laterButton.style.display = "none";
    });
    laterButtonContainer.appendChild(laterButton);
  }
}

function createFeaturedItemCard(item) {
  const card = document.createElement("div");
  card.className =
    "featured-item-card bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform flex flex-col h-full";

  card.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="menu-item-img w-full h-48 sm:h-56">
        <div class="p-4 sm:p-6 flex flex-col flex-grow">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg sm:text-xl font-display">${item.name}</h3>
                <span class="text-lg sm:text-xl font-bold text-amber-700">$${item.price.toFixed(2)}</span>
            </div>
            <p class="text-gray-600 text-sm sm:text-base mb-3">${item.description}</p>
            <div class="flex-grow"></div>
            <div class="mt-4 text-center">
                <span class="text-sm text-gray-500 font-medium">Available in Full Menu</span>
            </div>
        </div>
    `;

  return card;
}

function createMenuItemCard(item) {
  const card = document.createElement("div");
  card.className =
    "bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform flex flex-col h-full";

  let customizationOptions = "";
  if (item.customizations && item.customizations.slice) {
    customizationOptions += `
            <div class="flex gap-2 mt-2">
                ${item.customizations.slice
                  .map(
                    (option, index) =>
                      `<button class="custom-btn px-3 py-1 border border-forest-green text-forest-green rounded-full text-sm touch-target ${index === 0 ? "selected" : ""}" data-type="slice" data-value="${option.name}">${option.name} ($${(item.price + option.price).toFixed(2)})</button>`,
                  )
                  .join("")}
            </div>
        `;
  }

  const quantityButtons = `
        <div class="flex items-center justify-between gap-3 mt-4">
            <div class="quantity-controls">
                <button class="quantity-btn touch-target" data-item-id="${item.id}" data-change="-1">−</button>
                <input type="number" id="quantity-${item.id}" value="1" min="1" max="${APP_CONFIG.MAX_QUANTITY_PER_ITEM}" class="quantity-input">
                <button class="quantity-btn touch-target" data-item-id="${item.id}" data-change="1">+</button>
            </div>
            <button class="customize-btn touch-target" data-item-id="${item.id}">Customize</button>
        </div>
    `;

  card.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="menu-item-img w-full h-48 sm:h-56">
        <div class="p-4 sm:p-6 flex flex-col flex-grow">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg sm:text-xl font-display">${item.name}</h3>
                <span id="price-${item.id}" class="text-lg sm:text-xl font-bold text-amber-700">$${item.price.toFixed(2)}</span>
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

function renderFeaturedItems() {
  if (!featuredGrid) return;

  featuredGrid.innerHTML = "";
  const featuredItems = menuItems.filter((item) => item.featured);

  featuredItems.forEach((item) => {
    const card = createFeaturedItemCard(item);
    featuredGrid.appendChild(card);
  });
}

function renderMenuItems(items = menuItems) {
  if (!menuGrid) return;

  menuGrid.innerHTML = "";

  if (currentFilter === "All") {
    const categoryOrder = [
      "Pastries",
      "Breads",
      "Coffee",
      "Sweets",
      "Gelato",
      "Ice Cream",
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

function renderMenuFilters() {
  if (!filterContainer) return;

  const categories = [
    "All",
    ...new Set(menuItems.map((item) => item.category)),
  ];
  filterContainer.innerHTML = "";

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = `filter-btn ${
      category === currentFilter ? "selected" : ""
    } bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-full font-medium hover:border-forest-green hover:text-forest-green transition touch-target`;
    button.textContent = category;
    button.dataset.category = category;
    filterContainer.appendChild(button);
  });
}

function renderCart() {
  updateFloatingCartButton();
  if (!cartElement) return;

  if (cartItems.length === 0) {
    cartElement.innerHTML = `
      <div class="cart-header flex items-center justify-between p-4 sm:p-6 border-b-2 border-amber-700 bg-gradient-to-r from-amber-50 to-amber-100">
        <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-gray-900">Your Cart</h2>
        <button id="close-cart" class="text-gray-600 hover:text-gray-800 p-2 hover:bg-white rounded-full touch-target transition-colors">
          <i data-lucide="x" class="w-6 h-6"></i>
        </button>
      </div>
      <div class="flex-1 flex items-center justify-center p-8 bg-white">
        <div class="text-center">
          <i data-lucide="shopping-bag" class="w-16 h-16 text-gray-300 mx-auto mb-4"></i>
          <h3 class="text-xl font-bold text-gray-600 mb-2">Your cart is empty</h3>
          <p class="text-gray-500 mb-6">Add some delicious items to get started!</p>
          <button id="continue-shopping-empty" class="bg-amber-800 text-white font-bold py-3 px-6 rounded-full hover:bg-amber-900 transition touch-target">
            Continue Shopping
          </button>
        </div>
      </div>
    `;
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
    return;
  }

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.06625; // NJ tax rate
  const total = subtotal + tax;

  // Cart with items
  cartElement.innerHTML = `
    <div class="cart-header flex items-center justify-between p-4 sm:p-6 border-b-2 border-amber-700">
      <h2 class="text-xl sm:text-2xl font-bold font-display text-gray-900">Your Cart (${cartItems.length})</h2>
      <button id="close-cart" class="text-gray-600 hover:text-gray-800 p-2 hover:bg-white rounded-full touch-target">
        <i data-lucide="x" class="w-6 h-6"></i>
      </button>
    </div>
    <div class="cart-items-container flex-1 p-4 overflow-y-auto">
      ${cartItems
        .map(
          (item) => `
        <div class="cart-item-card mb-4 p-4 border rounded-lg bg-white">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-semibold text-gray-900">${item.name}</h4>
            <button class="remove-item-btn text-red-500 hover:text-red-700 p-1" data-unique-id="${item.uniqueId}">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
          <p class="text-sm text-gray-600 mb-2">${item.description}</p>
          ${
            item.customizations && Object.keys(item.customizations).length > 0
              ? `
            <div class="text-xs text-gray-500 mb-2">
              ${Object.entries(item.customizations)
                .map(([key, value]) => {
                  if (
                    key === "toppings" &&
                    Array.isArray(value) &&
                    value.length > 0
                  ) {
                    return `Toppings: ${value.join(", ")}`;
                  } else if (key === "test" && value) {
                    return `Test: ${value}`;
                  }
                  return "";
                })
                .filter(Boolean)
                .join(" • ")}
            </div>
          `
              : ""
          }
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <button class="quantity-btn-cart bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600" data-unique-id="${item.uniqueId}" data-change="-1">−</button>
              <span class="font-semibold w-8 text-center">${item.quantity}</span>
              <button class="quantity-btn-cart bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-green-600" data-unique-id="${item.uniqueId}" data-change="1">+</button>
            </div>
            <p class="text-amber-700 font-bold">$${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
    <div class="cart-footer p-4 sm:p-6 border-t-2 border-amber-700 bg-gray-50">
      <div class="space-y-2 mb-4">
        <div class="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span>Tax:</span>
          <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total:</span>
          <span class="text-amber-700">$${total.toFixed(2)}</span>
        </div>
      </div>
      <div class="space-y-3">
        <button id="continue-shopping" class="w-full bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-full hover:bg-gray-300 transition touch-target">
          Continue Shopping
        </button>
        <button id="checkout-btn" class="w-full bg-amber-700 text-white font-semibold py-3 px-6 rounded-full hover:bg-amber-800 transition touch-target">
          Proceed to Checkout
        </button>
      </div>
    </div>
  `;

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function updateFloatingCartButton() {
  if (!floatingCartBtn || !cartItemCount) return;

  const totalItems = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0,
  );
  cartItemCount.textContent = totalItems;

  if (totalItems > 0) {
    floatingCartBtn.classList.add("visible");
  } else {
    floatingCartBtn.classList.remove("visible");
  }
}

function addToCart(item, quantity = 1, customizations = {}) {
  const cartItem = {
    ...item,
    quantity,
    customizations,
    uniqueId: Date.now() + Math.random(),
  };

  cartItems.push(cartItem);
  renderCart();
  updateFloatingCartButton();

  // Show toast
  if (toastWrapper && toastMessage) {
    toastMessage.textContent = `Added ${item.name} to cart!`;
    toastWrapper.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastWrapper.classList.remove("visible");
    }, 3000);
  }
}

function removeFromCart(uniqueId) {
  cartItems = cartItems.filter((item) => item.uniqueId !== uniqueId);
  renderCart();
  updateFloatingCartButton();
}

function updateCartItemQuantity(uniqueId, change) {
  const item = cartItems.find((item) => item.uniqueId === uniqueId);
  if (item) {
    item.quantity = Math.max(1, item.quantity + change);
    renderCart();
    updateFloatingCartButton();
  }
}

function showCheckoutModal() {
  if (cartItems.length === 0) return;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.06625;
  const total = subtotal + tax;

  const modalBody = `
    <div class="space-y-4 text-left">
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="font-semibold mb-3">Order Summary</h4>
        <div class="space-y-2 text-sm">
          ${cartItems
            .map(
              (item) => `
            <div class="flex justify-between">
              <span>${item.name} x${item.quantity}</span>
              <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `,
            )
            .join("")}
          <hr class="my-2">
          <div class="flex justify-between">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div class="flex justify-between">
            <span>Tax:</span>
            <span>$${tax.toFixed(2)}</span>
          </div>
          <div class="flex justify-between font-bold">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <form id="checkout-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input type="text" name="name" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-amber-700 focus:ring-1 focus:ring-amber-700">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input type="tel" name="phone" required class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-amber-700 focus:ring-1 focus:ring-amber-700">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" name="email" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-amber-700 focus:ring-1 focus:ring-amber-700">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Pickup Time</label>
          <select name="pickupTime" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-amber-700 focus:ring-1 focus:ring-amber-700">
            <option value="asap">As soon as possible (15-20 min)</option>
            <option value="30min">30 minutes</option>
            <option value="1hour">1 hour</option>
            <option value="2hours">2 hours</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
          <textarea name="instructions" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-amber-700 focus:ring-1 focus:ring-amber-700" placeholder="Any special requests or dietary considerations..."></textarea>
        </div>
      </form>

      <div class="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
        <strong>Pickup Only:</strong> Please pay in-store when you arrive. We accept cash, card, and contactless payments.
      </div>
    </div>
  `;

  const actions = `
    <button type="button" class="modal-close-btn bg-gray-500 text-white font-semibold py-3 px-6 rounded-full touch-target hover:bg-gray-600 transition">Cancel</button>
    <button type="button" id="confirm-order-btn" class="bg-amber-700 text-white font-semibold py-3 px-6 rounded-full touch-target hover:bg-amber-800 transition">Confirm Order</button>
  `;

  showModal("Checkout", modalBody, actions);
}

function showModal(title, body, actions) {
  if (!modal) return;

  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = body;
  document.getElementById("modal-actions").innerHTML = actions;
  modal.classList.remove("hidden");
}

function hideModal() {
  if (!modal) return;
  modal.classList.add("hidden");
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu toggle
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("mobile-menu-hidden");
      mobileMenu.classList.toggle("mobile-menu-visible");
    });

    mobileMenu.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        mobileMenu.classList.add("mobile-menu-hidden");
        mobileMenu.classList.remove("mobile-menu-visible");
      }
    });
  }

  // Cart event listeners
  if (cartElement) {
    cartElement.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (!button) return;

      if (button.id === "close-cart") {
        closeCart();
      } else if (
        button.id === "continue-shopping-empty" ||
        button.id === "continue-shopping"
      ) {
        closeCart();
      } else if (button.id === "checkout-btn") {
        showCheckoutModal();
      } else if (button.classList.contains("remove-item-btn")) {
        const uniqueId = button.dataset.uniqueId;
        removeFromCart(uniqueId);
      } else if (button.classList.contains("quantity-btn-cart")) {
        const uniqueId = button.dataset.uniqueId;
        const change = parseInt(button.dataset.change);
        updateCartItemQuantity(uniqueId, change);
      }
    });
  }

  // Menu grid event listener
  if (menuGrid) {
    menuGrid.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (!button) return;

      const card = e.target.closest(".bg-white");

      if (button.classList.contains("quantity-btn")) {
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

        addToCart(item, quantity, customizations);
      } else if (button.classList.contains("customize-btn")) {
        const item = menuItems.find((i) => i.id == button.dataset.itemId);
        let modalBody = '<div class="space-y-4 text-left">';

        // Add test options if they exist
        if (item.customizations && item.customizations.test) {
          modalBody +=
            '<div class="border-b border-gray-200 pb-4"><h4 class="font-semibold text-gray-900 mb-3">Test Options:</h4>';
          item.customizations.test.forEach((option, index) => {
            modalBody += `<label class="flex items-center space-x-3 mb-2">
                            <input type="radio" name="test-option" class="test-radio h-5 w-5 text-amber-600 focus:ring-amber-500" data-value="${option}" ${index === 0 ? "checked" : ""}>
                            <span>${option} (+$0.00)</span>
                         </label>`;
          });
          modalBody += "</div>";
        }

        // Add toppings if they exist
        if (item.customizations && item.customizations.toppings) {
          modalBody +=
            '<div><h4 class="font-semibold text-gray-900 mb-3">Add Toppings:</h4>';
          item.customizations.toppings.forEach((topping) => {
            modalBody += `<label class="flex items-center space-x-3 mb-2">
                            <input type="checkbox" class="topping-checkbox h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500" data-name="${topping.name}" data-price="${topping.price}">
                            <span>${topping.name} (+$${topping.price.toFixed(2)})</span>
                         </label>`;
          });
          modalBody += "</div>";
        }

        modalBody += "</div>";
        const actions = `<button class="modal-close-btn bg-gray-500 text-white font-bold py-2 px-6 rounded-full touch-target">Cancel</button>
                                   <button id="save-customizations-btn" data-item-id="${item.id}" class="bg-amber-800 text-white font-bold py-2 px-6 rounded-full touch-target">Add to Cart</button>`;
        showModal(`Customize ${item.name}`, modalBody, actions);
      } else if (button.classList.contains("allergens-btn")) {
        const itemId = parseInt(button.dataset.itemId);
        const item = menuItems.find((i) => i.id === itemId);
        const allergensList =
          item.allergens && item.allergens.length > 0
            ? item.allergens.join(", ")
            : "No known allergens";
        showModal(
          `${item.name} - Allergen Information`,
          `<p class="text-gray-700"><strong>Contains:</strong> ${allergensList}</p>`,
          '<button class="modal-close-btn bg-amber-800 text-white font-bold py-2 px-8 rounded-full touch-target">OK</button>',
        );
      }
    });
  }

  // Filter container event listener
  if (filterContainer) {
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
  }

  // Search functionality
  if (searchBar) {
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
  }

  // Floating cart button event listener
  if (floatingCartBtn) {
    floatingCartBtn.addEventListener("click", () => {
      openCart();
    });
  }

  // Header cart button event listeners
  const headerCartBtn = document.getElementById("header-cart-btn");
  const mobileCartBtn = document.getElementById("mobile-cart-btn");

  if (headerCartBtn) {
    headerCartBtn.addEventListener("click", () => {
      openCart();
    });
  }

  if (mobileCartBtn) {
    mobileCartBtn.addEventListener("click", () => {
      openCart();
      if (mobileMenu) {
        mobileMenu.classList.add("mobile-menu-hidden");
        mobileMenu.classList.remove("mobile-menu-visible");
      }
    });
  }

  // Modal event listener
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-close-btn")) {
        hideModal();
      } else if (e.target.id === "save-customizations-btn") {
        const itemId = parseInt(e.target.dataset.itemId);
        const item = menuItems.find((i) => i.id === itemId);
        const quantity = 1;
        const customizations = { toppings: [] };

        // Get test option
        const selectedTest = document.querySelector(".test-radio:checked");
        if (selectedTest) {
          customizations.test = selectedTest.dataset.value;
        }

        // Get toppings
        document
          .querySelectorAll(".topping-checkbox:checked")
          .forEach((checkbox) => {
            customizations.toppings.push(checkbox.dataset.name);
          });

        addToCart(item, quantity, customizations);
        hideModal();
      } else if (e.target.id === "confirm-order-btn") {
        const form = document.getElementById("checkout-form");
        if (form && form.checkValidity()) {
          const formData = new FormData(form);
          const orderData = {
            name: formData.get("name"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            pickupTime: formData.get("pickupTime"),
            instructions: formData.get("instructions"),
            items: cartItems,
            timestamp: new Date().toLocaleString(),
          };

          console.log("Order submitted:", orderData);

          // Clear cart
          cartItems = [];
          renderCart();
          updateFloatingCartButton();

          // Show confirmation
          hideModal();
          showModal(
            "Order Confirmed!",
            `<div class="text-center">
              <div class="text-green-600 mb-4">
                <i data-lucide="check-circle" class="w-16 h-16 mx-auto mb-2"></i>
              </div>
              <p class="mb-4">Thank you <strong>${orderData.name}</strong>! Your order has been received.</p>
              <p class="text-sm text-gray-600 mb-4">We'll call you at <strong>${orderData.phone}</strong> when your order is ready for pickup.</p>
              <div class="bg-amber-50 p-3 rounded-lg text-sm">
                <strong>Estimated pickup time:</strong> ${orderData.pickupTime === "asap" ? "15-20 minutes" : orderData.pickupTime}
              </div>
            </div>`,
            '<button class="modal-close-btn bg-amber-700 text-white font-semibold py-3 px-8 rounded-full touch-target hover:bg-amber-800 transition">OK</button>',
          );

          // Re-create icons for the new modal content
          if (typeof lucide !== "undefined") {
            lucide.createIcons();
          }
        } else {
          form.reportValidity();
        }
      }
    });
  }

  // Catering form event listener
  const cateringForm = document.getElementById("catering-form");
  if (cateringForm) {
    cateringForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showModal(
        "Thank You!",
        "Your catering inquiry has been submitted. We'll be in touch with you soon!",
        '<button class="modal-close-btn bg-amber-700 text-white font-semibold py-3 px-8 rounded-full touch-target hover:bg-amber-800 transition">OK</button>',
      );
      e.target.reset();
    });
  }

  // Initialize the application
  console.log("Initializing application...", {
    featuredGrid,
    filterContainer,
    menuGrid,
  });

  if (featuredGrid) {
    console.log("Rendering featured items...");
    renderFeaturedItems();
  }

  if (filterContainer && menuGrid) {
    console.log("Rendering menu items...");
    renderMenuFilters();
    renderMenuItems();
  }

  renderCart();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
});
