const 
express = require('express'),
router = express.Router(),

User = require('../models/user'),
jwt = require('jsonwebtoken'),
config = require('config'),

secret = config.get('jwt_secret_key'),

// Middleware
auth = require('../middleware/authenticate'),

// Member +
auth_member_plus = require('../middleware/member_plus'),
memberPlus = [auth, auth_member_plus],

// Admin
auth_admin = require('../middleware/admin'),
adminAuth = [auth, auth_admin],


// Error handler
{ TakeError } = require('../helpers/helpError');

// ---------------------------------------------------------
// ----------------- TABLE OF CONTENTS ---------------------
// ---------------------------------------------------------
// POST
// /api/Users
// /api/Users/login

// GET -- Not in use, out of scope.
// /api/Users
// /api/Users/me
// /api/Users/:UserId
// ---------------------------------------------------------

//------------------------ POST -------------------------------

//          POST /api/Users (SIGNUP)
router.post('/', async (req, res, next) => {
    try {
        // previously Login.validate(req.body)
        const { error } = User.validateResponse(req.body);
        if (error) throw new TakeError(400, "Bad Request:" + error);

        const
        // If the req.body is formatted correctly a new User will be created with that information.
        userObj = new User(req.body),
        // - That way we can use the method: create() to use the userObj to make a .query().
        user = await userObj.create();
        // If .create() have:
            // -- Checked for dublicate users
            // -- INSERT INTO database correctly
            // -- Validated the object we created with the data from the database
        // Then we can return the newly created user to the FE!
        return res.send(JSON.stringify(user));
    } catch (err) {
        next(err);
    }
});

//          POST /api/Users/login (LOGIN)
router.post('/login', async (req, res, next) => {
    //Allows a "custom token" to be used.
    res.setHeader('Access-Control-Expose-Headers', 'toolbox-token');
    // Exposes a non-CORS-safelisted response (So we add toolbox-token to the list of safe headers), so we can use our custom token in the browser. Read more: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers
    // CORS(Cross-Origin Resourse Sharing). Read more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

    try {
        // Is the data from the FE login, correctly formated?
        const { error } = User.validate_login(req.body);
        if (error) throw new TakeError(400, 'Bad Request: ' + error);

        // create new User to check if it exist in the DB, and if there is more than 1!?
        const userObj = new User(req.body);
        // Check the format, and if the password is a match.
        const user = await User.checkCredentials(userObj);

        // If there are only 1 user and the data given are correct, we give asign a matching token, and send it with the response(user and the token)
        const token = await jwt.sign(user, secret);
        res.setHeader('toolbox-token', token);

        return res.send(JSON.stringify(user));
    } catch (err) {
        next(err);
    }
});

//------------------------ GET -------------------------------

// Disclaimer:
// The scopet changed and more focus was used on our tools, so that is why we are not using these GET's in our project.

// // ----- (ADMIN) GET ALL Users
// router.get('/', adminAuth, async (req, res, next) => {
//     try {
//         const user = await User.readAll();
//         return res.send(JSON.stringify(user));
//     } catch (err) {
//         next(err);
//     }
// });

// // ----- (MEMBER) OWN User
// router.get('/:me', memberPlus, async (req, res, next) => {
//     //URL segmet is :me
//     try {
//         if (req.params.me) { // Params stores the values from URL segmets like :me as params.me
//             me = parseInt(req.params.me);
//             if (!me) throw new TakeError(400, 'Bad request: me = should refer an user id (integer)');

//             const user = await User.readAll(me);
//             return res.send(JSON.stringify(user));
//         }
//     } catch (err) {
//         next(err);
//     }
// });

// // ----- (ADMIN) A specific User
// router.get('/:userid', adminAuth, async (req, res, next) => {
//     //URL segmet is :userid
//     let userid;
//     try {
//         if (req.params.userid) { // Params stores the values from URL segmets like :me as params.me
//             userid = parseInt(req.params.userid);
//             if (!userid) throw new TakeError(400, 'Bad request: me = should refer an user id (integer)');

//             const user = await User.readAll(userid);
//             return res.send(JSON.stringify(user));
//         }
//     } catch (err) {
//         next(err);
//     }
// });

// // ********************************************************
// // ********************  TEST ROUTE  **********************
// // ********************************************************
// router.get('/test/test', [auth], async (req,res, next) => {
//     try {
//         // const user = await User.test1();
//         // return res.send(JSON.stringify(user));


//         console.log("Test running!")
//     } catch (err) {
//         next(err);
//     }
// })

module.exports = router;