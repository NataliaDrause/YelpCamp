const express    	= require("express");
const app       	= express();
const bodyParser 	= require("body-parser");
const mongoose 		= require("mongoose");
const flash 		= require("connect-flash");
const passport 		= require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
let Campground      = require("./models/campground");
let Comment      	= require("./models/comment");
let User       		= require("./models/user");
let seedDB       	= require("./seeds");
app.locals.moment = require('moment');

//requiring routes
const commentRoutes 	= require("./routes/comments"),
	  campgroundRoutes  = require("./routes/campgrounds"),
	  indexRoutes 		= require("./routes/index");

mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/yelp_camp_v12", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//seedDB();

//PASSPORT CONFIG
app.use(require("express-session")({
	secret: "This is the biggest secret",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/", indexRoutes);

///////////////////////////////////

app.listen(3000, function(){
	console.log("Server is running");
});