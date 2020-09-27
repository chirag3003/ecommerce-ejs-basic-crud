// const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/fruits', {useUnifiedTopology: true,useNewUrlParser: true});

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   console.log("connected")
// });




const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine" , "ejs");

var prod = [];


app.get("/",function(req,res){
	res.render("index",{prod:prod});
})


app.get("/shop",function(req,res){
	res.render("shop",{prod,prod})
})


app.get("/admin/product",function(req,res){
	res.render("admin",{});
})

app.post("/admin/product",function(req,res){
	var data = req.body;
	var product = {
		title:data.title,
		des:data.des,
	}
	prod.push(product);
	res.render("admin",{})

})






app.listen(process.env.PORT || 3000,function(){
})