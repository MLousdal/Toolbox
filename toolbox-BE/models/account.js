const sql = require('mssql');
const config = require('config');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

const con = config.get('dbConfig_UCN');
const salt = parseInt(config.get('saltRounds'));

class Account {
    // accountObj: {userEmail, userPassword, userName}
    constructor(accountObj) {
        this.userEmail = accountObj.userEmail;
        this.userPassword = accountObj.userPassword;
        this.userName = accountObj.userName;
    }

    // static validate(accountObj)
    static validate(accountObj) {
        const schema = Joi.object({
            userEmail: Joi.string()
                .required()
                .email(),
            userPassword: Joi.string()
                .min(1)
                .max(255)
                .required(),
            userName: Joi.string()
                .alphanum()
                .min(1)
                .max(50)
        });

        return schema.validate(accountObj);
    }

    static validateResponse(accountResponse) {
        const schema = Joi.object({
            userId: Joi.number()
                .integer()
                .required(),
            userName: Joi.string()
                .alphanum()
                .min(1)
                .max(50)
                .required(),
            userRole: Joi.object({
                roleId: Joi.number()
                    .integer()
                    .required(),
                roleName: Joi.string()
                    .alphanum()
                    .min(1)
                    .max(50)
                    .required()
            }).required()
        });

        return schema.validate(accountResponse);
    }

    static checkCredentials(accountObj) {
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
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('userEmail', sql.NVarChar(255), accountObj.userEmail)
                        .query(`
                            SELECT u.userId, u.userName, r.roleId, r.roleName, p.passwordValue
                            FROM liloUser u
                            JOIN liloPassword p
                                ON u.userId = p.FK_userId
                            JOIN liloRole r
                                ON u.FK_roleId = r.roleId
                            WHERE u.userEmail = @userEmail
                        `);
                    console.log(result);

                    if (!result.recordset[0]) throw { statusCode: 404, errorMessage: 'User not found with provided credentials.' }
                    if (result.recordset.length > 1) throw { statusCode: 500, errorMessage: 'Multiple hits of unique data. Corrupt database.' }

                    const bcrypt_result = await bcrypt.compare(accountObj.userPassword, result.recordset[0].passwordValue);
                    if (!bcrypt_result) throw { statusCode: 404, errorMessage: 'User not found with provided credentials.' }

                    const accountResponse = {
                        userId: result.recordset[0].userId,
                        userName: result.recordset[0].userName,
                        userRole: {
                            roleId: result.recordset[0].roleId,
                            roleName: result.recordset[0].roleName
                        }
                    }
                    // check if the format is correct!
                    // will need a proper validate method for that

                    // *** static validateResponse(accountResponse)
                    const { error } = Account.validateResponse(accountResponse);
                    if (error) throw { statusCode: 500, errorMessage: 'Corrupt user account informaion in database.' }

                    resolve(accountResponse);

                } catch (error) {
                    console.log(error);
                    reject(error);
                }

                sql.close();
            })();
        });
    }

    // *** NEW static method readByEmail(accountObj)
    static readByEmail(accountObj) {
        return new Promise((resolve, reject) => {
            (async () => {
                // connect to DB
                // query the DB (SELECT WHERE userEmail)
                // check if there is ONE result --> good
                //      else throw error
                // check format (validateResponse)
                // resolve with accountResponse
                // if any errors reject with error
                // CLOSE THE DB CONNECTION

                try {
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('userEmail', sql.NVarChar(255), accountObj.userEmail)
                        .query(`
                            SELECT u.userId, u.userName, r.roleId, r.roleName
                            FROM liloUser u
                            JOIN liloRole r
                                ON u.FK_roleId = r.roleId
                            WHERE u.userEmail = @userEmail 
                        `);
                    console.log(result);

                    // error contains statusCode: 404 if not found! --> important in create(), see below
                    if (!result.recordset[0]) throw { statusCode: 404, errorMessage: 'User not found with provided credentials.' }
                    if (result.recordset.length > 1) throw { statusCode: 500, errorMessage: 'Multiple hits of unique data. Corrupt database.' }

                    const accountResponse = {
                        userId: result.recordset[0].userId,
                        userName: result.recordset[0].userName,
                        userRole: {
                            roleId: result.recordset[0].roleId,
                            roleName: result.recordset[0].roleName
                        }
                    }

                    const { error } = Account.validateResponse(accountResponse);
                    if (error) throw { statusCode: 500, errorMessage: 'Corrupt user account informaion in database.' }

                    resolve(accountResponse);

                } catch (error) {
                    console.log(error);
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
                // but first! --> check if user exists already in the system!
                // *** code to check if user already exists in DB (based on userEmail)
                try {
                    const account = await Account.readByEmail(this);    // checking if <this> account is already in the DB (by userEmail)
                    // if yes (aka no errors), then we have to abort creating it again --> REJECT with error: user exist
                    reject({ statusCode: 409, errorMessage: 'Conflict: user email is already in use.' })
                } catch (error) {
                    // if there were any errors, need to check if it was 404 not found (check readByEmail above)
                    // basically we will reject on anything other than 404 (with the error)
                    // and do nothing if 404 --> we are good, the user's email is not in the DB yet, can carry on with creating a new account
                    console.log(error);
                    if (!error.statusCode) reject(error);
                    if (error.statusCode != 404) reject(error);

                    // if we made it so far, now we can try-catch what we came here for: create()
                    // yes, WITHIN the catch block!


                    // connect to DB
                    // make a query (INSERT INTO loginUser, SELECT with SCOPE_IDENTITY(), INSERT INTO loginPassword)
                    // if good, we have the userId in the result
                    // check format (again, we dont have a validator for that at the moment)
                    // resolve with user
                    // if anything wrong throw error and reject with error
                    // CLOSE THE DB CONNECTION
                    try {
                        // let's generate the hashedPassword
                        const hashedPassword = await bcrypt.hash(this.userPassword, salt);

                        const pool = await sql.connect(con);
                        const result00 = await pool.request()
                            .input('userName', sql.NVarChar(50), this.userName)
                            .input('userEmail', sql.NVarChar(255), this.userEmail)
                            .input('hashedPassword', sql.NVarChar(255), hashedPassword)
                            .query(`
                        INSERT INTO liloUser([userName], [userEmail], [FK_roleId])
                        VALUES (@userName, @userEmail, 2);

                        SELECT u.userId, u.userName, r.roleId, r.roleName
                        FROM liloUser u
                        JOIN liloRole r
                            ON u.FK_roleId = r.roleId
                        WHERE u.userId = SCOPE_IDENTITY();

                        INSERT INTO liloPassword([passwordValue], [FK_userId])
                        VALUES (@hashedPassword, SCOPE_IDENTITY());
                    `);
                        console.log(result00);
                        if (!result00.recordset[0]) throw { statusCode: 500, errorMessage: 'Something went wrong, login is not created.' }

                        // previously user
                        const accountResponse = {
                            userId: result00.recordset[0].userId,
                            userName: result00.recordset[0].userName,
                            userRole: {
                                roleId: result00.recordset[0].roleId,
                                roleName: result00.recordset[0].roleName
                            }
                        }
                        // check if the format is correct!
                        // will need a proper validate method for that

                        // *** static validateResponse(accountResponse)
                        const { error } = Account.validateResponse(accountResponse);
                        console.log(error);
                        if (error) throw { statusCode: 500, errorMessage: 'Corrupt user account informaion in database.' }

                        // previously resolve(user)
                        resolve(accountResponse);

                    } catch (error) {
                        console.log(error);
                        reject(error);
                    }
                }

                sql.close();
            })();
        });
    }
}

// previously module.exports = Login;
module.exports = Account;