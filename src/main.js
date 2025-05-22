let shop = document.getElementById("shop");

let basket = JSON.parse(localStorage.getItem("data")) || [];

let generateShop = () => {
    return shop.innerHTML = shopItemsData
    .map((x) => {
        let {id, name, price, desc, img } = x;
        // Find item in basket to get initial quantity
        let basketItem = basket.find(item => item.id === id);
        let quantity = basketItem ? basketItem.item : 0;
        
        return `
        <div id="product-id-${id}" class="item">
            <img width="220" src="${img}" alt="${name}">
            <div class="details">
                <h3>${name}</h3>
                <p>${desc}</p>
                <div class="price-quantity">
                    <h2>$${price}</h2>
                    <div class="buttons">
                        <i onclick="decrement('${id}')" class="bi bi-dash-lg"></i>
                        <div id="${id}" class="quantity">${quantity}</div>
                        <i onclick="increment('${id}')" class="bi bi-plus-lg"></i>
                    </div>
                </div>
            </div>
        </div>
        `;
    })
    .join("");
};

generateShop();

let increment = (id) => {
    let search = basket.find((x) => x.id === id);

    if (search === undefined) {
        basket.push({
            id: id,
            item: 1,
        });
    } else {
        search.item += 1;
    }
    
    update(id);
    localStorage.setItem("data", JSON.stringify(basket));
};

let decrement = (id) => {
    let search = basket.find((x) => x.id === id);

    if (search === undefined) return;
    else if (search.item === 0) return;
    else {
        search.item -= 1;
    }
    
    update(id);
    localStorage.setItem("data", JSON.stringify(basket));
};

let update = (id) => {
    let search = basket.find((x) => x.id === id);
    let quantityElement = document.getElementById(id);
    
    if (quantityElement) {
        quantityElement.innerHTML = search ? search.item : 0;
    }
    calculation();
};

let calculation = () => {
    let cartIcon = document.getElementById("cartAmount");
    if (cartIcon) {
        cartIcon.innerHTML = basket.reduce((total, item) => total + item.item, 0);
    }
};

// Initialize cart display on page load
calculation();