var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var User = require("../models/user");
var middleware = require("../middleware");
var Notification = require("../models/notification");
var NodeGeocoder = require('node-geocoder');
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'venkatitsme6', 
  api_key: process.env.CLOUDINARY_API_key, 
  api_secret: process.env.CLOUDINARY_API_secret
});
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

router.get("/", function(req, res){
    var nomatch;
    if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      Campground.find({name: regex}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          if(allCampgrounds.length<1) {
               nomatch = "No Campgrounds matched your query, Search again!!!";
          }
          res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds', nomatch: nomatch});
       }
    });   
    } else {
       Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds', nomatch: nomatch});
       }
    });   
    }
});

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
  geocoder.geocode(req.body.campground.location,  function (err, data) {
    if (err || !data.length) {
      console.log(err);
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    cloudinary.v2.uploader.upload(req.file.path,async function(err, result) {
     if(err) {
         req.flash('error', err.message);
         return res.redirect('back');
     }
     var name = req.body.campground.name;
     var desc = req.body.campground.description;
     var author = {
      id: req.user._id,
      username: req.user.username
        };
     var price = req.body.campground.price;
     var image = result.secure_url;
     var imageId = result.public_id;
     var lat = data[0].latitude;
     var lng = data[0].longitude;
     var location = data[0].formattedAddress;
     var newCampground = {name: name,price:price,image: image, imageId: imageId, description: desc, author:author, location: location, lat: lat, lng: lng};
    //  Campground.create(newCampground, function(err, newlyCreated){
    //     if(err){
    //         console.log(err);
    //     } else {
    //         console.log(newlyCreated);
    //         res.redirect("/campgrounds");
    //     }
    // });
    try {  
      let campground = await Campground.create(newCampground);
      let user = await User.findById(req.user._id).populate('followers').exec();
      let newNotification = {
        username: req.user.username,
        campgroundId: campground.id
      };
      for(const follower of user.followers) {
        let notification = await Notification.create(newNotification);
        follower.notifications.push(notification);
        follower.save();
      }

      //redirect back to campgrounds page
      res.redirect(`/campgrounds/${campground.id}`);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
// });
  });
});
});

router.get('/new', middleware.isLoggedIn, function(req, res) {
    res.render('campgrounds/new');
});

router.get('/:id', function(req, res) {
    Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground) {
        if(err || !foundCampground) {
            req.flash('error', 'Sorry, that campground does not exist!');
            res.redirect('back');
        } else {
            res.render('campgrounds/show', {foundCampground: foundCampground});      
        }
    });
});

router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
      Campground.findById(req.params.id, (err, editcampground) => {
              res.render('campgrounds/edit', {editcampground: editcampground});   
    });   
});

router.put("/:id", upload.single('image'), middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if(req.file) {
              try {
                await cloudinary.v2.uploader.destroy(campground.imageId);
                var result = await cloudinary.v2.uploader.upload(req.file.path); 
                campground.imageId = result.public_id;
                campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                 return res.redirect("back");
              }
            }
            campground.name = req.body.campground.name;
            campground.location = req.body.location;
            campground.price = req.body.campground.price;
            campground.description = req.body.campground.description;
            campground.name = req.body.campground.name;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
            }
        });
  });
});

router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, async function (err, campground) {
        if(err) {
            req.flash('error', err.message);
            res.redirect('back');
        } else {
            try {
                await cloudinary.v2.uploader.destroy(campground.imageId);
                campground.remove();
                req.flash('success', 'Campground deleted successfully!');
                Comment.deleteMany({ _id : { $in: campground.comments} }, (err) => {
                if(err) {
                    console.log(err);
                } else {
                    req.flash('success', "Campground deleted");
                    res.redirect('/campgrounds');
                }
            });
            } catch(err) {
                if(err) {
                   req.flash("error", err.message);
                   return res.redirect("back");
                 }
            }
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
