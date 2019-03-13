var express = require("express");
var router  = express.Router({mergeParams: true});

var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

router.get('/new', middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, (err, campground) => {
        if(err) {
            console.log(err);
        } else {
            res.render('comments/new', {campground: campground});      
        }
    });
});

router.post('/', middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, (err, campground) => {
        if(err) {
            console.log(err);
            res.redirect('/campgrounds');
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if(err) {
                    req.flash('error', 'Something went wrong');
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    console.log(comment);
                    campground.comments.push(comment);
                    campground.save((err, savedcampground) => {
                        if(err) {
                            console.log(err);
                        } else {
                            req.flash('success', 'Successfully added comment');
                            res.redirect('/campgrounds/' + campground._id);
                        }
                    });
                }
            });
        }
    });
});

router.get('/:comment_id/edit', middleware.checkCommentOwnership, (req, res) => {
     Comment.findById(req.params.comment_id, (err, foundcomment) => {
         if(err) {
             res.redirect('back');
         } else {
              res.render('comments/edit', {campground_id: req.params.id, comment: foundcomment});
         }            
     });  
});

router.put('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
     Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedcomment) => {
        if(err) {
            res.redirect('back');
        } else {
            console.log(updatedcomment);
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndDelete(req.params.comment_id, (err, removedcomment) => {
        if(err) {
            res.redirect('back');
        } else {
                  req.flash('success', "Comment deleted");
                  res.redirect('/campgrounds/' + req.params.id);
                }
    });
});

module.exports = router;