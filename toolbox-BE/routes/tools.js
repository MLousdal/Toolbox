const { required } = require('joi');

const 
express = require('express'),
router = express.Router(),

Tool = require('../models/tool'),
Favorite = require('../models/favorite'),

// Middleware
auth = require('../middleware/authenticate'),

// Member +
auth_member_plus = require('../middleware/member_plus'),
memberPlus = [auth, auth_member_plus],

// Admin
auth_admin = require('../middleware/admin'),
adminAuth = [auth, auth_admin],


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

//          POST /api/tools (userId, title, description, link, categoryId)
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
        const { error } = Tool.validate_tool(req.body);
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
router.post('/favorite', async (req, res, next) => {
    try {
        // Expected req.body:
            // {
            //     toolId: '',
            //     userId: ''
            // }
 
        const { error } = Favorite.validate(req.body);
        if (error) throw new TakeError(400, 'Bad request: Favorite payload formatted incorrectly');

        const 
        newFavorite = new Favorite(req.body),
        favorite = await newFavorite.create_favorite(newFavorite);
        
        return res.send(JSON.stringify(favorite));
    } catch (err) {
        console.log(err)
        next(err);
    }
});

//------------------------PUT-------------------------------

//          PUT /api/tools/:userId/:toolID
router.put('/:userid/:toolid', adminAuth, async (req, res, next) => {
    let toolId, userId;
    try {
        // Expected req.body:
            // {
            //     toolTitle: '',
            //     toolDescription: '',
            //     toolLink: '',
            //     toolCategoryId: ''
            // }
            // Add the userId, and toolId from req.params
        if (req.params.userid) { 
            userId = parseInt(req.params.userid);
            req.body.userId = userId;
        }
        if (req.params.toolid) {
            toolId = parseInt(req.params.toolid);
            req.body.toolId = toolId;
        }
        if (!userId) {
            throw new TakeError(400, 'Bad request: userid = should refer a tools id (integer)');
        }
        if (!toolId) {
            throw new TakeError(400, 'Bad request: toolid = should refer a tools id (integer)');
        }

        const 
        { error } = Tool.validate_tool(req.body);
        if (error) throw new TakeError(400, 'Bad request: Tool payload formatted incorrectly');

        const 
        // Update a Tool from the req.body, 
        // -- and use the .update() to UPDATE DB(If everything checks out)
        updatedTool = new Tool(req.body),
        tool = await updatedTool.update();
        
        return res.send(JSON.stringify(tool));
    } catch (err) {
        next(err);
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

//------------------------------------ PUT(SOFT-DELETE) ------------------------------------

// This router is for:
    // -- If a user want to "remove" a Tool (Will change the toolStatus = inactive)!
    // What is needed:
        // In the path:
        // -- /delete/ follow by the id of the tool that should be removed!.
router.put('/delete/:toolid', async (req, res) => {
    let toolId; // Used to check if we have correct req.params.
    if (req.params.toolid) toolId = parseInt(req.params.toolid);

    

});

// ---------------------------------------- DELETE ------------------------------------------

// This router is for:
    // -- If a user want to remove a Tool from it's favorite list!
    // What is needed:
        // In the path:
        // -- a userId for who want to remove a favorite.
        // -- a toolId for want tool should removed from favorite.
router.delete('/:userid/:toolid', memberPlus, async (req, res, next) => {    
    try {
        // Validate if the req.body is formatted the way we expect!
        let toolId, userId;
        if (req.params.userid) userId = parseInt(req.params.userid);
        if (req.params.toolid) toolId = parseInt(req.params.toolid);
        
        // If toolId or userId is empty, that means that the parameter couldn't be converted to an Integer.
        if (!toolId) throw new TakeError(400, 'Bad request: toolid = should refer a tools id (integer)');
        if (!userId) throw new TakeError(400, 'Bad request: userid = should refer a users id (integer)');
        
        const 
        ids = {
            userId: userId,
            toolId: toolId
        },
        { error } = Favorite.validate(ids);
        if (error) throw new TakeError(400, 'Bad request: DELETE payload formatted incorrectly');
        
        
        const tool = await Favorite.delete(ids);
        console.log("!!!!!!!!!!")
        return res.send(JSON.stringify(tool));
    } catch (err) {
        next(err);
    }
});

module.exports = router;