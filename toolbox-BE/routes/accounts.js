// *** previously logins.js --> accounts.js
// now serving endpoints:
//      POST    /api/accounts/login
//      POST    /api/accounts

const express = require('express');
const router = express.Router();

// previously Login from ../models/login
const Account = require('../models/account');
const jwt = require('jsonwebtoken');
const config = require('config');

const secret = config.get('jwt_secret_key');


// ---------------------------------------------------------
// ----------------- TABLE OF CONTENTS ---------------------
// ---------------------------------------------------------
// POST
// /api/accounts
// /api/accounts/login

// PUT
// /api/accounts/:accountId
// /api/accounts/delete/me
// /api/accounts/delete/:accountId

// GET
// /api/accounts
// /api/accounts/me
// /api/accounts/:accountId
// ---------------------------------------------------------

//------------------------POST-------------------------------

//          POST /api/accounts/login (LOGIN)
// previously '/'
router.post('/login', async (req, res) => {
    // res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Expose-Headers', 'x-authenticate-token');
    try {
        // previously Login.validate(req.body)
        const { error } = Account.validate(req.body);
        if (error) throw { statusCode: 400, errorMessage: error };

        // previously const loginObj = new Login(req.body)
        const accountObj = new Account(req.body);
        // previously const user = await Login.readByEmail(loginObj)
        const account = await Account.checkCredentials(accountObj);

        const token = await jwt.sign(account, secret);
        res.setHeader('x-authenticate-token', token);
        // previously user
        return res.send(JSON.stringify(account));

    } catch (err) {
        console.log(err);
        // need to make the condition check sensible...
        if (!err.statusCode) return res.status(401).send(JSON.stringify({ errorMessage: 'Incorrect user email or password.' }));
        if (err.statusCode != 400) return res.status(401).send(JSON.stringify({ errorMessage: 'Incorrect user email or password.' }));
        return res.status(400).send(JSON.stringify({ errorMessage: err.errorMessage.details[0].message }));
    }
});


//          POST /api/accounts (SIGNUP)
// previously '/signup'
router.post('/', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
        // previously Login.validate(req.body)
        const { error } = Account.validate(req.body);
        if (error) throw { statusCode: 400, errorMessage: error };

        // previously const loginObj = new Login(req.body);
        const accountObj = new Account(req.body);
        // previously const user = await loginObj.create();
        const account = await accountObj.create();

        // previously user
        return res.send(JSON.stringify(account));
    } catch (err) {
        console.log(err);
        // need to make the condition check sensible...
        if (!err.statusCode) return res.status(500).send(JSON.stringify({ errorMessage: err }));
        if (err.statusCode != 400) return res.status(err.statusCode).send(JSON.stringify({ errorMessage: err }));
        return res.status(400).send(JSON.stringify({ errorMessage: err.errorMessage.details[0].message }));
    }
});

//------------------------PUT-------------------------------
// ----- (MEMBER) UPDATE own account
router.put('/me', async (req, res) => {
    // › › validate req.params.toolid as toolid
    // › › validate req.body (payload) as tool --> authors must have authorid!
    // › › call tool = await Tool.readById(req.params.toolid)
    // › › merge / overwrite tool object with req.body
    // › › call await tool.update() --> tool holds the updated information
    const toolidValidate = Account.validate(req.params);
    if (toolidValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: toolid has to be an integer', errorDetail: error.details[0].message }));

    const payloadValidate = Account.validate(req.body);
    if (payloadValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: Tool payload formatted incorrectly', errorDetail: error.details[0].message }));

    try {
        const oldTool = await Account.readById(req.params.toolid);
        oldTool.copy(req.body);
        const tool = await oldTool.update();
        return res.send(JSON.stringify(tool));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

// ----- (ADMIN) UPDATE account
router.put('/:accountid', async (req, res) => {
    // › › validate req.params.toolid as toolid
    // › › validate req.body (payload) as tool --> authors must have authorid!
    // › › call tool = await Tool.readById(req.params.toolid)
    // › › merge / overwrite tool object with req.body
    // › › call await tool.update() --> tool holds the updated information
    const toolidValidate = Account.validate(req.params);
    if (toolidValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: toolid has to be an integer', errorDetail: error.details[0].message }));

    const payloadValidate = Account.validate(req.body);
    if (payloadValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: Tool payload formatted incorrectly', errorDetail: error.details[0].message }));

    try {
        const oldTool = await Account.readById(req.params.toolid);
        oldTool.copy(req.body);
        const tool = await oldTool.update();
        return res.send(JSON.stringify(tool));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

// ----- (MEMBER) "DELETE" own account
router.put('/delete/me', async (req, res) => {
    // › › validate req.params.toolid as toolid
    // › › validate req.body (payload) as tool --> authors must have authorid!
    // › › call tool = await Tool.readById(req.params.toolid)
    // › › merge / overwrite tool object with req.body
    // › › call await tool.update() --> tool holds the updated information
    const toolidValidate = Account.validate(req.params);
    if (toolidValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: toolid has to be an integer', errorDetail: error.details[0].message }));

    const payloadValidate = Account.validate(req.body);
    if (payloadValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: Tool payload formatted incorrectly', errorDetail: error.details[0].message }));

    try {
        const oldTool = await Account.readById(req.params.toolid);
        oldTool.copy(req.body);
        const tool = await oldTool.update();
        return res.send(JSON.stringify(tool));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

// ----- (ADMIN) "DELETE" any account
router.put('/delete/:accountid', async (req, res) => {
    // › › validate req.params.toolid as toolid
    // › › validate req.body (payload) as tool --> authors must have authorid!
    // › › call tool = await Tool.readById(req.params.toolid)
    // › › merge / overwrite tool object with req.body
    // › › call await tool.update() --> tool holds the updated information
    const toolidValidate = Account.validate(req.params);
    if (toolidValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: toolid has to be an integer', errorDetail: error.details[0].message }));

    const payloadValidate = Account.validate(req.body);
    if (payloadValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: Tool payload formatted incorrectly', errorDetail: error.details[0].message }));

    try {
        const oldTool = await Account.readById(req.params.toolid);
        oldTool.copy(req.body);
        const tool = await oldTool.update();
        return res.send(JSON.stringify(tool));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

//------------------------GET-------------------------------
// ----- (ADMIN) ALL accounts
router.get('/', async (req, res) => {
    // need to call the Tool class for DB access...
    let authorid;
    if (req.query.author) {
        authorid = parseInt(req.query.author);
        if (!authorid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?author= should refer an author id (integer)' }));
    }

    try {
        const tools = await Account.readAll(authorid);
        return res.send(JSON.stringify(tools));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

// ----- (MEMBER) OWN account
router.get('/me', async (req, res) => {
    // need to call the Tool class for DB access...
    let authorid;
    if (req.query.author) {
        authorid = parseInt(req.query.author);
        if (!authorid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?author= should refer an author id (integer)' }));
    }

    try {
        const tools = await Account.readAll(authorid);
        return res.send(JSON.stringify(tools));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

// ----- (ADMIN) A specific account
router.get('/me', async (req, res) => {
    // need to call the Tool class for DB access...
    let authorid;
    if (req.query.author) {
        authorid = parseInt(req.query.author);
        if (!authorid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?author= should refer an author id (integer)' }));
    }

    try {
        const tools = await Account.readAll(authorid);
        return res.send(JSON.stringify(tools));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});





module.exports = router;