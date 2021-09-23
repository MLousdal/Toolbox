const
config = require('config'),
sql = require('mssql'),
Joi = require('joi'),
 _ = require('lodash'),

con = config.get('dbConfig_UCN'),
 
// Error Handlers
 { TakeError } = require('../helpers/helpError');


 class Favorite {
     constructor (favArray) {
         this.toolId = favArray[0];
         this.userId = favArray[1];
     }

    create () {
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
            result = pool.request()
                .query(`
                    
                `);


        } catch (err) {

        }
        sql.close();
    }
 }