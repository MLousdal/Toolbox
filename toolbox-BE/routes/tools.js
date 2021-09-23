const 
express = require('express'),
router = express.Router(),

Tool = require('../models/tool'),

// Middleware
auth = require('../middleware/authenticate'),

// Member +
auth_member_plus = require('../middleware/member_plus'),
memberPlus = [auth, auth_member_plus],

// Admin


// Error handler
{ TakeError } = require('../helpers/helpError');

// ---------------------------------------------------------
// ----------------- TABLE OF CONTENTS ---------------------
// ---------------------------------------------------------

// GET
// /api/tools -- All tools
// /api/tools/:toolID -- Specific tool
// /api/tools/favorite/:me -- All favoritet tools from a specific user


// POST
// /api/tools -- Create new Tool
// /api/tools/favorite/:userId -- Add tool to users favorite list


// PUT
// /api/tools/me/:toolID
// /api/tools/:toolID
// PUT - (SOFT DELETE)
// /api/tools/delete/:me/:toolId
// /api/tools/delete/:toolID


// ---------------------------------------------------------



//------------------------GET-------------------------------

//  GET /api/tools (All tools)
router.get('/', async (req, res,next) => {
    try {
        const tools = await Tool.readAll();
        return res.send(JSON.stringify(tools));
    } catch (err) {
        next(err)
    }
});

//  GET /api/tools/favorite/:me  (Get all tools that a user has as favorites)
router.get('/favorite/:me', async (req, res, next) => {
    let me;
    try {
        if (req.params.me) { // Params stores the values from URL segmets like :me as params.me
            me = parseInt(req.params.me);
        }
        
        if (!me) throw new TakeError(400, 'Bad request: toolid = should refer a tools id (integer)');

        const user = await Tool.readAll_favorite(me);
        return res.send(JSON.stringify(user));
    } catch (err) {
        next(err);
    }
});


//        GET api/tools/:toolID (Specific tool)
router.get('/:toolid', async (req, res, next) => {
    // same as users/:userid
    let toolid;
    try {
        if (req.params.toolid) { // Params stores the values from URL segmets like :me as params.me
            toolid = parseInt(req.params.toolid);
        }

        if (!toolid) throw new TakeError(400, 'Bad request: toolid = should refer a tools id (integer)');

            const tool = await Tool.readAll(toolid);
            return res.send(JSON.stringify(tool));
    } catch (err) {
        next(err);
    }

    try {
        const tool = await Tool.readByAll(req.params.toolid);
        return res.send(JSON.stringify(tool));
    } catch (err) {
        return res.status(500).send(JSON.stringify({ errorMessage: err }));
    }
});

//------------------------POST-------------------------------


//          POST /api/tools (title, description, link, categoryId)
router.post('/', async (req, res, next) => {
    try {
        // Expected req.body:
            // {
            //     userId: '', -- The creater of the tool
            //     toolTitle: '',
            //     toolDescription: '',
            //     toolLink: '',
            //     toolCategoryId: ''
            // }
        const { error } = Tool.validate_newTool(req.body);
        if (error) throw new TakeError(400, 'Bad request: Tool payload formatted incorrectly');

        const 
        // Create a new Tool from the req.body, 
        // -- and use the .create() to add to DB(If everything checks out)
        newTool = new Tool(req.body),
        tool = await newTool.create();
        
        return res.send(JSON.stringify(tool));
    } catch (err) {
        next(err);
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

router.put('/me/:toolid', async (req, res) => {
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

//------------------------PUT(SOFT-DELETE)-------------------------------

//          PUT /api/tools/delete/me (MEMBER - DELETE OWN TOOL)

router.put('/delete/me', async (req, res) => {
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
//          PUT /api/tools/delete/:toolID (ADMIN - DELETE ANY)

router.put('/delete/:toolid', async (req, res) => {
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