// ==================== LOAD AUTH STATUS ON PAGE LOAD ====================
window.onload = async () => {
    fetchMe();
    updateProfileUI();
};

// ==================== API HELPER ====================
const BASE_URL = "https://speedmart-backend.onrender.com";

async function api(path, options = {}) {
    const res = await fetch(BASE_URL + path, {
        headers: { "Content-Type": "application/json" },
        credentials: "include", // allow cookies (login session)
        ...options
    });
    return res.json();
}



let currentUser = null;

async function fetchMe() {
    const res = await api("/api/me");

    if (res.ok && res.email) {
        currentUser = { email: res.email };

        // Show logged-in UI
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("signupForm").style.display = "none";
        document.getElementById("extraProfileButtons").style.display = "block";
        document.getElementById("profileWelcome").textContent = "Welcome, " + res.email;
    } else {
        currentUser = null;

        // Show login UI if logged out
        document.getElementById("loginForm").style.display = "block";
        document.getElementById("signupForm").style.display = "none";
        document.getElementById("extraProfileButtons").style.display = "none";
        document.getElementById("profileWelcome").textContent = "";
    }
}




// ==================== SHOP DATA ====================
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

let cart = [];
let wishlist = [];


// ==================== PAGE CONTROL ====================
function showSection(id) {
    document.querySelectorAll("main section").forEach(sec => sec.style.display = "none");
    document.getElementById(id).style.display = "block";
    document.getElementById('footer').style.display = "none";
    
}

function showHome() {
    showSection('home');
    document.getElementById('home').style.display = 'flex';
    document.getElementById('home2').style.display = 'block';
    document.getElementById('footer').style.display = "block";
}


// ==================== CATEGORY & PRODUCTS ====================
function showCategories() {
    showSection('categoriesPage');
    const container = document.getElementById('categoriesList');
    container.innerHTML = "";
    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.textContent = cat.name;
        btn.onclick = () => showProducts(cat);
        container.appendChild(btn);
    });
}

function showProducts(category) {
    showSection('productsPage');
    document.getElementById('categoryTitle').textContent = category.name;
    const container = document.getElementById('productsList');
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


// ==================== CART ====================
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
    showSection('cartPage');
    const container = document.getElementById('cartList');
    container.innerHTML = "";
    let total = 0;
    cart = cart.filter(i => i.qty > 0);
    cart.forEach(i => {
        total += i.qty * i.price;
        container.innerHTML += `<div class="product-card">
            <p>${i.name}</p>
            <p>Qty: ${i.qty}</p>
            <p>Rs ${i.qty * i.price}</p>
        </div>`;
    });


    document.getElementById("cartTotal").textContent = "Total: Rs " + total;
}

function clearCart() {
    cart = [];
    showCart();
}

// ==================== CHECKOUT (LOGIN REQUIRED) ====================
async function placeOrder() {
    await fetchMe();
    if (!currentUser) return alert("Please Login First To Checkout!");

    // Check if cart has any valid items
    cart = cart.filter(i => i.qty > 0);
    if (cart.length === 0) return alert("Your cart is empty ❌ Add items first!");

    const items = cart.map(i => ({
        name: i.name,
        price: i.price,
        qty: i.qty
    }));

    const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);


    if (total <= 0) return alert("Your cart total is 0 ❌");

    const res = await api("/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items, total })
    });

    if (res.ok) {
        alert("✅ Order Placed Successfully!");
        clearCart();
    } else {
        alert("❌ Something went wrong. Try again.");
    }

}

function closeAddressPopup() {
    document.getElementById("addressPopup").style.display = "none";
}




// ==================== WISHLIST ====================
function addToWishlist(id, name, price, image) {
    if (!wishlist.find(i => i.id === id)) wishlist.push({ id, name, price, image });
    alert(name + " added to wishlist ❤️");
}

function clearWishlist() {
    if (wishlist.length === 0) {
        alert("Wishlist is already empty!");
        return;
    }

    if (confirm("Are you sure you want to clear your wishlist?")) {
        wishlist = [];
        showWishlist();
    }
}


function showWishlist() {
    showSection('wishlistPage');
    const container = document.getElementById('wishlistList');
    container.innerHTML = "";
    wishlist.forEach(i => {
        container.innerHTML += `<div class="product-card">
            <img src="${i.image}" width="100">
            <p>${i.name}</p>
            <p>Rs ${i.price}</p>
        </div>`;
    });
}


// ==================== PROFILE UI CONTROL ====================

function updateProfileUI() {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const extraButtons = document.getElementById("extraProfileButtons");
    const welcomeText = document.getElementById("profileWelcome");

    if (currentUser && currentUser.email) {
        loginForm.style.display = "none";
        signupForm.style.display = "none";
        extraButtons.style.display = "block";
        welcomeText.textContent = `Welcome, ${currentUser.email}`;
    } else {
        loginForm.style.display = "block";
        signupForm.style.display = "none";
        extraButtons.style.display = "none";
        welcomeText.textContent = "";
    }
}
async function showMyOrders() {
    await fetchMe();
    if (!currentUser) return alert("Please Login First");

    const res = await api("/api/orders");

    if (!res.ok || !res.orders) {
        alert("No orders found.");
        return;
    }

    showSection("ordersPage");

    const ordersList = document.getElementById("ordersList");
    ordersList.innerHTML = "";

    if (res.orders.length === 0) {
        ordersList.innerHTML = "<p>No orders yet</p>";
        return;
    }

    res.orders.forEach(order => {
        const div = document.createElement("div");
        div.className = "product-card";
        div.innerHTML = `
            <p><b>Order ID:</b> ${order._id}</p>
            <p><b>Total:</b> Rs ${order.total}</p>
            <p><b>Date:</b> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <hr>
            ${order.items.map(item => `
                <p>${item.name} × ${item.qty} = Rs ${item.qty * item.price}</p>
            `).join("")}
        `;
        ordersList.appendChild(div);
    });
}




function showProfile() {
    showSection("profilePage");
    updateProfileUI();
}

function showLogin() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("signupForm").style.display = "none";
}

function showSignup() {
    document.getElementById("signupForm").style.display = "block";
    document.getElementById("loginForm").style.display = "none";
}

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const res = await api("/api/login", {
        method: "POST",
        body: JSON.stringify({
            email: loginEmail.value,
            password: loginPass.value
        })
    });
   if (res.ok) {
    alert("✅ Logged In Successfully");
    fetchMe();
    showProfile();
} else {
        alert("❌ Wrong Email or Password");
    }
});

// Signup
document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (signupPass.value !== signupRePass.value) return alert("Passwords Do Not Match ❌");

    const res = await api("/api/register", {
        method: "POST",
        body: JSON.stringify({
            email: signupEmail.value,
            phone: signupPh.value,
            password: signupPass.value
        })
    });

    if (res.ok) {
        await fetchMe();
        updateProfileUI();
        alert("✅ Account Created...");
    } else {
        alert("❌ Email Already Exists");
    }
});

// Logout
async function logoutUser() {
    await api("/api/auth/logout", { method: "POST" });
    currentUser = null;
    fetchMe(); // refresh UI state
    alert("Logged Out ✅");
    showProfile(); // return to profile page showing login form
}



