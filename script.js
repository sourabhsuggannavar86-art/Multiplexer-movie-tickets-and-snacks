function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.add("hidden");
  });
  document.getElementById(pageId).classList.remove("hidden");
  if (pageId === "admin") {
    if (adminLoggedIn) showAdminDashboard();
  }
}

const movies = [
  {
    title: "Avengers: Endgame",
    poster: "🦸",
    language: "English",
    genre: "Action",
    rating: "8.4",
    certificate: "UA",
    duration: "181 min",
    description: "Earth's mightiest heroes reunite for one final time-changing mission.",
    trailer: "https://www.youtube.com/watch?v=TcMBFSGVi1c"
  },
  {
    title: "Avatar",
    poster: "🔵",
    language: "English",
    genre: "Sci-Fi",
    rating: "7.9",
    certificate: "UA",
    duration: "162 min",
    description: "A former marine is drawn into the beautiful and dangerous world of Pandora.",
    trailer: "https://www.youtube.com/watch?v=d9MyW72ELq0"
  },
  {
    title: "Jawan",
    poster: "⚔️",
    language: "Hindi",
    genre: "Action",
    rating: "7.0",
    certificate: "UA",
    duration: "169 min",
    description: "A vigilante fights corruption with a daring plan to right society's wrongs.",
    trailer: "https://www.youtube.com/watch?v=MWrQb0kM9tY"
  },
  {
    title: "Leo",
    poster: "🐯",
    language: "Tamil",
    genre: "Thriller",
    rating: "7.1",
    certificate: "A",
    duration: "164 min",
    description: "A quiet cafe owner's life changes after he confronts a violent past.",
    trailer: "https://www.youtube.com/watch?v=Po3jStA673E"
  },
  {
    title: "The Dark Knight",
    poster: "🦇",
    language: "English",
    genre: "Crime",
    rating: "9.0",
    certificate: "UA",
    duration: "152 min",
    description: "Batman faces a criminal mastermind who plunges Gotham into chaos.",
    trailer: "https://www.youtube.com/watch?v=EXeTwQWrcwY"
  },
  {
    title: "OM",
    poster: "🙏",
    language: "Kannada",
    genre: "Drama",
    rating: "8.2",
    certificate: "UA",
    duration: "150 min",
    description: "A powerful Kannada story of love, friendship and conflict.",
    trailer: "https://www.youtube.com/results?search_query=OM+Kannada+movie+trailer"
  }
];

const screens = [
  { name: "Screen 1", showtimes: ["10:00 AM", "02:30 PM", "06:45 PM"] },
  { name: "Screen 2", showtimes: ["11:15 AM", "04:00 PM", "09:15 PM"] },
  { name: "IMAX", showtimes: ["12:30 PM", "07:00 PM"] }
];

let selectedMovie = null;
let selectedScreen = screens[0];
let selectedShowtime = screens[0].showtimes[0];
let selectedSeats = [];
let seatLayout = [];

let account = JSON.parse(localStorage.getItem("multiplexAccount")) || null;
let bookings = JSON.parse(localStorage.getItem("multiplexBookings")) || [];

function renderMovieFilters() {
  const languageFilter = document.getElementById("languageFilter");
  const genreFilter = document.getElementById("genreFilter");
  [...new Set(movies.map(movie => movie.language))].forEach(language => {
    languageFilter.innerHTML += `<option value="${language}">${language}</option>`;
  });
  [...new Set(movies.map(movie => movie.genre))].forEach(genre => {
    genreFilter.innerHTML += `<option value="${genre}">${genre}</option>`;
  });
}

function renderMovies() {
  const language = document.getElementById("languageFilter").value;
  const genre = document.getElementById("genreFilter").value;
  const filtered = movies.filter(movie =>
    (language === "All" || movie.language === language) &&
    (genre === "All" || movie.genre === genre)
  );

  document.getElementById("movieList").innerHTML = filtered.map((movie, index) =>
    `<div class="card movie-card">
      <div class="poster">${movie.poster}</div>
      <h3>${movie.title}</h3>
      <p class="movie-meta">⭐ ${movie.rating} · ${movie.certificate} · ${movie.duration}</p>
      <p>${movie.language} · ${movie.genre}</p>
      <p class="movie-description">${movie.description}</p>
      <div class="movie-actions">
        <button class="trailer-button" onclick="window.open('${movie.trailer}', '_blank')">Watch Trailer</button>
        <button onclick="openBooking(${movies.indexOf(movie)})">Book Tickets</button>
      </div>
    </div>`
  ).join("");
}

function openBooking(movieIndex) {
  selectedMovie = movies[movieIndex];
  selectedSeats = [];
  selectedScreen = screens[0];
  selectedShowtime = screens[0].showtimes[0];
  generateSeatLayout();

  document.getElementById("bookingModal").classList.remove("hidden");
  renderBooking();
}

function closeBookingModal() {
  document.getElementById("bookingModal").classList.add("hidden");
}

function closeModalOnBackdrop(event) {
  if (event.target.id === "bookingModal") closeBookingModal();
}

function generateSeatLayout() {
  seatLayout = [];
  for (let row = 0; row < 6; row++) {
    for (let column = 1; column <= 10; column++) {
      const id = `${String.fromCharCode(65 + row)}${column}`;
      let type = "regular";
      if (row === 0) type = "recliner";
      else if (row === 1) type = "premium";
      else if ((row === 4 || row === 5) && (column === 4 || column === 5)) type = "couple";
      else if (row === 5 && column === 1) type = "wheelchair";

      const occupied = ["A3", "A8", "B5", "C2", "C9", "D6", "E4"].includes(id);
      seatLayout.push({ id, type, occupied });
    }
  }
}

function selectScreen(screenIndex) {
  selectedScreen = screens[screenIndex];
  selectedShowtime = selectedScreen.showtimes[0];
  renderBooking();
}

function selectShowtime(showtime) {
  selectedShowtime = showtime;
  renderBooking();
}

function toggleSeat(seatId) {
  const seat = seatLayout.find(item => item.id === seatId);
  if (!seat || seat.occupied) return;

  if (selectedSeats.includes(seatId)) {
    selectedSeats = selectedSeats.filter(id => id !== seatId);
  } else {
    if (selectedSeats.length >= 8) {
      alert("A maximum of 8 seats can be booked at once.");
      return;
    }
    selectedSeats.push(seatId);
  }
  renderBooking();
}

function seatPrice(type) {
  if (type === "recliner") return 450;
  if (type === "premium") return 350;
  if (type === "couple") return 600;
  if (type === "wheelchair") return 250;
  return 250;
}

function renderBooking() {
  const screensButtons = screens.map((screen, index) =>
    `<button class="${screen.name === selectedScreen.name ? "selected" : ""}" onclick="selectScreen(${index})">${screen.name}</button>`
  ).join("");

  const showtimeButtons = selectedScreen.showtimes.map(time =>
    `<button class="${time === selectedShowtime ? "selected" : ""}" onclick="selectShowtime('${time}')">${time}</button>`
  ).join("");

  const seats = seatLayout.map(seat =>
    `<button class="seat ${seat.type} ${seat.occupied ? "occupied" : ""} ${selectedSeats.includes(seat.id) ? "selected" : ""}"
      onclick="toggleSeat('${seat.id}')"
      title="${seat.type} seat - ₹${seatPrice(seat.type)}"
      ${seat.occupied ? "disabled" : ""}>${seat.id}</button>`
  ).join("");

  const seatTotal = selectedSeats.reduce((total, seatId) => {
    const seat = seatLayout.find(item => item.id === seatId);
    return total + seatPrice(seat.type);
  }, 0);

  document.getElementById("bookingSteps").innerHTML = `
    <h2>Book: ${selectedMovie.title}</h2>
    <p>${selectedMovie.language} · ${selectedMovie.genre} · ${selectedMovie.certificate}</p>
    <h3>Select Screen</h3>
    <div class="showtimes">${screensButtons}</div>
    <h3>Select Showtime</h3>
    <div class="showtimes">${showtimeButtons}</div>
    <div class="screen">SCREEN</div>
    <div class="seat-map">${seats}</div>
    <p>🟪 Recliner ₹450 · 🟦 Premium ₹350 · 🌸 Couple ₹600 · 🔵 Wheelchair ₹250 · Regular ₹250</p>
    <div class="booking-summary">
      <h3>Seats: ${selectedSeats.join(", ") || "None selected"}</h3>
      <h3>Ticket subtotal: ₹${seatTotal}</h3>
      <input id="promoCode" placeholder="Promo code" value="FAMILY100">
      <button onclick="applyPromo()">Apply Promo</button>
      <h3 id="discountLine">Discount: ₹0</h3>
      <h3 id="bookingTotal">Total: ₹${seatTotal}</h3>
      <button class="checkout" onclick="proceedToPayment()">Continue to Payment</button>
    </div>`;
}

let promoDiscount = 0;

function applyPromo() {
  const code = document.getElementById("promoCode").value.trim().toUpperCase();
  promoDiscount = code === "FAMILY100" ? 100 : code === "MOVIE20" ? 20 : 0;
  if (promoDiscount === 0) alert("Invalid promo code.");

  const subtotal = selectedSeats.reduce((total, seatId) => {
    const seat = seatLayout.find(item => item.id === seatId);
    return total + seatPrice(seat.type);
  }, 0);
  document.getElementById("discountLine").textContent =
    `Discount: ₹${code === "MOVIE20" ? `${Math.round(subtotal * 0.2)} (20%)` : promoDiscount}`;
  if (code === "MOVIE20") promoDiscount = Math.round(subtotal * 0.2);
  document.getElementById("bookingTotal").textContent =
    `Total: ₹${Math.max(0, subtotal - promoDiscount)}`;
}

function proceedToPayment() {
  if (selectedSeats.length === 0) {
    alert("Please select at least one seat.");
    return;
  }

  const subtotal = selectedSeats.reduce((total, seatId) => {
    const seat = seatLayout.find(item => item.id === seatId);
    return total + seatPrice(seat.type);
  }, 0);

  document.getElementById("bookingSteps").innerHTML = `
    <h2>Customer & Payment</h2>
    <div class="account-layout">
      <div>
        <input id="payName" type="text" placeholder="Full name" value="${account?.name || ""}" required>
        <input id="payEmail" type="email" placeholder="Email address" value="${account?.email || ""}" required>
        <input id="payPhone" type="tel" placeholder="Phone number" value="${account?.phone || ""}" required>
      </div>
      <div>
        <h3>Payment Method</h3>
        <select id="paymentMethod">
          <option>UPI</option>
          <option>Credit / Debit Card</option>
          <option>Net Banking</option>
        </select>
        <h3>Amount to pay: ₹${Math.max(0, subtotal - promoDiscount)}</h3>
        <p>No real payment will be taken in this demo.</p>
        <button class="checkout" onclick="completeBooking()">Pay & Confirm</button>
      </div>
    </div>`;
}

function completeBooking() {
  const name = document.getElementById("payName").value.trim();
  const email = document.getElementById("payEmail").value.trim();
  const phone = document.getElementById("payPhone").value.trim();
  if (!name || !email || !phone) {
    alert("Please enter customer details.");
    return;
  }

  const subtotal = selectedSeats.reduce((total, seatId) => {
    const seat = seatLayout.find(item => item.id === seatId);
    return total + seatPrice(seat.type);
  }, 0);
  const total = Math.max(0, subtotal - promoDiscount);

  const booking = {
    id: `MUX${Date.now().toString().slice(-8)}`,
    movie: selectedMovie.title,
    screen: selectedScreen.name,
    showtime: selectedShowtime,
    seats: [...selectedSeats],
    total,
    customer: { name, email, phone },
    status: "Confirmed",
    date: new Date().toLocaleString()
  };

  bookings.unshift(booking);
  localStorage.setItem("multiplexBookings", JSON.stringify(bookings));
  account = booking.customer;
  localStorage.setItem("multiplexAccount", JSON.stringify(account));
  loadAccount();

  selectedSeats.forEach(seatId => {
    const seat = seatLayout.find(item => item.id === seatId);
    seat.occupied = true;
  });

  document.getElementById("bookingSteps").innerHTML = `
    <div class="success-box">
      <h2>✅ Booking Confirmed</h2>
      <p><strong>${booking.movie}</strong></p>
      <p>${booking.screen} · ${booking.showtime}</p>
      <p>Seats: ${booking.seats.join(", ")}</p>
      <p>Booking ID: ${booking.id}</p>
      <p>Confirmation sent to ${email} and ${phone}</p>
      <div class="qr-code" title="QR code"></div>
      <button class="checkout" onclick="closeBookingModal(); showPage('account')">View My Booking</button>
    </div>`;
}

function saveAccount(event) {
  event.preventDefault();
  account = {
    name: document.getElementById("customerName").value.trim(),
    email: document.getElementById("customerEmail").value.trim(),
    phone: document.getElementById("customerPhone").value.trim()
  };
  localStorage.setItem("multiplexAccount", JSON.stringify(account));
  alert("Account details saved.");
}

function loadAccount() {
  if (!account) return;
  document.getElementById("customerName").value = account.name || "";
  document.getElementById("customerEmail").value = account.email || "";
  document.getElementById("customerPhone").value = account.phone || "";
  renderBookingHistory();
}

function renderBookingHistory() {
  const history = document.getElementById("bookingHistory");
  if (bookings.length === 0) {
    history.innerHTML = "No bookings yet.";
    return;
  }
  history.innerHTML = bookings.map((booking, index) =>
    `<div class="booking-item">
      <h3>${booking.movie}</h3>
      <p>${booking.screen} · ${booking.showtime}</p>
      <p>Seats: ${booking.seats.join(", ")}</p>
      <p>Total: ₹${booking.total} · ${booking.status}</p>
      <p>Booking ID: ${booking.id}</p>
      ${booking.status === "Confirmed"
        ? `<button onclick="cancelBooking(${index})">Cancel & Refund</button>`
        : ""}
    </div>`
  ).join("");
}

function cancelBooking(index) {
  if (!confirm("Cancel this booking and receive a refund?")) return;
  const booking = bookings[index];
  booking.status = "Cancelled";
  booking.refund = booking.total;
  localStorage.setItem("multiplexBookings", JSON.stringify(bookings));
  renderBookingHistory();
  alert(`Booking cancelled. Refund of ₹${booking.total} initiated.`);
}

// POS product catalog
const products = [
  { barcode: "1001", name: "Classic Popcorn", price: 150, category: "Popcorn", icon: "🍿", stock: 18 },
  { barcode: "1002", name: "Caramel Popcorn", price: 180, category: "Popcorn", icon: "🍿", stock: 8 },
  { barcode: "2001", name: "Coke", price: 80, category: "Beverages", icon: "🥤", stock: 25 },
  { barcode: "2002", name: "Mineral Water", price: 40, category: "Beverages", icon: "💧", stock: 5 },
  { barcode: "3001", name: "Margherita Pizza", price: 250, category: "Pizza", icon: "🍕", stock: 12 },
  { barcode: "3002", name: "Paneer Pizza", price: 320, category: "Pizza", icon: "🍕", stock: 7 },
  { barcode: "4001", name: "Veg Burger", price: 180, category: "Burgers", icon: "🍔", stock: 14 },
  { barcode: "4002", name: "Cheese Burger", price: 220, category: "Burgers", icon: "🍔", stock: 6 },
  { barcode: "5001", name: "Loaded Nachos", price: 120, category: "Snacks", icon: "🧀", stock: 16 },
  { barcode: "5002", name: "French Fries", price: 130, category: "Snacks", icon: "🍟", stock: 4 }
];

const combos = [
  { name: "Movie Combo", price: 350, items: ["Classic Popcorn", "Coke"], savings: 40 },
  { name: "Meal Deal", price: 420, items: ["Veg Burger", "Coke", "French Fries"], savings: 50 }
];

let cart = [];
let posDiscount = 0;
let cashier = "Cashier One";
let heldOrders = JSON.parse(localStorage.getItem("multiplexHeldOrders")) || [];
let posTransactions = JSON.parse(localStorage.getItem("multiplexTransactions")) || [];
let kitchenOrders = JSON.parse(localStorage.getItem("multiplexKitchenOrders")) || [];

function setCashier(name) {
  cashier = name;
}

function renderProducts() {
  const category = document.getElementById("categoryFilter").value;
  const visible = products.filter(product => category === "All" || product.category === category);
  document.getElementById("productList").innerHTML = visible.map(product =>
    `<div class="product">
      <h2>${product.icon}</h2>
      <h3>${product.name}</h3>
      <p>${product.category}</p>
      <p>₹${product.price}</p>
      <p class="${product.stock <= 5 ? "stock-low" : ""}">Stock: ${product.stock}</p>
      <button onclick="addToCartByBarcode('${product.barcode}')">Add</button>
    </div>`
  ).join("");
}

function addToCart(index) {
  addToCartByBarcode(products[index].barcode);
}

function addToCartByBarcode(barcode) {
  const product = products.find(item => item.barcode === barcode);
  if (!product) {
    alert("Unknown barcode or product.");
    return;
  }
  if (product.stock <= 0) {
    alert(`${product.name} is out of stock.`);
    return;
  }
  const existing = cart.find(item => item.barcode === barcode);
  if (existing) {
    if (existing.quantity >= product.stock) {
      alert("No more stock available.");
      return;
    }
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCart();
}

function changeQuantity(barcode, change) {
  const item = cart.find(product => product.barcode === barcode);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) cart = cart.filter(product => product.barcode !== barcode);
  updateCart();
}

function removeCartItem(barcode) {
  cart = cart.filter(product => product.barcode !== barcode);
  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById("cartItems");
  let subtotal = 0;
  if (cart.length === 0) {
    cartItems.innerHTML = "No items added";
  } else {
    cartItems.innerHTML = cart.map(item => {
      subtotal += item.price * item.quantity;
      return `<div class="pos-panel-item">
        <strong>${item.icon} ${item.name}</strong>
        <div class="quantity-controls">
          <button onclick="changeQuantity('${item.barcode}', -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity('${item.barcode}', 1)">+</button>
          <button onclick="removeCartItem('${item.barcode}')">Remove</button>
        </div>
      </div>`;
    }).join("");
  }
  const gst = subtotal * 0.05;
  const total = Math.max(0, subtotal - posDiscount + gst);
  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("discount").textContent = posDiscount.toFixed(2);
  document.getElementById("gst").textContent = gst.toFixed(2);
  document.getElementById("total").textContent = total.toFixed(2);
}

function applyPosCoupon() {
  const code = document.getElementById("posPromo").value.trim().toUpperCase();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (code === "SNACK50") posDiscount = 50;
  else if (code === "MOVIE10") posDiscount = subtotal * 0.1;
  else posDiscount = 0;
  if (posDiscount === 0) alert("Invalid coupon code.");
  updateCart();
}

function scanBarcode() {
  const barcode = document.getElementById("barcodeInput").value.trim();
  if (!barcode) return;
  addToCartByBarcode(barcode);
  document.getElementById("barcodeInput").value = "";
}

function renderCombos() {
  document.getElementById("comboList").innerHTML = combos.map((combo, index) =>
    `<div class="combo-item">
      <strong>${combo.name}</strong>
      <p>${combo.items.join(" + ")}</p>
      <p>₹${combo.price} · Save ₹${combo.savings}</p>
      <button onclick="addCombo(${index})">Add Combo</button>
    </div>`
  ).join("");
}

function addCombo(index) {
  const combo = combos[index];
  combo.items.forEach(name => {
    const product = products.find(item => item.name === name);
    if (product) addToCartByBarcode(product.barcode);
  });
  const comboSubtotal = combo.items.reduce((sum, name) => {
    const product = products.find(item => item.name === name);
    return sum + (product ? product.price : 0);
  }, 0);
  posDiscount += Math.max(0, comboSubtotal - combo.price);
  updateCart();
}

function holdOrder() {
  if (cart.length === 0) {
    alert("There is no order to hold.");
    return;
  }
  heldOrders.push({
    id: `HOLD${Date.now().toString().slice(-6)}`,
    cart: JSON.parse(JSON.stringify(cart)),
    discount: posDiscount,
    cashier,
    date: new Date().toLocaleString()
  });
  localStorage.setItem("multiplexHeldOrders", JSON.stringify(heldOrders));
  cart = [];
  posDiscount = 0;
  updateCart();
  alert("Order held and can be resumed.");
}

function showHeldOrders() {
  if (heldOrders.length === 0) {
    alert("No held orders.");
    return;
  }
  const choice = prompt(heldOrders.map((order, index) =>
    `${index + 1}. ${order.id} - ${order.cashier} - ₹${order.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}`
  ).join("\n") + "\nEnter held order number:");
  const index = Number(choice) - 1;
  if (!heldOrders[index]) return;
  cart = heldOrders[index].cart;
  posDiscount = heldOrders[index].discount;
  heldOrders.splice(index, 1);
  localStorage.setItem("multiplexHeldOrders", JSON.stringify(heldOrders));
  updateCart();
}

function getGrandTotal() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return Math.max(0, subtotal - posDiscount + subtotal * 0.05);
}

function openPayment() {
  if (cart.length === 0) {
    alert("Please add products first.");
    return;
  }
  document.getElementById("bookingModal").classList.remove("hidden");
  document.getElementById("bookingSteps").innerHTML = `
    <h2>Complete POS Payment</h2>
    <p>Cashier: ${cashier}</p>
    <h3>Amount Due: ₹${getGrandTotal().toFixed(2)}</h3>
    <label>Payment 1</label>
    <select id="paymentOne">
      <option>Cash</option><option>Card</option><option>UPI</option><option>Online</option>
    </select>
    <input id="paymentOneAmount" type="number" min="0" value="${getGrandTotal().toFixed(2)}" placeholder="Amount">
    <label>Payment 2 (optional split)</label>
    <select id="paymentTwo">
      <option value="">None</option><option>Cash</option><option>Card</option><option>UPI</option><option>Online</option>
    </select>
    <input id="paymentTwoAmount" type="number" min="0" value="0" placeholder="Amount">
    <button class="checkout" onclick="completePosPayment()">Confirm Payment</button>`;
}

function completePosPayment() {
  const due = getGrandTotal();
  const amountOne = Number(document.getElementById("paymentOneAmount").value) || 0;
  const amountTwo = Number(document.getElementById("paymentTwoAmount").value) || 0;
  if (Math.abs(amountOne + amountTwo - due) > 0.01) {
    alert("Split payment amounts must equal the grand total.");
    return;
  }

  const transaction = {
    id: `INV${Date.now().toString().slice(-8)}`,
    cashier,
    items: JSON.parse(JSON.stringify(cart)),
    subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    discount: posDiscount,
    gst: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.05,
    total: due,
    payments: [
      { method: document.getElementById("paymentOne").value, amount: amountOne },
      amountTwo > 0 ? { method: document.getElementById("paymentTwo").value, amount: amountTwo } : null
    ].filter(Boolean),
    status: "Completed",
    date: new Date().toLocaleString()
  };

  cart.forEach(item => {
    const product = products.find(productItem => productItem.barcode === item.barcode);
    if (product) product.stock = Math.max(0, product.stock - item.quantity);
  });
  posTransactions.unshift(transaction);
  kitchenOrders.unshift({
    id: transaction.id,
    items: transaction.items,
    status: "Preparing",
    cashier
  });
  localStorage.setItem("multiplexTransactions", JSON.stringify(posTransactions));
  localStorage.setItem("multiplexKitchenOrders", JSON.stringify(kitchenOrders));

  document.getElementById("bookingSteps").innerHTML = `
    <div class="success-box">
      <h2>Payment Successful</h2>
      <p>Invoice: ${transaction.id}</p>
      <p>Paid via ${transaction.payments.map(payment => `${payment.method} ₹${payment.amount.toFixed(2)}`).join(" + ")}</p>
      <h3>Total: ₹${due.toFixed(2)} including GST</h3>
      <button class="checkout" onclick="printReceipt('${transaction.id}')">Print Thermal Receipt</button>
      <button onclick="closeBookingModal()">Done</button>
    </div>`;
  cart = [];
  posDiscount = 0;
  updateCart();
  renderPosManagement();
  renderProducts();
}

function printReceipt(transactionId) {
  const transaction = posTransactions.find(item => item.id === transactionId);
  if (!transaction) return;
  const lines = transaction.items.map(item =>
    `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`
  ).join("<br>");
  const receipt = window.open("", "_blank", "width=320,height=600");
  receipt.document.write(`
    <html><body style="font-family:monospace;width:280px">
      <h3 style="text-align:center">MULTIPLEX</h3>
      <p>${transaction.date}<br>Invoice: ${transaction.id}<br>Cashier: ${transaction.cashier}</p>
      ${lines}
      <hr>
      <p>Subtotal: ₹${transaction.subtotal.toFixed(2)}<br>
      Discount: ₹${transaction.discount.toFixed(2)}<br>
      GST (5%): ₹${transaction.gst.toFixed(2)}<br>
      <strong>Total: ₹${transaction.total.toFixed(2)}</strong></p>
      <p>Thank you!</p>
    </body></html>`);
  receipt.document.close();
  receipt.print();
}

function voidTransaction() {
  if (posTransactions.length === 0) {
    alert("No transactions available.");
    return;
  }
  const pin = prompt("Manager authorization PIN:");
  if (pin !== "1234") {
    alert("Authorization denied.");
    return;
  }
  const choice = prompt(posTransactions.map((transaction, index) =>
    `${index + 1}. ${transaction.id} - ₹${transaction.total} - ${transaction.status}`
  ).join("\n") + "\nEnter transaction number:");
  const index = Number(choice) - 1;
  if (!posTransactions[index]) return;
  posTransactions[index].status = "Refunded";
  posTransactions[index].refund = posTransactions[index].total;
  localStorage.setItem("multiplexTransactions", JSON.stringify(posTransactions));
  renderPosManagement();
  alert(`Refund of ₹${posTransactions[index].total} initiated.`);
}

function renderPosManagement() {
  document.getElementById("kitchenOrders").innerHTML = kitchenOrders.length
    ? kitchenOrders.map((order, index) =>
      `<div class="kitchen-item">
        <strong>${order.id}</strong>
        <p>${order.items.map(item => `${item.name} x${item.quantity}`).join(", ")}</p>
        <p>Status: ${order.status}</p>
        ${order.status !== "Ready"
          ? `<button onclick="markKitchenReady(${index})">Mark Ready</button>`
          : ""}
      </div>`).join("")
    : "No active kitchen orders.";

  document.getElementById("inventoryAlerts").innerHTML = products
    .filter(product => product.stock <= 5)
    .map(product => `<p class="stock-low">${product.icon} ${product.name}: only ${product.stock} left</p>`)
    .join("") || "<p>Stock levels are healthy.</p>";

  document.getElementById("transactionList").innerHTML = posTransactions.slice(0, 5).map(transaction =>
    `<div class="transaction-item">
      <strong>${transaction.id}</strong>
      <p>₹${transaction.total.toFixed(2)} · ${transaction.status}</p>
      <p>${transaction.cashier}</p>
    </div>`
  ).join("") || "No transactions yet.";
}

function markKitchenReady(index) {
  kitchenOrders[index].status = "Ready";
  localStorage.setItem("multiplexKitchenOrders", JSON.stringify(kitchenOrders));
  renderPosManagement();
}

let adminLoggedIn = sessionStorage.getItem("multiplexAdminLoggedIn") === "true";
let expenses = JSON.parse(localStorage.getItem("multiplexExpenses")) || [];

function loginAdmin() {
  const username = document.getElementById("adminUsername").value.trim();
  const password = document.getElementById("adminPassword").value;
  if (username !== "admin" || password !== "1234") {
    alert("Invalid admin credentials.");
    return;
  }
  adminLoggedIn = true;
  sessionStorage.setItem("multiplexAdminLoggedIn", "true");
  showAdminDashboard();
}

function logoutAdmin() {
  adminLoggedIn = false;
  sessionStorage.removeItem("multiplexAdminLoggedIn");
  document.getElementById("adminLogin").classList.remove("hidden");
  document.getElementById("adminDashboard").classList.add("hidden");
}

function showAdminDashboard() {
  document.getElementById("adminLogin").classList.add("hidden");
  document.getElementById("adminDashboard").classList.remove("hidden");
  renderAdminDashboard();
}

function completedPosTransactions() {
  return posTransactions.filter(transaction => transaction.status !== "Refunded");
}

function renderAdminDashboard() {
  if (!adminLoggedIn) return;

  const ticketSales = bookings
    .filter(booking => booking.status !== "Cancelled")
    .reduce((sum, booking) => sum + booking.total, 0);
  const snackSales = completedPosTransactions()
    .reduce((sum, transaction) => sum + transaction.total, 0);
  const gstCollected = completedPosTransactions()
    .reduce((sum, transaction) => sum + transaction.gst, 0);
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const profit = ticketSales + snackSales - expenseTotal;

  document.getElementById("adminMetrics").innerHTML = `
    <div class="card metric-card">Ticket Sales<strong>₹${ticketSales.toFixed(2)}</strong></div>
    <div class="card metric-card">Snack Sales<strong>₹${snackSales.toFixed(2)}</strong></div>
    <div class="card metric-card">GST Collected<strong>₹${gstCollected.toFixed(2)}</strong></div>
    <div class="card metric-card">Net Profit<strong>₹${profit.toFixed(2)}</strong></div>
    <div class="card metric-card">Ticket Bookings<strong>${bookings.filter(item => item.status !== "Cancelled").length}</strong></div>
    <div class="card metric-card">POS Orders<strong>${completedPosTransactions().length}</strong></div>`;

  const confirmedBookings = bookings.filter(booking => booking.status !== "Cancelled");
  const screenTotals = {};
  const movieTotals = {};
  confirmedBookings.forEach(booking => {
    screenTotals[booking.screen] = (screenTotals[booking.screen] || 0) + booking.total;
    movieTotals[booking.movie] = (movieTotals[booking.movie] || 0) + booking.total;
  });

  document.getElementById("revenueReports").innerHTML = `
    <h3>Movie-wise Collection</h3>
    ${Object.entries(movieTotals).map(([name, amount]) =>
      `<div class="report-row"><span>${name}</span><strong>₹${amount.toFixed(2)}</strong></div>`
    ).join("") || "<p>No ticket sales yet.</p>"}
    <h3>Snack-wise Sales</h3>
    ${completedPosTransactions().flatMap(transaction => transaction.items).reduce((rows, item) => {
      const existing = rows.find(row => row.name === item.name);
      if (existing) existing.amount += item.price * item.quantity;
      else rows.push({ name: item.name, amount: item.price * item.quantity });
      return rows;
    }, []).map(row =>
      `<div class="report-row"><span>${row.name}</span><strong>₹${row.amount.toFixed(2)}</strong></div>`
    ).join("") || "<p>No snack sales yet.</p>"}`;

  document.getElementById("occupancyReports").innerHTML =
    Object.entries(screenTotals).map(([screen, amount]) => {
      const count = confirmedBookings.filter(booking => booking.screen === screen)
        .reduce((sum, booking) => sum + booking.seats.length, 0);
      const occupancy = Math.min(100, count / 60 * 100);
      return `<div class="report-row"><span>${screen} · ${count} seats</span><strong>${occupancy.toFixed(1)}%</strong></div>`;
    }).join("") || "<p>No occupancy data yet.</p>";

  const cashierTotals = {};
  const paymentTotals = {};
  completedPosTransactions().forEach(transaction => {
    cashierTotals[transaction.cashier] =
      (cashierTotals[transaction.cashier] || 0) + transaction.total;
    transaction.payments.forEach(payment => {
      paymentTotals[payment.method] =
        (paymentTotals[payment.method] || 0) + payment.amount;
    });
  });

  document.getElementById("cashierReports").innerHTML = `
    <h3>Cashier Sales</h3>
    ${Object.entries(cashierTotals).map(([name, amount]) =>
      `<div class="report-row"><span>${name}</span><strong>₹${amount.toFixed(2)}</strong></div>`
    ).join("") || "<p>No POS sales yet.</p>"}
    <h3>Payment Methods</h3>
    ${Object.entries(paymentTotals).map(([name, amount]) =>
      `<div class="report-row"><span>${name}</span><strong>₹${amount.toFixed(2)}</strong></div>`
    ).join("") || "<p>No payment data yet.</p>"}`;

  document.getElementById("gstReports").innerHTML = `
    <h3>GST Report</h3>
    <div class="report-row"><span>GST collected</span><strong>₹${gstCollected.toFixed(2)}</strong></div>
    <h3>Product Stock</h3>
    ${products.map(product =>
      `<div class="report-row ${product.stock <= 5 ? "stock-low" : ""}">
        <span>${product.name}</span><strong>${product.stock}</strong>
      </div>`
    ).join("")}`;

  document.getElementById("expenseList").innerHTML = expenses.map((expense, index) =>
    `<div class="report-row">
      <span>${expense.name}</span>
      <strong>₹${expense.amount.toFixed(2)}</strong>
      <button onclick="removeExpense(${index})">Remove</button>
    </div>`
  ).join("") || "<p>No expenses recorded.</p>";

  document.getElementById("profitReport").innerHTML = `
    <div class="report-row"><span>Ticket revenue</span><strong>₹${ticketSales.toFixed(2)}</strong></div>
    <div class="report-row"><span>Snack revenue</span><strong>₹${snackSales.toFixed(2)}</strong></div>
    <div class="report-row"><span>Total expenses</span><strong>₹${expenseTotal.toFixed(2)}</strong></div>
    <div class="report-row"><span>Estimated profit</span><strong>₹${profit.toFixed(2)}</strong></div>`;
}

function addExpense() {
  const name = document.getElementById("expenseName").value.trim();
  const amount = Number(document.getElementById("expenseAmount").value);
  if (!name || amount <= 0) {
    alert("Enter an expense name and valid amount.");
    return;
  }
  expenses.push({ name, amount, date: new Date().toLocaleDateString() });
  localStorage.setItem("multiplexExpenses", JSON.stringify(expenses));
  document.getElementById("expenseName").value = "";
  document.getElementById("expenseAmount").value = "";
  renderAdminDashboard();
}

function removeExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem("multiplexExpenses", JSON.stringify(expenses));
  renderAdminDashboard();
}

function exportReport(format) {
  renderAdminDashboard();
  const ticketSales = bookings
    .filter(booking => booking.status !== "Cancelled")
    .reduce((sum, booking) => sum + booking.total, 0);
  const snackSales = completedPosTransactions()
    .reduce((sum, transaction) => sum + transaction.total, 0);
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const profit = ticketSales + snackSales - expenseTotal;
  const rows = [
    ["Report", "Amount"],
    ["Ticket Sales", ticketSales.toFixed(2)],
    ["Snack Sales", snackSales.toFixed(2)],
    ["Expenses", expenseTotal.toFixed(2)],
    ["Profit", profit.toFixed(2)]
  ];

  if (format === "csv") {
    const csv = rows.map(row => row.map(value => `"${value}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "multiplex-report.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  } else {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <html><body style="font-family:Arial;padding:30px">
      <h1>Multiplex Management Report</h1>
      ${rows.map(row => `<p><strong>${row[0]}:</strong> ${row[0] === "Report" ? row[1] : "₹" + row[1]}</p>`).join("")}
      </body></html>`);
    printWindow.document.close();
    printWindow.print();
  }
}

renderMovieFilters();
renderMovies();
loadAccount();
renderProducts();
renderCombos();
renderPosManagement();
updateCart();
if (adminLoggedIn) showAdminDashboard();
