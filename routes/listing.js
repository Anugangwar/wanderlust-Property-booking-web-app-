const express = require("express");
const wrapAsync = require("../utils/wrapAsync.js");

const{validateListing, isLoggedIn, isOwner} = require("../middleware.js");

const router = express.Router();

const listingController = require("../controllers/listings.js");

const multer  = require('multer')

const {storage } = require("../cloudConfig.js");
const upload = multer({ storage });



// combine same path of routes(router.route()) 

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Edit route

router.get("/:id/edit", isLoggedIn, isOwner, 
     wrapAsync(listingController.renderEditForm));


router
.route("/")
.get(wrapAsync(listingController.index))
.post(
     isLoggedIn, 
     validateListing,
     upload.single("listing[image]"),
     wrapAsync(listingController.createListing)
);


router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner, 
 upload.single("listing[image]"),
 validateListing, 
wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));


module.exports = router;