require("dotenv").config();

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://chirag:chirag30@cluster0.qvesn.gcp.mongodb.net/gharana', {useUnifiedTopology: true,useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected")
});



const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const session = require("mongoose-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose")



const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine" , "ejs");





// mongoose configurations
let cart =[];

const productS = new mongoose.Schema({
	productName: String,
	productQuantity: String,
	productMrp: Number,
	productPrice: Number,
});
const Product = new mongoose.model("productBasicInfo", productS);






// user pages
app.get("/",function(req,res){
	
	Product.find(function(err,prod){
		res.render("userSide/index" , {prod:prod})
	})
	
})

app.get("/products",function(req,res){
	res.render("product")
})


app.get("/shop",function(req,res){
	
	Product.find(function(err,prod){
		res.render("userSide/shop" , {prod:prod});
	})
})

app.get("/shop/:productId",function(req,res){
	Product.findOne({_id:req.params.productId},function(err,prod){
		if(err){
			console.log("err");
		}
		else{
			res.render("userSide/product",{prod:prod});
		}
	})
})






// admin pages

app.get("/admin/product",function(req,res){
	res.render("adminSide/adminProduct",{});
})

app.post("/admin/product",function(req,res){
	
	var data = req.body;
	var product = new Product({
		productName: data.productName,
		productQuantity: data.productQuantity,
		productMrp: data.productMrp,
		productPrice: data.productPrice,
	})
	product.save();

	res.redirect("/admin/product")

})

app.get("/admin/editproduct",function(req,res){
	Product.find(function(err,prod){
		res.render("adminSide/editShop" , {prod:prod});
	})
})

app.get("/admin/editproduct/:productId",function(req,res){
	Product.findOne({_id:req.params.productId},function(err,prod){
		if(err){
			console.log(err);
		}else{
			res.render("adminSide/editProduct",{prod:prod})
		}
	})
})

app.post("/admin/editproduct",function(req,res){
	let data = req.body;

	Product.findByIdAndUpdate(data.productId,{$set:{
		productName:data.productName,
		productMrp: data.productMrp,
		productPrice:data.productPrice,
		productQuantity: data.productQuantity
	}},function(err){
		if(err){
			console.log(err);
		}
	})
})


app.get("/admin/deleteproduct",function(req,res){
	Product.find(function(err,prod){
		res.render("adminSide/deleteShop" , {prod:prod});
	})
})

app.get("/admin/deleteproduct/:productId",function(req,res){
	Product.findOne({_id:req.params.productId},function(err,prod){
		if(err){
			console.log(err);
		}else{
			res.render("adminSide/deleteProduct",{prod:prod})
		}
	})
})

app.post("/admin/deleteproduct",function(req,res){
	let data = req.body;

	Product.findByIdAndDelete(data.productId,function(err){
		if(err)
			console.log(err);

	})
	res.redirect("/admin/deleteproduct");
})







// user info and cart
app.post("/addToCart",function(req,res){
	cart.push(req.body.product);
	console.log(cart);
})




app.listen(process.env.PORT || 3000,function(){
})