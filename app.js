require("dotenv").config();

const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose")


const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine" , "ejs");



app.use(session({
	secret:process.env.SECRET,
	resave:false,
	saveUnitialized:false,
}))

app.use(passport.initialize());
app.use(passport.session());



// mongoose configurations

mongoose.connect(`mongodb+srv://${process.env.MONGOKEY}@cluster0.qvesn.gcp.mongodb.net/gharana`, {useUnifiedTopology: true,useNewUrlParser: true});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected")
});

//ProductSchema and model
const productS = new mongoose.Schema({
	productName: String,
	productQuantity: String,
	productMrp: Number,
	productPrice: Number,
});
const Product = new mongoose.model("productBasicInfo", productS);


//user credentials
const userSchema = new mongoose.Schema({
	username:String,
	password:String,
})

userSchema.plugin(passportLocalMongoose);
const user = new mongoose.model("user",userSchema);


passport.use(user.createStrategy());
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser())



let cart =[];


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

app.get('/login',function(req,res){
	res.render("userSide/login",{login:true})
})
app.get('/signup',function(req,res){
	res.render("userSide/login",{login:false})
})






// user info and cart
app.post("/addToCart",function(req,res){
	cart.push(req.body.product);
	console.log(cart);
})

app.post("/signup",function(req,res){
	let data = req.body;
	const userDetails = new user({
		username: data.username,
		password:data.password,
	})
	userDetails.save(function(err){
		if(err){
			console.log(err);
		}
		else
			res.redirect("/login");

	});
	
})

app.post("/login",function(req,res){

	let data= req.body;
	user.findOne({username:data.username},function(err,user){
		if(err)
			console.log(err);
		else{
			if(user){
				if(user.password == data.password)
				res.redirect("/");
				else
					res.redirect("/login")

			}else
			res.redirect("/register");
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


app.listen(process.env.PORT || 3000,function(){
})