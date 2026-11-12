const cart = [];
const ORDER_STORAGE_KEY = "blendd-demo-orders";
const ADMIN_EMAIL = "admin@blendd.demo";
const ADMIN_PASSWORD = "BlenddAdmin123";
const ORDER_STATUSES = ["Order received", "Preparing", "Out for delivery", "Delivered", "Cancelled"];
const grid = document.querySelector("#product-grid");
const cartDrawer = document.querySelector("#cart-drawer");
const backdrop = document.querySelector("#cart-backdrop");
const toast = document.querySelector("#toast");
const authBackdrop = document.querySelector("#auth-backdrop");
const money = n => `₹${n}`;
let currentUser = null;
let checkoutAfterLogin = false;
let orders = [];

document.querySelector("#year").textContent = new Date().getFullYear();

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    const category = button.dataset.filter;
    document.querySelectorAll(".product-card").forEach(card => {
      card.classList.toggle("hidden", category !== "all" && card.dataset.category !== category);
    });
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function loadOrders() {
  try {
    const savedOrders = localStorage.getItem(ORDER_STORAGE_KEY);
    if (!savedOrders) return [];
    const parsedOrders = JSON.parse(savedOrders);
    if (!Array.isArray(parsedOrders)) throw new Error("Saved orders are not a list.");
    return parsedOrders;
  } catch (error) {
    console.error("Could not load saved demo orders.", error);
    showToast("Saved demo orders could not be loaded.");
    return [];
  }
}

function saveOrders() {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
    return true;
  } catch (error) {
    console.error("Could not save demo orders.", error);
    showToast("Could not save the demo order in this browser.");
    return false;
  }
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.querySelector("#cart-count").textContent = count;
  document.querySelector("#cart-total").textContent = money(total);
  const target = document.querySelector("#cart-items");
  if (!cart.length) {
    target.innerHTML = '<p class="empty-cart">Your bag is waiting for a little happiness. ✨</p>';
  } else {
    target.innerHTML = cart.map((item, index) => `
      <div class="cart-line">
        <div><b>${escapeHTML(item.name)}</b><small>${item.qty} × ${money(item.price)}</small></div>
        <div><b>${money(item.qty * item.price)}</b><br><button class="remove-item" data-remove="${index}">Remove</button></div>
      </div>`).join("");
    target.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
      cart.splice(Number(button.dataset.remove), 1);
      renderCart();
    }));
  }
  updateCheckoutSummary();
}

function updateCheckoutSummary() {
  const summary = document.querySelector("#checkout-summary");
  const button = document.querySelector("#place-order");
  if (!summary || !button) return;
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  summary.innerHTML = cart.length
    ? `<strong>Your bag</strong><span>${cart.map(item => `${escapeHTML(item.name)} × ${item.qty}`).join(", ")}</span><b>${money(total)}</b>`
    : '<span>Your bag is empty. Add a blend from the menu to place an order.</span>';
  button.disabled = !cart.length;
}

document.querySelectorAll(".add-button").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.name, price = Number(button.dataset.price);
    const found = cart.find(item => item.name === name);
    if (found) found.qty += 1; else cart.push({ name, price, qty: 1 });
    renderCart();
    showToast(`${name} added to your bag ✨`);
  });
});

function openCart() {
  cartDrawer.classList.add("open");
  backdrop.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  backdrop.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}
document.querySelector("#cart-open").addEventListener("click", openCart);
document.querySelector("#cart-close").addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);

function openLogin() {
  document.querySelector("#login-error").textContent = "";
  authBackdrop.classList.remove("hidden");
  document.querySelector('#login-form [name="email"]').focus();
}
function closeLogin() {
  authBackdrop.classList.add("hidden");
}
document.querySelector("#account-open").addEventListener("click", () => {
  if (currentUser) showDashboard();
  else openLogin();
});
document.querySelector("#login-close").addEventListener("click", closeLogin);
authBackdrop.addEventListener("click", event => {
  if (event.target === authBackdrop) closeLogin();
});
document.querySelector("#demo-admin-fill").addEventListener("click", () => {
  const form = document.querySelector("#login-form");
  form.elements.email.value = ADMIN_EMAIL;
  form.elements.password.value = ADMIN_PASSWORD;
});

function renderOrderItems(items) {
  return (Array.isArray(items) ? items : []).map(item =>
    `${escapeHTML(item.name)} × ${Number(item.qty) || 0}`
  ).join(", ");
}

function renderCustomerOrders() {
  const target = document.querySelector("#customer-orders");
  const customerOrders = orders.filter(order => order.email === currentUser.email);
  if (!customerOrders.length) {
    target.innerHTML = '<p class="empty-orders">Your placed orders will show up here.</p>';
    return;
  }
  target.innerHTML = customerOrders.map(order => `
    <article class="order-card">
      <div class="order-card-heading"><strong>${escapeHTML(order.id)}</strong><span class="status-badge">${escapeHTML(order.status)}</span></div>
      <p>${renderOrderItems(order.items)}</p>
      <div class="order-card-meta"><span>${escapeHTML(order.address)}</span><strong>${money(Number(order.total) || 0)}</strong></div>
      ${order.deliveryPartner ? `<small>Delivery partner: ${escapeHTML(order.deliveryPartner)}</small>` : ""}
    </article>`).join("");
}

function renderAdminOrders() {
  const target = document.querySelector("#admin-orders");
  if (!orders.length) {
    target.innerHTML = '<p class="empty-orders">No demo orders yet.</p>';
    return;
  }
  target.innerHTML = orders.map(order => `
    <article class="order-card admin-order">
      <div class="order-card-heading"><strong>${escapeHTML(order.id)}</strong><span class="status-badge">${escapeHTML(order.status)}</span></div>
      <p>${renderOrderItems(order.items)} <strong>${money(Number(order.total) || 0)}</strong></p>
      <div class="admin-customer"><strong>${escapeHTML(order.name)}</strong><span>${escapeHTML(order.email)} · ${escapeHTML(order.phone)}</span><span>${escapeHTML(order.address)}</span></div>
      <form class="admin-order-form" data-order-id="${escapeHTML(order.id)}">
        <label>Status<select name="status">${ORDER_STATUSES.map(status => `<option value="${escapeHTML(status)}"${status === order.status ? " selected" : ""}>${escapeHTML(status)}</option>`).join("")}</select></label>
        <label>Delivery partner<input name="deliveryPartner" value="${escapeHTML(order.deliveryPartner || "")}" placeholder="Assign a rider"></label>
        <button class="button button-dark" type="submit">Save delivery</button>
      </form>
    </article>`).join("");
}

function renderDashboard() {
  const dashboard = document.querySelector("#dashboard");
  const customerPanel = document.querySelector("#customer-panel");
  const adminPanel = document.querySelector("#admin-panel");
  document.querySelector("#storefront-view").classList.toggle("hidden", Boolean(currentUser));
  dashboard.classList.toggle("hidden", !currentUser);
  if (!currentUser) {
    document.querySelector("#account-open").textContent = "Log in";
    return;
  }
  const isAdmin = currentUser.role === "admin";
  document.querySelector("#dashboard-title").textContent = isAdmin ? "Delivery dashboard" : "Your deliveries";
  document.querySelector("#role-badge").textContent = isAdmin ? "Admin" : "Customer";
  document.querySelector("#account-open").textContent = isAdmin ? "Admin panel" : "My account";
  customerPanel.classList.toggle("hidden", isAdmin);
  adminPanel.classList.toggle("hidden", !isAdmin);
  if (isAdmin) renderAdminOrders();
  else renderCustomerOrders();
  updateCheckoutSummary();
}

function showDashboard() {
  closeLogin();
  closeCart();
  renderDashboard();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelector("#login-form").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.elements.email.value.trim().toLowerCase();
  const password = form.elements.password.value;
  if (email === ADMIN_EMAIL && password !== ADMIN_PASSWORD) {
    document.querySelector("#login-error").textContent = "That admin email and password do not match the demo credentials.";
    return;
  }
  currentUser = { email, role: email === ADMIN_EMAIL ? "admin" : "customer" };
  form.reset();
  const continueToCheckout = checkoutAfterLogin;
  checkoutAfterLogin = false;
  showDashboard();
  if (continueToCheckout && currentUser.role === "customer") {
    document.querySelector('#delivery-form [name="name"]').focus();
  }
});

document.querySelector("#logout").addEventListener("click", () => {
  currentUser = null;
  renderDashboard();
  window.scrollTo({ top: 0, behavior: "smooth" });
  showToast("You have been logged out.");
});

document.querySelector("#delivery-form").addEventListener("submit", event => {
  event.preventDefault();
  if (!currentUser || currentUser.role !== "customer") {
    showToast("Sign in with a customer account to place an order.");
    return;
  }
  if (!cart.length) {
    showToast("Add a blend before placing an order.");
    return;
  }
  const formData = new FormData(event.currentTarget);
  const order = {
    id: `BL-${Date.now().toString(36).toUpperCase()}`,
    email: currentUser.email,
    name: String(formData.get("name")).trim(),
    phone: String(formData.get("phone")).trim(),
    address: String(formData.get("address")).trim(),
    items: cart.map(item => ({ ...item })),
    total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    status: ORDER_STATUSES[0],
    deliveryPartner: "",
    createdAt: new Date().toISOString()
  };
  orders.unshift(order);
  if (!saveOrders()) {
    orders.shift();
    return;
  }
  cart.length = 0;
  renderCart();
  renderDashboard();
  showToast(`Demo order ${order.id} placed.`);
});

document.querySelector("#admin-orders").addEventListener("submit", event => {
  if (!event.target.matches(".admin-order-form")) return;
  event.preventDefault();
  if (!currentUser || currentUser.role !== "admin") {
    showToast("Sign in with the admin demo account to manage deliveries.");
    return;
  }
  const form = event.target;
  const order = orders.find(item => item.id === form.dataset.orderId);
  if (!order) {
    showToast("That order could not be found.");
    return;
  }
  const previousStatus = order.status;
  const previousPartner = order.deliveryPartner;
  order.status = form.elements.status.value;
  order.deliveryPartner = form.elements.deliveryPartner.value.trim();
  if (!saveOrders()) {
    order.status = previousStatus;
    order.deliveryPartner = previousPartner;
    return;
  }
  renderDashboard();
  showToast(`Delivery ${order.id} updated.`);
});

document.querySelector("#checkout").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Add a blend before checking out.");
    return;
  }
  closeCart();
  if (currentUser) {
    showDashboard();
    if (currentUser.role === "customer") document.querySelector('#delivery-form [name="name"]').focus();
    return;
  }
  checkoutAfterLogin = true;
  openLogin();
});

document.querySelector("#brand-home").addEventListener("click", () => {
  if (!currentUser) return;
  currentUser = null;
  renderDashboard();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
    closeLogin();
  }
});

const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a, button").forEach(link => link.addEventListener("click", () => nav.classList.remove("open")));

orders = loadOrders();
renderCart();
