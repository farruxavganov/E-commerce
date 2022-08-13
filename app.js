const cartBtn = document.querySelector(".cart-btn");
const cartItems = document.querySelector(".cart-items");
const cartOverlay = document.querySelector(".cart-overlay");
const cartData = document.querySelector(".cart");
const closeCart = document.querySelector(".close-cart");
const cartContent = document.querySelector(".cart-content");
const cartTotol = document.querySelector(".cart-totol");
const clearBtn = document.querySelector(".clear-cart");
const productsCenter = document.querySelector(".products-center");
const API = "products.json";

let cart = [];
let cartBtnDOM = [];

class Products {
	async getProductsData(api) {
		try {
			let result = await fetch(api);
			let data = await result.json();
			let products = data.items;
			products = products.map(product => {
				let { title, price } = product.fields;
				let img = product.fields.image.fields.file.url;
				let { id } = product.sys;

				return { title, price, img, id };
			})

			return products;
		} catch (e) {
			let err = new Error(e.message);
			console.error(err)
		}
	}
}
class UI {
	displayProducts(products) {
		let result = '';

		products.forEach(product => {
			result += `
				<article class="product">
                    <div class="img-container">
                        <img src="${product.img}" class="product-img" alt="${product.title}">
                        <button class="bag-btn" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i>
                            add to bag
                        </button>
                    </div>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                </article>
			`
		});

		productsCenter.innerHTML = result;
	}

	btnBadgeEvent() {
		let btns = [...document.querySelectorAll(".bag-btn")];
		cartBtnDOM = btns;
		btns.forEach(btn => {
			let id = btn.dataset.id;

			let cartItem = cart.find(item => item.id === id);

			if (cartItem) {
				btn.innerText = "In Cart";
				btn.disabled = true;
			} else {
				btn.onclick = (event) => {
					event.target.innerText = "In Cart";
					event.target.disabled = true;
 
					let cartItemById = { ...Storage.getLocalProducts(id), ammount: 1 };

					cart = [...cart, cartItemById];

					Storage.setLocalCart(cart);

					this.setCartValue(cart);
					this.addCartItem(cartItemById);
					this.showCart();
				}
			}

		})
	}


	showCart() {
		cartOverlay.classList.add("transparentBcg");
		cartData.classList.add("showCart");
	}

	hidnCart() {
		cartOverlay.classList.remove("transparentBcg");
		cartData.classList.remove("showCart");
	}

	setCartValue(cart) {
		let tempTotol = 0;
		let itemsTotol = 0;

		cart.map(item => {
			tempTotol += item.price * item.ammount;
			itemsTotol += item.ammount
		})
		cartTotol.innerText = parseFloat(tempTotol.toFixed(2));
		cartItems.innerText = itemsTotol;
	}

	addCartItem(item) {
		let cartItemDiv = document.createElement("div");
		cartItemDiv.classList.add("cart-item");
		cartItemDiv.innerHTML = `
             			<img src="${item.img}">
                        <div>
                            <h4>${item.title}</h4>
                            <h5>$${item.price}</h5>
                            <span class="remove-item" data-id="${item.id}">remove</span>
                        </div>
                        <div>
                            <i class="fas fa-chevron-up" data-id="${item.id}"></i>
                            <p class="item-amount">${item.ammount}</p>
                            <i class="fas fa-chevron-down" data-id="${item.id}"></i>
                        </div>
		`

		cartContent.appendChild(cartItemDiv);
	}

	setupApp() {
		cart = Storage.getLocalCart();
		console.log(cart)
		this.setCartValue(cart);
		this.populars(cart);

		cartBtn.addEventListener("click", this.showCart);
		closeCart.addEventListener("click", this.hidnCart);

	}

	populars(cart) {
		cart.forEach(item => {
			this.addCartItem(item);
		})
	}

	cartLogic() {
		clearBtn.addEventListener("click", ()=> {this.clearItems()});

		cartContent.addEventListener("click", (e)=>{
			if(e.target.classList.contains("remove-item")){
				let removeItem = e.target;
				let id = removeItem.dataset.id;
				let parrent = removeItem.parentElement.parentElement;
				cartContent.removeChild(parrent);
				this.removeItemCart(id);
			}

			if(e.target.classList.contains("fa-chevron-up")){
				let id = e.target.dataset.id;
				
				let product = cart.find(item => item.id === id);
				product.ammount = product.ammount + 1;
				document.querySelector(".item-amount").innerHTML = product.ammount;
				this.setCartValue(cart);
				Storage.setLocalCart(cart);
			}

			if(e.target.classList.contains("fa-chevron-down")){
				let id = e.target.dataset.id;
				let parrent = e.target.parentElement.parentElement;

				let product = cart.find(item => item.id === id);
				product.ammount = product.ammount - 1;
				if(product.ammount === 0){
					product.ammount = 0;
					cartContent.removeChild(parrent);
					this.removeItemCart(id);
				}
				document.querySelector(".item-amount").innerHTML = product.ammount;
				this.setCartValue(cart);
				Storage.setLocalCart(cart);
			}
			
		})
	}

	clearItems() {
		cart.forEach(item => this.removeItemCart(item.id));
		while(cartContent.children.length > 0) {
			cartContent.removeChild(cartContent.children[0]);
		}
		this.btnBadgeEvent();
		this.hidnCart();

	}

	removeItemCart(id) {
		cart = cart.filter(item => item.id !== id);
		Storage.setLocalCart(cart);
		this.setCartValue(cart);

		let button = this.getSingleBtn(id);
		button.disabled = false;
		button.innerHTML = `<i class="fas fa-shopping-cart"></i>
                            add to bag`;
	}

	getSingleBtn(id) {
		return cartBtnDOM.find(item => item.dataset.id === id);
	}
}

class Storage {
	static getLocalProducts(id) {
		let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
		return products.find(item => item.id === id);
	}

	static setLocalProducts(products) {
		localStorage.setItem("products", JSON.stringify(products));
	}

	static setLocalCart(cart) {
		localStorage.setItem("cart", JSON.stringify(cart))
	}

	static getLocalCart() {
		return localStorage.getItem("cart")? JSON.parse(localStorage.getItem("cart")) : [];
	}
}
Storage.getLocalProducts(5)
document.addEventListener("DOMContentLoaded", () => {
	const ui = new UI();
	const products = new Products();

	ui.setupApp();

	products.getProductsData(API)
		.then(products => {
			ui.displayProducts(products);
			Storage.setLocalProducts(products);
		})
		.then(() => {
			ui.btnBadgeEvent();
			ui.cartLogic();
		})
})