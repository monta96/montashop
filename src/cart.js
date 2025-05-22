let label = document.getElementById("label");
let ShoppingCart = document.getElementById("shopping-cart");

let basket = JSON.parse(localStorage.getItem("data")) || [];

// Toast Notification System
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 2500);
}

// Cart Calculation
let calculation = () => {
  let cartIcon = document.getElementById("cartAmount");
  if (cartIcon) {
    cartIcon.innerHTML = basket.reduce((total, item) => total + item.item, 0);
  }
};


let generateCartItems = () => {
  if (basket.length !== 0) {
    ShoppingCart.innerHTML = basket.map((x) => {
      let { id, item } = x;
      let search = shopItemsData.find((y) => y.id === id) || {};
      
      return `
      <div class="cart-item">
        <img width="100" src="${search.img || ''}" alt="${search.name || 'Product'}"/>
        <div class="details">
          <div class="title-price-x">
            <h4 class="title-price">
              <p>${search.name || 'Item'}</p>
              <p class="cart-item-price">$${search.price || 0}</p>
            </h4>
            <i onclick="removeItem('${id}')" class="bi bi-x-lg"></i>
          </div>
          
          <h3>$${(item * (search.price || 0)).toFixed(2)}</h3>
          
          <div class="button-group">
            <div class="quantity-controls">
              <i onclick="decrement('${id}')" class="bi bi-dash-lg"></i>
              <div id="${id}" class="quantity">${item}</div>
              <i onclick="increment('${id}')" class="bi bi-plus-lg"></i>
            </div>
            
            <div class="save-later">
              <button onclick="saveForLater('${id}')" class="save-btn">
                <i class="bi bi-bookmark"></i> Save
              </button>
            </div>
          </div>
        </div>
      </div>`;
    }).join("");
  } else {
    ShoppingCart.innerHTML = ``;
    label.innerHTML = `
    <h2>Cart is Empty</h2>
    <a href="index.html">
      <button class="HomeBtn">Back to home</button>
    </a>`;
  }
};

// Cart Operations
let increment = (id) => {
  let search = basket.find((x) => x.id === id);
  if (!search) {
    basket.push({ id, item: 1 });
  } else {
    search.item += 1;
  }
  update(id);
  localStorage.setItem("data", JSON.stringify(basket));
};

let decrement = (id) => {
  let search = basket.find((x) => x.id === id);
  if (!search || search.item <= 0) return;
  search.item -= 1;
  update(id);
  basket = basket.filter((x) => x.item !== 0);
  localStorage.setItem("data", JSON.stringify(basket));
};

let update = (id) => {
  let search = basket.find((x) => x.id === id);
  let element = document.getElementById(id);
  if (element) {
    element.innerHTML = search ? search.item : 0;
  }
  calculation();
  TotalAmount();
};

let removeItem = (id) => {
  basket = basket.filter((x) => x.id !== id);
  generateCartItems();
  TotalAmount();
  localStorage.setItem("data", JSON.stringify(basket));
};

// Save for Later Feature
let saveForLater = (id) => {
  let item = basket.find(x => x.id === id);
  if (item) {
    let saved = JSON.parse(localStorage.getItem("saved")) || [];
    saved.push(item);
    localStorage.setItem("saved", JSON.stringify(saved));
    removeItem(id);
    showToast("✓ Saved for later");
  }
};

let clearCart = () => {
  basket = [];
  generateCartItems();
  localStorage.setItem("data", JSON.stringify(basket));
};

// Total Calculation
let TotalAmount = () => {  
  if (basket.length !== 0) {
    let amount = basket
      .map((x) => {
        let { item, id } = x;
        let search = shopItemsData.find((y) => y.id === id) || [];
        return item * search.price;
      })
      .reduce((x, y) => x + y, 0);

      label.innerHTML = `
    <h2>Total Bill: $${amount.toFixed(2)}</h2>
    <a href="checkout.html" class="checkout">Proceed to Checkout</a>
    <button onclick="clearCart()" class="removeAll">Clear Cart</button>
    `;
  } else {
    label.innerHTML = '';
  }
};

// Initialize
calculation();
generateCartItems();
TotalAmount();


function displaySavedItems() {
    const saved = JSON.parse(localStorage.getItem("saved")) || [];
    const savedSection = document.getElementById("saved-section");
    
    if (saved.length > 0 && savedSection) {
        savedSection.innerHTML = `
            <h3>Saved For Later</h3>
            <div class="saved-list">
                ${saved.map(item => {
                    const product = shopItemsData.find(p => p.id === item.id) || {};
                    return `
                        <div class="saved-item">
                            <img src="${product.img || ''}" width="50" alt="">
                            <span>${product.name || 'Item'}</span>
                            <button onclick="moveToCart('${item.id}')">Move to Cart</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
}
function moveToCart(id) {
    let saved = JSON.parse(localStorage.getItem("saved")) || [];
    let item = saved.find(x => x.id === id);
    
    if (item) {
        // Add to cart
        let basket = JSON.parse(localStorage.getItem("data")) || [];
        let existingItem = basket.find(x => x.id === id);
        
        if (existingItem) {
            existingItem.item += item.item || 1;
        } else {
            basket.push({
                id: item.id,
                item: item.item || 1
            });
        }
        
        // Remove from saved
        saved = saved.filter(x => x.id !== id);
        
        // Update storage
        localStorage.setItem("data", JSON.stringify(basket));
        localStorage.setItem("saved", JSON.stringify(saved));
        
        // Refresh displays
        generateCartItems();
        displaySavedItems();
        calculation();
        TotalAmount();
        showToast("Moved to cart!");
    }
}


displaySavedItems();