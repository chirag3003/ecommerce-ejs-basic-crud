var widht = window.innerWidth;
console.log(widht);
var cart = document.querySelector(".myCart");
	document.querySelector(".cart-btn").addEventListener("click",function(){
		cart.style.display = "block";
	})
	document.querySelector(".cartHeading i").addEventListener("click",function(){
		cart.style.display = "none";
	})
