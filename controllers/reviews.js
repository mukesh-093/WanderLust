const Review = require("../models/review.js");
const Listing  = require("../models/listing.js");

// create review
module.exports.createReview = async (req, res) => {
   let listings =  await Listing.findById(req.params.id);
   let newReview = new Review(req.body.review);  
   newReview.author = req.user._id;
   listings.reviews.push(newReview);
   await newReview.save();
   await listings.save();
   req.flash("success", "Created new review");
   res.redirect(`/listings/${listings._id}`);
}

// delete review
module.exports.deleteReview = async (req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted a review");
    res.redirect(`/listings/${id}`);
}