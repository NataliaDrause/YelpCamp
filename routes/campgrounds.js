const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");

//////////INDEX route 
router.get("/", function(req,res){
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({$or: [{name: regex,}, {location: regex}, {"author.username":regex}]}, function(err, allCampgrounds){
			if(err){
				req.flash("error", "Something went wrong");
			} else {
				if(allCampgrounds.length < 1) {
                        req.flash("error", "Campground not found");
                        return res.redirect("back");
			 	}
				res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"});
			}
		});
	}
	Campground.find({}, function(err, allCampgrounds){
		if(err){
		   console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"});
		}
	});
});

//////////CREATE route
router.post("/", middleware.isLoggedIn, function(req,res){
	let name = req.body.name;
	let image = req.body.image;
	let desc = req.body.description;
	let price = req.body.price;
	let author = {
		id: req.user._id,
		username: req.user.username,
		firstName: req.user.firstName,
		lastName: req.user.lastName
	};
	let newCampground = {name: name, price: price, image: image, description: desc, author: author};
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			res.redirect("/campgrounds");
		}
	});
});

//////////NEW route
router.get("/new", middleware.isLoggedIn, function(req,res){
	res.render("campgrounds/new");
});

//////////SHOW route
router.get("/:id", function(req,res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground not found");
			res.redirect("back");
		} else {
			//console.log(foundCampground);
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

//EDIT ROUTE

router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

//UPDATE ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//DESTROY ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findByIdAndRemove(req.params.id, function(err, deletedCampground){
		if(err){
			res.redirect("/campgrounds");
		} else {
			deletedCampground.comments.forEach(function(comment){
				Comment.findByIdAndRemove(comment, function(err){
					if(err){
						console.log(err);
					}
				});
			});
			res.redirect("/campgrounds");
		}
	});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;