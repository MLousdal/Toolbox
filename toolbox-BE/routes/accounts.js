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
// POST

// /api/accounts
// /api/accounts/login

// PUT

// /api/accounts/:accountId

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


//------------------------GET-------------------------------






module.exports = router;