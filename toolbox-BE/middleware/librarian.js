module.exports = (req, res, next) => {
    if (req.account.userRole.roleName == 'admin' || req.account.userRole.roleName == 'librarian') next();

    return res.status(401).send(JSON.stringify({ errorMessage: 'Unauthorised access.' }));

}