    var express     = require("express"),
        Campground  = require("../models/campground"),
        passport    = require("passport"),
        router      = express.Router(),
        middleware  = require("../middleware"),
        geocoder    = require("geocoder"),
        request     = require("request"),

        fs          = require("fs"),
        weather     = require("../weather/weather");

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



    //Get distance
    router.get("/:id/distance", function(req, res){
        var id = req.params.id;
        Campground.findById(id, function(err, foundCampground){
             if(err){
                 console.log(err);
              }else{
               geocoder.geocode(foundCampground.location, function (err, data) {
                   if(data.results[0] === 'undefined' || !data.results[0]){
                   res.redirect("/campgrounds/" + req.params.id);
                 } else{
                    var lat1 = data.results[0].geometry.location.lat;
                    var lng1 = data.results[0].geometry.location.lng;
                    var location = data.results[0].formatted_address;

                        var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress);
                        var list = ip.split(",");
                        ip= list[list.length-1];
                        var city, country;
                    request({
                        url:`http://ipinfo.io/${ip}`,
                        json:true
                        }, function (error, response, body) {
                        var guestInfo = {
                            city: body.city,
                            country: body.country,
                            ip: body.ip
                        }
                        console.log(guestInfo.city) //test
                var guestLocation = `${guestInfo.country} ${guestInfo.city}`;
                 geocoder.geocode(guestLocation, function (err, data) {
                  if(data.results[0] === 'undefined' || !data.results[0]){
                        res.redirect("/campgrounds/" + req.params.id);
                  } else{

                    var lat2 = data.results[0].geometry.location.lat;
                    var lng2 = data.results[0].geometry.location.lng;
                    var location2 = data.results[0].formatted_address;
                    console.log(location2); //test


                    var R = 6378137; // metres

                    // var lat2 = guestInfo.lat;
                    // var lng2 = guestInfo.lng;
                    console.log(Math.PI);
                    console.log(lng2);
                    var φ1 = lat1 * Math.PI / 180;
                    var φ2 = (lat2 * Math.PI) / 180;
                    var Δφ = (lat2-lat1) * Math.PI / 180;;
                    var Δλ = (lng2-lng1) * Math.PI / 180;;
                    console.log(φ2); //test

                    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
                    console.log(a); //test
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                    console.log(c); //test
                    var d = R * c;

                console.log(d);
                res.render(`./campground/distance`, {campground:foundCampground, message:d, guestInfo:guestInfo, guestLat:lat2, guestLng:lng2});
                  }
                                 })
                        });

                 }
               })
              }
        })
    })




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
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            var location = data.results[0].formatted_address;

            var newCampground = {name: name, image: imageURL, description: desc, price: price, author:author, location: location, lat: lat, lng: lng};
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

    //
    router.get("/:id", function(req, res){
        var id = req.params.id;
        Campground.findById(id).populate("comments").exec(function(err, foundCampground){
            if(err){
                console.log(err);
            }else{
               geocoder.geocode(foundCampground.location, function (err, data) {
                   if(data.results[0] === 'undefined' || !data.results[0]){
                   res.redirect("/campgrounds/" + req.params.id + "/edit");
                } else{
                    var lat = data.results[0].geometry.location.lat;
                    var lng = data.results[0].geometry.location.lng;
                    var location = data.results[0].formatted_address;
                weather.getWeather(lat, lng, (errorMessage, weatherResult)=>{
                    if(errorMessage){
                        console.log(errorMessage);
                    }else{
                        var summary = weatherResult.summary;
                    }
                res.render("./campground/show", {campground: foundCampground, weatherResult:weatherResult})
            })
            }
        });
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
            console.log(data.results[0]);
            if(data.results[0] === 'undefined' || !data.results[0]){
                res.redirect("/campgrounds/" + req.params.id + "/edit");
            } else{
            var lat = data.results[0].geometry.location.lat;
            var lng = data.results[0].geometry.location.lng;
            var location = data.results[0].formatted_address;

            var newCampground = {name: req.body.name, image: req.body.image, description: req.body.description,
                            price: req.body.price, location: location, lat: lat, lng: lng};
            // Campground.findByIdAndUpdate(req.params.id, {$set: newCampground}, function(err, campground){
                Campground.findByIdAndUpdate(req.params.id, {$set: newCampground}, function(err, updatedCampground){
                    if(err){
                    res.redirect("back");
                    }else{
                        req.flash("success", "Campground post was successfully edited!");
                        res.redirect("/campgrounds/" + req.params.id);

                    }
                })
            }
        });
    });
    //Remove logic
    router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
        Campground.findByIdAndRemove(req.params.id, function(err){
            if(err){
                res.redirect("/campgrounds")
            }else{
                req.flash("success", "Campground post was successfully deleted!");
                res.redirect("/campgrounds");
            }
        })
    })


    //Exporting data
    module.exports = router;
