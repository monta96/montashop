// Initialize product data with proper error handling
if (!window.shopItemsData || !Array.isArray(window.shopItemsData)) {
    console.error("Product data not loaded properly!");
    window.shopItemsData = [];
}

// Main checkout initialization
document.addEventListener('DOMContentLoaded', initializeCheckout);

function initializeCheckout() {
    try {
        const basket = getBasketItems();
        renderCheckoutItems(basket);
        setupFormSubmission();
    } catch (error) {
        console.error("Checkout initialization failed:", error);
        showToast("Failed to initialize checkout. Please refresh the page.");
    }
}

// Basket management
function getBasketItems() {
    try {
        return JSON.parse(localStorage.getItem("data")) || [];
    } catch (error) {
        console.error("Failed to parse basket data:", error);
        return [];
    }
}

function clearBasket() {
    localStorage.removeItem("data");
}

// Rendering functions
function renderCheckoutItems(basket) {
    const checkoutItems = document.getElementById("checkout-items");
    const checkoutTotal = document.getElementById("checkout-total");

    if (!checkoutItems || !checkoutTotal) {
        console.error("Required DOM elements not found");
        return;
    }

    if (basket.length === 0) {
        checkoutItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        checkoutTotal.innerHTML = '';
        return;
    }

    try {
        checkoutItems.innerHTML = generateCheckoutItemsHTML(basket);
        checkoutTotal.innerHTML = generateTotalHTML(basket);
    } catch (error) {
        console.error("Failed to render checkout items:", error);
        checkoutItems.innerHTML = '<p class="error-message">Failed to load cart items</p>';
    }
}

function generateCheckoutItemsHTML(basket) {
    return basket.map(item => {
        const product = findProduct(item.id) || { 
            name: "Unknown Product", 
            price: 0,
            image: "placeholder.jpg" 
        };
        
        return `
        <div class="checkout-item">
            <img src="${product.image || 'placeholder.jpg'}" alt="${product.name}" class="checkout-item-image">
            <div class="checkout-item-details">
                <span class="checkout-item-name">${product.name}</span>
                <span class="checkout-item-quantity">x ${item.item}</span>
                <span class="checkout-item-price">$${(product.price * item.item).toFixed(2)}</span>
            </div>
        </div>`;
    }).join('');
}

function generateTotalHTML(basket) {
    const subtotal = calculateSubtotal(basket);
    const shipping = 5.99;
    const total = subtotal + shipping;

    return `
    <div class="total-line">
        <span>Subtotal:</span>
        <span>$${subtotal.toFixed(2)}</span>
    </div>
    <div class="total-line">
        <span>Shipping:</span>
        <span>$${shipping.toFixed(2)}</span>
    </div>
    <div class="total-line grand-total">
        <span>Total:</span>
        <span>$${total.toFixed(2)}</span>
    </div>`;
}

// Calculation helpers
function calculateSubtotal(basket) {
    return basket.reduce((total, item) => {
        const product = findProduct(item.id) || { price: 0 };
        return total + (product.price * item.item);
    }, 0);
}

function findProduct(id) {
    return window.shopItemsData.find(p => {
        // Handle both string and number IDs
        return String(p.id) === String(id);
    });
}

// Form handling
function setupFormSubmission() {
    const form = document.getElementById("checkout-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        
        try {
            // Disable button during processing
            submitButton.disabled = true;
            submitButton.textContent = "Processing...";
            
            await processPayment();
        } catch (error) {
            console.error("Payment processing failed:", error);
            showToast("Payment failed. Please try again.");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
}

// Payment processing
async function processPayment() {
    const basket = getBasketItems();
    
    if (basket.length === 0) {
        showToast("Your cart is empty!");
        return;
    }
    
    // Validate form data
    const formData = getFormData();
    if (!isFormValid(formData)) {
        showToast("Please fill in all required fields");
        return;
    }
    
    try {
        // Create order record
        const order = createOrder(basket, formData);
        
        // Save order locally
        saveOrderToLocalStorage(order);
        
        // For demo purposes, we'll mock API submission
        const apiSuccess = await submitOrderToAPI(order);
        
        if (apiSuccess) {
            // Clear cart and redirect
            clearBasket();
            window.location.href = "thankyou.html";
        } else {
            showToast("Payment processing failed. Please try again.");
        }
    } catch (error) {
        console.error("Order processing error:", error);
        throw error;
    }
}

function getFormData() {
    const form = document.getElementById("checkout-form");
    if (!form) return {};
    
    return {
        name: form.elements["name"]?.value,
        email: form.elements["email"]?.value,
        address: form.elements["address"]?.value,
        paymentMethod: form.elements["payment"]?.value
    };
}

function isFormValid(formData) {
    return formData.name && formData.email && formData.address;
}

function createOrder(basket, formData) {
    const subtotal = calculateSubtotal(basket);
    const shipping = 5.99;
    
    return {
        date: new Date().toISOString(),
        customer: {
            name: formData.name,
            email: formData.email,
            address: formData.address
        },
        items: basket.map(item => {
            const product = findProduct(item.id) || { name: "Unknown", price: 0 };
            return {
                productId: item.id,
                productName: product.name,
                quantity: item.item,
                unitPrice: product.price
            };
        }),
        paymentMethod: formData.paymentMethod,
        subtotal: subtotal,
        shipping: shipping,
        total: subtotal + shipping,
        status: "processing"
    };
}

function saveOrderToLocalStorage(order) {
    try {
        const orders = JSON.parse(localStorage.getItem("orders")) || [];
        orders.push(order);
        localStorage.setItem("orders", JSON.stringify(orders));
        return true;
    } catch (error) {
        console.error("Failed to save order to localStorage:", error);
        return false;
    }
}

// Mock API submission
async function submitOrderToAPI(order) {
    try {
        // This is where you would integrate with MockAPI.io
        // For now, we'll simulate an API call with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate random success/failure for demo
        return Math.random() > 0.2; // 80% success rate for demo
    } catch (error) {
        console.error("API submission error:", error);
        return false;
    }
}

// Toast notification system
function showToast(message, type = "error") {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Auto-remove after delay
    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}