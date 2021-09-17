const User = require('./models/user');


class errorHandeling {
    constructor(handleObj) {

    }
    static userVal(validate,status) {
        // $ is used for easier naming.
        const $validate = User.validate(validate);

        // Want to change the status?
        let $status;
        if (status) {
            $status = status;
        } else {
            $status = 400;
        }
        // If error is true(exists), return with an errorMessage.
        if ($validate.error) return res.status($status).send(JSON.stringify({ errorMessage: 'Bad request: toolid has to be an integer', errorDetail: error.details[0].message }));
    }

}


module.exports = errorHandeling;