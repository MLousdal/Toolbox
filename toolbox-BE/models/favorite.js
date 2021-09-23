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

    static validate (favoriteArray) {
        const schema = Joi.object({
            toolId: Joi
                .number()
                .integer()
                .min(1)
                .required(),
            userId: Joi
                .number()
                .integer()
                .min(1)
                .required()
        })

        return schema.validate(favoriteArray);
    }

    static validate_result (favoriteArray) {
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

        return schema.validate(favoriteArray);
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
                            INSERT INTO toolboxFavorite
                                ([FK_userId], [FK_toolId])
                            VALUES
                                (@toolId, @userId) ;
        
                            SELECT t.toolId, t.toolTitle, t.toolDescription, t.toolLink, c.categoryId, c.categoryName
                            FROM toolboxTool t
                            JOIN toolboxCategory c
                                ON t.FK_categoryId = c.categoryId
                            WHERE t.toolId = @toolId ;
                        `);
                    console.log(result);
        
                    // If recordset is empty it means that the table already exists, so throw and error that says that the user already exist.
                    if (result.recordset == undefined) throw new TakeError(409, 'Conflict: The provided user-email or user-name, are already in use!');
                    // If recordset is over 1, that means somehow the server created 2 of the same thing.
                    if (result.recordset.length > 1) throw new TakeError(500, 'Internal Server Error: Something went wrong when creating the new Tool!');
        
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
 }

 module.exports = Favorite;