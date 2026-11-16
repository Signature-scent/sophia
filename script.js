const phoneNumber = "2349070558715";
const STORAGE_KEY = "signature-scents-state";
const SESSION_KEY = "signature-scents-session";
const CART_STORAGE_KEY = "signature-scents-cart";
const DEFAULT_PRODUCTS = [
  { id: "3ml", name: "3ml Signature Scent", price: 1000, discount: 0, image: "Screenshot 2026-11-15 212050.png", family: "signature", size: "3ml" },
  { id: "6ml", name: "6ml Signature Scent", price: 2000, discount: 0, image: "Screenshot 2026-11-15 211433.png", family: "signature", size: "6ml" },
  { id: "10ml", name: "10ml Signature Scent", price: 4000, discount: 0, image: "Screenshot 2026-11-15 211910.png", family: "signature", size: "10ml" },
  { id: "france", name: "10ml France Oil", price: 5500, discount: 0, image: "Screenshot 2026-11-15 212840.png", family: "france", size: "10ml France" },
  { id: "20ml", name: "20ml Signature Scent", price: 8000, discount: 0, image: "Screenshot 2026-11-15 214117.png", family: "signature", size: "20ml" },
  { id: "30ml", name: "30ml Signature Scent", price: 12000, discount: 0, image: "Screenshot 2026-11-15 214117.png", family: "signature", size: "30ml" },
  { id: "50ml", name: "50ml Signature Scent", price: 15000, discount: 0, image: "Screenshot 2026-11-15 214117.png", family: "signature", size: "50ml" },
  { id: "100ml", name: "100ml Signature Scent", price: 30000, discount: 0, image: "Screenshot 2026-11-15 214117.png", family: "signature", size: "100ml" },
  { id: "body-mist", name: "Body Mist", price: 4500, discount: 0, image: "image.png", family: "mist", size: "Body Mist" },
];

const DEFAULT_COMBOS = [
  { id: "mini-duo", name: "Mini Scent Duo", description: "2 × 3ml Oils", price: 1500, discount: 0, image: "Screenshot 2026-11-15 214117.png" },
  { id: "scent-mist", name: "Scent and Mist", description: "6ml Oil + Body Mist", price: 6000, discount: 0, image: "Screenshot 2026-11-15 214117.png" },
  { id: "mini-glow", name: "Mini Glow Duo", description: "10ml Oil + Body Mist", price: 8000, discount: 0, image: "Screenshot 2026-11-15 214117.png" },
  { id: "full-scent", name: "Full Scent", description: "2 × 10ml Oils + Body Mist", price: 11500, discount: 0, image: "Screenshot 2026-11-15 214117.png" },
];

const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector("#site-navigation");
const productDialog = document.querySelector(".product-dialog");
const authDialog = document.getElementById("auth-dialog");
const ownerDialog = document.getElementById("owner-dialog");
const cartDialog = document.getElementById("cart-dialog");
const toast = document.getElementById("toast");
const cartButton = document.getElementById("cart-button");
const cartCount = document.getElementById("cart-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutButton = document.getElementById("checkout-button");
const accountButton = document.getElementById("account-button");
const ownerButton = document.getElementById("owner-button");
const logoutButton = document.getElementById("logout-button");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const ownerProductList = document.getElementById("owner-product-list");
const productForm = document.getElementById("product-form");
const productImageUpload = document.getElementById("product-image-upload");
const productImagePreview = document.getElementById("product-image-preview");
const productImageUrl = document.getElementById("product-image-url");
const resetProductFormButton = document.getElementById("reset-product-form");
const productsGrid = document.getElementById("products-grid");
const combosGrid = document.getElementById("combos-grid");
const detailImage = document.querySelector(".detail-image");
const detailTitle = document.querySelector("#detail-title");
const detailPrice = document.querySelector(".detail-price");
const detailDescription = document.querySelector(".detail-description");
const sizePicker = document.querySelector(".size-picker");
const sizeOptions = document.querySelector(".size-options");
const quantityInput = document.querySelector("#detail-quantity");

let selectedProduct = null;
let currentProductEditorId = null;
let toastTimer = null;
let cart = loadCart();

const appState = loadState();

function loadCart() {
  const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
  if (!Array.isArray(savedCart)) return [];

  return savedCart.filter((item) =>
    item &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    Number.isFinite(Number(item.price)) &&
    Number.isInteger(Number(item.quantity)) &&
    Number(item.quantity) > 0
  ).map((item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    image: item.image || "",
    quantity: Math.min(99, Number(item.quantity)),
  }));
}

function getInitialState() {
  return {
    currentUser: null,
    accounts: [{
      id: "owner",
      fullName: "Sophia",
      email: "owner@sophiafragrance.com",
      password: "admin123",
      role: "owner",
    }],
    products: DEFAULT_PRODUCTS.map((product) => ({ ...product })),
    combos: DEFAULT_COMBOS.map((combo) => ({ ...combo })),
  };
}

function loadState() {
  try {
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    const sessionState = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!savedState) {
      const initialState = getInitialState();
      if (sessionState && sessionState.email) {
        const existingUser = initialState.accounts.find((account) => account.email.toLowerCase() === sessionState.email.toLowerCase());
        initialState.currentUser = existingUser || null;
      }
      return initialState;
    }

    const nextState = {
      ...getInitialState(),
      ...savedState,
      accounts: Array.isArray(savedState.accounts) && savedState.accounts.length ? savedState.accounts : getInitialState().accounts,
      products: Array.isArray(savedState.products) && savedState.products.length ? savedState.products : getInitialState().products,
      combos: Array.isArray(savedState.combos) && savedState.combos.length ? savedState.combos : getInitialState().combos,
    };

    if (sessionState && sessionState.email) {
      nextState.currentUser = nextState.accounts.find((account) => account.email.toLowerCase() === sessionState.email.toLowerCase()) || null;
    }

    return nextState;
  } catch (error) {
    return getInitialState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  if (appState.currentUser) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: appState.currentUser.id, email: appState.currentUser.email }));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function formatMoney(value) {
  const number = Number(value) || 0;
  return `₦${number.toLocaleString()}`;
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function getDiscountedPrice(product) {
  const price = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;
  return Math.max(0, price - (price * discount / 100));
}

function closeNavigation() {
  if (!menuToggle || !siteNavigation) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  menuToggle.classList.remove("is-open");
  siteNavigation.classList.remove("open");
}

function updateAuthControls() {
  const user = appState.currentUser;
  if (!accountButton) return;

  if (user) {
    const firstName = user.fullName ? user.fullName.split(" ")[0] : "Account";
    accountButton.textContent = `Hi ${firstName}`;
  } else {
    accountButton.textContent = "Account";
  }

  if (ownerButton) {
    const ownerAccess = Boolean(user && user.role === "owner");
    ownerButton.classList.toggle("hidden", !ownerAccess);
  }

  if (logoutButton) {
    logoutButton.classList.toggle("hidden", !user);
  }
}

function openAuthDialog() {
  if (authDialog) authDialog.showModal();
}

function closeAuthDialog() {
  if (authDialog) authDialog.close();
}

function closeOwnerDialog() {
  if (ownerDialog) ownerDialog.close();
}

function ensureValidImageSource(source) {
  if (!source || source.trim() === "") {
    return "Screenshot 2026-11-15 214117.png";
  }
  return source;
}

function renderProducts() {
  if (!productsGrid) return;

  productsGrid.innerHTML = appState.products.map((product) => {
    const discounted = getDiscountedPrice(product);
    const hasDiscount = Number(product.discount) > 0;
    return `
      <article class="product-card" data-product-id="${product.id}" data-family="${product.family || "signature"}" data-size="${product.size || product.name}" data-image="${ensureValidImageSource(product.image)}">
        <button class="image-details-button" type="button" aria-label="View details for ${product.name}">
          <img src="${ensureValidImageSource(product.image)}" alt="${product.name}" loading="lazy">
        </button>
        <h3>${product.name}</h3>
        <div class="price-row">
          <div class="price">${formatMoney(discounted)}</div>
          ${hasDiscount ? `<div class="old-price">${formatMoney(product.price)}</div>` : ""}
        </div>
        <button class="details-btn" type="button">View details</button>
        <div class="product-actions">
          <button class="order-btn add-to-cart-btn" type="button" data-product-id="${product.id}" data-product="${product.name}" data-price="${discounted}">Add to cart</button>
          <button class="order-btn buy-now-btn" type="button" data-product-id="${product.id}" data-product="${product.name}" data-price="${discounted}">Order now</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderCombos() {
  if (!combosGrid) return;

  combosGrid.innerHTML = appState.combos.map((combo) => {
    const discounted = getDiscountedPrice(combo);
    const hasDiscount = Number(combo.discount) > 0;
    return `
      <article class="combo-card" data-product-id="${combo.id}" data-family="combo">
        <button class="image-details-button" type="button" aria-label="View details for ${combo.name}">
          <img src="${ensureValidImageSource(combo.image)}" alt="${combo.name}">
        </button>
        <div class="combo-info">
          <h3>${combo.name}</h3>
          <p>${combo.description}</p>
          <div class="price-row">
            <div class="price">${formatMoney(discounted)}</div>
            ${hasDiscount ? `<div class="old-price">${formatMoney(combo.price)}</div>` : ""}
          </div>
          <div class="product-actions">
            <button class="order-btn add-to-cart-btn" type="button" data-product-id="${combo.id}" data-product="${combo.name}" data-price="${discounted}">Add to cart</button>
            <button class="order-btn buy-now-btn" type="button" data-product-id="${combo.id}" data-product="${combo.name}" data-price="${discounted}">Order now</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderOwnerList() {
  if (!ownerProductList) return;

  ownerProductList.innerHTML = appState.products.map((product) => `
    <div class="owner-product-item">
      <img src="${ensureValidImageSource(product.image)}" alt="${product.name}">
      <div class="owner-product-meta">
        <strong>${product.name}</strong>
        <span>${formatMoney(getDiscountedPrice(product))}</span>
      </div>
      <div class="owner-item-actions">
        <button class="tiny-btn edit-product" data-id="${product.id}" type="button">Edit</button>
        <button class="tiny-btn danger delete-product" data-id="${product.id}" type="button">Remove</button>
      </div>
    </div>
  `).join("");
}

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function renderCart() {
  if (!cartItems) return;

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  if (cartCount) cartCount.textContent = String(itemCount);
  if (cartButton) cartButton.setAttribute("aria-label", `Open shopping cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`);
  if (cartTotal) cartTotal.textContent = formatMoney(subtotal);
  if (checkoutButton) checkoutButton.disabled = cart.length === 0;

  cartItems.replaceChildren();
  if (!cart.length) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "cart-empty";
    emptyMessage.textContent = "Your cart is empty. Add something lovely from the collection.";
    cartItems.append(emptyMessage);
    return;
  }

  cart.forEach((item) => {
    const row = document.createElement("article");
    row.className = "cart-item";

    const image = document.createElement("img");
    image.className = "cart-item-image";
    image.src = item.image || "Screenshot 2026-11-15 214117.png";
    image.alt = "";

    const details = document.createElement("div");
    details.className = "cart-item-details";
    const name = document.createElement("strong");
    name.textContent = item.name;
    const price = document.createElement("span");
    price.textContent = `${formatMoney(item.price)} each`;
    const lineTotal = document.createElement("span");
    lineTotal.className = "cart-item-total";
    lineTotal.textContent = formatMoney(item.price * item.quantity);
    details.append(name, price, lineTotal);

    const controls = document.createElement("div");
    controls.className = "cart-item-controls";
    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.className = "quantity-change";
    decrease.dataset.cartAction = "decrease";
    decrease.dataset.cartId = item.id;
    decrease.setAttribute("aria-label", `Decrease ${item.name} quantity`);
    decrease.textContent = "−";
    const quantity = document.createElement("span");
    quantity.className = "cart-item-quantity";
    quantity.textContent = String(item.quantity);
    const increase = document.createElement("button");
    increase.type = "button";
    increase.className = "quantity-change";
    increase.dataset.cartAction = "increase";
    increase.dataset.cartId = item.id;
    increase.setAttribute("aria-label", `Increase ${item.name} quantity`);
    increase.textContent = "+";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-remove";
    remove.dataset.cartAction = "remove";
    remove.dataset.cartId = item.id;
    remove.setAttribute("aria-label", `Remove ${item.name} from cart`);
    remove.textContent = "Remove";
    controls.append(decrease, quantity, increase, remove);

    row.append(image, details, controls);
    cartItems.append(row);
  });
}

function addToCart(product, quantity = 1) {
  if (!product || !product.cartId) return;

  const existingItem = cart.find((item) => item.id === product.cartId);
  if (existingItem) {
    existingItem.quantity = Math.min(99, existingItem.quantity + quantity);
  } else {
    cart.push({
      id: product.cartId,
      name: product.name,
      price: Number(product.price) || 0,
      image: product.image || "",
      quantity: Math.min(99, Math.max(1, quantity)),
    });
  }

  saveCart();
  renderCart();
  showToast(`${product.name} added to cart.`);
}

function openWhatsAppCartOrder() {
  if (!cart.length) {
    showToast("Add at least one item to your cart first.");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message = [
    "Hello Sophia!",
    "",
    "I would like to order:",
    ...cart.map((item) => `• ${item.name} × ${item.quantity} — ${formatMoney(item.price * item.quantity)}`),
    "",
    `Subtotal: ${formatMoney(total)}`,
    "",
    "My name:",
    "My location:",
    "",
    "Thank you!",
  ].join("\n");
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function openWhatsAppOrder(product) {
  const message = [
    "Hello Sophia!",
    "",
    "I would like to order:",
    `${product.name} × 1 — ${formatMoney(product.price)}`,
    "",
    `Subtotal: ${formatMoney(product.price)}`,
    "",
    "My name:",
    "My location:",
    "",
    "Thank you!",
  ].join("\n");
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function getProductFromCard(card) {
  const orderButton = card.querySelector(".order-btn");
  const image = card.querySelector("img");
  const name = orderButton?.dataset.product || card.dataset.product || "Product";
  const productId = card.dataset.productId || orderButton?.dataset.productId || "";
  const isCombo = card.classList.contains("combo-card");
  const product = {
    name,
    price: Number(orderButton?.dataset.price || card.dataset.price || 0),
    cartId: `${isCombo ? "combo" : "product"}:${productId}`,
    size: card.dataset.size || card.querySelector("h3")?.textContent?.trim() || "Standard",
    image: image?.src || card.dataset.image || "Screenshot 2026-11-15 214117.png",
    imageAlt: image?.alt || name,
    description: card.querySelector(".combo-info p")?.textContent?.trim() || "",
    isMist: (card.dataset.family || "").toLowerCase() === "mist",
    family: card.dataset.family || "signature",
  };
  return product;
}

function showProductDetails(product) {
  selectedProduct = product;
  detailImage.src = product.image;
  detailImage.alt = product.imageAlt || product.name;
  detailTitle.textContent = product.name;
  detailPrice.textContent = formatMoney(product.price);
  detailDescription.textContent = product.description || "Choose your preferred size and add it to your cart.";
  quantityInput.value = "1";
  sizeOptions.replaceChildren();
  sizePicker.hidden = product.isMist || product.family === "france" || product.family === "combo";

  if (!product.isMist && product.family !== "france" && product.family !== "combo") {
    const familyProducts = appState.products.filter((item) => (item.family || "signature") === (product.family || "signature"));

    familyProducts.forEach((item) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "size-option";
      option.textContent = item.size || item.name;
      option.setAttribute("aria-pressed", String(item.name === product.name));
      option.addEventListener("click", () => showProductDetails({
        cartId: `product:${item.id}`,
        name: item.name,
        price: getDiscountedPrice(item),
        size: item.size || item.name,
        image: item.image,
        imageAlt: item.name,
        isMist: false,
        family: item.family || "signature",
      }));
      sizeOptions.append(option);
    });
  }

  if (productDialog) productDialog.showModal();
}

function resetProductForm() {
  currentProductEditorId = null;
  if (productForm) productForm.reset();
  if (productImagePreview) {
    productImagePreview.hidden = true;
    productImagePreview.removeAttribute("src");
  }
  if (productImageUrl) productImageUrl.value = "";
  if (productImageUpload) productImageUpload.value = "";
}

function editProductInForm(productId) {
  const product = appState.products.find((item) => item.id === productId);
  if (!product) return;

  currentProductEditorId = productId;
  document.getElementById("product-name").value = product.name;
  document.getElementById("product-price").value = product.price;
  document.getElementById("product-discount").value = product.discount || 0;
  document.getElementById("product-image-url").value = product.image || "";

  if (product.image) {
    productImagePreview.src = ensureValidImageSource(product.image);
    productImagePreview.hidden = false;
  }

  if (ownerDialog) ownerDialog.showModal();
}

function handleOrderButtonClick(button) {
  if (!button) return;

  const card = button.closest(".product-card, .combo-card");
  if (card) addToCart(getProductFromCard(card));
}

if (menuToggle && siteNavigation) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
    menuToggle.classList.toggle("is-open", !isExpanded);
    siteNavigation.classList.toggle("open", !isExpanded);
  });

  siteNavigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeNavigation();
  });
}

document.addEventListener("mousedown", (event) => {
  if (!menuToggle || !siteNavigation) return;
  const isOpen = siteNavigation.classList.contains("open");
  const clickedInsideNav = siteNavigation.contains(event.target);
  const clickedToggle = menuToggle.contains(event.target);

  if (isOpen && !clickedInsideNav && !clickedToggle) {
    closeNavigation();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNavigation();
    if (productDialog && productDialog.open) productDialog.close();
    if (cartDialog && cartDialog.open) cartDialog.close();
    if (authDialog && authDialog.open) authDialog.close();
    if (ownerDialog && ownerDialog.open) ownerDialog.close();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 768) closeNavigation();
});

if (accountButton) {
  accountButton.addEventListener("click", () => {
    if (appState.currentUser) {
      openAuthDialog();
      return;
    }
    openAuthDialog();
  });
}

if (ownerButton) {
  ownerButton.addEventListener("click", () => {
    if (!appState.currentUser || appState.currentUser.role !== "owner") {
      showToast("Owner access required.");
      return;
    }
    if (ownerDialog) ownerDialog.showModal();
  });
}

if (cartButton && cartDialog) {
  cartButton.addEventListener("click", () => cartDialog.showModal());
}

if (cartItems) {
  cartItems.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-cart-action]");
    if (!actionButton) return;

    const item = cart.find((entry) => entry.id === actionButton.dataset.cartId);
    if (!item) return;

    if (actionButton.dataset.cartAction === "remove") {
      cart = cart.filter((entry) => entry.id !== item.id);
    } else if (actionButton.dataset.cartAction === "increase") {
      item.quantity = Math.min(99, item.quantity + 1);
    } else if (actionButton.dataset.cartAction === "decrease") {
      item.quantity = Math.max(1, item.quantity - 1);
    }

    saveCart();
    renderCart();
  });
}

if (checkoutButton) {
  checkoutButton.addEventListener("click", openWhatsAppCartOrder);
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    appState.currentUser = null;
    saveState();
    updateAuthControls();
    closeAuthDialog();
    showToast("You are now logged out.");
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const email = String(formData.get("loginEmail") || "").trim().toLowerCase();
    const password = String(formData.get("loginPassword") || "").trim();
    const user = appState.accounts.find((account) => account.email.toLowerCase() === email && account.password === password);

    if (!user) {
      showToast("Incorrect email or password.");
      return;
    }

    appState.currentUser = user;
    saveState();
    updateAuthControls();
    closeAuthDialog();
    showToast(`Welcome back, ${user.fullName.split(" ")[0]}!`);
    loginForm.reset();
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(signupForm);
    const fullName = String(formData.get("signupName") || "").trim();
    const email = String(formData.get("signupEmail") || "").trim().toLowerCase();
    const password = String(formData.get("signupPassword") || "").trim();

    if (!fullName || !email || !password) {
      showToast("Please fill in all fields to create an account.");
      return;
    }

    const accountExists = appState.accounts.some((account) => account.email.toLowerCase() === email);
    if (accountExists) {
      showToast("This email is already in use.");
      return;
    }

    const newAccount = {
      id: `customer-${Date.now()}`,
      fullName,
      email,
      password,
      role: "customer",
    };

    appState.accounts.push(newAccount);
    appState.currentUser = newAccount;
    saveState();
    updateAuthControls();
    closeAuthDialog();
    signupForm.reset();
    showToast(`Account created, ${fullName}!`);
  });
}

if (productImageUpload) {
  productImageUpload.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      if (productImagePreview) {
        productImagePreview.src = result;
        productImagePreview.hidden = false;
      }
      if (productImageUrl) productImageUrl.value = "";
    };
    reader.readAsDataURL(file);
  });
}

if (productForm) {
  productForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!appState.currentUser || appState.currentUser.role !== "owner") {
      showToast("Only the owner can manage inventory.");
      return;
    }

    const name = document.getElementById("product-name").value.trim();
    const price = Number(document.getElementById("product-price").value);
    const discount = Number(document.getElementById("product-discount").value || 0);
    const imageValue = productImagePreview?.src && !productImagePreview.hidden ? productImagePreview.src : (productImageUrl.value || "Screenshot 2026-11-15 214117.png");

    if (!name || !Number.isFinite(price)) {
      showToast("Please provide a valid product name and price.");
      return;
    }

    const productPayload = {
      id: currentProductEditorId || `product-${Date.now()}`,
      name,
      price,
      discount: Math.max(0, Math.min(100, discount)),
      image: imageValue,
      family: "signature",
      size: name,
    };

    if (currentProductEditorId) {
      appState.products = appState.products.map((product) => product.id === currentProductEditorId ? productPayload : product);
      showToast("Product updated.");
    } else {
      appState.products.unshift(productPayload);
      showToast("New product added.");
    }

    saveState();
    renderProducts();
    renderOwnerList();
    resetProductForm();
  });
}

if (resetProductFormButton) {
  resetProductFormButton.addEventListener("click", () => {
    resetProductForm();
    showToast("Form reset.");
  });
}

if (ownerProductList) {
  ownerProductList.addEventListener("click", (event) => {
    const editButton = event.target.closest(".edit-product");
    const deleteButton = event.target.closest(".delete-product");

    if (editButton) {
      editProductInForm(editButton.dataset.id);
      return;
    }

    if (deleteButton) {
      const productId = deleteButton.dataset.id;
      appState.products = appState.products.filter((product) => product.id !== productId);
      saveState();
      renderProducts();
      renderOwnerList();
      if (currentProductEditorId === productId) {
        resetProductForm();
      }
      showToast("Product removed.");
    }
  });
}

document.addEventListener("click", (event) => {
  const imageDetailsButton = event.target.closest(".image-details-button");
  if (imageDetailsButton) {
    const card = imageDetailsButton.closest(".product-card, .combo-card");
    if (card) showProductDetails(getProductFromCard(card));
    return;
  }

  const detailsButton = event.target.closest(".details-btn");
  if (detailsButton) {
    const card = detailsButton.closest(".product-card");
    if (card) {
      showProductDetails(getProductFromCard(card));
    }
    return;
  }

  const buyNowButton = event.target.closest(".buy-now-btn");
  if (buyNowButton) {
    const card = buyNowButton.closest(".product-card, .combo-card");
    if (card) openWhatsAppOrder(getProductFromCard(card));
    return;
  }

  const orderButton = event.target.closest(".order-btn");
  if (!orderButton) return;

  if (orderButton.classList.contains("detail-order")) {
    addToCart(selectedProduct, Math.max(1, Math.min(99, Number(quantityInput.value) || 1)));
    if (productDialog && productDialog.open) productDialog.close();
    return;
  }

  handleOrderButtonClick(orderButton);
});

if (document.querySelector(".dialog-close")) {
  document.querySelector(".dialog-close").addEventListener("click", () => {
    if (productDialog && productDialog.open) productDialog.close();
  });
}

if (document.querySelector(".auth-close")) {
  document.querySelector(".auth-close").addEventListener("click", () => closeAuthDialog());
}

if (document.querySelector(".owner-close")) {
  document.querySelector(".owner-close").addEventListener("click", () => closeOwnerDialog());
}

if (document.querySelector(".cart-close")) {
  document.querySelector(".cart-close").addEventListener("click", () => cartDialog.close());
}

if (productDialog) {
  productDialog.addEventListener("click", (event) => {
    if (event.target === productDialog) productDialog.close();
  });
}

if (cartDialog) {
  cartDialog.addEventListener("click", (event) => {
    if (event.target === cartDialog) cartDialog.close();
  });
}

if (authDialog) {
  authDialog.addEventListener("click", (event) => {
    if (event.target === authDialog) authDialog.close();
  });
}

if (ownerDialog) {
  ownerDialog.addEventListener("click", (event) => {
    if (event.target === ownerDialog) ownerDialog.close();
  });
}

document.querySelectorAll(".quantity-change").forEach((button) => {
  button.addEventListener("click", () => {
    const quantity = Number(quantityInput.value) || 1;
    quantityInput.value = String(Math.min(99, Math.max(1, quantity + Number(button.dataset.step))));
  });
});

function init() {
  updateAuthControls();
  renderProducts();
  renderCombos();
  renderOwnerList();
  renderCart();
  resetProductForm();
}

init();