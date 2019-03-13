require('dotenv').config();

var express               = require("express"),
    app                   = express(),
    bodyParser            = require("body-parser"),
    methodOverride        = require("method-override"),
    mongoose              = require("mongoose"),
    passport              = require('passport'),
    localStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    session               = require("express-session"),
    flash                 = require('connect-flash'),
    Campground            = require("./models/campground"),
    Comment               = require("./models/comment"),
    User                  = require("./models/user"),
    seedDB                = require("./seeds");
    
var commentRoutes     = require("./routes/comments"),
    campgroundRoutes  = require("./routes/campgrounds"),
    indexRoutes        = require("./routes/index");
    
mongoose.connect('mongodb://localhost/yelp_camp', { useNewUrlParser: true });
app.locals.moment = require('moment');
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(flash());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: 'uidjdj89938jdjd',
    resave: false,             //order1
    saveUninitialized: false   //order is important otherwise that isAuthenticated always returns false
}));
app.use(passport.initialize()); //order2
app.use(passport.session());    //order3
passport.use(new localStrategy(User.authenticate()));
 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async (req, res, next) => {
   res.locals.currentUser = req.user;
    if(req.user) {
    try {
      let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
      res.locals.notifications = user.notifications.reverse();
    } catch(err) {
      console.log(err.message);
    }
}
   res.locals.error = req.flash('error');
   res.locals.success = req.flash('success');
   next();
});

app.use('/', indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);

//seedDB()

app.listen(process.env.PORT, process.env.IP, function() {
    console.log('YELPCAMP SERVER STARTED');
});