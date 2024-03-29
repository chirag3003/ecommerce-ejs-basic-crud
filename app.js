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

mongoose.connect(`${process.env.MONGOKEY}`, {useUnifiedTopology: true,useNewUrlParser: true});

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



const userINFO = new mongoose.Schema({
	username: String,
	cart:[{
		product:{
			// productName: String,
			// productQuantity: String,
			// productMrp: Number,
			// productPrice: Number
		},
		quantity:Number}],
	address:[String],

})
const userInfo = new mongoose.model("userInfo",userINFO);




// passport configurations
passport.use(user.createStrategy());
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser())









// user pages
app.get("/",function(req,res){
	let auser=false;
	
	Product.find(function(err,prod){
		if(req.isAuthenticated()){
			console.log(req.user)
			auser=true;
			
			userInfo.findOne({username:req.user.username},(err,user) =>{
				if(err){
					console.log(err);
					return;
				}
				res.render("userSide/index",{prod:prod,userDet:user});
			})
			
		}
		else{
			res.render("userSide/index",{prod:prod,userDet:null})
		}
	})
		
	
})




app.get("/shop",function(req,res){

	
	Product.find(function(err,prod){
		if(req.isAuthenticated()){
			auser = true;
			
			userInfo.findOne({username:req.user.username},(err,user) =>{
				if(err){
					console.log(err);
					return;
				}
				res.render("userSide/shop",{prod:prod,userDet:user})


			})

		}else
			
	})
})

app.get("/shop/:productId",function(req,res){
	
	Product.findOne({_id:req.params.productId},function(err,prod){
		if(req.isAuthenticated()){
			
			
			userInfo.findOne({username:req.user.username},(err,user) =>{
				if(err){
					console.log(err);
					return;
				}
			})
			res.render("userSide/shop",{prod:prod,userDet:user})
		}else
			auser = false;
	
		res.render("userSide/shop" , {prod:prod,userDet:null});
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
	if(!req.isAuthenticated()){
		res.redirect("/login")
		return;
	}
	Product.findOne({_id:req.body.product},function(err,prod){
		if(err){console.log(err)}
		else if(prod){
			console.log(prod);
			userInfo.findOne({username:req.user.username},function(err,user){
				if(err){
					console.log(err);
				}
				if(user){
					// console.log("hi");
					
					const cart = {
						product:prod,
						// {
						// 	productName:prod.productName,
						// 	productQuantity:prod.productQuantity,
						// 	productMrp:prod.productMrp,
						// 	productPrice:prod.productPrice
						// }
						
						quantity:0

					}
					console.log();
					user.cart.push(cart);
					user.save();
				}else{console.log("user not found");}
			})
		}
	})
})

app.post("/signup",function(req,res){
	let data = req.body;
	user.register({username:data.username},data.password,function(err,user){
		if(err){
			console.log(err);
			res.redirect("/signup");
		}
		else{
			passport.authenticate("local")(req,res,function(){
				const newUser = new userInfo({
					username:data.username,
				})
				newUser.save();
				res.redirect("/")
			})
		}
	})
	
})

app.post("/login",function(req,res){

	let data= req.body;
	const userDetails = new user({
		username:data.username,
		password:data.password,
	})
	function next(err){
		if(err){
			console.log(err)

		}else{
			res.redirect("/")
		}
	}
	user.findOne({username:data.username},function(err,isUser){
		if(!isUser){
			res.redirect("/signup");
		}else{

		

			passport.authenticate('local', function(err, user, info) {
		    	if (err) { 
		    		return next(err); 
		    	}
		    	if (!user) { 
		    		return res.redirect('/login'); 
		    	}
		    	req.logIn(user, function(err) {
		    		if (err) { 
		    			return next(err); 
		    		}
		    		return next(false);
		    	});
		  	},{session:false})(req, res, next);
		
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
	product.save(function(err){
		if(err){
			console.log(err);
		}
	});
	console.log(product._id)

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