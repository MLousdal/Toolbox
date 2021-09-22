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

        // req.user is created in order to be able to do things like:
            // -- Check what role the member does have, and then use middleware to grant access acordingly.
        req.user = decodedToken;

        next();
    } catch (error) {
        // If the jwt.verify, change the error, to something other than just "jwt malformed".
            if (error.message == 'jwt malformed') error = new TakeError(401, 'Unauthorized: Token could not be validated!');
       
        next (error);
    }
}