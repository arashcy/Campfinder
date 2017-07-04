    var express = require("express"),
        User = require("../models/user"),
        passport = require("passport"),
        router = express.Router();
    
    
    //Renders landing page
    router.get("/", function(req, res){
        res.render("./campground/landing");
    });
    
    router.get("/register", function(req, res){
        res.render("register");
    })
    
    router.post("/register", function(req, res){
        var newUser = new User({username: req.body.username});
        User.register(newUser, req.body.password, function(err, user){
            if(err){
                console.log(err);
                req.flash("error", err.message)
                res.redirect("/register");
            }
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Welcome to YelpCamp " + user.username + "!");
                res.redirect("/campgrounds"); 
            });
        });
    });
    
    //Login Route
    router.get("/login", function(req, res){
        res.render("login");
    });
    
    router.post("/login", passport.authenticate("local", 
        {
            successRedirect: "/campgrounds",
            failureRedirect: "/login"
        }), function(req, res){
    });

    //Logout Route
    router.get("/logout", function(req, res){
        req.logout();
        req.flash("success", "You successfully logged out!")
        res.redirect("/campgrounds");
    })
    
    
        
    //Exporting data
    module.exports = router;