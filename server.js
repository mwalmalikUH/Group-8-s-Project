/////////////////////////////////////////   Importing everything we need   /////////////////////////////////////

// import express lib and initialise it to app var
const express = require("express");
const app = express();
// import bcrypyt hashing library (encryption)
const bcrypt = require("bcrypt");


////////////////////////////////////////////   Configuration   /////////////////////////////////////////////////

// server port (creates 4000 during dev otherwise grabs the port from env)
const PORT = 4000;



// allows to read static files e.g. css, imgs...
app.use(express.static('public'));



// allows us to access data entered into form, inside our request vars
app.use(express.urlencoded({
    extended: false
}));



// allows us to accept json data
app.use(express.json());



// sets the view engine to ejs template engine
app.set("view engine", "ejs");





///////////////////////////////////////////////////   Local Storage  //////////////////////////////////////////


// local storage
const usersList = [
    // {
    //     "username": "test,
    //     "password": "123"
    // }
];
const userProfiles = [
    // {
    //     'username': 'test',
    //     'profile': {
    //         "fullname": "test",
    //         "state": "CA"
    //     }
    // },
];
const quotesHistory = [
    // {
    //     "username": "test",
    //     "quotes": [{QUOTE1}, {QUOTE2}]
    // }
];
// used to check if user is already logged in
let currentUser = "";
const states = {
    'AL': 'Alabama',
    'AK': 'Alaska',
    'AZ': 'Arizona',
    "AR": 'Arkansas',
    "CA": 'California',
    "CO": 'Colorado',
    "CT": 'Connecticut',
    "DE": 'Delaware',
    "DC": 'District Of Columbia',
    "FL": 'Florida',
    "GA": 'Georgia',
    "HI": 'Hawaii',
    "ID": 'Idaho',
    "IL": 'Illinois',
    "IN": 'Indiana',
    "IA": 'Iowa',
    "KS": 'Kansas',
    "KY": 'Kentucky',
    "LA": 'Louisiana',
    "ME": 'Maine',
    "MD": 'Maryland',
    "MA": 'Massachusetts',
    "MI": 'Michigan',
    "MN": 'Minnesota',
    "MS": 'Mississippi',
    "MO": 'Missouri',
    "MT": 'Montana',
    "NE": 'Nebraska',
    "NV": 'Nevada',
    "NH": 'New Hampshire',
    "NJ": 'New Jersey',
    "NM": 'New Mexico',
    "NY": 'New York',
    "NC": 'North Carolina',
    "ND": 'North Dakota',
    "OH": 'Ohio',
    "OK": 'Oklahoma',
    "OR": 'Oregon',
    "PA": 'Pennsylvania',
    "RI": 'Rhode Island',
    "SC": 'South Carolina',
    "SD": 'South Dakota',
    "TN": 'Tennessee',
    "TX": 'Texas',
    "UT": 'Utah',
    "VT": 'Vermont',
    "VA": 'Virginia',
    "WA": 'Washington',
    "WV": 'West Virginia',
    "WI": 'Wisconsin',
    "WY": 'Wyoming',
};


/////////////////////////////////////   Custom Functions   ////////////////////////////

// username taken
const isUsernameTaken = (username, usersList) => {
    return Boolean(usersList.find(user => user.username.toLowerCase() == username.toLowerCase()));
};


// first time login
const firstTimeLogin = (username, userProfiles) => {
    return (null == userProfiles.find(userProfile => userProfile.username.toLowerCase() == username.toLowerCase()));
};


// returns the specified user's profile
const getUserProfile = (username, userProfiles) => {
    return userProfiles.find(userProfile => userProfile.username.toLowerCase() == username.toLowerCase());
};

const containsSpace = (username) => {
    return username.includes(" ");
};

const exceedsCharacters = (string, length) => {
    return string.length > length;
};

// returns the specified user's quote history
const getUserQuotes = (username, quotesHistory) => {
    return quotesHistory.find(user => user.username.toLowerCase() == username.toLowerCase());
};

// returns whether 
const initialProfileExists = (username, userProfiles) => {
    return Boolean(getUserProfile(username, userProfiles));
};


//////////////////////////////////////   Routing (manipulating and displaying pages)   /////////////////////////


// homepage route
app.get("/", (req, res) => {
    if (!currentUser) {
        return res.redirect('/login');
    }

    if (!initialProfileExists(currentUser, userProfiles)) {
        return res.redirect('/client-profile-management');
    }

    res.render("home.ejs");
});


// login route
app.get("/login", (req, res) => {
    if (currentUser) {
        return res.redirect('/');
    }
    res.render("login.ejs");
});

app.post("/login", async (req, res) => {
    if (containsSpace(req.body.username)) {
        return res.render('login.ejs', { showSpaceError: true });
    }
    // checks if user exists
    const user = usersList.find(user => user.username.toLowerCase() == req.body.username.toLowerCase());

    // user doesn't exist
    if (user == null) {
        return res.render("login.ejs", { showError: true });
    }


    try {
        // checks if password matches
        if (await bcrypt.compare(req.body.password, user.password)) {
            // sets the current user to logged in one so it remembers even if the page refreshes
            currentUser = req.body.username;
            // redirected to client profile management if first time logging in
            if (firstTimeLogin(currentUser, userProfiles)) {
                return (res.redirect('/client-profile-management'));
            }
            // redirect to home since logged in successfully
            res.redirect('/');

        } else {
            // password didn't match
            return res.render("login.ejs", {
                // sets the error flash to show
                showError: true
            });
        }
    } catch {
        // unknown error occured
        res.status(500).send('Internal server error');
    }
});


// sign-up route
app.get("/sign-up", (req, res) => {
    // if logged in only then allow access to page
    if (currentUser) {
        res.redirect('/');
    }

    res.render("sign-up.ejs");
});

app.post("/sign-up", async (req, res) => {
    if (containsSpace(req.body.username)) {
        return res.render('sign-up.ejs', { showSpaceError: true });
    }

    if (isUsernameTaken(req.body.username, usersList)) {
        return res.render('sign-up.ejs', { showError: true });
    }

    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = {
            username: req.body.username,
            password: hashedPassword
        };
        usersList.push(user);

        const newUserQuote = {
            "username": user.username, "quotes": []
        };
        quotesHistory.push(newUserQuote);

        res.redirect("/login");
    } catch {
        res.status(500).status('Error!');
    }
});

// logout route
app.post("/logout", (req, res) => {
    currentUser = "";
    res.redirect('/login');
});



// profile firstime management route
app.get("/client-profile-management", (req, res) => {
    // if logged in only then allow access to page
    if (!currentUser) {
        return res.redirect('/login');

    }

    // if profile already exists redirect to home
    if (initialProfileExists(currentUser, userProfiles)) {
        return res.redirect('/');
    }

    return res.render("client-profile-management.ejs");

});

app.post("/client-profile-management", (req, res) => {
    const fullName = req.body.fullName;
    const address1 = req.body.address1;
    const address2 = req.body.address2;
    const city = req.body.city;
    const state = req.body.state;
    const zipCode = req.body.zipCode;

    if (exceedsCharacters(fullName, 50)) {
        return res.render("client-profile-management.ejs", { showFieldError: true, length: 50, field: fullName, fieldName: "Full name" });
    }

    if (!exceedsCharacters(fullName, 0)) {
        return res.render("client-profile-management.ejs", { showZeroError: true, field: fullName, fieldName: "Full name" });
    }

    if (exceedsCharacters(address1, 100)) {
        return res.render("client-profile-management.ejs", { showFieldError: true, length: 100, field: address1, fieldName: "Address 1" });
    }

    if (!exceedsCharacters(address1, 0)) {
        return res.render("client-profile-management.ejs", { showZeroError: true, field: address1, fieldName: "Address 1" });
    }
    if (exceedsCharacters(address2, 100)) {
        return res.render("client-profile-management.ejs", { showFieldError: true, length: 100, field: address2, fieldName: "Address 2" });
    }

    if (exceedsCharacters(zipCode, 9)) {
        return res.render("client-profile-management.ejs", { showFieldError: true, length: 9, field: zipCode, fieldName: "Zipcode" });
    }

    if (!exceedsCharacters(zipCode, 4)) {
        return res.render("client-profile-management.ejs", { showZipCodeError: true, length: 5, field: zipCode, fieldName: "Zipcode" });
    }

    if (exceedsCharacters(city, 100)) {
        return res.render("client-profile-management.ejs", { showFieldError: true, length: 100, field: city, fieldName: "City" });
    }

    if (!exceedsCharacters(city, 0)) {
        return res.render("client-profile-management.ejs", { showZeroError: true, field: city, fieldName: "City" });
    }

    const userProfile = {
        "username": currentUser,
        "profile": {
            "fullName": fullName,
            "address1": address1,
            "address2": address2,
            "city": city,
            "state": state,
            "zipCode": zipCode
        }
    };
    userProfiles.push(userProfile);
    res.redirect('/');
});



// quote history route
app.get("/fuel-quote-history", (req, res) => {
    // if not logged in
    if (!currentUser) {
        return res.redirect('/login');
    }

    // if initial profile doesn't exist
    if (!initialProfileExists(currentUser, userProfiles)) {
        return res.redirect('/client-profile-management');
    }

    res.render("fuel-quote-history.ejs", { quotes: getUserQuotes(currentUser, quotesHistory).quotes });
});



// new fuel quote route
app.get("/new-fuel-quote", (req, res) => {
    // if not logged in
    if (!currentUser) {
        return res.redirect('/login');
    }

    // if initial profile doesn't exist
    if (!initialProfileExists(currentUser, userProfiles)) {
        return res.redirect('/client-profile-management');
    }

    // gets user's profile from local storage
    const userProfile = getUserProfile(currentUser, userProfiles);

    // prepares address to be displayed
    const userAddress = userProfile.profile.address1 + " " + userProfile.profile.address2 + " " + userProfile.profile.city + ', ' + userProfile.profile.state + ', ' + userProfile.profile.zipCode;

    res.render("new-fuel-quote.ejs", { address: userAddress });

});

app.post("/new-fuel-quote", (req, res) => {
    const userProfile = getUserProfile(currentUser, userProfiles);
    // prepare user address
    const userAddress = userProfile.profile.address1 + " " + userProfile.profile.address2 + " " + userProfile.profile.city + ', ' + userProfile.profile.state + ', ' + userProfile.profile.zipCode;
    // prepare quote object
    const newQuote = {
        "gallonsRequested": req.body.gallonsRequested,
        "address": userAddress,
        "deliveryDate": req.body.deliveryDate,
        "suggestedPrice": "placeholder hehe",
        "totalAmount": "another placeholder hehe",
    };

    // gets user's quote storage location and add the newly created quote to it
    const userQuotes = getUserQuotes(currentUser, quotesHistory);
    userQuotes.quotes.push(newQuote);

    res.redirect('/');
});


// client settings routes
app.get("/client-profile-settings", (req, res) => {
    // if not logged in
    if (!currentUser) {
        return res.redirect('/login');
    }

    // if initial profile doesn't exist
    if (!initialProfileExists(currentUser, userProfiles)) {
        return res.redirect('/client-profile-management');
    }

    const userProfile = getUserProfile(currentUser, userProfiles);
    const stateCode = userProfile.profile.state;
    const placeholderData = {
        fullName: userProfile.profile.fullName,
        stateCode: stateCode,
        stateFull: stateCode + ' - ' + states[stateCode],
        zipCode: userProfile.profile.zipCode,
        address1: userProfile.profile.address1,
        address2: userProfile.profile.address2,
        city: userProfile.profile.city
    };

    res.render("client-profile-settings.ejs", placeholderData);
});

app.post("/client-profile-settings", (req, res) => {
    // grabs new settings from all the fields and updates in local storage
    const userProfile = getUserProfile(currentUser, userProfiles);
    userProfile.profile.fullName = req.body.fullName;
    userProfile.profile.address1 = req.body.address1;
    userProfile.profile.address2 = req.body.address2;
    userProfile.profile.state = req.body.state;
    userProfile.profile.city = req.body.city;
    userProfile.profile.zipCode = req.body.zipCode;

    res.redirect('/');
});


// launches server and listens on PORT var
app.listen(PORT);