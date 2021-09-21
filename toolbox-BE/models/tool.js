const config = require('config');

const sql = require('mssql');
const con = config.get('dbConfig_UCN');

const Joi = require('joi');

const _ = require('lodash');

class Tool {
    constructor(toolObj) {
        this.toolId = toolObj.toolId;
        this.toolTitle = toolObj.toolTitle;
        this.toolLink = toolObj.toolLink;
        this.toolDescription = toolObj.toolDescription;
        this.categoryId = toolObj.categoryId;
        this.categoryName = toolObj.categoryName;
        
        if (toolObj.authors) this.authors = _.cloneDeep(toolObj.authors);
    }

    copy(toolObj) {
        // if (toolObj.toolid) this.toolid = toolObj.toolid;
        if (toolObj.title) this.title = toolObj.title;
        if (toolObj.year) this.year = toolObj.year;
        if (toolObj.link) this.link = toolObj.link;
        if (toolObj.authors) this.authors = _.cloneDeep(toolObj.authors);
    }

    static validate(toolWannabeeObj) {
        const schema = Joi.object({
            toolId: Joi.number()
                .integer()
                .min(1),
            toolTitle: Joi.string()
                .min(1)
                .max(255),
            toolLink: Joi.string()
                .uri()
                .max(255)
                .allow(null),   // <-- need to allow null values for links
            toolDescription: Joi.string()
                .max(255)
                .allow(null),
            category: Joi.object({
                categoryId: Joi.number()
                    .integer()
                    .min(1)
                    .required(),
                categoryName: Joi.string()
                    .max(50)})
        });

        return schema.validate(toolWannabeeObj);
    }

    static readAll(userid) {
        return new Promise((resolve, reject) => {
            (async () => {
                // › › connect to DB
                // › › create SQL query string (SELECT Tool JOIN ToolAuthor JOIN Author)
                // › › if authorid, add WHERE authorid to query string
                // › › query DB with query string
                // › › restructure DB result into the object structure needed (JOIN --> watch out for duplicates)
                // › › validate objects
                // › › close DB connection

                // DISCLAIMER: need to look up how to SELECT with the results of another SELECT
                //      right now only the author with the authorid is listed on the tool in the response

                try {
                    const pool = await sql.connect(con);
                    let result;

                    if (userid) {
                        result = await pool.request()
                            .input('userid', sql.Int(), userid)
                            .query(`
                            SELECT * FROM toolboxTool t
                            JOIN toolboxCategory c
                                ON t.FK_categoryId = c.categoryId
                            WHERE t.FK_userid = @userid
                            `);
                    } else {
                        result = await pool.request()
                            .query(`
                        SELECT * FROM toolboxTool t
                        JOIN toolboxCategory c
                            ON t.FK_categoryId = c.categoryId
                        `);
                    }

                    const tools = [];   // this is NOT validated yet
                    let lastToolIndex = -1;

                    result.recordset.forEach(record => {
                        const newTool = {
                            toolId: record.toolId,
                            toolTitle: record.toolTitle,
                            toolLink: record.toolLink,
                            toolDescription: record.toolDescription,
                            category:
                            {
                                categoryId: record.categoryId,
                                categoryName: record.categoryName
                            }
                        }

                        tools.push(newTool);
                    });

                    const validtools = [];
                    tools.forEach(tool => {
                        const { error } = Tool.validate(tool);
                        if (error) throw { errorMessage: `Tool.validate failed.` };

                        // validtools.push(new Tool(newTool));
                        validtools.push(tool);
                    });

                    resolve(validtools);
                    // resolve(tools);

                } catch (error) {
                    reject(error);
                    console.log(error)
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
                // › › check if authors exist in DB (i.e. Author.readById(authorid))
                // › › connect to DB
                // › › check if tool already exists in DB (e.g. matching title and year)
                // › › query DB (INSERT Tool, SELECT Tool WHERE SCOPE_IDENTITY(), INSERT ToolAuthor)
                // › › check if exactly one result
                // › › keep toolid safe
                // › › queryDB* (INSERT ToolAuthor) as many more times needed (with toolid)
                // › › ((query DB query DB (SELECT Tool JOIN ToolAuthor JOIN Author WHERE toolid))) ==>
                // › ›      close the DB because we are calling 
                // › ›             Tool.readById(toolid)
                // › › // restructure DB result into the object structure needed (JOIN --> watch out for duplicates)
                // › › // validate objects
                // › › close DB connection

                try {
                    this.authors.forEach(async (author) => {
                        const authorCheck = await Author.readById(author.authorid);
                    });

                    const pool = await sql.connect(con);
                    const resultCheckTool = await pool.request()
                        .input('title', sql.NVarChar(50), this.title)
                        .input('year', sql.Int(), this.year)
                        .query(`
                            SELECT *
                            FROM liloTool b
                            WHERE b.title = @title AND b.year = @year
                        `)

                    if (resultCheckTool.recordset.length == 1) throw { statusCode: 409, errorMessage: `Conflict. Tool already exists, toolid: ${resultCheckTool.recordset[0].toolid}` }
                    if (resultCheckTool.recordset.length > 1) throw { statusCode: 500, errorMessage: `Multiple hits of unique data. Corrupt database, toolid: ${resultCheckTool.recordset[0].toolid}` }

                    await pool.connect();
                    const result00 = await pool.request()
                        .input('title', sql.NVarChar(50), this.title)
                        .input('year', sql.Int(), this.year)
                        .input('link', sql.NVarChar(255), this.link)
                        .input('authorid', sql.Int(), this.authors[0].authorid)
                        .query(`
                                INSERT INTO liloTool (title, year, link)
                                VALUES (@title, @year, @link);
                        
                                SELECT *
                                FROM liloTool
                                WHERE toolid = SCOPE_IDENTITY();

                                INSERT INTO liloToolAuthor (FK_toolid, FK_authorid)
                                VALUES (SCOPE_IDENTITY(), @authorid);
                        `)

                    if (!result00.recordset[0]) throw { statusCode: 500, errorMessage: `DB server error, INSERT failed.` }
                    const toolid = result00.recordset[0].toolid;

                    this.authors.forEach(async (author, index) => {
                        if (index > 0) {
                            await pool.connect();
                            const resultAuthors = await pool.request()
                                .input('toolid', sql.Int(), toolid)
                                .input('authorid', sql.Int(), author.authorid)
                                .query(`
                                    INSERT INTO liloToolAuthor (FK_toolid, FK_authorid)
                                    VALUES (@toolid, @authorid)
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

            })();
        });
    }

    // static delete(toolid) {
    //     return new Promise((resolve, reject) => {
    //         (async () => {
    //             // › › connect to DB
    //             // › › query DB (SELECT Tool JOIN ToolAuthor JOIN Author WHERE toolid) <-- moving this before the DB connection, calling readById instead
    //             // › › query DB (DELETE ToolAuthor WHERE toolid, DELETE Tool WHERE toolid)
    //             // › › restructure DB result into the object structure needed (JOIN --> watch out for duplicates)
    //             // › › validate objects
    //             // › › close DB connection

    //             try {
    //                 const tool = await Tool.readById(toolid);

    //                 const pool = await sql.connect(con);
    //                 const result = await pool.request()
    //                     .input('toolid', sql.Int(), toolid)
    //                     .query(`
    //                     DELETE liloToolAuthor
    //                     WHERE FK_toolid = @toolid;

    //                     DELETE liloLoan
    //                     WHERE FK_toolid = @toolid;

    //                     DELETE liloTool
    //                     WHERE toolid = @toolid
    //                 `);

    //                 resolve(tool);

    //             } catch (error) {
    //                 reject(error);
    //             }

    //             sql.close();

    //         })();
    //     });
    // }

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
                        .input('authorid', sql.Int(), this.authors[0].authorid)
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

                    this.authors.forEach(async (author, index) => {
                        if (index > 0) {
                            await pool.connect();
                            const resultAuthors = await pool.request()
                                .input('toolid', sql.Int(), this.toolid)
                                .input('authorid', sql.Int(), author.authorid)
                                .query(`
                                        INSERT INTO liloToolAuthor (FK_toolid, FK_authorid)
                                        VALUES (@toolid, @authorid)
                                    `);
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
