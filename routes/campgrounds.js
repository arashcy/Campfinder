    var express = require("express"),
        Campground = require("../models/campground"),
        passport = require("passport"),
        router = express.Router(),
        middleware = require("../middleware"),
        geocoder = require('geocoder');

    //Renders campground page
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campground/campgrounds",{campgrounds:allCampgrounds});
        }
    });
});
    
    //Adds a new campground
    router.post("/", middleware.isLoggedIn, function(req, res){
        var name = req.body.name;
        var price = req.body.price;
        var imageURL = req.body.image;
        var desc = req.body.description;
        var author = {
            id: req.user._id,
            username: req.user.username
        }
        
        geocoder.geocode(req.body.location, function (err, data) {
        var  lat = data.results[0].geometry.location.lat;
        var  lng = data.results[0].geometry.location.lng;
        var  location = data.results[0].formatted_address;
        var  newCampground = {name: name, image: imageURL, description: desc, price: price, author:author, location: location, lat: lat, lng: lng};
        
            Campground.create(newCampground, function(error, newCampground){
                if(error){
                    console.log(error);
                }else{
                    req.flash("success", "Campground post was successfully added!")
                    res.redirect("/campgrounds");    
                }
        
            });    
        });
    });
    //Renders create form
    router.get("/new", middleware.isLoggedIn, function(req, res){
        res.render("./campground/new");
    });
    
    router.get("/:id", function(req, res){
        var id = req.params.id;
        Campground.findById(id).populate("comments").exec(function(err, foundCampground){
            if(err){
                console.log(err);
            }else{
                res.render("./campground/show", {campground: foundCampground})
            }
        });
    });
    
    //Edit Route
    router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
            Campground.findById(req.params.id, function(err, foundCampground){
                res.render("./campground/edit", {foundCampground: foundCampground});
        })
    });
    
    //Update Logic
    router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newData = {name: req.body.name, image: req.body.image, description: req.body.description, price: req.body.price, location: location, lat: lat, lng: lng};
        Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success","Successfully Updated!");
                res.redirect("/campgrounds/" + campground._id);
            }
        });
    });
    });
    //Remove logic
    router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
        Campground.findByIdAndRemove(req.params.id, function(err){
            if(err){
                res.redirect("/campgrounds")
            }else{
                req.flash("success", "Campground post was successfully deleted!")
                res.redirect("/campgrounds")
            }
        })
    })
    
    
    //Exporting data
    module.exports = router;