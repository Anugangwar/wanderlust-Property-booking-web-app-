const Reviews = require("../models/reviews.js");
const Listing = require("../models/listing.js");


module.exports.createReview =  async(req, res) => {


     let listing = await Listing.findById(req.params.id);
     let newReview = new Reviews(req.body.review);

     newReview.author = req.user._id;  //author's id for review
     listing.reviews.push(newReview);

     await newReview.save();
     await listing.save();

     console.log("new review saved");
    //  res.send("new review saved");
    req.flash("success", "New reviews Added");
    res.redirect(`/listings/${listing._id}`);
};


module.exports.destroyReview = async (req,res) => {
        let { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId }});
        await Reviews.findByIdAndDelete(reviewId);


        req.flash("success", "review deleted!!");
        res.redirect(`/listings/${id}`);
    };