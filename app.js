if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
console.log(process.env.SECRET);


const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing  = require("./models/listing.js")
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
// const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema, reviewSchema } = require("./schema.js");
const reviewsRouter = require("./routes/review.js");
const listingRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo")
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
// const { isLoggedIn, isOwner, validateListing } = require("./middleware.js");


// controllers
// const listingController = require("./controllers/listings.js");
// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main().then(() =>{
    console.log("connect to db");
})
.catch((err) => {
    console.log(err);
}); 

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});
 
store.on("error", () => {
    console.log("Error in Mongo Session Store", err)
})
//express session config
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    //add cookie options
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    },
};

// app.get("/", (req, res) =>{
//     res.send("Hello World");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app
//flash middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
}); 

// // listing routes
// //Index route
// app.get("/listings", wrapAsync(listingController.index));

// //new route(create)
// app.get("/listings/new", isLoggedIn, listingController.renderNewForm);

// //Show route(read)
// app.get("/listings/:id", wrapAsync(listingController.showListing));

// // Create route(post)
// app.post("/listings",
//     isLoggedIn,validateListing, wrapAsync(listingController.createListing)
    
// );


// // Edit route(put)
// app.get("/listings/:id/edit",isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// // Update Route
// app.put("/listings/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// // delete route
// app.delete("/listings/:id",isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));

// //connecting review routes 
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);


// app.all("*", (req, res, next) =>{
//     next(new ExpressError(404, "page not found!"));
// });

app.use((err, req, res, next) => {
    let {statusCode=500, message = "something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {err});
    // res.status(statusCode).send(message);
})

app.listen(8080, () =>{
    console.log("Server is running on port 8080");
});