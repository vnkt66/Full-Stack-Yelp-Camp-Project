var mongoose     = require("mongoose"),
    Campground   = require("./models/campground"),
    Comment      = require("./models/comment")
    
var data = [
     {
         name       : 'IMAGE1',
         image      : 'https://images.unsplash.com/photo-1551326844-4df70f78d0e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
         description: 'غينيا واستمر العصبة ضرب قد. وباءت الأمريكي الأوربيين هو به،, هو العالم، الثقيلة بال. مع وايرلندا الأوروبيّون كان, قد بحق أسابيع العظمى واعتلاء. انه كل وإقامة المواد. '
     },
     {
         name       : 'IMAGE2',
         image      : 'https://images.unsplash.com/photo-1551375048-9c5c503d0d2a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
         description: 'غينيا واستمر العصبة ضرب قد. وباءت الأمريكي الأوربيين هو به،, هو العالم، الثقيلة بال. مع وايرلندا الأوروبيّون كان, قد بحق أسابيع العظمى واعتلاء. انه كل وإقامة المواد. '
     },
     {
         name       : 'IMAGE3',
         image      : 'https://images.unsplash.com/photo-1464500542410-1396074bf230?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
         description: 'غينيا واستمر العصبة ضرب قد. وباءت الأمريكي الأوربيين هو به،, هو العالم، الثقيلة بال. مع وايرلندا الأوروبيّون كان, قد بحق أسابيع العظمى واعتلاء. انه كل وإقامة المواد. '
     },
     {
         name       : 'IMAGE4',
         image      : 'https://images.unsplash.com/photo-1504255193611-0df42cbd17c1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
         description: 'غينيا واستمر العصبة ضرب قد. وباءت الأمريكي الأوربيين هو به،, هو العالم، الثقيلة بال. مع وايرلندا الأوروبيّون كان, قد بحق أسابيع العظمى واعتلاء. انه كل وإقامة المواد. '
     }
    ];
    
function seedDB() {
  //Remove all campgrounds
  Campground.deleteMany({}, (err) => {
        if(err) {
            console.log(err);
        } else {
            console.log('REMOVED CAMPGROUNDS');
            data.forEach((data) => {
            //add a few campgrounds
            Campground.create(data, (err, createddata) => {
            if(err) {
                console.log(err);
            } else {
                console.log(createddata);
                Comment.create({
                    text  : "Food Looks Delicious but i don't have money to buy",
                    author: "venkatitsme6"
                }, (err, comment) => {
                    if(err) {
                        console.log(err);
                    } else {
                        createddata.comments.push(comment);
                        createddata.save((err, saveddata) => {
                            if(err) {
                                console.log(err);
                            } else {
                                console.log('Saved comment to database!');
                            }
                        })
                    }
                })
            }
        })
        })
        }
    }) 
   //add a few comments
}

module.exports = seedDB;