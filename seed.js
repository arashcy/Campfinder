var mongoose = require("mongoose");
var Campground = require("./models/campground");
function seedDB(){
    Campground.remove({}, function(err){
        if(err){
            console.log(err);
        }else{
            console.log("Campgrounds removed")
        }
    });
}

module.exports = seedDB;