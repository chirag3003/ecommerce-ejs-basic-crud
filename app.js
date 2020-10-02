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

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine" , "ejs");



const productS = new mongoose.Schema({
	title: String,
	des: String,
	price: Number,
	orignalP: Number,
});

const Product = new mongoose.model("product", productS);

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


app.get("/admin/product",function(req,res){
	res.render("adminProduct",{});
})

app.post("/admin/product",function(req,res){
	var data = req.body;
	var product = new Product({
		title:data.title,
		des:data.des,
		prodPrice:data.prodPrice,
		oprice:data.oprice,
	})
	product.save();

	res.redirect("/admin/product")

})






app.listen(process.env.PORT || 3000,function(){
})