    var express = require("express"),
        User = require("../models/user"),
        passport = require("passport"),
        router = express.Router(),
        nodemailer = require('nodemailer');


    //Renders landing page
    router.get("/", function(req, res){
        res.render("./campground/landing");
    });

    //Renders Newsletter page
    router.get("/newsletter", function(req, res){

        res.render("./campground/newsletter");

    });
    //
    router.post("/newsletter", (req, res)=>{
      var email = req.body.email;
      console.log(email);
      var name = req.body.name;
      var transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
              type: 'OAuth2',
              user: 'arashcyruss@gmail.com',
              clientId: "591186201615-iscvdt7i2pdoj3singqf2kgidovr8dme.apps.googleusercontent.com",
              clientSecret: "eX2vssQHzVFfBFmaIZQoR2eX",
              refreshToken: "1/8yyoOicPzmf1ZX2zgKhujNqIlTsK9F9iIE6Gif1-PbKgOFlr3XsFijzwsPidBiAf",
              access_token: "ya29.GlvwBPloYOeVOtLWeaWD9XT5zXLlxrXKMpZd61Tioww4AWE30gyXSAW8JVtUqBvUMTwO1fkAf25mPlQObKoBGJgGP7WZPgksy5-stVHH5JoPqUXFp3RJlSHfGZTS",
              expires: 3600
          }
      });
          // setup email data with unicode symbols
          var mailOptions = {
              from: '"Arash Ajam(CampFinder) 👻" <arashcyruss@gmail.com>', // sender address
              to: `${email}`, // list of receivers
              subject: `Hello ${name} ✔`, // Subject line
              text: 'Welcome to our newsletter.', // plain text body
              html: '<b>Welcome to our newsletter.</b>' // html body
          };

          // send mail with defined transport object
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
              console.log('Message sent: %s', info.messageId);
              // Preview only available when sending through an Ethereal account
              console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

              // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
              // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
          });
          res.redirect("/campgrounds");

    })

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
