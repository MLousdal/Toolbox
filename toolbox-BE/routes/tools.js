const express = require('express');
const router = express.Router();

const Tool = require('../models/tool');
//const Author = require('../models/author');

//const Tool = require('../models/tool');
//const Author = require('../models/author');


// ---------------------------------------------------------


// GET
// /api/accounts
// /api/tools/me
// /api/tools/:toolID


// POST
// /api/tools


// PUT
// /api/tools/me/:toolID
// /api/tools/:toolID



// ---------------------------------------------------------


//------------------------GET-------------------------------

//         GET /api/tools 

router.get('/', async (req, res) => {
    // need to call the Tool class for DB access...
    let authorid;
    if (req.query.author) {
        authorid = parseInt(req.query.author);
        if (!authorid) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: ?author= should refer an author id (integer)' }));
    }

    try {
        const tools = await Tool.readAll(authorid);
        return res.send(JSON.stringify(tools));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});


//        GET api/tools/:toolID

router.get('/:toolid', async (req, res) => {
    // › › validate req.params.toolid as toolid
    // › › call await Tool.readById(req.params.toolid)
    const { error } = Tool.validate(req.params);
    if (error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: toolid has to be an integer', errorDetail: error.details[0].message }));

    try {
        const tool = await Tool.readById(req.params.toolid);
        return res.send(JSON.stringify(tool));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

//        GET /api/tools/me

router.get('/:toolid', async (req, res) => {
    // › › validate req.params.toolid as toolid
    // › › call await Tool.readById(req.params.toolid)
    const { error } = Tool.validate(req.params);
    if (error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: toolid has to be an integer', errorDetail: error.details[0].message }));

    try {
        const tool = await Tool.readById(req.params.toolid);
        return res.send(JSON.stringify(tool));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});


//------------------------POST-------------------------------

//          POST /api/tools (title, description, link, category, (icon))

router.post('/', async (req, res) => {
    // › › validate req.body (payload) as tool --> authors must have authorid!
    // › › instantiate tool = new Tool(req.body)
    // › › call await tool.create()

    const { error } = Tool.validate(req.body);
    if (error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: Tool payload formatted incorrectly', errorDetail: error.details[0].message }));

    try {
        const newTool = new Tool(req.body);
        const tool = await newTool.create();
        return res.send(JSON.stringify(tool));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});



//------------------------DELETE-------------------------------

// DELETE NOT USED IN PROJECT

/*   router.delete('/:toolid', async (req, res) => {
        // › › validate req.params.toolid as toolid
        // › › call await Tool.delete(req.params.toolid)
        const { error } = Tool.validate(req.params);
        if (error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: toolid has to be an integer', errorDetail: error.details[0].message }));

        try {
            const tool = await Tool.delete(req.params.toolid);
            return res.send(JSON.stringify(tool));
        } catch (err) {
            return res.status(500).send(JSON.stringify({ errorMessage: err }));
        }
    });
*/


//------------------------PUT-------------------------------


//          PUT /api/tools/me/:toolID

router.put('/:toolid', async (req, res) => {
    // › › validate req.params.toolid as toolid
    // › › validate req.body (payload) as tool --> authors must have authorid!
    // › › call tool = await Tool.readById(req.params.toolid)
    // › › merge / overwrite tool object with req.body
    // › › call await tool.update() --> tool holds the updated information
    const toolidValidate = Tool.validate(req.params);
    if (toolidValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: toolid has to be an integer', errorDetail: error.details[0].message }));

    const payloadValidate = Tool.validate(req.body);
    if (payloadValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: Tool payload formatted incorrectly', errorDetail: error.details[0].message }));

    try {
        const oldTool = await Tool.readById(req.params.toolid);
        oldTool.copy(req.body);
        const tool = await oldTool.update();
        return res.send(JSON.stringify(tool));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});


//          PUT /api/tools/:toolID

router.put('/:toolid', async (req, res) => {
    // › › validate req.params.toolid as toolid
    // › › validate req.body (payload) as tool --> authors must have authorid!
    // › › call tool = await Tool.readById(req.params.toolid)
    // › › merge / overwrite tool object with req.body
    // › › call await tool.update() --> tool holds the updated information
    const toolidValidate = Tool.validate(req.params);
    if (toolidValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: toolid has to be an integer', errorDetail: error.details[0].message }));

    const payloadValidate = Tool.validate(req.body);
    if (payloadValidate.error) return res.status(400).send(JSON.stringify({ errorMessage: 'Bad request: Tool payload formatted incorrectly', errorDetail: error.details[0].message }));

    try {
        const oldTool = await Tool.readById(req.params.toolid);
        oldTool.copy(req.body);
        const tool = await oldTool.update();
        return res.send(JSON.stringify(tool));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});


module.exports = router;