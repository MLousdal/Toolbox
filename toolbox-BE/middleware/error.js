const { useError } = require('../helpers/helpError');

module.exports = (err, req, res, next) => {
    useError(err,res) // We know that the error that catch(err) {next(err)} will have a statusCode and Message that we can use to send back to the FE.
}