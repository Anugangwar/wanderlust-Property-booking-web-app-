if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
// console.log(process.env.SECRET); 


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require('express-session');
const MongoStore = require("connect-mongo");

const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const dbUrl = process.env.ATLASDB_URL;



main().then ( () => {
 console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect(dbUrl);
    
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


//session for deployment(because info is not saved using express session on production level)
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret:"mysecretstring",
    },
    touchAfter: 24 * 3600,    //for lazy update
});


store.on("error", (err) =>{
    console.log("ERROR in MONGO SESSION STORE", err);
});


//define sessions

const sessionOptions = {
    store,
    secret: "mysecretstring",
    resave: false,
    saveUninitialized: true, 
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

// app.get("/", (req, res) => {
// res.send("home");
// });


app.use(session(sessionOptions)); //use sessions (session come first)

app.use(flash()); //before the routes  (flash after the session)


app.use(passport.initialize());   //initialize passport for every request
app.use(passport.session());    //passport session (every req should known it is part of which session )
passport.use(new LocalStrategy(User.authenticate())); // use static authenticate method of model in LocalStrategy

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//middleware for flash
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


// app.get("/demouser", async (req, res) => {
//     let fakeUser= new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });

//    const registeredUser = await User.register(fakeUser, "helloworld");

//    res.send(registeredUser);
// });



app.use("/listings", listingRouter);  //express router

app.use("/listings/:id/reviews", reviewRouter);

app.use("/", userRouter);


// app.get("/testListing", async (req, res) => {
// let sampleListing = new Listing({
//     title: "My new Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
// });
// await sampleListing.save();
// console.log("saved");
// res.send("successful testing");
// });

//check all routes and come to this

// app.all("*", (req, res, next) => {
//     next(new ExpressError(404,"Page Not Found!"));
// });


// err middleware
app.use((err, req, res, next) => {
    let { statusCode=500, message= "something went wrong!"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("Error.ejs", {message});
    // res.send("something went wrong");
});

app.listen(8080, () => {
    console.log("server is listening to the port 8080");
});


// const fs = require('fs');
// console.log("Views folder exists?", fs.existsSync(path.join(__dirname, "views")));
// console.log("Listings folder exists?", fs.existsSync(path.join(__dirname, "views", "/layouts/listings")));
