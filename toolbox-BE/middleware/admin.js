const { TakeError } = require('../helpers/helpError');
module.exports = async (req, res, next) => {
    try {
        if (req.user.userRole.roleName == 'Admin') {
            next();
        } {
            throw new TakeError(401, 'Unauthorised access!');
        }
    } catch (err) {
        next(err);
    }

}