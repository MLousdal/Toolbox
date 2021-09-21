const 
jwt = require('jsonwebtoken'),
config = require('config'),

secret = config.get('jwt_secret_key'),
{ TakeError } = require('../helpers/helpError');

module.exports = async (req, res, next) => {
    const token = req.header('toolbox-token');

    try {

        // If the token is not in the req.header, then an error will be thrown.
        if (!token) throw new TakeError(401, 'Unauthorized: No valid token provided!');

        // If the right token is in the req.header, then we need to verify it with our secret-key
        const decodedToken = await jwt.verify(token, secret);

        req.user = decodedToken;
        console.log("req.body ===============" , req.user)

        next();
    } catch (error) {
        if (error.message == 'jwt malformed') error = new TakeError(401, 'Unauthorized: Token could not be validated!');
        next (error);
    }
}