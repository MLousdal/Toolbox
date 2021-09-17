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
        const { error } = User.validate(req.body);
        if (error) throw { statusCode: 400, errorMessage: error };

        // previously const loginObj = new Login(req.body);
        const UserObj = new User(req.body);
        // previously const user = await loginObj.create();
        const User = await UserObj.create();

        // previously user
        return res.send(JSON.stringify(User));
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
        const { error } = User.validate(req.body);
        if (error) throw { statusCode: 400, errorMessage: error };

        // previously const loginObj = new Login(req.body)
        const UserObj = new User(req.body);
        // previously const user = await Login.readByEmail(loginObj)
        const User = await User.checkCredentials(UserObj);

        const token = await jwt.sign(User, secret);
        res.setHeader('x-authenticate-token', token);
        // previously user
        return res.send(JSON.stringify(User));

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
// ----- (ADMIN) ALL Users
router.get('/', async (req, res) => {
    // need to call the Tool class for DB access...
    let userid;
    if (req.query.user) {
        userid = parseInt(req.query.user);
        if (!userid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?user= should refer an user id (integer)' }));
    }

    try {
        const user = await User.readAll(userid);
        return res.send(JSON.stringify(user));
    } catch (err) {
        return res.status(500).send(JSON.stringify({errorMessage: err, from: "router.get(All Users)"}));
    }
});

// ----- (MEMBER) OWN User
router.get('/me', async (req, res) => {
    // need to call the Tool class for DB access...
    let authorid;
    if (req.query.author) {
        authorid = parseInt(req.query.author);
        if (!authorid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?author= should refer an author id (integer)' }));
    }

    try {
        const tools = await User.readAll(authorid);
        return res.send(JSON.stringify(tools));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

// ----- (ADMIN) A specific User
router.get('/:userid', async (req, res) => {
    // need to call the Tool class for DB access...
    let authorid;
    if (req.query.author) {
        authorid = parseInt(req.query.author);
        if (!authorid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?author= should refer an author id (integer)' }));
    }

    try {
        const tools = await User.readAll(authorid);
        return res.send(JSON.stringify(tools));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});





module.exports = router;