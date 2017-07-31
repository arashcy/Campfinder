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
    geocoder         = require("geocoder"),
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
mongoose.connect("mongodb://arash:arashajam@ds151222.mlab.com:51222/campfinder");

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
        res.locals.error = req.flash("error");
        res.locals.success = req.flash("success");
        next();
    })
});

//Creating a server log
// app.use((req, res, next)=>{
//     var now = new Date().toString();
//     var ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress);
//         var list = ip.split(",");
//         ip= list[list.length-1];
//     var city, country;
    
//     request({
//         url:'http://ipinfo.io/',
//         json:true
//     }, function (error, response, body) {
//         console.log('body:', body); // Print the error if one occurred
//         console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//         city = body.city;
//         country = body.country;
//         var log = `Server accessed: ${now} by ${req.method} method. ${req.url}. IP: ${ip}. Country: ${country}, City: ${city} \n`;
//         fs.appendFile('server.log', log, (error)=>{
//             if(error) console.log(error);
//         })
//     });
//     next();
// })



//Routes
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/", authRoutes);
    
    
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Started");
});
