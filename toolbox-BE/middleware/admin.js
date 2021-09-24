module.exports = (req, res, next) => {
    if (req.account.userRole.roleName == 'Admin') next();

    return res.status(401).send(JSON.stringify({ errorMessage: 'Unauthorised access.' }));
}