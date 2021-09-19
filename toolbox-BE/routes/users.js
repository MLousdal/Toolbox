// *** previously logins.js --> Users.js
// now serving endpoints:
//      POST    /api/Users/login
//      POST    /api/Users

const express = require('express');
const router = express.Router();

const User = require('../models/user');
const jwt = require('jsonwebtoken');
const config = require('config');

const secret = config.get('jwt_secret_key');

// Error handler
const { TakeError } = require('../helpers/helpError');


// ---------------------------------------------------------
// ----------------- TABLE OF CONTENTS ---------------------
// ---------------------------------------------------------
// POST
// /api/Users
// /api/Users/login

// PUT
// /api/Users/:UserId
// /api/Users/delete/me
// /api/Users/delete/:UserId

// GET
// /api/Users
// /api/Users/me
// /api/Users/:UserId
// ---------------------------------------------------------

//------------------------POST-------------------------------
//          POST /api/Users (SIGNUP)
// previously '/signup'
router.post('/', async (req, res) => {
    
    try {
        // previously Login.validate(req.body)
        const { error } = User.validateResponse(req.body);
        if (error) throw new TakeError(400, "Bad Request:" + error);

        // If the req.body is formatted correctly a new User will be created with that information.
        const userObj = new User(req.body);

        const user = await userObj.create();

        // previously user
        return res.send(JSON.stringify(user));
    } catch (err) {
        console.log(err);
        // need to make the condition check sensible...
        if (!err.statusCode) return res.status(500).send(JSON.stringify({ errorMessage: err }));
        if (err.statusCode != 400) return res.status(err.statusCode).send(JSON.stringify({ errorMessage: err }));
        return res.status(400).send(JSON.stringify({ errorMessage: err.errorMessage.details[0].message }));
    }
});

//          POST /api/Users/login (LOGIN)
// previously '/'
router.post('/login', async (req, res) => {
    res.setHeader('Access-Control-Expose-Headers', 'x-authenticate-token');
    try {
        // previously Login.validate(req.body)
        const { error } = User.validateResponse(req.body);
        if (error) throw { statusCode: 400, errorMessage: error };

        // previously const loginObj = new Login(req.body)
        const userObj = new User(req.body);
        // previously const user = await Login.readByEmail(loginObj)
        const user = await User.checkCredentials(userObj);

        const token = await jwt.sign(user, secret);
        res.setHeader('x-authenticate-token', token);

        return res.send(JSON.stringify(user));

    } catch (err) {
        console.log(err);
        // need to make the condition check sensible...
        if (!err.statusCode) return res.status(401).send(JSON.stringify({ errorMessage: 'Incorrect user email or password.' }));
        if (err.statusCode != 400) return res.status(401).send(JSON.stringify({ errorMessage: 'Incorrect user email or password.' }));
        return res.status(400).send(JSON.stringify({ errorMessage: err.errorMessage.details[0].message }));
    }
});

//------------------------PUT-------------------------------
// ----- (MEMBER) UPDATE own User
router.put('/me', async (req, res) => {
    // › › validate req.params.toolid as toolid
    // › › validate req.body (payload) as tool --> authors must have authorid!
    // › › call tool = await Tool.readById(req.params.toolid)
    // › › merge / overwrite tool object with req.body
    // › › call await tool.update() --> tool holds the updated information
    const toolidValidate = User.validate(req.params);
    if (toolidValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: toolid has to be an integer', errorDetail: error.details[0].message }));

    const payloadValidate = User.validate(req.body);
    if (payloadValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: Tool payload formatted incorrectly', errorDetail: error.details[0].message }));

    try {
        const oldTool = await User.readById(req.params.toolid);
        oldTool.copy(req.body);
        const tool = await oldTool.update();
        return res.send(JSON.stringify(tool));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

// ----- (ADMIN) UPDATE User
router.put('/:userid', async (req, res) => {
    // › › validate req.params.toolid as toolid
    // › › validate req.body (payload) as tool --> authors must have authorid!
    // › › call tool = await Tool.readById(req.params.toolid)
    // › › merge / overwrite tool object with req.body
    // › › call await tool.update() --> tool holds the updated information
    const toolidValidate = User.validate(req.params);
    if (toolidValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: toolid has to be an integer', errorDetail: error.details[0].message }));

    const payloadValidate = User.validate(req.body);
    if (payloadValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: Tool payload formatted incorrectly', errorDetail: error.details[0].message }));

    try {
        const oldTool = await User.readById(req.params.toolid);
        oldTool.copy(req.body);
        const tool = await oldTool.update();
        return res.send(JSON.stringify(tool));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

// ----- (MEMBER) "DELETE" own User
router.put('/delete/me', async (req, res) => {
    // › › validate req.params.toolid as toolid
    // › › validate req.body (payload) as tool --> authors must have authorid!
    // › › call tool = await Tool.readById(req.params.toolid)
    // › › merge / overwrite tool object with req.body
    // › › call await tool.update() --> tool holds the updated information
    const toolidValidate = User.validate(req.params);
    if (toolidValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: toolid has to be an integer', errorDetail: error.details[0].message }));

    const payloadValidate = User.validate(req.body);
    if (payloadValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: Tool payload formatted incorrectly', errorDetail: error.details[0].message }));

    try {
        const oldTool = await User.readById(req.params.toolid);
        oldTool.copy(req.body);
        const tool = await oldTool.update();
        return res.send(JSON.stringify(tool));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

// ----- (ADMIN) "DELETE" any User
router.put('/delete/:userid', async (req, res) => {
    // › › validate req.params.toolid as toolid
    // › › validate req.body (payload) as tool --> authors must have authorid!
    // › › call tool = await Tool.readById(req.params.toolid)
    // › › merge / overwrite tool object with req.body
    // › › call await tool.update() --> tool holds the updated information
    const toolidValidate = User.validate(req.params);
    if (toolidValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: toolid has to be an integer', errorDetail: error.details[0].message }));

    const payloadValidate = User.validate(req.body);
    if (payloadValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: Tool payload formatted incorrectly', errorDetail: error.details[0].message }));

    try {
        const oldTool = await User.readById(req.params.toolid);
        oldTool.copy(req.body);
        const tool = await oldTool.update();
        return res.send(JSON.stringify(tool));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

//------------------------GET-------------------------------
// ----- (ADMIN) GET ALL Users
router.get('/', async (req, res, next) => {
    try {
        const user = await User.readAll();
        return res.send(JSON.stringify(user));
    } catch (err) {
        next(err);
    }
});

// ----- (MEMBER) OWN User
router.get('/:me', async (req, res, next) => {
    //URL segmet is :me
    try {
        if (req.params.me) { // Params stores the values from URL segmets like :me as params.me
            me = parseInt(req.params.me);
            if (!me) throw new TakeError(400, 'Bad request: me = should refer an user id (integer)');

            const user = await User.readAll(me);
            return res.send(JSON.stringify(user));
        }
    } catch (err) {
        next(err);
    }
});

// ----- (ADMIN) A specific User
router.get('/:userid', async (req, res, next) => {
    //URL segmet is :userid
    let userid;
    try {
        if (req.params.userid) { // Params stores the values from URL segmets like :me as params.me
            userid = parseInt(req.params.userid);
            if (!userid) throw new TakeError(400, 'Bad request: me = should refer an user id (integer)');

            const user = await User.readAll(userid);
        return res.send(JSON.stringify(user));
        }
    } catch (err) {
        console.log("THIS ERROR",err)
        next(err);
    }
});


// ********************************************************
// ********************  TEST ROUTE  **********************
// ********************************************************
router.get('/test/test', async (req,res, next) => {
    try {
        const user = await User.test1();
        return res.send(JSON.stringify(user));

        console.log("Test running!")
    } catch (err) {
        next(err);
    }
})


module.exports = router;