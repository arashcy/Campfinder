    var express = require("express"),
        Campground = require("../models/campground"),
        Comment = require("../models/comment"),
        passport = require("passport"),
        router = express.Router({mergeParams: true}),
        middleware = require("../middleware");
    
    
    router.get("/new", middleware.isLoggedIn, function(req, res){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                res.redirect("/campgrounds");
            }else{
                res.render("./comment/new", {campground:foundCampground});
            }
        })
    });
    
    router.post("/", middleware.isLoggedIn, function(req, res){
        Campground.findById(req.params.id, function(err, campgroundFound){
           if(err){
               res.redirect("/campgrounds");
           }else{
                Comment.create(req.body.comment, function(err, comment){
                    if(err){
                        console.log(err);
                    }else{
                        comment.author.id = req.user._id;
                        comment.author.username = req.user.username;
                        var date = new Date();
                        comment.date = date.toDateString();
                        comment.save();
                        campgroundFound.comments.push(comment);         
                        campgroundFound.save();
                        req.flash("success", "Comment was successfully added!")
                        res.redirect('/campgrounds/' + campgroundFound._id);
                    }
                });
           }
        });
    });
    //rendering edit form for comments
    router.get("/:comment_id/edit", middleware.checkCommentOwnership,function(req, res){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back");
            }else{
                
                res.render("comment/edit", {foundCampground: req.params.id, foundComment: foundComment})
            }
        })
    })
    
    //updating edited comment
    router.put("/:comment_id", middleware.checkCommentOwnership,function(req, res){
        Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
            if(err){
                res.redirect("back");
            }else{
                var date = new Date();
                updatedComment.date = date.toDateString();
                updatedComment.save();
                req.flash("success", "Comment was successfully edited!");
                res.redirect("/campgrounds/" + req.params.id);
            }
        })
    })
    
    //delete comment route
    router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
        Comment.findByIdAndRemove(req.params.comment_id, function(err, updatedComment){
            if(err){
                res.redirect("back");
            }else{
                req.flash("success", "Comment was successfully deleted!")
                res.redirect("/campgrounds/" + req.params.id);
            }
        })
    })

    
    //Exporting data
    module.exports = router;