const BASE_URL = "https://speedmart-backend.onrender.com";
let currentUser = null;
let cart = [];
let wishlist = [];

// ================= API HELPERS =================
async function api(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options
  });
  return res.json();
}

// Load user when site loads
window.onload = () => { fetchMe(); showHome(); };

async function fetchMe() {
  const res = await api("/api/me");
  if (res.ok && res.email) {
    currentUser = res.email;
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("extraProfileButtons").style.display = "block";
    document.getElementById("profileWelcome").textContent = "Welcome, " + res.email;
  } else {
    currentUser = null;
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("extraProfileButtons").style.display = "none";
    document.getElementById("profileWelcome").textContent = "";
  }
}

// ================= PAGE SHOW COMPONENTS =================
function showSection(id) {
  document.querySelectorAll("main section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";

  if (id === "home") {
    document.getElementById("footer").style.display = "flex";
    document.getElementById("home2").style.display = "block";
  } else {
    document.getElementById("footer").style.display = "none";
    document.getElementById("home2").style.display = "none";
  }
}

function showHome() {
  showSection("home");
  document.getElementById("home").style.display = "flex";
  document.getElementById("home2").style.display = "block";
}

// ================= CATEGORIES & PRODUCTS =================
function showCategories() {
  showSection("categoriesPage");
  const container = document.getElementById("categoriesList");
  container.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat.name;
    btn.onclick = () => showProducts(cat);
    container.appendChild(btn);
  });
}

function showProducts(category) {
  showSection("productsPage");
  document.getElementById("categoryTitle").textContent = category.name;

  const container = document.getElementById("productsList");
  container.innerHTML = "";
  category.products.forEach(p => {
    container.innerHTML += `
      <div class="product-card">
        <img src="${p.image}" width="120">
        <p>${p.name}</p>
        <p>Rs ${p.price}</p>
        <div>
          <button onclick="decreaseCart('${p.id}')">-</button>
          <span id="qty-${p.id}">0</span>
          <button onclick="increaseCart('${p.id}', '${p.name}', ${p.price})">+</button>
        </div>
        <button onclick="addToWishlist('${p.id}', '${p.name}', ${p.price}, '${p.image}')">❤ Wishlist</button>
      </div>`;
  });
}

// ================= CART =================
function increaseCart(id, name, price) {
  let item = cart.find(i => i.id === id);
  if (!item) cart.push(item = { id, name, price, qty: 1 });
  else item.qty++;
  document.getElementById(`qty-${id}`).textContent = item.qty;
}

function decreaseCart(id) {
  let item = cart.find(i => i.id === id);
  if (item && item.qty > 0) {
    item.qty--;
    document.getElementById(`qty-${id}`).textContent = item.qty;
  }
}

function showCart() {
  showSection("cartPage");
  const container = document.getElementById("cartList");
  container.innerHTML = "";
  let total = 0;
  cart = cart.filter(i => i.qty > 0);

  cart.forEach(i => {
    total += i.qty * i.price;
    container.innerHTML += `
      <div class="product-card">
        <p>${i.name}</p>
        <p>Qty: ${i.qty}</p>
        <p>Rs ${i.qty * i.price}</p>
      </div>`;
  });

  document.getElementById("cartTotal").textContent = "Total: Rs " + total;
}

async function placeOrder() {
  await fetchMe();
  if (!currentUser) return alert("Please login first!");
  if (cart.length === 0) return alert("Your cart is empty!");

  const items = cart.map(i => ({ name: i.name, price: i.price, qty: i.qty }));
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  const res = await api("/api/checkout", { method: "POST", body: JSON.stringify({ items, total }) });

  if (res.ok) { alert("Order Placed ✅"); cart = []; showCart(); }
}

// ================= WISHLIST =================
function addToWishlist(id, name, price, image) {
  if (!wishlist.find(i => i.id === id)) wishlist.push({ id, name, price, image });
  alert("Added to wishlist ❤️");
}

function showWishlist() {
  showSection("wishlistPage");
  const container = document.getElementById("wishlistList");
  container.innerHTML = "";
  wishlist.forEach(i => {
    container.innerHTML += `
      <div class="product-card">
        <img src="${i.image}" width="100">
        <p>${i.name}</p>
        <p>Rs ${i.price}</p>
      </div>`;
  });
}

// ================= PROFILE AUTH =================
function showProfile() { showSection("profilePage"); fetchMe(); }

document.getElementById("loginForm").onsubmit = async (e) => {
  e.preventDefault();
  const res = await api("/api/login", { method: "POST", body: JSON.stringify({ email: loginEmail.value, password: loginPass.value }) });
  if (res.ok) { alert("✅ Logged In"); fetchMe(); }
  else alert("❌ Incorrect Details");
};

document.getElementById("signupForm").onsubmit = async (e) => {
  e.preventDefault();
  if (signupPass.value !== signupRePass.value) return alert("Passwords do not match");
  const res = await api("/api/register", { method: "POST", body: JSON.stringify({ email: signupEmail.value, phone: signupPh.value, password: signupPass.value }) });
  if (res.ok) { alert("✅ Account Created"); fetchMe(); }
  else alert("❌ Email already registered");
};

async function logoutUser() {
  await api("/api/auth/logout", { method: "POST" });
  currentUser = null;
  fetchMe();
  alert("Logged Out ✅");
}

// ================= ORDERS =================
async function showMyOrders() {
  await fetchMe();
  if (!currentUser) return alert("Login first");

  const res = await api("/api/orders");
  showSection("ordersPage");
  const list = document.getElementById("ordersList");
  list.innerHTML = "";

  if (res.orders.length === 0) return list.innerHTML = "<p>No orders yet</p>";

  res.orders.forEach(o => {
    list.innerHTML += `
      <div class="product-card">
        <p><b>Order ID:</b> ${o._id}</p>
        <p><b>Total:</b> Rs ${o.total}</p>
        <p><b>Status:</b> ${o.status}</p>
      </div>`;
  });
}

// ================= ALLOW HTML onclick() =================
window.showHome = showHome;
window.showCategories = showCategories;
window.showProducts = showProducts;
window.showWishlist = showWishlist;
window.showCart = showCart;
window.showProfile = showProfile;
window.showMyOrders = showMyOrders;
window.placeOrder = placeOrder;
window.logoutUser = logoutUser;
