const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://chirag:chirag30@cluster0.qvesn.gcp.mongodb.net/gharana', {useUnifiedTopology: true,useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected")
});


const productS = new mongoose.Schema({
	productName: String,
	productDesc: String,
	productMrp: Number,
	productPrice: Number,
});

const Product = new mongoose.model("productBasicInfo", productS);

const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine" , "ejs");





app.get("/",function(req,res){
	
	Product.find(function(err,prod){
		res.render("index" , {prod:prod})
	})
	
})

app.get("/products",function(req,res){
	res.render("product")
})


app.get("/shop",function(req,res){
	
	Product.find(function(err,prod){
		res.render("shop" , {prod:prod});
	})
})

app.get("/shop/:productId",function(req,res){
	Product.findOne({_id:req.params.productId},function(err,prod){
		if(err){
			console.log("err");
		}
		else{
			console.log(prod);
			res.render("product",{prod:prod});
		}
	})
})


app.get("/admin/product",function(req,res){
	res.render("adminProduct",{});
})

app.post("/admin/product",function(req,res){
	
	var data = req.body;
	var product = new Product({
		productName: data.productName,
		productDesc: data.productDesc,
		productMrp: data.productMrp,
		productPrice: data.productPrice,
	})
	product.save();

	res.redirect("/admin/product")

})






app.listen(process.env.PORT || 3000,function(){
})