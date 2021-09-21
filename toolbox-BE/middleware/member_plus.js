const { TakeError } = require("../helpers/helpError");

module.exports = async (req, res, next) => {
    try {
        // Checks if the role matches an Admin or a Member, which means that the we can use next() and move on to the router.
        if (req.user.userRole.roleName == 'Admin') {
            next();
            console.log("WE GOT IT1!!")
        } else if (req.user.userRole.roleName == 'Member') {
            next();
            console.log("WE GOT IT2!!")
        } else {
            throw new TakeError(401, 'Unauthorized: This user do not have access!')
        }
    } catch (error) {
        next(error);
    }
}