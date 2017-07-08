var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};

    middlewareObj.checkCampgroundOwnership = function (req, res, next){
            if(req.isAuthenticated()){
                Campground.findById(req.params.id, function(err, foundCampground){
                    if(err){
                        res.redirect("back");
                    }else{
                            if(foundCampground.author.id.equals(req.user._id) || req.user.username =="arash"){
                                next();
                            }else{
                                req.flash("error", "Permission denied!")
                                res.redirect("back");
                            }
                        }
                });    
            }else{
                req.flash("error", "You need to be logged in!")
                res.redirect("/login");
            }
        }
    //Comment ownership
    middlewareObj.checkCommentOwnership = function(req, res, next){
        if(req.isAuthenticated()){
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err){
                    res.redirect("back");
                  }else{
                        if(foundComment.author.id.equals(req.user._id)){
                            next();
                        }else{
                            req.flash("error", "Permission denied!");
                            res.redirect("back");
                        }
                    }
            });    
        }else{
            req.flash("error", "You need to be logged in!");
            res.redirect("/login");
        }
    }
    
    middlewareObj.isLoggedIn = function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "Please log in first!")
        res.redirect("/login");
    }
    
    

module.exports = middlewareObj;