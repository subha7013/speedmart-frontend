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
const res = await fetch(BASE_URL + path, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options
});


// ✅ Fetch user session
async function fetchMe() {
    const res = await api("/api/me");
    currentUser = (res.ok && res.email) ? { email: res.email, phone: res.phone } : null;
    updateProfileUI();
}

window.onload = () => {
    fetchMe();
    showHome();
};

// ✅ Update Profile Screen
async function updateProfileUI() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const profileDashboard = document.getElementById("profileDashboard");

    if (currentUser) {
        if (loginForm) loginForm.style.display = "none";
        if (signupForm) signupForm.style.display = "none";
        if (profileDashboard) profileDashboard.style.display = "block";
        
        // Fill basic details
        const emailDisp = document.getElementById("profileEmailDisplay");
        if (emailDisp) emailDisp.textContent = currentUser.email;
        
        const phoneInput = document.getElementById("profilePhoneInput");
        if (phoneInput) phoneInput.value = currentUser.phone || "";
        
        const avatarLetter = document.getElementById("avatarLetter");
        if (avatarLetter) avatarLetter.textContent = currentUser.email.charAt(0).toUpperCase();

        // Calculate and render stats counts
        const wishlistCount = document.getElementById("profileWishlistCount");
        if (wishlistCount) wishlistCount.textContent = wishlist.length;

        const cartCount = document.getElementById("profileCartCount");
        if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);

        const ordersCount = document.getElementById("profileOrdersCount");
        const recentOrdersBox = document.getElementById("profileRecentOrders");

        // Fetch orders count and preview from server
        try {
            const res = await api("/api/orders");
            if (res.ok && res.orders) {
                if (ordersCount) ordersCount.textContent = res.orders.length;
                
                if (recentOrdersBox) {
                    recentOrdersBox.innerHTML = "";
                    if (res.orders.length === 0) {
                        recentOrdersBox.innerHTML = `<p class="no-orders">You haven't placed any orders yet.</p>`;
                    } else {
                        // Take the last 2 orders
                        const recent = res.orders.slice(0, 2);
                        recent.forEach(order => {
                            const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            });
                            
                            const itemsPreview = order.items.map(item => `${item.name} (x${item.qty})`).join(", ");
                            
                            recentOrdersBox.innerHTML += `
                            <div class="recent-order-item">
                                <div class="ro-header">
                                    <span class="ro-id">Order #${order._id.slice(-6).toUpperCase()}</span>
                                    <span class="ro-status ${order.status.toLowerCase()}">${order.status}</span>
                                </div>
                                <div class="ro-details">
                                    <p class="ro-items">${itemsPreview}</p>
                                    <div class="ro-meta">
                                        <span class="ro-total">₹${order.total}</span>
                                        <span class="ro-date">${formattedDate}</span>
                                    </div>
                                </div>
                            </div>`;
                        });
                    }
                }
            } else {
                if (ordersCount) ordersCount.textContent = "0";
                if (recentOrdersBox) recentOrdersBox.innerHTML = `<p class="no-orders">Failed to load orders.</p>`;
            }
        } catch (e) {
            console.error("Error loading profile orders stats:", e);
            if (ordersCount) ordersCount.textContent = "0";
            if (recentOrdersBox) recentOrdersBox.innerHTML = `<p class="no-orders">Error loading orders.</p>`;
        }
    } else {
        if (loginForm) loginForm.style.display = "block";
        if (signupForm) signupForm.style.display = "none";
        if (profileDashboard) profileDashboard.style.display = "none";
    }
}

// ✅ Save Phone Details
async function saveProfileChanges() {
    const phoneInput = document.getElementById("profilePhoneInput");
    if (!phoneInput) return;
    const phoneVal = phoneInput.value.trim();

    const res = await api("/api/user/update", {
        method: "POST",
        body: JSON.stringify({ phone: phoneVal })
    });

    if (res.ok) {
        showToast("Profile Phone Updated ✅");
        if (currentUser) currentUser.phone = phoneVal;
    } else {
        showToast(res.msg || "Failed to update profile ❌");
    }
}

// ✅ Change Password
async function changeUserPassword() {
    const newPass = document.getElementById("newPasswordInput");
    const confirmPass = document.getElementById("confirmNewPasswordInput");
    if (!newPass || !confirmPass) return;

    if (!newPass.value) {
        return showToast("Password cannot be empty ❌");
    }
    if (newPass.value !== confirmPass.value) {
        return showToast("Passwords do not match ❌");
    }

    const res = await api("/api/user/update", {
        method: "POST",
        body: JSON.stringify({ password: newPass.value })
    });

    if (res.ok) {
        showToast("Password Changed Successfully ✅");
        newPass.value = "";
        confirmPass.value = "";
        togglePasswordForm();
    } else {
        showToast(res.msg || "Failed to change password ❌");
    }
}

// ✅ Toggle Change Password Form
function togglePasswordForm() {
    const section = document.getElementById("changePasswordSection");
    if (!section) return;
    if (section.style.display === "none") {
        section.style.display = "block";
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        section.style.display = "none";
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
                    <button class="wishlist-btn" onclick="addToWishlist('${p.id}','${p.name}',${p.price},'${p.image}')">❤️
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
    if (!currentUser) return showToast(`Please Login First to Buy ✅`);

    const items = [{ name, price, qty: 1 }];
    const total = price;

    const res = await api("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items, total })
    });

    if (res.ok) {
        showToast(`Order Placed Instantly ⚡✅`);
    } else {
        showToast(`Something went wrong ❌`);
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
        showToast(`Please Login first to continue`);
        showProfile(); // auto redirect to profile tab
        return;
    }    
    if (cart.length === 0) return showToast(`Cart is empty`);
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
    if (!currentUser) return showToast(`Please Login First`);

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
    if (res.ok) fetchMe(), showToast(`Logged In ✅`); else showToast(`Credentials are not matched`);
};
signupForm.onsubmit = async (e) => {
    e.preventDefault();
    if (signupPass.value !== signupRePass.value) return showToast(`Passwords don't match ❌`);
    const res = await api("/api/register", { method: "POST", body: JSON.stringify({ email: signupEmail.value, phone: signupPh.value, password: signupPass.value }) });
    if (res.ok) fetchMe(), showToast(`Account Created ✅`); else showToast(`Email already exists ❌`);
};
async function logoutUser() { await api("/api/auth/logout", { method: "POST" }); currentUser = null; updateProfileUI(); showToast(`Logged Out ✅`); showProfile(); }
let index = 0;
