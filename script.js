const BASE_URL = "https://speedmart-backend.onrender.com";
// const BASE_URL = "https://astonishing-vibrancy-production.up.railway.app";


let currentUser = null;
let cart = [];
let wishlist = [];

// ✅ SHOP DATA (Categories + Products)
const categories = [
    { name: 'Charger', products: [
        { id: 'charger1', name: 'Dual Port Adapter', price: 199, image: 'assets/charger1.jpg' },
        { id: 'charger2', name: 'Samsung Adapter', price: 249, image: 'assets/charger2.jpg' },
        { id: 'charger3', name: 'Apple Adapter', price: 1499, image: 'assets/charger3.jpg' },
    ]},
    { name: 'Earbuds', products: [
        { id: 'earbuds1', name: 'Realme buds Q', price: 1999, image: 'assets/earbuds1.jpg' },
        { id: 'earbuds2', name: 'Boult earbuds', price: 899, image: 'assets/earbuds2.jpg' },
        { id: 'earbuds3', name: 'Boat Airdoped 311', price: 1299, image: 'assets/earbuds3.jpg' },
    ]},
    { name: 'Headset', products: [
        { id: 'headset1', name: 'Headset', price: 2599, image: 'assets/headset1.jpg' },
        { id: 'headset2', name: 'Sony', price: 2999, image: 'assets/headset2.jpg' },
    ]},
    { name: 'Neckband', products: [
        { id: 'neckband1', name: 'Boat 235 V2', price: 899, image: 'assets/neckband1.jpg' },
    ]},
    { name: 'Accessories', products: [
        { id: 'keyboard1', name: 'Keyboard', price: 1499, image: 'assets/keyboard1.jpg' },
        { id: 'mouse1', name: 'Mouse', price: 599, image: 'assets/mouse1.jpg' },
    ]},
    { name: 'Powerbank', products: [
        { id: 'powerbank1', name: 'Mi 10000mah Powerbank', price: 699, image: 'assets/powerbank1.jpg' },
        { id: 'powerbank2', name: 'Oneplus 20000mah Powerbank', price: 1799, image: 'assets/powerbank2.jpg' },
    ]},
    { name: 'Soundbar', products: [
        { id: 'soundbar1', name: 'JBL Base Pro', price: 2000, image: 'assets/soundbar1.jpg' },
        { id: 'soundbar2', name: 'JBL Super Bass', price: 1299, image: 'assets/soundbar2.jpg' },
        { id: 'soundbar3', name: 'Boat Stone Pro', price: 799, image: 'assets/soundbar3.jpg' },
    ]},
];

// ✅ API Call Wrapper
async function api(path, options = {}) {
    const res = await fetch(BASE_URL + path, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        ...options
    });
    return res.json();
}

// ✅ Fetch user session
async function fetchMe() {
    const res = await api("/api/me");
    currentUser = (res.ok && res.email) ? { email: res.email } : null;
    updateProfileUI();
}

window.onload = () => {
    fetchMe();
    showHome();
};

// ✅ Update Profile Screen
function updateProfileUI() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const profileBtns = document.getElementById("extraProfileButtons");
    const welcome = document.getElementById("profileWelcome");

    if (currentUser) {
        loginForm.style.display = "none";
        signupForm.style.display = "none";
        profileBtns.style.display = "block";
        welcome.textContent = `Welcome, ${currentUser.email}`;
    } else {
        loginForm.style.display = "block";
        signupForm.style.display = "none";
        profileBtns.style.display = "none";
        welcome.textContent = "";
    }
}

// ✅ Navigation
function showSection(id) {
    document.querySelectorAll("main section").forEach(sec => sec.style.display = "none");
    document.getElementById(id).style.display = "block";
    document.getElementById("footer").style.display = "none";
}
function showHome() {
    showSection("home");
    document.getElementById("home").style.display = "flex";
    document.getElementById("home2").style.display = "block";
    document.getElementById("footer").style.display = "block";
}
function showProfile() { showSection("profilePage"); updateProfileUI(); }
function showLogin() { loginForm.style.display = "block"; signupForm.style.display = "none"; }
function showSignup() { signupForm.style.display = "block"; loginForm.style.display = "none"; }

// ✅ Category Display
function showCategories() {
    showSection("categoriesPage");
    const box = document.getElementById("categoriesList");
    box.innerHTML = "";
    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.textContent = cat.name;
        btn.onclick = () => showProducts(cat);
        box.appendChild(btn);
    });
}
function backToCategories() {
    showCategories(); // simply shows category list again
}


// ✅ Products Display
function showProducts(category) {
    showSection("productsPage");
    document.getElementById("categoryTitle").textContent = category.name;
    const box = document.getElementById("productsList");
    box.innerHTML = "";

    category.products.forEach(p => {
        box.innerHTML += `
        <div class="product-card">
            <div class="img-box">
                <img src="${p.image}">
            </div>
            <div class="info">
                <h3>${p.name}</h3>
                <p>₹${p.price}</p>

                <div class="qty-box">
                    <button onclick="decreaseCart('${p.id}')">-</button>
                    <span id="qty-${p.id}">0</span>
                    <button onclick="increaseCart('${p.id}','${p.name}',${p.price})">+</button>
                </div>

                <div class="action-btns">
                    <button class="wishlist-btn" onclick="addToWishlist('${p.id}','${p.name}',${p.price},'${p.image}')">Add to Wishlist
                    </button>

                    <button class="buy-btn" onclick="buyNow('${p.id}','${p.name}',${p.price})">Buy Now
                    </button>
                </div>
            </div>
        </div>`;
    });
}
async function buyNow(id, name, price) {
    await fetchMe();
    if (!currentUser) return alert("Please Login First to Buy ✅");

    const items = [{ name, price, qty: 1 }];
    const total = price;

    const res = await api("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items, total })
    });

    if (res.ok) {
        alert("Order Placed Instantly ⚡✅");
        showMyOrders();
    } else {
        alert("Something went wrong ❌");
    }
}


// ✅ Cart
function increaseCart(id, name, price) {
    let item = cart.find(i => i.id === id);

    if (!item) {
        cart.push(item = { id, name, price, qty: 1 });
    } else {
        item.qty++;
    }

    // Update quantity in product list UI (if visible)
    const qtySpan = document.getElementById(`qty-${id}`);
    if (qtySpan) qtySpan.textContent = item.qty;

    // ✅ If cart page is open, re-render cart
    if (document.getElementById("cartPage").style.display !== "none") {
        showCart();
    }
    showToast(`${name} added to Cart ✅`);
}

function showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function decreaseCart(id) {
    let item = cart.find(i => i.id === id);

    if (!item) return;

    item.qty--;

    // If qty hits zero, remove item completely
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
        showToast(`Cart is empty`);
    }

    showCart(); // Re-render cart after update
}

function showCart() {
    showSection("cartPage");
    const box = document.getElementById("cartList");
    box.innerHTML = "";
    let total = 0;
    cart = cart.filter(i => i.qty > 0);

    cart.forEach(i => {
        total += i.qty * i.price;

        box.innerHTML += `
        <div class="cart-item">
            <div class="left">
                <h4>${i.name}</h4>
                <p>Qty: ${i.qty}</p>
                <p>₹${i.qty * i.price}</p>
            </div>

            <div class="right">
                <button onclick="decreaseCart('${i.id}')">-</button>
                <button onclick="increaseCart('${i.id}','${i.name}',${i.price})">+</button>
            </div>
        </div>`;
    });

    document.getElementById("cartTotal").textContent = "Total: Rs " + total;
}

function clearCart() { cart = []; showCart(); }

// ✅ Checkout
async function placeOrder() {
    await fetchMe();
    if (!currentUser) {
        alert("Please Login first to continue");
        showProfile(); // auto redirect to profile tab
        return;
    }    
    if (cart.length === 0) return alert("Cart empty!");
    const items = cart.map(i => ({ name: i.name, price: i.price, qty: i.qty }));
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const res = await api("/api/checkout", { method: "POST", body: JSON.stringify({ items, total }) });
    if (res.ok) showToast(`Order Placed 📦✅`), clearCart();
}

// ✅ Wishlist
function addToWishlist(id, name, price, image) {
    if (!wishlist.find(i => i.id === id)) wishlist.push({ id, name, price, image });
    showToast(`${name} added to wishlist ❤️`);
}
function showWishlist() {
    showSection("wishlistPage");
    const box = document.getElementById("wishlistList");
    box.innerHTML = "";
    wishlist.forEach(i => {
        box.innerHTML += `<div class="product-card"><img src="${i.image}" width="100"><p>${i.name}</p><p>Rs ${i.price}</p></div>`;
    });
}
function clearWishlist() { wishlist = []; showWishlist(); }

// ✅ Orders
async function showMyOrders() {
    await fetchMe();
    if (!currentUser) return alert("Please Login First");

    const res = await api("/api/orders");
    showSection("ordersPage");
    const list = document.getElementById("ordersList");
    list.innerHTML = "";

    if (!res.orders || res.orders.length === 0) {
        list.innerHTML = `<p style="text-align:center;">No orders yet.</p>`;
        return;
    }

    res.orders.forEach(order => {
        const formattedDate = new Date(order.createdAt).toLocaleString();

        list.innerHTML += `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">Order #${order._id.slice(-6)}</span>
                <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
            </div>

            <div class="order-items">
                ${order.items.map(i => `
                    <div class="order-item">
                        <span>${i.name}</span>
                        <span>× ${i.qty}</span>
                        <span>₹${i.qty * i.price}</span>
                    </div>
                `).join("")}
            </div>

            <div class="order-footer">
                <span><b>Total:</b> ₹${order.total}</span>
                <span><b>Date:</b> ${formattedDate}</span>
            </div>
        </div>`;
    });
}

// ✅ Login + Signup + Logout
loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const res = await api("/api/login", { method: "POST", body: JSON.stringify({ email: loginEmail.value, password: loginPass.value }) });
    if (res.ok) fetchMe(), alert("Logged In ✅"); else alert("Wrong credentials ❌");
};
signupForm.onsubmit = async (e) => {
    e.preventDefault();
    if (signupPass.value !== signupRePass.value) return alert("Passwords don't match ❌");
    const res = await api("/api/register", { method: "POST", body: JSON.stringify({ email: signupEmail.value, phone: signupPh.value, password: signupPass.value }) });
    if (res.ok) fetchMe(), alert("Account Created ✅"); else alert("Email already exists ❌");
};
async function logoutUser() { await api("/api/auth/logout", { method: "POST" }); currentUser = null; updateProfileUI(); alert("Logged Out ✅"); showProfile(); }
let index = 0;

function showSlides() {
  const slides = document.querySelector(".slides");
  const dots = document.querySelectorAll(".slider-dots span");

  slides.style.transform = `translateX(-${index * 100}%)`;

  dots.forEach(dot => dot.classList.remove("active"));
  dots[index].classList.add("active");

  index = (index + 1) % dots.length;
}

setInterval(showSlides, 3000);
showSlides();

function currentSlide(n) {
  index = n;
  showSlides();
}






