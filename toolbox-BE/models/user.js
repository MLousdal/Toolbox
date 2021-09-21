const 
sql = require('mssql'),
config = require('config'),
Joi = require('joi'),
bcrypt = require('bcryptjs'),
_ = require('lodash'),

con = config.get('dbConfig_UCN'),
salt = parseInt(config.get('saltRounds')),

// Error Handlers
// REMEMBER: CAN'T require a model that uses User.validate before the User-class have been exported. Meaning you can't use it in this case.
{ TakeError } = require('../helpers/helpError');

class User {
    // userObj: {userId, userName, userEmail, userPassword, userStatus}
    constructor(userObj) {
        // this.userId = userObj.userId;
        this.userName = userObj.userName;
        this.userEmail = userObj.userEmail;
        this.userPassword = userObj.userPassword;
        // this.userStatus = userObj.userStatus;
        // this.roleId = userObj.roleId;
        // this.roleName = userObj.roleName

        // *********************************************************************************************************************
        // Can't easily create a nested object with a class. And not sure if we need anything else than the name,email,password?
        // The constructor will only be used when creating a new user?? Right?
    }

    static validate_login (loginObj) {
        const schema = Joi.object({
            userEmail: Joi
                .string()
                .email()
                .min(1)
                .max(255)
                .required(),
            userPassword: Joi
            .string()
            .min(1)
            .max(255)
            .required()
        })

        return schema.validate(loginObj);
    }

    // static validate(userObj)
    static validate(userObj) {
        const schema = Joi.object({
            userId: Joi.number()
                .integer()
                .required(),
            userName: Joi.string()
                .alphanum()
                .min(1)
                .max(50)
                .required(),
            userEmail: Joi.string()
                .email()
                .min(1)
                .max(255)
                .required(),
            userStatus: Joi.string()
                .min(1)
                .max(50),
            userRole: Joi.object({
                roleId: Joi.number()
                    .integer()
                    .required(),
                roleName: Joi.string()
                    .alphanum()
                    .min(1)
                    .max(50)
            })
        });

        return schema.validate(userObj);
    }

    static validateResponse(userResponse) {
        const schema = Joi.object({
            userId: Joi.number()
                .integer(),
            userName: Joi.string()
                .alphanum()
                .min(1)
                .max(50)
                .required(),
            userPassword: Joi.string()
                .min(1)
                .max(255),
            userEmail: Joi.string()
                .email()
                .min(1)
                .max(255)
                .required(),
            userStatus: Joi.string()
                .min(1)
                .max(50),
            userRole: Joi.object({
                roleId: Joi.number()
                    .integer(),
                roleName: Joi.string()
                    .alphanum()
                    .min(1)
                    .max(50)
            })
        });

        return schema.validate(userResponse);
    }

    static checkCredentials(userObj) {
        return new Promise((resolve, reject) => {
            (async () => {
                // connect to DB
                // make a query (using the pool object)
                // check if there was a result
                // !!! -> check the hashed password with bcrypt!
                // if yes -> check format
                //  if format OK -> resolve
                // if no in any case, then throw and error and reject with error
                // CLOSE THE DB CONNECTION !!!!!!!!!!!!!!!!!!!!!!!!!!!!! !!!

                try {
                    const 
                    pool = await sql.connect(con),
                    result = await pool.request()
                        .input('userEmail', sql.Int(), userObj.userEmail)
                        // Query Objectives:
                            // -- We are looking for a user with all the information needed:
                            // -- First JOIN is to get the passwordValue that matches the userid (via the user found through the email).
                                // -- The password is used to check via bcrypt on BE with the one recieved from the FE.
                            // -- Second JOIN is to get the Role that matches the user.
                            // -- And it all have to match with the userEmail.
                        .query(`
                            SELECT u.userId, u.userName, r.roleId, r.roleName, p.passwordValue
                            FROM toolboxUser u
                            JOIN toolboxPassword p
                                ON u.userId = p.FK_userId
                            JOIN toolboxRole r
                                ON u.FK_roleId = r.roleId
                            WHERE u.userEmail = @userEmail
                        `);
                    console.log(result);

                    // (No match) if there is no recordset[0], then throw.
                    if (!result.recordset[0]) throw new TakeError(404, 'Not Found: User not found with provided credentials!');
                    // (Multiple matches) if there are more than 1 result = there are 2 or more users with the same information then throw.
                    if (result.recordset.length > 1) throw new TakeError(500, 'Internal Server Error: Multiple hits of unique data. Corrupt database: Multiple of same user.');

                    // ------------------
                    // ----- BCRYPT -----
                    // ------------------
                        // // Check if the the given token-password is correct.
                        const bcrypt_result = await bcrypt.compare(userObj.userPassword, result.recordset[0].passwordValue);
                        // // If there was no match, throw an error.
                        if (!bcrypt_result) throw new TakeError(404, 'Not Found: User with the provided credentials could not be found!');

                    // Create the object we are going to send back to the FE.
                    const 
                    set = result.recordset[0],
                    userResponse = {
                        userId: set.userId,
                        userName: set.userName,
                        userEmail: set.userEmail,
                        userStatus: set.userStatus,
                        userRole: {
                            roleId: set.roleId,
                            roleName: set.roleName
                        }
                    },
                    // Before sending the object, we should look and see if has been formatted correctly.
                    { error } = User.validateResponse(userResponse);
                    if (error) throw new TakeError(500, 'Internal Server Error: Corrupt user account informaion in database!');

                    resolve(userResponse);
                } catch (error) {
                    reject(error);
                }
                sql.close();
            })();
        });
    }

    // create() to send the data to the db

    create() { 
        return new Promise((resolve, reject) => {
            (async () => {
                // Check if the new user already exist in the DB:
                try {
                    // Before checking / creating the user we have to hash the password.
                    const hashedPassword = await bcrypt.hash(this.userPassword, salt)

                    const pool = await sql.connect(con);

                    // Query (extra) info:
                        // -- FK_roleId is set to 2 (The id role: member) as a standard. It can be changed later by an admin, same with status = active.
                        // -- SCOPE_IDENTITY() is used to get the id that is given to the new user, so we can send back that users info.
                        // -- We DON'T want to send back the password with this query.
                    const result = await pool.request()
                    .input('hashedPassword', sql.NVarChar(255), hashedPassword)
                    .input('userName', sql.NVarChar(50), this.userName)
                    .input('userEmail', sql.NVarChar(255), this.userEmail)
                    .query(`
                        IF NOT (
                            EXISTS (
                                SELECT *
                                FROM toolboxUser u
                                WHERE u.userEmail = @userEmail OR u.userName = @username
                            ))
                        BEGIN
                            INSERT INTO toolboxUser
                                ([userName], [userEmail], [userStatus], [FK_roleId])
                            VALUES
                                (@userName, @userEmail, 'active', 2) ;
                            
                            SELECT u.userId, u.userName, u.userEmail, r.roleId, r.roleName
                            FROM toolboxUser u
                            JOIN toolboxRole r
                                ON u.FK_roleid = r.roleid
                            WHERE u.userId = SCOPE_IDENTITY() ;

                            INSERT INTO toolboxPassword
                                ([passwordValue], [FK_userId])
                            VALUES
                                (@hashedPassword, SCOPE_IDENTITY()) ;
                        END
                    `);
                    console.log(result)
                    
                    // If recordset is empty it means that the table already exists, so throw and error that says that the user already exist.
                    if (result.recordset == undefined) throw new TakeError(409, 'Conflict: The provided user-email or user-name, are already in use!');
                    
                    const
                    set = result.recordset[0], 
                    useResult = {
                        userId: set.userId,
                        userName: set.userName,
                        userEmail: set.userEmail,
                        userRole: {
                            roleId: set.roleId,
                            roleName: set.roleName
                        }
                    },
                    // Is the data we got back from the DB formatted correctly?
                    { error } = User.validateResponse(useResult);
                    if (error) throw new TakeError(500, 'Internal Server Error: User account informaion in database is corrupted!');

                    resolve(useResult);
                } catch (err) {
                    reject(err);
                }



                // try {
                //     const account = await User.readByEmail(this);    // checking if <this> account is already in the DB (by userEmail)
                //     // if yes (aka no errors), then we have to abort creating it again --> REJECT with error: user exist
                //     reject({ statusCode: 409, errorMessage: 'Conflict: user email is already in use.' })
                // } catch (error) {
                //     // if there were any errors, need to check if it was 404 not found (check readByEmail above)
                //     // basically we will reject on anything other than 404 (with the error)
                //     // and do nothing if 404 --> we are good, the user's email is not in the DB yet, can carry on with creating a new account
                //     console.log(error);
                //     if (!error.statusCode) reject(error);
                //     if (error.statusCode != 404) reject(error);

                //     // if we made it so far, now we can try-catch what we came here for: create()
                //     // yes, WITHIN the catch block!


                //     // connect to DB
                //     // make a query (INSERT INTO loginUser, SELECT with SCOPE_IDENTITY(), INSERT INTO loginPassword)
                //     // if good, we have the userId in the result
                //     // check format (again, we dont have a validator for that at the moment)
                //     // resolve with user
                //     // if anything wrong throw error and reject with error
                //     // CLOSE THE DB CONNECTION
                //     try {
                //         // let's generate the hashedPassword
                //         const hashedPassword = await bcrypt.hash(this.userPassword, salt);

                //         const pool = await sql.connect(con);
                //         const result00 = await pool.request()
                //             .input('userName', sql.NVarChar(50), this.userName)
                //             .input('userEmail', sql.NVarChar(255), this.userEmail)
                //             .input('hashedPassword', sql.NVarChar(255), hashedPassword)
                //             .query(`
                //         INSERT INTO toolboxUser([userName], [userEmail], [FK_roleId])
                //         VALUES (@userName, @userEmail, 2);

                //         SELECT u.userId, u.userName, r.roleId, r.roleName
                //         FROM toolboxUser u
                //         JOIN toolboxRole r
                //             ON u.FK_roleId = r.roleId
                //         WHERE u.userId = SCOPE_IDENTITY();

                //         INSERT INTO toolboxPassword([passwordValue], [FK_userId])
                //         VALUES (@hashedPassword, SCOPE_IDENTITY());
                //     `);
                //         console.log(result00);
                //         if (!result00.recordset[0]) throw { statusCode: 500, errorMessage: 'Something went wrong, login is not created.' }

                //         // previously user
                //         const accountResponse = {
                //             userId: result00.recordset[0].userId,
                //             userName: result00.recordset[0].userName,
                //             userRole: {
                //                 roleId: result00.recordset[0].roleId,
                //                 roleName: result00.recordset[0].roleName
                //             }
                //         }
                //         // check if the format is correct!
                //         // will need a proper validate method for that

                //         // *** static validateResponse(accountResponse)
                //         const { error } = Account.validateResponse(accountResponse);
                //         console.log(error);
                //         if (error) throw { statusCode: 500, errorMessage: 'Corrupt user account informaion in database.' }

                //         // previously resolve(user)
                //         resolve(accountResponse);

                //     } catch (error) {
                //         console.log(error);
                //         reject(error);
                //     }
                // }

                sql.close();
            })();
        });
    }

    static test1() {
        // return new Promise ((resolve,reject) => {
        //     (async () => {
        //         // Test area!

        //         try {
                    


        //         } catch (err) {
        //             reject(err);
        //         }

        //         sql.close();
        //     })();
        // })
    }

    static readAll(userid) {
        return new Promise((resolve, reject) => {
            (async () => {
                // › › connect to DB
                // › › create SQL query string (SELECT *u.userName, u.userEmail, u.userStatus FROM toolboxUser)
                // › › if userid is true, add WHERE userid to query string to only find that user.
                // › › query DB with query string
                // › › restructure DB result into the object structure needed (JOIN --> watch out for duplicates)
                // › › validate objects
                // › › close DB connection

                try {
                    const pool = await sql.connect(con);
                    let result;

                    if (userid) {
                        result = await pool.request()
                            .input('userId', sql.Int(), userid)
                            .query(`
                                SELECT u.userId, u.userName, u.userEmail, u.userStatus, r.roleId, r.roleName
                                FROM toolboxUser u 
                                JOIN toolboxRole r
                                    ON u.FK_roleId = r.roleId
                                WHERE u.userId = @userId
                            `);
                    } else {
                        result = await pool.request()
                            .query(`
                                SELECT u.userId, u.userName, u.userEmail, u.userStatus, r.roleId, r.roleName
                                FROM toolboxUser u
                                JOIN toolboxRole r
                                    ON u.FK_roleId = r.roleId
                                ORDER BY u.userStatus ASC
                            `);
                    }

                    // Create array with user(s) where every user will be validated before being pushed to users[].
                    const users = [];
                    result.recordset.forEach((record, index) => {
                        // Index could be used for things like:
                        // -- How many users were found and give it to the FE...

                        const createUser = {
                            userId: record.userId,
                            userName: record.userName,
                            userEmail: record.userEmail,
                            userStatus: record.userStatus,
                            userRole: {
                                roleId: record.roleId,
                                roleName: record.roleName
                            }   
                        }

                        // Validate if newUser are in the right format and right info.
                        const $validate = User.validate(createUser);
                        if ($validate.error) throw new TakeError(500, 'User validation, failed! ErrorInfo' + $validate.error);

                        users.push(createUser);
                    });

                    // If users are empty, then throw error because that means the user could not be found.
                    if (users.length == 0) throw new TakeError(400, 'Bad Request: User not found!');

                    resolve(users);
                } catch (error) {
                    reject(error);
                }
                sql.close();
            })();
        });
    }
}


module.exports = User;