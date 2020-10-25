var widht = window.innerWidth;

	document.querySelector(".cart-btn").addEventListener("click",function(){
		document.querySelector(".myCart").focus();

	})
	document.querySelector(".cartHeading i").addEventListener("click",function(){
		document.querySelector(".myCart").blur();
	})
