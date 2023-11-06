const elements = {
  cartIcon: document.getElementById("cartIcon"),
  cartSidebar: document.getElementById("cartSidebar"),
  cartItemCount: document.getElementById("cartItemCount"),
  cartItems: document.getElementById("cartItems"),
  closeCart: document.getElementById("closeCart"),
  productContainer: document.getElementById("productContainer"),
  sortSelect: document.getElementById("sortSelect"),
  filterIcon: document.getElementById("filterIcon"),
  filterMenu: document.getElementById("filterMenu"),
  categoryFilter: document.getElementById("categoryFilter"),
  minPrice: document.getElementById("minPrice"),
  maxPrice: document.getElementById("maxPrice"),
  applyButton: document.getElementById("applyButton"),
  cartTotal: document.getElementById("cartTotal"),
  buyButton: document.getElementById("buyButton"),
};

let state = {
  isCartOpen: false,
  cartItemCounter: 0,
  cart: {},
  totalPrice: 0,
};

elements.filterIcon.addEventListener("click", toggleFilterMenu);
elements.applyButton.addEventListener("click", applyFilters);
elements.cartIcon.addEventListener("click", toggleCart);
elements.closeCart.addEventListener("click", toggleCart);
elements.sortSelect.addEventListener("change", sortProducts);
elements.buyButton.addEventListener("click", purchase);

fetchProducts();
fetchCategories();

function toggleFilterMenu() {
  elements.filterMenu.style.display =
    elements.filterMenu.style.display === "none" ? "block" : "none";
}

function applyFilters() {
  const category = elements.categoryFilter.value;
  const min = Number(elements.minPrice.value);
  const max = Number(elements.maxPrice.value);
  elements.productContainer.innerHTML = "";
  fetch("https://fakestoreapi.com/products")
    .then((res) => res.json())
    .then((data) => {
      let filteredData = data;
      if (category) {
        filteredData = filteredData.filter(
          (product) => product.category === category
        );
      }
      if (min) {
        filteredData = filteredData.filter((product) => product.price >= min);
      }
      if (max) {
        filteredData = filteredData.filter((product) => product.price <= max);
      }
      filteredData.forEach((product) => {
        createCard(product);
      });
    })
    .catch((error) => console.error("Error:", error));
}

function toggleCart() {
  state.isCartOpen = !state.isCartOpen;
  if (state.isCartOpen) {
    elements.cartSidebar.classList.add("cart-opened");
    elements.filterMenu.style.display = "none";
  } else {
    elements.cartSidebar.classList.remove("cart-opened");
  }
}

function addToCart(productName, productPrice) {
  productPrice = parseFloat(productPrice);
  const existingItem = Array.from(elements.cartItems.children).find((item) =>
    item.textContent.includes(productName)
  );

  if (existingItem) {
    incrementQuantity(existingItem, productPrice, productName);
  } else {
    addNewItem(productName, productPrice);
  }
}

function incrementQuantity(item, price, productName) {
  const quantityInput = item.querySelector("input[type='number']");
  quantityInput.value = parseInt(quantityInput.value) + 1;
  item.dataset.quantity = quantityInput.value;
  updateQuantity(item, productName, quantityInput.value);
  updateTotalPrice(price);
}

function addNewItem(productName, productPrice) {
  const listItem = createListItem(productName, productPrice);

  elements.cartItems.appendChild(listItem);
  elements.cartItemCount.textContent = ++state.cartItemCounter;

  updateTotalPrice(productPrice);
  elements.buyButton.style.display = "block";
}

function createListItem(productName, productPrice) {
  const listItem = document.createElement("li");
  listItem.dataset.price = productPrice;
  listItem.dataset.quantity = "1";

  const textNode = document.createTextNode(`${productName} - $${productPrice}`);

  const quantityInput = createQuantityInput(listItem, productName);
  const removeButton = createRemoveButton(productName);

  listItem.append(textNode, quantityInput, removeButton);

  return listItem;
}

function createQuantityInput(listItem, productName) {
  const quantityInput = document.createElement("input");
  quantityInput.type = "number";
  quantityInput.min = "1";
  quantityInput.value = "1";
  quantityInput.addEventListener("change", () => {
    updateQuantity(listItem, productName, quantityInput.value);
  });

  return quantityInput;
}

function createRemoveButton(productName) {
  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => {
    removeFromCart(productName);
  });

  return removeButton;
}

function updateTotalPrice(price) {
  state.totalPrice += price;
  elements.cartTotal.textContent = `Total: $${state.totalPrice.toFixed(2)}`;
}

function updateQuantity(listItem, productName, newQuantity) {
  newQuantity = parseFloat(newQuantity);
  const price = parseFloat(listItem.dataset.price);
  const oldTotal = price * listItem.dataset.quantity;
  const newTotal = price * newQuantity;
  state.totalPrice = state.totalPrice - oldTotal + newTotal;
  elements.cartTotal.textContent = `Total: $${state.totalPrice.toFixed(2)}`;

  listItem.dataset.quantity = newQuantity;

  const newText = document.createTextNode(
    `${productName} x ${newQuantity} - $${price * newQuantity}`
  );

  listItem.replaceChild(newText, listItem.firstChild);
}

function removeFromCart(productName) {
  const listItem = Array.from(elements.cartItems.children).find((item) =>
    item.textContent.startsWith(productName)
  );
  if (!listItem) {
    console.error(`Could not find product "${productName}" in the cart.`);
    return;
  }
  elements.cartItems.removeChild(listItem);
  elements.cartItemCount.textContent = --state.cartItemCounter;
  state.totalPrice -=
    parseFloat(listItem.dataset.price) * parseFloat(listItem.dataset.quantity);
  elements.cartTotal.textContent = `Total: $${state.totalPrice.toFixed(2)}`;
  if (state.cartItemCounter === 0) {
    elements.buyButton.style.display = "none";
  }
}
function purchase() {
  alert("Your purchase was successful!");
  elements.cartItems.innerHTML = "";
  elements.cartItemCount.textContent = 0;
  state.totalPrice = 0;
  elements.cartTotal.textContent = "";
  elements.buyButton.style.display = "none";
}
function fetchProducts() {
  fetch("https://fakestoreapi.com/products")
    .then((res) => res.json())
    .then((data) => {
      data.forEach((product) => {
        createCard(product);
      });
    })
    .catch((error) => console.error("Error:", error));
}

function fetchCategories() {
  fetch("https://fakestoreapi.com/products/categories")
    .then((res) => res.json())
    .then((categories) => {
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        elements.categoryFilter.appendChild(option);
      });
    })
    .catch((error) => console.error("Error:", error));
}

function createCard(product) {
  let card = document.createElement("div");
  card.className = "card";
  card.innerHTML = generateCardHTML(product);
  card.onclick = () => displayProductDetails(product.id);
  elements.productContainer.appendChild(card);
}

function generateCardHTML(product) {
  return `
    <img src="${product.image}" alt="${product.title}">
    <h2>${product.title}</h2>
    <h3>${product.price} $</h3>
    <button class='.add-to-cart-btn' onclick="addToCart('${product.title}', ${product.price})">Add to Cart</button>
  `;
}

function displayProductDetails(productId) {
  fetch(`https://fakestoreapi.com/products/${productId}`)
    .then((res) => res.json())
    .then((productDetails) => {
      let modal = createModal(productDetails);
      document.body.appendChild(modal);
      displayModal(modal);
    })
    .catch((error) => console.error("Error:", error));
}

function createModal(productDetails) {
  let modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = generateModalHTML(productDetails);
  return modal;
}

function generateModalHTML(productDetails) {
  return `
    <div class="modal-content">
      <span class="close">×</span>
      <h1>${productDetails.title}</h1>
      <img src="${productDetails.image}" alt="${productDetails.title}">
      <p>${productDetails.description}</p>
      <p>Price: ${productDetails.price}$</p>
      <button onclick="addToCart('${productDetails.title}', ${productDetails.price})">Add to Cart</button>
    </div>
  `;
}

function displayModal(modal) {
  let span = modal.querySelector(".close");
  modal.style.display = "block";
  span.onclick = () => {
    modal.style.display = "none";
  };
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
      modal.remove();
    }
  };
}

function sortProducts() {
  const sortBy = this.value;
  elements.productContainer.innerHTML = "";
  fetch("https://fakestoreapi.com/products")
    .then((res) => res.json())
    .then((data) => {
      switch (sortBy) {
        case "priceLowToHigh":
          data.sort((a, b) => a.price - b.price);
          break;
        case "priceHighToLow":
          data.sort((a, b) => b.price - a.price);
          break;
        case "nameAToZ":
          data.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "nameZToA":
          data.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case "popularity":
          data.sort((a, b) => b.rating.rate - a.rating.rate);
          break;
        default:
          break;
      }
      data.forEach((product) => {
        createCard(product);
      });
    })
    .catch((error) => console.error("Error:", error));
}
