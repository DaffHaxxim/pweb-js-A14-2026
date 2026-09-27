// konfigurasi
const PRODUCTS_API = "https://dummyjson.com/products";
const SESSION_KEY = "firstName";
const CART_KEY = "pweb.cart";
const PAGE_SIZE = 12;
const SEARCH_DELAY = 300;

// proteksi halaman
const sessionName = localStorage.getItem(SESSION_KEY);

if (sessionName === null) {
  window.location.replace("login.html");
}

// elemen
const greeting = document.querySelector("#greeting");
const searchInput = document.querySelector("#search-input");
const categorySelect = document.querySelector("#category-select");
const sortSelect = document.querySelector("#sort-select");
const resultCount = document.querySelector("#result-count");
const loadingState = document.querySelector("#loading-state");
const errorState = document.querySelector("#error-state");
const errorMessage = document.querySelector("#error-message");
const retryButton = document.querySelector("#retry-button");
const emptyState = document.querySelector("#empty-state");
const productGrid = document.querySelector("#product-grid");
const loadMoreButton = document.querySelector("#load-more");
const logoutButton = document.querySelector("#logout-button");
const cartButton = document.querySelector("#cart-button");
const cartBadge = document.querySelector("#cart-badge");
const cartOverlay = document.querySelector("#cart-overlay");
const cartDrawer = document.querySelector("#cart-drawer");
const cartList = document.querySelector("#cart-list");
const cartEmpty = document.querySelector("#cart-empty");
const cartTotal = document.querySelector("#cart-total");
const productModal = document.querySelector("#product-modal");
const toast = document.querySelector("#toast");

const modalFields = {
  image: document.querySelector("#modal-image"),
  discount: document.querySelector("#modal-discount"),
  category: document.querySelector("#modal-category"),
  title: document.querySelector("#modal-title"),
  brand: document.querySelector("#modal-brand"),
  price: document.querySelector("#modal-price"),
  original: document.querySelector("#modal-original"),
  rating: document.querySelector("#modal-rating"),
  stock: document.querySelector("#modal-stock"),
  description: document.querySelector("#modal-description"),
};

// state
let allProducts = [];
let searchQuery = "";
let activeCategory = "all";
let activeSort = "default";
let visibleCount = PAGE_SIZE;
let activeProductId = null;

// utilitas
const formatPrice = (value) => `$${value.toFixed(2)}`;

const getOriginalPrice = (product) => product.price / (1 - product.discountPercentage / 100);

const formatCategory = (slug) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const findProduct = (id) => allProducts.find((product) => product.id === id) ?? null;

const debounce = (callback, delay) => {
  let timerId;

  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => callback(...args), delay);
  };
};

// pipeline data
const filterByQuery = (items, query) => {
  if (query === "") return items;

  return items.filter(
    (product) =>
      product.title.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
  );
};

const filterByCategory = (items, category) =>
  category === "all" ? items : items.filter((product) => product.category === category);

const sortProducts = (items, sort) => {
  const copy = [...items];

  if (sort === "price-asc") return copy.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return copy.sort((a, b) => b.price - a.price);
  if (sort === "rating-desc") return copy.sort((a, b) => b.rating - a.rating);
  return copy;
};

const getFilteredProducts = () =>
  sortProducts(filterByCategory(filterByQuery(allProducts, searchQuery), activeCategory), activeSort);

// kartu produk
const createProductCard = (product) => {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.id = product.id;
  card.tabIndex = 0;
  card.setAttribute("aria-label", `Lihat detail ${product.title}`);

  const media = document.createElement("div");
  media.className = "card-media";

  const badge = document.createElement("span");
  badge.className = "discount-badge";
  badge.textContent = `-${Math.round(product.discountPercentage)}%`;

  const image = document.createElement("img");
  image.src = product.thumbnail;
  image.alt = product.title;
  image.loading = "lazy";

  media.append(badge, image);

  const body = document.createElement("div");
  body.className = "card-body";

  const chip = document.createElement("span");
  chip.className = "chip";
  chip.textContent = formatCategory(product.category);

  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = product.title;

  const meta = document.createElement("div");
  meta.className = "card-meta";

  const price = document.createElement("span");
  price.className = "price";
  price.textContent = formatPrice(product.price);

  const rating = document.createElement("span");
  rating.className = "rating";
  rating.textContent = product.rating.toFixed(1);

  meta.append(price, rating);

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "btn btn-primary btn-block btn-add";
  addButton.textContent = "Tambah ke Keranjang";

  body.append(chip, title, meta, addButton);
  card.append(media, body);
  return card;
};

// render
const render = () => {
  const filtered = getFilteredProducts();
  const visible = filtered.slice(0, visibleCount);

  productGrid.replaceChildren(...visible.map(createProductCard));

  resultCount.textContent = `Menampilkan ${visible.length} dari ${filtered.length} produk`;
  emptyState.hidden = filtered.length > 0;
  loadMoreButton.hidden = visibleCount >= filtered.length;
};

const resetAndRender = () => {
  visibleCount = PAGE_SIZE;
  render();
};

// kategori
const renderCategoryOptions = (products) => {
  const categories = [...new Set(products.map((product) => product.category))].sort();

  const options = categories.map((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = formatCategory(category);
    return option;
  });

  categorySelect.replaceChildren(categorySelect.options[0], ...options);
};

// ambil data
const showLoading = () => {
  const skeletons = Array.from({ length: PAGE_SIZE }, () => {
    const box = document.createElement("div");
    box.className = "skeleton";
    return box;
  });

  loadingState.replaceChildren(...skeletons);
  loadingState.hidden = false;
  errorState.hidden = true;
  emptyState.hidden = true;
  productGrid.replaceChildren();
  loadMoreButton.hidden = true;
  resultCount.textContent = "Memuat produk...";
};

const loadProducts = async () => {
  showLoading();

  try {
    const response = await fetch(`${PRODUCTS_API}?limit=0`);

    if (!response.ok) {
      throw new Error(`Server merespons dengan status ${response.status}.`);
    }

    const data = await response.json();
    allProducts = data.products;

    renderCategoryOptions(allProducts);
    resetAndRender();
  } catch (error) {
    errorMessage.textContent =
      error instanceof TypeError
        ? "Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi."
        : error.message;
    errorState.hidden = false;
    resultCount.textContent = "";
  } finally {
    loadingState.hidden = true;
  }
};

// keranjang
const loadCart = () => {
  const saved = localStorage.getItem(CART_KEY);
  if (saved === null) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

let cart = loadCart();

const saveCart = (items) => {
  if (items.length === 0) {
    localStorage.removeItem(CART_KEY);
  } else {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }
};

const getCartCount = (items) => items.reduce((sum, item) => sum + item.qty, 0);

const getCartTotal = (items) => items.reduce((sum, item) => sum + item.price * item.qty, 0);

const updateCart = (nextCart) => {
  cart = nextCart;
  saveCart(cart);
  renderCart();
};

const addToCart = (product) => {
  const exists = cart.some((item) => item.id === product.id);

  const nextCart = exists
    ? cart.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
    : cart.concat({
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        qty: 1,
      });

  updateCart(nextCart);
  bumpBadge();
  showToast(`${product.title} ditambahkan ke keranjang`);
};

const changeQty = (id, delta) => {
  const nextCart = cart
    .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
    .filter((item) => item.qty > 0);

  updateCart(nextCart);
};

const removeFromCart = (id) => updateCart(cart.filter((item) => item.id !== id));

const clearCart = () => updateCart([]);

const createCartItem = (item) => {
  const row = document.createElement("li");
  row.className = "cart-item";
  row.dataset.id = item.id;

  const image = document.createElement("img");
  image.src = item.thumbnail;
  image.alt = item.title;

  const info = document.createElement("div");

  const title = document.createElement("p");
  title.className = "cart-item-title";
  title.textContent = item.title;

  const price = document.createElement("p");
  price.className = "cart-item-price";
  price.textContent = `${formatPrice(item.price)} x ${item.qty} = ${formatPrice(item.price * item.qty)}`;

  const qtyRow = document.createElement("div");
  qtyRow.className = "qty-row";

  const minus = document.createElement("button");
  minus.type = "button";
  minus.className = "qty-btn";
  minus.dataset.action = "decrease";
  minus.textContent = "-";
  minus.setAttribute("aria-label", `Kurangi ${item.title}`);

  const qty = document.createElement("span");
  qty.className = "qty-value";
  qty.textContent = item.qty;

  const plus = document.createElement("button");
  plus.type = "button";
  plus.className = "qty-btn";
  plus.dataset.action = "increase";
  plus.textContent = "+";
  plus.setAttribute("aria-label", `Tambah ${item.title}`);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove-btn";
  remove.dataset.action = "remove";
  remove.textContent = "Hapus";

  qtyRow.append(minus, qty, plus, remove);
  info.append(title, price, qtyRow);
  row.append(image, info);
  return row;
};

const renderCart = () => {
  cartList.replaceChildren(...cart.map(createCartItem));
  cartEmpty.hidden = cart.length > 0;
  cartBadge.textContent = getCartCount(cart);
  cartTotal.textContent = formatPrice(getCartTotal(cart));
};

const setCartOpen = (isOpen) => {
  cartDrawer.classList.toggle("is-open", isOpen);
  cartDrawer.setAttribute("aria-hidden", String(!isOpen));
  cartDrawer.inert = !isOpen;
  cartOverlay.hidden = !isOpen;
};

// notifikasi
const bumpBadge = () => {
  cartBadge.classList.remove("is-bump");
  void cartBadge.offsetWidth;
  cartBadge.classList.add("is-bump");
};

const showToast = (() => {
  let timerId;

  return (message) => {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      toast.hidden = true;
    }, 2000);
  };
})();

// modal detail
const openModal = (id) => {
  const product = findProduct(id);
  if (product === null) return;

  activeProductId = product.id;
  modalFields.image.src = product.images?.[0] ?? product.thumbnail;
  modalFields.image.alt = product.title;
  modalFields.discount.textContent = `-${Math.round(product.discountPercentage)}%`;
  modalFields.category.textContent = formatCategory(product.category);
  modalFields.title.textContent = product.title;
  modalFields.brand.textContent = product.brand ?? "-";
  modalFields.price.textContent = formatPrice(product.price);
  modalFields.original.textContent = formatPrice(getOriginalPrice(product));
  modalFields.rating.textContent = product.rating.toFixed(1);
  modalFields.stock.textContent = product.stock;
  modalFields.description.textContent = product.description;

  productModal.showModal();
};

// event
searchInput.addEventListener(
  "input",
  debounce((event) => {
    searchQuery = event.target.value.trim().toLowerCase();
    resetAndRender();
  }, SEARCH_DELAY)
);

categorySelect.addEventListener("change", () => {
  activeCategory = categorySelect.value;
  resetAndRender();
});

sortSelect.addEventListener("change", () => {
  activeSort = sortSelect.value;
  resetAndRender();
});

loadMoreButton.addEventListener("click", () => {
  visibleCount += PAGE_SIZE;
  render();
});

retryButton.addEventListener("click", loadProducts);

productGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".product-card");
  if (card === null) return;

  const id = Number(card.dataset.id);

  if (event.target.closest(".btn-add") !== null) {
    addToCart(findProduct(id));
  } else {
    openModal(id);
  }
});

productGrid.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.matches(".product-card")) {
    openModal(Number(event.target.dataset.id));
  }
});

productModal.addEventListener("click", (event) => {
  if (event.target === productModal || event.target.closest("[data-action='close']") !== null) {
    productModal.close();
  } else if (event.target.closest("[data-action='add']") !== null) {
    addToCart(findProduct(activeProductId));
  }
});

cartButton.addEventListener("click", () => setCartOpen(true));
cartOverlay.addEventListener("click", () => setCartOpen(false));

cartDrawer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (button === null) return;

  const action = button.dataset.action;
  const row = button.closest(".cart-item");
  const id = row === null ? null : Number(row.dataset.id);

  if (action === "close") setCartOpen(false);
  if (action === "clear") clearCart();
  if (action === "increase") changeQty(id, 1);
  if (action === "decrease") changeQty(id, -1);
  if (action === "remove") removeFromCart(id);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) setCartOpen(false);
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  window.location.replace("login.html");
});

// init
if (sessionName !== null) {
  const nameEl = document.createElement("strong");
  nameEl.textContent = sessionName;
  greeting.replaceChildren("Halo, ", nameEl);
  document.body.classList.remove("is-guarded");

  setCartOpen(false);
  renderCart();
  loadProducts();
}
