const
config = require('config'),
sql = require('mssql'),
Joi = require('joi'),
 _ = require('lodash'),

con = config.get('dbConfig_UCN'),
 
// Error Handlers
 { TakeError } = require('../helpers/helpError');

class Tool {
    constructor(toolObj) {
        this.userId = toolObj.userId;
        this.toolTitle = toolObj.toolTitle;
        this.toolLink = toolObj.toolLink;
        this.toolDescription = toolObj.toolDescription;
        this.toolCategoryId = toolObj.toolCategoryId;
    }

    static validate(toolWannabeeObj) {
        const schema = Joi.object({
            creator: Joi.object({
                userId: Joi
                    .number()
                    .integer()
                    .min(1)
                    .required(),
                userName: Joi
                    .string()
                    .min(1)
                    .max(50)
                    .required(),
            }),
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

        return schema.validate(toolWannabeeObj);
    }

    static validate_favorite (favoriteArray) {
        const schema = Joi.array()
        .length(2) // -- There can only be 2 numbers in the array.
            .items( // -- 2 numbers are required.
                Joi
                .number()
                .integer()
                .min(1)
                .required(),
                Joi
                .number()
                .integer()
                .min(1)
                .required()
            );

            return schema.validate(favoriteArray);
    }

    static validate_tool (newToolObj) {
        const schema = Joi.object({
            userId: Joi
                .number()
                .integer()
                .min(1)
                .required(),
            toolTitle: Joi
                .string()
                .min(1)
                .max(50)
                .required(),
            toolDescription: Joi
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
            toolCategoryId: Joi
                .number()
                .integer()
                .min(1)
                .required()        
        })

        return schema.validate(newToolObj);
    }

    static readAll(toolId) {
        return new Promise((resolve, reject) => {
            (async () => {
                  // › › connect to DB
                // › › create SQL query string (ALL tools / 1 specific tool via toolId)
                // › › if toolid is true, add WHERE userid to query string to only find that user.
                // › › query DB with query string
                // › › restructure DB result into the object structure needed
                // › › validate objects
                // › › close DB connection

                try {
                    const pool = await sql.connect(con);
                    let result;

                    if (toolId) {
                        result = await pool.request()
                            .input('toolId', sql.Int(), toolId)
                            .query(`
                                SELECT t.toolId, t.toolTitle, t.toolDescription, t.toolLink, c.categoryId, c.categoryName
                                FROM toolboxTool t 
                                JOIN toolboxCategory c
                                    ON t.FK_categoryId = c.categoryId
                                WHERE t.toolId = @toolId AND t.toolStatus = 'active'
                            `);
                    } else {
                        result = await pool.request()
                            .query(`
                                SELECT t.toolId, t.toolTitle, t.toolDescription, t.toolLink, c.categoryId, c.categoryName
                                FROM toolboxTool t 
                                JOIN toolboxCategory c
                                    ON t.FK_categoryId = c.categoryId
                                WHERE t.toolStatus = 'active'
                                ORDER BY c.categoryId ASC
                            `);
                    }
                    console.log(result)

                    // Create array with tools(s) where every tool will be validated before being pushed to tools[].
                    const tools = [];
                    result.recordset.forEach((record, index) => {
                        // Index could be used for things like:
                        // -- How many tools were found and give it to the FE...

                        const createTool = {
                            toolId: record.toolId,
                            toolTitle: record.toolTitle,
                            toolDescription: record.toolDescription,
                            toolLink: record.toolLink,
                            category: {
                                categoryId: record.categoryId,
                                categoryName: record.categoryName
                            }
                        }

                        // Validate if newUser are in the right format and right info.
                        const $validate = Tool.validate(createTool);
                        if ($validate.error) throw new TakeError(500, 'Tool validation, failed! ErrorInfo' + $validate.error);

                        tools.push(createTool);
                    });

                    // If tools are empty, then throw error because that means the tools could not be found.
                    if (tools.length == 0) throw new TakeError(400, 'Bad Request: Tools not found!');

                    resolve(tools);
                } catch (err) {
                    reject(err);
                }
                sql.close();
            })();
        });
    }

    static readAll_favorite (userId) {
        return new Promise((resolve, reject) => {
            (async () => {
                // -- connect to DB
                // -- create SQL query string that find the matches to the userId in the toolboxFavorite-tabel.
                    // -- Make sure that all the tools have the status = 'active' (So the tool haven't been soft-deleted)
                // -- query DB with query string
                // -- restructure DB result into the object structure needed
                // -- validate objects
                // -- close DB connection
                try {
                    const pool = await sql.connect(con);

                    const result = await pool.request()
                    .input('userId', sql.Int(), userId)
                    .query(`                 
                        SELECT t.toolId, t.toolTitle, t.toolDescription, t.toolLink, c.categoryId, c.categoryName
                        FROM toolboxUser u
                        JOIN toolboxFavorite f
                            ON f.FK_userId = @userId
                        JOIN toolboxTool t
                            ON f.FK_toolId = t.toolId
                        JOIN toolboxCategory c
                            ON t.FK_categoryId = c.categoryId
                        WHERE u.userId = @userId AND t.toolStatus = 'active'
                    `);
                    console.log(result)

                    // Create array with tools(s) where every tool will be validated before being pushed to tools[].
                    const tools = [];
                    result.recordset.forEach((record, index) => {
                        // Index could be used for things like:
                        // -- How many tools were found and give it to the FE...

                        const createTool = {
                            toolId: record.toolId,
                            toolTitle: record.toolTitle,
                            toolDescription: record.toolDescription,
                            toolLink: record.toolLink,
                            category: {
                                categoryId: record.categoryId,
                                categoryName: record.categoryName
                            }
                        }

                        // Validate if newUser are in the right format and right info.
                        const $validate = Tool.validate(createTool);
                        if ($validate.error) throw new TakeError(500, 'Tool validation, failed! ErrorInfo' + $validate.error);

                        tools.push(createTool);
                    });

                    // If tools are empty, then throw error because that means the tools could not be found.
                    if (tools.length == 0) throw new TakeError(400, 'Bad Request: Tools not found!');

                    resolve(tools);
                } catch (err) {
                    reject(err);
                }
                sql.close();
            })();
        });
    }

    static readById(toolid) {
        return new Promise((resolve, reject) => {
            (async () => {
                // › › connect to DB
                // › › query DB (SELECT Tool JOIN ToolAuthor JOIN Author WHERE toolid)
                // › › restructure DB result into the object structure needed (JOIN --> watch out for duplicates)
                // › › validate objects
                // › › close DB connection

                try {
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('toolid', sql.Int(), toolid)
                        .query(`
                            SELECT b.toolid, b.title, b.year, b.link, a.authorid, a.firstname, a.lastname 
                            FROM liloTool b
                            JOIN liloToolAuthor ba
                                ON b.toolid = ba.FK_toolid
                            JOIN liloAuthor a
                                ON ba.FK_authorid = a.authorid
                            WHERE b.toolid = @toolid
                    `)

                    const tools = [];   // this is NOT validated yet
                    let lastToolIndex = -1;
                    result.recordset.forEach(record => {
                        if (tools[lastToolIndex] && record.toolid == tools[lastToolIndex].toolid) {
                            console.log(`Tool with id ${record.toolid} already exists.`);
                            const newAuthor = {
                                authorid: record.authorid,
                                firstname: record.firstname,
                                lastname: record.lastname
                            }
                            tools[lastToolIndex].authors.push(newAuthor);
                        } else {
                            console.log(`Tool with id ${record.toolid} is a new tool.`)
                            const newTool = {
                                toolid: record.toolid,
                                title: record.title,
                                year: record.year,
                                link: record.link,
                                authors: [
                                    {
                                        authorid: record.authorid,
                                        firstname: record.firstname,
                                        lastname: record.lastname
                                    }
                                ]
                            }
                            tools.push(newTool);
                            lastToolIndex++;
                        }
                    });

                    if (tools.length == 0) throw { statusCode: 404, errorMessage: `Tool not found with provided toolid: ${toolid}` }
                    if (tools.length > 1) throw { statusCode: 500, errorMessage: `Multiple hits of unique data. Corrupt database, toolid: ${toolid}` }

                    const { error } = Tool.validate(tools[0]);
                    if (error) throw { statusCode: 500, errorMessage: `Corrupt Tool informaion in database, toolid: ${toolid}` }

                    resolve(new Tool(tools[0]));

                } catch (error) {
                    reject(error);
                }

                sql.close();
            })();
        });
    }

    create() {
        return new Promise((resolve, reject) => {
            (async () => {
                // connect to DB
                // check if tool already exists in DB (e.g. matching title, link and category)
                // query DB (INSERT Tool, SELECT Tool WHERE SCOPE_IDENTITY(), add Category and send new tool back)
                // check if exactly one result
                // keep toolid safe
                // queryDB* (INSERT ToolAuthor) as many more times needed (with toolid)
                // restructure DB result into the object structure needed (JOIN --> watch out for duplicates)
                // validate objects
                // close DB connection

                try {
                    const pool = await sql.connect(con);

                    // Query (extra) info:
                        // -- Inorder to check if the same tool already exist, we are looking for a tool with the same title, description and link. 
                        // -- SCOPE_IDENTITY() is used to get the id that is given to the new tool, so we can send back that tools info to FE.
                    const result = await pool.request()
                    .input('userId', sql.NVarChar(50), this.userId)
                    .input('toolTitle', sql.NVarChar(50), this.toolTitle)
                    .input('toolDescription', sql.NVarChar(255), this.toolDescription)
                    .input('toolLink', sql.NVarChar(255), this.toolLink)
                    .input('toolCategoryId', sql.Int(), this.toolCategoryId)
                    .query(`
                        IF NOT (
                            EXISTS (
                                SELECT *
                                FROM toolboxTool t
                                WHERE t.toolTitle = @toolTitle AND t.toolDescription = @toolDescription AND t.toolLink = @toolLink 
                            ))
                        BEGIN
                            INSERT INTO toolboxTool 
                                ([toolTitle], [toolDescription], [toolLink], [toolStatus], [FK_userId], [FK_categoryId])
                            VALUES
                                (@toolTitle, @toolDescription, @toolLink, 'active', @userId, @toolCategoryId) ;
                            
                            SELECT SCOPE_IDENTITY() AS toolId, t.toolTitle, t.toolDescription, t.toolLink, c.categoryId, u.userId, u.userName
                            FROM toolboxTool t
                            JOIN toolboxUser u
                                ON u.userId = @userId
                            JOIN toolboxCategory c
                                ON t.FK_categoryId = c.categoryId
                            WHERE t.toolId = SCOPE_IDENTITY() ;
                        END
                    `);
                    console.log(result);
                    
                    // If recordset is empty it means that the table already exists, so throw and error that says that the user already exist.
                    if (result.recordset == undefined) throw new TakeError(409, 'Conflict: The provided user-email or user-name, are already in use!');
                    // If recordset is over 1, that means somehow the server created 2 of the same thing.
                    if (result.recordset.length > 1) throw new TakeError(500, 'Internal Server Error: Something went wrong when creating the new Tool!')
                    
                    const
                    set = result.recordset[0], 
                    useResult = {
                        creator: {
                            userId: set.userId,
                            userName: set.userName
                        },
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
                    { error } = Tool.validate(useResult);
                    if (error) throw new TakeError(500, 'Internal Server Error: Tool informaion in database is corrupted!');

                    resolve(useResult);
                } catch (err) {
                    reject(err);
                }




                try {
                    this.tools.forEach(async (tool) => {
                        const toolCheck = await Tool.readById(tool.toolid);
                    });

                    const pool = await sql.connect(con);
                    const resultCheckTool = await pool.request()
                        .input('toolTitle', sql.NVarChar(50), this.toolTitle)
                        .input('toolDescription', sql.NVarChar(50), this.toolDescription)
                        .input('toolLink', sql.NVarChar(255), this.toolLink)

                        .query(`
                            SELECT *
                            FROM tool t
                            WHERE t.toolTitle = @toolTitle AND @toolDescription = @toolDescription AND t.toolLink = @toolLink
                        `)

                    if (resultCheckTool.recordset.length == 1) throw { statusCode: 409, errorMessage: `Conflict. Tool already exists, toolid: ${resultCheckTool.recordset[0].toolid}` }
                    if (resultCheckTool.recordset.length > 1) throw { statusCode: 500, errorMessage: `Multiple hits of unique data. Corrupt database, toolid: ${resultCheckTool.recordset[0].toolid}` }

                    await pool.connect();
                    const result00 = await pool.request()
                        .input('toolTitle', sql.NVarChar(50), this.toolTitle)
                        .input('toolDescription', sql.NVarChar(50), this.toolDescription)
                        .input('toolLink', sql.NVarChar(255), this.toolLink)
                        .query(`
                               
                        `)

                    if (!result00.recordset[0]) throw { statusCode: 500, errorMessage: `DB server error, INSERT failed.` }
                    const toolid = result00.recordset[0].toolid;

                    this.tools.forEach(async (tool, index) => {
                        if (index > 0) {
                            await pool.connect();
                            const resultTools = await pool.request()
                                .input('toolid', sql.Int(), toolid)
                                .query(`
                                
                                `)
                        }
                    })

                    sql.close();

                    const tool = await Tool.readById(toolid);

                    resolve(tool);

                } catch (error) {
                    reject(error);
                }

                sql.close();

                // try {
                //     this.authors.forEach(async (author) => {
                //         const authorCheck = await Author.readById(author.authorid);
                //     });

                //     const pool = await sql.connect(con);
                //     const resultCheckTool = await pool.request()
                //         .input('title', sql.NVarChar(50), this.title)
                //         .input('year', sql.Int(), this.year)
                //         .query(`
                //             SELECT *
                //             FROM liloTool b
                //             WHERE b.title = @title AND b.year = @year
                //         `)

                //     if (resultCheckTool.recordset.length == 1) throw { statusCode: 409, errorMessage: `Conflict. Tool already exists, toolid: ${resultCheckTool.recordset[0].toolid}` }
                //     if (resultCheckTool.recordset.length > 1) throw { statusCode: 500, errorMessage: `Multiple hits of unique data. Corrupt database, toolid: ${resultCheckTool.recordset[0].toolid}` }

                //     await pool.connect();
                //     const result00 = await pool.request()
                //         .input('title', sql.NVarChar(50), this.title)
                //         .input('year', sql.Int(), this.year)
                //         .input('link', sql.NVarChar(255), this.link)
                //         .input('authorid', sql.Int(), this.authors[0].authorid)
                //         .query(`
                //                 INSERT INTO liloTool (title, year, link)
                //                 VALUES (@title, @year, @link);
                        
                //                 SELECT *
                //                 FROM liloTool
                //                 WHERE toolid = SCOPE_IDENTITY();

                //                 INSERT INTO liloToolAuthor (FK_toolid, FK_authorid)
                //                 VALUES (SCOPE_IDENTITY(), @authorid);
                //         `)

                //     if (!result00.recordset[0]) throw { statusCode: 500, errorMessage: `DB server error, INSERT failed.` }
                //     const toolid = result00.recordset[0].toolid;

                //     this.authors.forEach(async (author, index) => {
                //         if (index > 0) {
                //             await pool.connect();
                //             const resultAuthors = await pool.request()
                //                 .input('toolid', sql.Int(), toolid)
                //                 .input('authorid', sql.Int(), author.authorid)
                //                 .query(`
                //                     INSERT INTO liloToolAuthor (FK_toolid, FK_authorid)
                //                     VALUES (@toolid, @authorid)
                //                 `)
                //         }
                //     })

                //     sql.close();

                //     const tool = await Tool.readById(toolid);

                //     resolve(tool);

                // } catch (error) {
                //     reject(error);
                // }

                // sql.close();

            })();
        });
    }
    
   

    update() {
        return new Promise((resolve, reject) => {
            (async () => {
                // › › check if tool already exists in DB (i.e. Tool.readById(toolid))
                // › › check if authors exist in DB (i.e. Author.readById(authorid))
                // › › connect to DB
                // › › query DB (UPDATE Tool WHERE toolid)
                // › › queryDB (DELETE ToolAuthor WHERE toolid, INSERT ToolAuthor)
                // › › queryDB* (INSERT ToolAuthor) as many more times needed (with toolid)
                // › › query DB query DB (SELECT Tool JOIN ToolAuthor JOIN Author WHERE toolid)
                // › › restructure DB result into the object structure needed (JOIN --> watch out for duplicates)
                // › › validate objects
                // › › close DB connection

                try {
                    const oldTool = await Tool.readById(this.toolid);   // <-- this was (should have been) checked already in the route handler

                    this.authors.forEach(async (author) => {
                        const authorCheck = await Author.readById(author.authorid);
                    });

                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('title', sql.NVarChar(50), this.title)
                        .input('year', sql.Int(), this.year)
                        .input('link', sql.NVarChar(255), this.link)
                        .input('toolid', sql.Int(), this.toolid)
                  //    .input('authorid', sql.Int(), this.authors[0].authorid)
                        .query(`
                            UPDATE Tool
                            SET
                                toolTitle = @toolTitle,
                                toolLink = @toolLink,
                            WHERE toolid = @toolid;
                        `);


                        // .query(`
                        //     UPDATE liloTool
                        //     SET
                        //         title = @title,
                        //         year = @year,
                        //         link = @link
                        //     WHERE toolid = @toolid;

                        //     DELETE liloToolAuthor
                        //     WHERE FK_toolid = @toolid;

                        //     INSERT INTO liloToolAuthor (FK_toolid, FK_authorid)
                        //     VALUES (@toolid, @authorid)
                        // `);

                  //  this.authors.forEach(async (author, index) => {
                    this.tools.forEach(async (tool, index) => {
                        if (index > 0) {
                            await pool.connect();
                            const resultTools = await pool.request()
                                .input('toolid', sql.Int(), this.toolid)
                            //  .input('authorid', sql.Int(), author.authorid)
                                .query(`
                                        
                                    `);
                                // .query(`
                                //         INSERT INTO liloToolAuthor (FK_toolid, FK_authorid)
                                //         VALUES (@toolid, @authorid)
                                //     `);
                        }
                    });

                    sql.close();

                    const tool = await Tool.readById(this.toolid);

                    resolve(tool);

                } catch (error) {
                    reject(error);
                }

                sql.close();

            })();
        });
    }

}

module.exports = Tool;
