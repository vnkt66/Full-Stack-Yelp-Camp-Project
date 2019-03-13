var Campground = require("../models/campground");
var Comment    = require("../models/comment");

var middlewareObj = {};
middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
      Campground.findById(req.params.id, (err, foundCampground) => {
        if(err || !foundCampground) {
            req.flash('error', "Sorry that campground doesn't exist at all");
            res.redirect('back');
        } else {
            if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
              next();  
            } else {
                req.flash('error', "You don't have permission to do that");
                res.redirect('back');
            }
        }
    });   
    } else {
        req.flash('error', 'You need to be logged in to do that');
        res.redirect('back');
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
      Comment.findById(req.params.comment_id, (err, foundcomment) => {
        if(err || !foundcomment) {
            req.flash('error', 'Comment not found');
            res.redirect('back');
        } else {
            if(foundcomment.author.id.equals(req.user._id) || req.user.isAdmin) {
              next();  
            } else {
                req.flash('error', "You don't have permission to do that");
                res.redirect('back');
            }
        }
    });   
    } else {
        req.flash('error', 'You need to be logged in to do that');
        res.redirect('/login');
    }
};

middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()){
         next();
    } else {
        req.flash('error', 'You need to be logged in to do that');
        res.redirect('/login');
    }
};

module.exports = middlewareObj;