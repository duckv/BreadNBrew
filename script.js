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
    cartElement.innerHTML = `
            <div class="flex items-center justify-between p-6 border-b-2 border-amber-100 bg-gradient-to-r from-amber-50 to-amber-100">
                <h2 class="text-2xl sm:text-3xl font-bold font-display text-gray-900">Your Cart</h2>
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
                    <p class="text-gray-500 text-base">Add some delicious items to get started!</p>
                </div>
            </div>
        `;
    lucide.createIcons();
    return;
  }

  const header = document.createElement("div");
  header.className =
    "flex items-center justify-between p-6 border-b-2 border-amber-100 bg-gradient-to-r from-amber-50 to-amber-100";
  header.innerHTML = `
        <div class="flex items-center gap-3">
            <h2 class="text-2xl sm:text-3xl font-bold font-display text-gray-900">Your Cart</h2>
            <span class="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-bold">${cartItems.length} item${cartItems.length !== 1 ? "s" : ""}</span>
        </div>
        <button id="close-cart" class="text-gray-600 hover:text-gray-800 p-2 hover:bg-white rounded-full touch-target transition-colors">
            <i data-lucide="x" class="w-6 h-6"></i>
        </button>
    `;

  const itemsContainer = document.createElement("div");
  itemsContainer.className =
    "cart-items-container bg-gradient-to-b from-gray-50 to-white";

  const itemsList = document.createElement("div");
  itemsList.className = "p-4 sm:p-6 space-y-6 min-h-full";

  if (cartItems.length > 0) {
    // Add debugging info
    const debugInfo = document.createElement("div");
    debugInfo.className =
      "text-center p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4";
    debugInfo.innerHTML = `<p class="text-blue-800 font-semibold">Cart has ${cartItems.length} item(s)</p>`;
    itemsList.appendChild(debugInfo);
  }

  cartItems.forEach((cartItem) => {
    const menuItem = menuItems.find((item) => item.id === cartItem.id);
    if (!menuItem) {
      console.log("Menu item not found for cart item:", cartItem);
      return;
    }

    const itemDiv = document.createElement("div");
    itemDiv.className =
      "flex gap-4 bg-white p-5 rounded-xl shadow-lg border-2 border-amber-200 hover:border-amber-300 transition-all duration-200 mb-2";

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
        customizationText = `<p class="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded-md mt-1 font-medium">${customs.join(", ")}</p>`;
      }
    }

    itemDiv.innerHTML = `
            <img src="${menuItem.img}" alt="${menuItem.name}" class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-gray-200">
            <div class="flex-1">
                <h4 class="font-bold text-base sm:text-lg text-gray-900 mb-1">${menuItem.name}</h4>
                ${customizationText}
                <p class="text-amber-800 font-bold text-base sm:text-lg mt-2">$${cartItem.price.toFixed(2)} each</p>
                <div class="flex items-center justify-between mt-3">
                    <div class="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1">
                        <button class="cart-quantity-change bg-amber-600 hover:bg-amber-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm touch-target transition-colors" data-unique-id="${cartItem.uniqueId}" data-change="-1">-</button>
                        <span class="w-8 text-center font-bold text-lg text-gray-900">${cartItem.quantity}</span>
                        <button class="cart-quantity-change bg-amber-600 hover:bg-amber-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm touch-target transition-colors" data-unique-id="${cartItem.uniqueId}" data-change="1">+</button>
                    </div>
                    <button class="cart-remove-item bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 p-2 rounded-full touch-target transition-colors" data-unique-id="${cartItem.uniqueId}">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
            <div class="text-right flex flex-col justify-center">
                <p class="font-bold text-xl text-amber-800 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">$${(cartItem.price * cartItem.quantity).toFixed(2)}</p>
            </div>
        `;

    itemsList.appendChild(itemDiv);
  });

  itemsContainer.appendChild(itemsList);

  const footer = document.createElement("div");
  footer.id = "cart-footer";
  footer.className =
    "cart-footer border-t-2 border-amber-200 bg-white shadow-lg";

  footer.innerHTML = `
        <div id="checkout-view" class="p-6 bg-white border-t-2 border-amber-100">
            <div class="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
                <h3 class="font-bold text-lg text-gray-900 mb-4">Order Summary</h3>
                <div class="space-y-3">
                    <div class="flex justify-between text-base font-medium text-gray-700">
                        <span>Subtotal:</span>
                        <span id="cart-subtotal" class="font-bold">$0.00</span>
                    </div>
                    <div class="flex justify-between text-base font-medium text-gray-700">
                        <span>Tax:</span>
                        <span id="cart-tax" class="font-bold">$0.00</span>
                    </div>
                    <div class="flex justify-between text-base font-medium text-gray-700">
                        <span>Tip:</span>
                        <span id="cart-tip" class="font-bold">$0.00</span>
                    </div>
                    <div class="border-t-2 border-amber-200 pt-3 mt-3">
                        <div class="flex justify-between font-bold text-xl text-gray-900">
                            <span>Total:</span>
                            <span id="cart-total" class="text-amber-800 bg-amber-50 px-3 py-1 rounded-lg">$0.00</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-6">
                <h4 class="font-bold font-display text-lg mb-3">Pickup or Delivery?</h4>
                <div class="flex gap-2 mb-4">
                    <button class="pickup-btn flex-1 bg-amber-800 text-white font-bold py-2 px-4 rounded-full hover:bg-amber-900 transition touch-target">Pickup</button>
                    <button class="delivery-btn flex-1 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300 transition touch-target">Delivery</button>
                </div>

                <div id="pickup-options" class="">
                    <div class="mb-4">
                        <h5 class="font-semibold mb-2">Pickup Day:</h5>
                        <div class="flex gap-2">
                            <button class="date-btn bg-amber-800 text-white px-4 py-2 rounded-full font-semibold touch-target" data-day="today">Today</button>
                            <button class="date-btn bg-white border-2 border-amber-600 text-amber-800 px-4 py-2 rounded-full font-semibold touch-target" data-day="tomorrow">Tomorrow</button>
                        </div>
                    </div>
                    <div class="mb-4">
                        <h5 class="font-semibold mb-2">Pickup Time:</h5>
                        <div id="time-slot-container" class="flex flex-wrap gap-2 mb-2">
                            <!-- Time slots will be generated by JS -->
                        </div>
                        <div id="later-button-container" class="text-center">
                            <!-- "Show more times" button will be added here if needed -->
                        </div>
                    </div>
                </div>

                <div id="delivery-options" class="hidden">
                    <p class="text-gray-600 text-sm">Delivery is not yet available. Please select pickup.</p>
                </div>
            </div>

            <div class="mb-6">
                <h4 class="font-bold font-display text-lg mb-3">Add a Tip</h4>
                <div class="flex flex-wrap gap-2 mb-3">
                    <button class="tip-btn bg-white border-2 border-amber-600 text-amber-800 px-4 py-2 rounded-full font-semibold touch-target" data-tip="15">15%</button>
                    <button class="tip-btn bg-white border-2 border-amber-600 text-amber-800 px-4 py-2 rounded-full font-semibold touch-target" data-tip="18">18%</button>
                    <button class="tip-btn bg-white border-2 border-amber-600 text-amber-800 px-4 py-2 rounded-full font-semibold touch-target" data-tip="20">20%</button>
                    <button class="tip-btn bg-white border-2 border-amber-600 text-amber-800 px-4 py-2 rounded-full font-semibold touch-target" data-tip="custom">Custom</button>
                </div>
                <div id="custom-tip-container" class="hidden">
                    <input type="number" id="custom-tip-input" placeholder="Enter tip %" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600" min="0" max="100">
                </div>
            </div>

            <button class="checkout-continue-btn w-full bg-green-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-green-700 transition text-xl touch-target shadow-lg border-2 border-green-500 mb-4">Continue to Payment</button>
        </div>

        <div id="payment-view" class="hidden p-4 sm:p-6">
            <h4 class="font-bold font-display text-xl mb-4">Select Payment</h4>
            <div class="space-y-3 mb-6">
                <button class="payment-btn w-full flex items-center justify-center p-3 border rounded-lg hover:bg-gray-100 touch-target">
                    <i data-lucide="credit-card" class="mr-2"></i> Debit/Credit Card
                </button>
                <button class="payment-btn w-full flex items-center justify-center p-3 border rounded-lg hover:bg-gray-100 touch-target">
                    <i data-lucide="smartphone" class="mr-2"></i> Apple/Google Pay
                </button>
            </div>
            <button class="back-to-checkout-btn w-full text-sm text-gray-600 hover:underline touch-target">Back to Order Options</button>
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

  if (!subtotalElement) return;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * APP_CONFIG.NJ_SALES_TAX_RATE;
  const tip =
    tipInfo.type === "percent"
      ? (subtotal * tipInfo.value) / 100
      : tipInfo.value;
  const total = subtotal + tax + tip;

  subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  taxElement.textContent = `$${tax.toFixed(2)}`;
  tipElement.textContent = `$${tip.toFixed(2)}`;
  totalElement.textContent = `$${total.toFixed(2)}`;
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
      cartElement.classList.add("cart-hidden");
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
          type: "percent",
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
  });

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
