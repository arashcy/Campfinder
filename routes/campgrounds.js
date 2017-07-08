    var express = require("express"),
        Campground = require("../models/campground"),
        passport = require("passport"),
        router = express.Router(),
        middleware = require("../middleware");

    //Renders campground page
    router.get("/", function(req, res){
        Campground.find({}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else{
                res.render("./campground/campgrounds", {campgrounds:allCampgrounds});
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
        var newCampground = {name:name, price:price, image:imageURL, description:desc, author:author};
        Campground.create(newCampground, function(error, newCampground){
            if(error){
                console.log(error);
            }else{
                req.flash("success", "Campground post was successfully added!")
                res.redirect("/campgrounds");    
            }
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
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
            if(err){
                res.redirect("/campgrounds");
            }else{
                req.flash("success", "Campground post was successfully edited!")
                res.redirect("/campgrounds/" + req.params.id);            }
        })
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