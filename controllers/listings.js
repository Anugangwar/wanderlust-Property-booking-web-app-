const Listing = require("../models/listing.js");

module.exports.index = async (req,res) => {
const allListings = await Listing.find({});
res.render("layouts/listings/index", {allListings});
};


module.exports.renderNewForm = (req, res) => {
    res.render("layouts/listings/new");
};


module.exports.showListing = async(req, res) => {
let {id} = req.params;
const listing = await Listing.findById(id)
.populate({
    path: "reviews",
    populate: {
        path: "author",
    },
})
.populate("owner");

if(!listing){
    req.flash("error", "Listing you requested for does not exist!!");
    return res.redirect("/listings");
}
console.log(listing);
res.render("layouts/listings/show", { listing});
};


module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;

    // console.log(url, "..", filename);
// let {title, description, image, price, location, country} = req.body;
const newListing = new Listing(req.body.listing);
// console.log(req.user);
newListing.owner = req.user._id;
newListing.image = {url, filename};
await newListing.save();
req.flash("success", "New listing Added");
res.redirect("layouts/listings");
};


module.exports.renderEditForm = async (req, res) => {
let {id} = req.params;
const listing = await Listing.findById(id);

if(!listing){
    req.flash("error", "Listing you requested for doesn't exist!!");
    return res.redirect("layouts/listings");
}

let origianlImageUrl = listing.image.url;
origianlImageUrl = origianlImageUrl.replace("/upload","/upload/h_300,w_250");
res.render("layouts/listings/edit", { listing, origianlImageUrl });
};


module.exports.updateListing = async (req, res) => {
let {id} = req.params;
let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
// res.redirect("/listings");
if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
}
req.flash("success", "listing updated successfully");
res.redirect(`layouts/listings/${id}`);   //redirect on show route
};


module.exports.destroyListing = async (req, res) => {
let {id} = req.params;
let deletedListing = await Listing.findByIdAndDelete(id);
console.log(deletedListing);
req.flash("success", "listing deleted!");
res.redirect("/listings");
};

