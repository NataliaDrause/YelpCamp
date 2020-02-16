const express = require("express");
const router = express.Router();
const passport = require("passport");
let User = require("../models/user");
let Campground = require("../models/campground");

//root route
router.get("/", function(req, res){
	res.render("landing");
});

//===============
//  AUTH ROUTES
//===============

//show register form
router.get("/register", function(req,res){
	res.render("register", {page: 'register'});
});

//handle sign up logic
router.post("/register", function(req,res){
	let newUser = new User(
		{
			username: req.body.username,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			emaol: req.body.email,
			avatar: req.body.avatar
		});
	
	if(req.body.adminCode === "secretcode123"){
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("register", {error: err.message});
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to YelpCamp " + user.username);
			res.redirect("/campgrounds");
		});
	});
});

//show login form
router.get("/login", function (req,res){
	res.render("login", {page: "login"});
});
//handling login logic
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(req,res){
});
//logout route
router.get("/logout", function(req,res){
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/campgrounds");
});

//USERS profiles
router.get("/users/:id", function(req, res){
	User.findById(req.params.id, function(err, foundUser){
		if(err){
			req.flash("error", "Something went wrong.");
			return res.redirect("/");
		}
		Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
			if(err){
			req.flash("error", "Something went wrong.");
			return res.redirect("/");
		}
			res.render("users/show", {user: foundUser, campgrounds: campgrounds});
		});
	});
});

module.exports = router;