const BASE_URL = "https://speedmart-backend.onrender.com";
let currentUser = null;
let cart = [];
let wishlist = [];

// API helper
async function api(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options
  });
  return res.json();
}

// Load user on page open
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

window.onload = () => { fetchMe(); };

// Profile Navigation
function showProfile() { showSection("profilePage"); fetchMe(); }
function showLogin() { document.getElementById("loginForm").style.display = "block"; document.getElementById("signupForm").style.display = "none"; }
function showSignup() { document.getElementById("signupForm").style.display = "block"; document.getElementById("loginForm").style.display = "none"; }

// Login Submit
document.getElementById("loginForm").onsubmit = async (e) => {
  e.preventDefault();
  const res = await api("/api/login", {
    method: "POST",
    body: JSON.stringify({ email: loginEmail.value, password: loginPass.value })
  });
  if (res.ok) { alert("✅ Logged In"); fetchMe(); }
  else alert("❌ Incorrect Details");
};

// Signup Submit
document.getElementById("signupForm").onsubmit = async (e) => {
  e.preventDefault();
  if (signupPass.value !== signupRePass.value) return alert("Passwords do not match");
  const res = await api("/api/register", {
    method: "POST",
    body: JSON.stringify({
      email: signupEmail.value,
      phone: signupPh.value,
      password: signupPass.value
    })
  });
  if (res.ok) { alert("✅ Account Created"); fetchMe(); }
  else alert("❌ Email already registered");
};

// Logout
async function logoutUser() {
  await api("/api/auth/logout", { method: "POST" });
  currentUser = null;
  fetchMe();
  alert("Logged Out ✅");
}

// Cart
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
    container.innerHTML += `<div class="product-card">
      <p>${i.name}</p><p>Qty: ${i.qty}</p><p>Rs ${i.qty * i.price}</p></div>`;
  });
  document.getElementById("cartTotal").textContent = "Total: Rs " + total;
}

// Checkout
async function placeOrder() {
  await fetchMe();
  if (!currentUser) return alert("Please login first!");
  if (cart.length === 0) return alert("Your cart is empty!");

  const items = cart.map(i => ({ name: i.name, price: i.price, qty: i.qty }));
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  const res = await api("/api/checkout", {
    method: "POST",
    body: JSON.stringify({ items, total })
  });

  if (res.ok) { alert("Order Placed ✅"); cart = []; showCart(); }
}

// Orders
async function showMyOrders() {
  await fetchMe();
  if (!currentUser) return alert("Login first");

  const res = await api("/api/orders");
  showSection("ordersPage");
  const list = document.getElementById("ordersList");
  list.innerHTML = "";

  if (res.orders.length === 0) return list.innerHTML = "<p>No orders yet</p>";

  res.orders.forEach(o => {
    list.innerHTML += `<div class="product-card">
      <p><b>Order ID:</b> ${o._id}</p>
      <p><b>Total:</b> Rs ${o.total}</p>
      <p><b>Status:</b> ${o.status}</p>
    </div>`;
  });
}

// Show Section Utility
function showSection(id) {
  document.querySelectorAll("main section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";
}
