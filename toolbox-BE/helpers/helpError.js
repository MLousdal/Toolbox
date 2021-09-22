
// Heavly inspired by this guide: https://dev.to/nedsoft/central-error-handling-in-express-3aej
class TakeError extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}
function useError (err, res) {
    const { statusCode, message} = err; // This will destructure err in to 2 parts. The first part of the obj will be called statusCode (like, let statusCode = err[0]), and second part will be called message (err[1]).
    res.status(statusCode).send(JSON.stringify({
        status: "Error",
        statusCode,
        message
    }))
};

class HandleIt {
    constructor(handleObj) {

    }
    // static userVal(validate,status) {
        // $ is used for easier naming.
        // const $validate = User.validate(validate);

        // // Want to change the status?
        // let $status;
        // if (status) {
        //     $status = status;
        // } else {
        //     $status = 500;
        // }
        // // If error is true(exists), return with an errorMessage.
        // if ($validate.error) throw new TakeError($status, 'User validation, failed! ErrorInfo' + $validate.error);

        // if ($validate.error) return res.status($status).send(JSON.stringify({ errorMessage: 'Bad request: toolid has to be an integer', errorDetail: error.details[0].message }));
        // const { error } = User.validate(newUser);
        // if (error) throw { errorMessage: 'User validation, failed! Index: ' + index + ' ;Error: ' + error}; // Will also send where in the loop the error occured.
    // }
};


module.exports = {
    TakeError,
    useError
}
