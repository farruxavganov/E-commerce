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
}
class Storage {
	static getLocalProducts(){
		return localStorage.getItem("products")
	}

	static setLocalProducts(products) {
		localStorage.setItem("products", JSON.stringify(products));
	}
}

document.addEventListener("DOMContentLoaded", ()=> {
	const ui = new UI();
	const products = new Products();

	products.getProductsData(API)
		.then(products => {
			ui.displayProducts(products);
			Storage.setLocalProducts(products);
		})
})