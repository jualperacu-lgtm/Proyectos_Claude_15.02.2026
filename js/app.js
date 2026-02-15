// ── Estado global ──
let carrito = [];

// ── Utilidades ──
function getUsuario() {
  return JSON.parse(sessionStorage.getItem("usuario"));
}

function requireAuth() {
  if (!getUsuario()) {
    window.location.href = "index.html";
  }
}

// ── LOGIN ──
function initLogin() {
  // Si ya está logueado, ir al home
  if (getUsuario()) {
    window.location.href = "home.html";
    return;
  }

  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("loginError");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const usuario = document.getElementById("usuario").value.trim();
    const password = document.getElementById("password").value;

    const found = USUARIOS.find(
      (u) => u.usuario === usuario && u.password === password
    );

    if (found) {
      sessionStorage.setItem("usuario", JSON.stringify(found));
      window.location.href = "home.html";
    } else {
      errorEl.textContent = "Usuario o contraseña incorrectos";
    }
  });
}

// ── NAVBAR ──
function initNavbar() {
  const user = getUsuario();
  const userInfo = document.getElementById("userInfo");
  if (userInfo && user) {
    userInfo.textContent = user.nombre;
  }

  const logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("usuario");
      window.location.href = "index.html";
    });
  }
}

// ── VENTAS ──
function initVentas() {
  requireAuth();
  initNavbar();
  renderProductos();
  renderCarrito();
}

function renderProductos() {
  const grid = document.getElementById("productosGrid");
  if (!grid) return;

  grid.innerHTML = PRODUCTOS.map((p) => `
    <div class="producto-card">
      <div class="emoji">${p.imagen}</div>
      <div class="nombre">${p.nombre}</div>
      <div class="precio">S/ ${p.precio.toFixed(2)}</div>
      <div class="stock-info">Stock: ${p.stock} unidades</div>
      <button class="btn-add" onclick="addToCart(${p.id})" ${p.stock === 0 ? "disabled" : ""}>
        ${p.stock === 0 ? "Agotado" : "Añadir"}
      </button>
    </div>
  `).join("");
}

function addToCart(id) {
  const producto = PRODUCTOS.find((p) => p.id === id);
  if (!producto || producto.stock <= 0) return;

  const item = carrito.find((c) => c.id === id);
  if (item) {
    if (item.cantidad >= producto.stock) return;
    item.cantidad++;
  } else {
    carrito.push({ id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 });
  }

  renderCarrito();
}

function changeQty(id, delta) {
  const item = carrito.find((c) => c.id === id);
  if (!item) return;

  const producto = PRODUCTOS.find((p) => p.id === id);
  item.cantidad += delta;

  if (item.cantidad <= 0) {
    carrito = carrito.filter((c) => c.id !== id);
  } else if (producto && item.cantidad > producto.stock) {
    item.cantidad = producto.stock;
  }

  renderCarrito();
}

function renderCarrito() {
  const itemsEl = document.getElementById("carritoItems");
  const totalEl = document.getElementById("carritoTotal");
  const btnPagar = document.getElementById("btnPagar");
  if (!itemsEl) return;

  if (carrito.length === 0) {
    itemsEl.innerHTML = '<div class="carrito-empty">El carrito está vacío</div>';
    totalEl.textContent = "S/ 0.00";
    btnPagar.disabled = true;
    return;
  }

  btnPagar.disabled = false;

  itemsEl.innerHTML = carrito.map((item) => `
    <div class="carrito-item">
      <div class="item-info">
        <div class="item-nombre">${item.nombre}</div>
        <div class="item-precio">S/ ${item.precio.toFixed(2)} c/u</div>
      </div>
      <div class="item-qty">
        <button onclick="changeQty(${item.id}, -1)">−</button>
        <span>${item.cantidad}</span>
        <button onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join("");

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  totalEl.textContent = `S/ ${total.toFixed(2)}`;
}

function procesarVenta() {
  if (carrito.length === 0) return;

  // Descontar stock
  carrito.forEach((item) => {
    const producto = PRODUCTOS.find((p) => p.id === item.id);
    if (producto) {
      producto.stock -= item.cantidad;
    }
  });

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  alert(`Venta procesada con éxito.\nTotal: S/ ${total.toFixed(2)}`);

  carrito = [];
  renderProductos();
  renderCarrito();
}

// ── INVENTARIO ──
function initInventario() {
  requireAuth();
  initNavbar();
  renderInventario();
}

function renderInventario() {
  const tbody = document.getElementById("inventarioBody");
  if (!tbody) return;

  tbody.innerHTML = PRODUCTOS.map((p) => {
    let badgeClass = "alto";
    if (p.stock <= 20) badgeClass = "bajo";
    else if (p.stock <= 50) badgeClass = "medio";

    return `
      <tr>
        <td>${p.id}</td>
        <td>${p.imagen} ${p.nombre}</td>
        <td>${p.categoria}</td>
        <td>S/ ${p.precio.toFixed(2)}</td>
        <td><span class="badge-stock ${badgeClass}">${p.stock}</span></td>
      </tr>
    `;
  }).join("");
}
