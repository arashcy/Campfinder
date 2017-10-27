var express          = require("express"),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    passport         = require("passport"),
    localStrategy    = require("passport-local"),
    Campground       = require("./models/campground"),
    Comment          = require("./models/comment"),
    User             = require("./models/user"),
    flash            = require("connect-flash"),
    methodOverride   = require("method-override"),
    request          = require("request"),
    fs               = require("fs");

   //Requiring routes
var authRoutes       = require("./routes/auth"),
    commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds");

//INITIALIZING APP TO EXPRESS FUNCTION
var app = express();

//AIzaSyAJ62_qAIDp_zR4T9DDl7tvE837msAdzBc



//Fixing library warning
mongoose.Promise = require("bluebird");
mongoose.Promise = global.Promise;

//SETTING UP THE DATABASE
// mongoose.connect("mongodb://localhost/yelp_camp");
const port = process.env.PORT || 3000;
console.log(process.env.PORT);
if(port != 3000){
mongoose.connect('mongodb://arash:arashajam@ds151222.mlab.com:51222/campfinder');
} else{
  mongoose.connect('mongodb://localhost:27017/Campfinder');
}
//SET TO EJS
app.set("view engine", "ejs");

//USE BODY PARSER AND PUBLIC DIR
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());


//SETTING UP EXPRESS SESSION
app.use(require("express-session")({
    secret:"secrett",
    resave:false,
    saveUninitialized:false
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Passing user for every route
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use(function(req, res, next){
    var now = new Date().toString();
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
        res.locals.guestInfo = guestInfo;
        next();
    })
});



//Routes
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/", authRoutes);


app.listen(port, process.env.IP, function(){
    console.log("Server Started");
});
