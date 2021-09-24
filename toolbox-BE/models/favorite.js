const { reject } = require('lodash');

const
config = require('config'),
sql = require('mssql'),
Joi = require('joi'),
 _ = require('lodash'),

con = config.get('dbConfig_UCN'),
 
// Error Handlers
 { TakeError } = require('../helpers/helpError');


 class Favorite {
     constructor (favObj) {
         this.toolId = favObj.toolId;
         this.userId = favObj.userId;
     }

    static validate (favoriteObject) {
        const schema = Joi.object({
            userId: Joi
                .number()
                .integer()
                .min(1)
                .required(),
            toolId: Joi
                .number()
                .integer()
                .min(1)
                .required()
        })

        return schema.validate(favoriteObject);
    }

    static validate_result (favoriteObj) {
        const schema = Joi.object({
            toolId: Joi
                    .number()
                    .integer()
                    .min(1)
                    .required(),
                toolTitle: Joi
                    .string()
                    .min(1)
                    .max(255)
                    .required(),
                toolLink: Joi
                    .string()
                    .uri()
                    .min(1)
                    .max(255)
                    .required(),
                toolDescription: Joi
                    .string()
                    .min(1)
                    .max(255)
                    .required(),
                category: Joi.object({
                    categoryId: Joi
                        .number()
                        .integer()
                        .min(1)
                        .required(),
                    categoryName: Joi
                        .string()
                        .max(50)
                })
        });

        return schema.validate(favoriteObj);
    }
    
    create_favorite () {
        return new Promise((resolve, reject)=> {
            (async ()=> {

                // To Do:
                // Connect to the DB
                // Query: INSERT toolId and userId, into toolboxFavorite. Then SELECT the tool that was add'ed.
                // Take the result and create an object, 
                // -- and then valdidate the object.
                // If everything is alright, return result.
                // If not send the right error message to the route.next().
                // Close the connection to the DB
        
                try {
                    const
                    pool = await sql.connect(con),
                    result = await pool.request()
                        .input('toolId', sql.Int(), this.toolId)
                        .input('userId', sql.Int(), this.userId)
                        .query(`
                            IF NOT (
                                EXISTS (
                                    SELECT * 
                                    FROM toolboxFavorite f
                                    WHERE f.FK_userId = @userId AND f.FK_toolId = @toolId
                                )
                            )
                            BEGIN
                                INSERT INTO toolboxFavorite
                                    ([FK_userId], [FK_toolId])
                                VALUES
                                    (@userId, @toolId) ;
            
                                SELECT t.toolId, t.toolTitle, t.toolDescription, t.toolLink, c.categoryId, c.categoryName
                                FROM toolboxTool t
                                JOIN toolboxCategory c
                                    ON t.FK_categoryId = c.categoryId
                                WHERE t.toolId = @toolId ;
                            END
                        `);
                    console.log(result.recordset);
        
                    // If recordset is empty it means that the table already exists, so throw and error that says that the user already exist.
                    if (result.recordset == undefined) throw new TakeError(409, 'Conflict: The provided favorite Data-combination, are already in use!');
                    // If recordset is over 1, that means somehow the server created 2 of the same thing.
                    if (result.recordset.length > 1) throw new TakeError(500, 'Internal Server Error: Something went wrong when creating the new Favorite!');
        
                    const
                    set = result.recordset[0], 
                    useResult = {
                        toolId: set.toolId,
                        toolTitle: set.toolTitle,
                        toolLink: set.toolLink,
                        toolDescription: set.toolDescription,
                        category: {
                            categoryId: set.categoryId,
                            categoryName: set.categoryName
                        }
                    },
                    // Is the data we got back from the DB formatted correctly?
                    { error } = Favorite.validate_result(useResult);
                    if (error) throw new TakeError(500, 'Internal Server Error: Tool informaion in database is corrupted!');
        
                    resolve(useResult);
                } catch (err) {
                    reject(err);
                }
                sql.close();
            })();
        })
    }

    static delete (faveObj) {
        return new Promise ((resolve,reject) => {
            (async () => {
                try {
                    const 
                    pool = await sql.connect(con),
                    // In query we have to find the row where both userId and toolId are present. After that SELECT tool = @toolid, so send what tool have been removed from toolboxFavorite.
                    result = await pool.request()
                    .input('userId', sql.Int(), faveObj.userId)
                    .input('toolId', sql.Int(), faveObj.toolId)
                    .query(`
                        IF (
                            EXISTS (
                                SELECT *
                                FROM toolboxFavorite f
                                WHERE f.FK_userId = @userId AND f.FK_toolId = @toolId
                            )
                        )
                        BEGIN
                            DELETE toolboxFavorite
                            WHERE FK_userId = @userId AND FK_toolId = @toolId ;
        
                            SELECT t.toolId, t.toolTitle, t.toolDescription, t.toolLink, c.categoryId, c.categoryName
                            FROM toolboxTool t
                            JOIN toolboxCategory c
                                ON t.FK_categoryId = c.categoryId
                            WHERE t.toolId = @toolId ;
                        END
                    `);

                    // If recordset is empty it means that the table already exists, so throw and error that says that the user already exist.
                    if (result.recordset == undefined) throw new TakeError(409, 'Conflict: The provided favorite Data-combination, can not be found!');
                    // If recordset is over 1, that means somehow the server created 2 of the same thing.
                    if (result.recordset.length > 1) throw new TakeError(500, 'Internal Server Error: Something went wrong when deleting selected Favorite!');

                    const
                    set = result.recordset[0], 
                    useResult = {
                        toolId: set.toolId,
                        toolTitle: set.toolTitle,
                        toolLink: set.toolLink,
                        toolDescription: set.toolDescription,
                        category: {
                            categoryId: set.categoryId,
                            categoryName: set.categoryName
                        }
                    },
                    // Is the data we got back from the DB formatted correctly?
                    { error } = Favorite.validate_result(useResult);
                    if (error) throw new TakeError(500, 'Internal Server Error: Tool informaion in database is corrupted!');

                    resolve(useResult);
                } catch (err) {
                    reject(err);
                }
            })();
        })
    }
 }

 module.exports = Favorite;