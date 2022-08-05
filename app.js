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

class Products {
	async getProductsData(api){
		try {
			let result = await fetch(api);
			let data = await result.json();
			let products = data.items;
			products = products.map(product => {
				let {title,price} = product.fields;
				let img = product.fields.image.fields.file.url;
				let {id} = product.sys;

				return {title,price,img, id};
			})

			return products;
		}catch (e) {
			let err = new Error(e.message);
			console.error(err)
		}
	}
}
class UI {
	displayProducts(products){
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

	btnBadgeEvent(){
		let btns = [...document.querySelectorAll(".bag-btn")];
		btns.forEach(btn => {
			let id = btn.dataset.id;

			let cartItem = cart.find(item => item.id === id);

			if(cartItem){
				btn.innerText = "In Cart";
				btn.disabled = true;
			}else {
				btn.addEventListener("click", (event)=>{
					event.target.innerText = "In Cart";
					event.target.disabled = true;

					let cartItemById = {...Storage.getLocalProducts(id), ammount: 1};

					cart = [...cart, cartItemById];

					Storage.setLocalCart(cart);

					this.setCartValue(cart);
					this.addCartItem(cartItemById);
					this.showCart();
				})
			}

		})
	}

	showCart() {
		cartOverlay.classList.add("transparentBcg");
		cartData.classList.add("showCart");
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

	addCartItem(item){
		let cartItemDiv = document.createElement("div");
		cartItemDiv.classList.add("cart-item");
		cartItemDiv.innerHTML =`
             			<img src="${item.img}">
                        <div>
                            <h4>${item.title}</h4>
                            <h5>$${item.price}</h5>
                            <span class="remove-item">remove</span>
                        </div>
                        <div>
                            <i class="fas fa-chevron-up"></i>
                            <p class="item-amount">${item.ammount}</p>
                            <i class="fas fa-chevron-down"></i>
                        </div>
		`

		cartContent.appendChild(cartItemDiv);
	}

	setupApp() {
		cart = Storage.getLocalCart();
		this.setCartValue(cart);
		this.populars(cart);
	}

	populars(cart){
		cart.forEach(item => {
			this.addCartItem(item);
		})
	}
}

class Storage {
	static getLocalProducts(id){
		let products = localStorage.getItem("products")? JSON.parse(localStorage.getItem("products")) : [];
		return products.find(item=> item.id === id);
	}

	static setLocalProducts(products) {
		localStorage.setItem("products", JSON.stringify(products));
	}

	static setLocalCart(cart){
		localStorage.setItem("cart",JSON.stringify(cart))
	}

	static getLocalCart(){
		return JSON.parse(localStorage.getItem("cart"));
	}
}
Storage.getLocalProducts(5)
document.addEventListener("DOMContentLoaded", ()=> {
	const ui = new UI();
	const products = new Products();

	ui.setupApp();

	products.getProductsData(API)
		.then(products => {
			ui.displayProducts(products);
			Storage.setLocalProducts(products);
		})
		.then(()=>{
			ui.btnBadgeEvent();
		})
})