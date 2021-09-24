const { application } = require('express');
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
// /api/tools/:toolId -- Specific tool
// /api/tools/favorite/:me -- All favoritet tools from a specific user
// /api/tools/creator/:userId -- All tools that a user have created.


// POST
// /api/tools -- Create new Tool
// /api/tools/favorite/:userId -- Add tool to users favorite list


// PUT
// /api/tools/me/:toolID
// /api/tools/:toolID
// PUT - (SOFT DELETE)
// /api/tools/delete/:me/:toolId
// /api/tools/delete/:toolID

            // *************************
            // ******** TIPS ***********
            // *************************
            // How to order routes? Reference: https://gabrieleromanato.name/order-of-routes-when-using-parameters-in-expressjs
            // It sould be from least specific to most specific, like so:
            // router.get('/)
            // router.get('/tools)
            // router.get('/:toolId)

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
router.get('/favorite/:me', memberPlus, async (req, res, next) => {
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

//  GET api/tools/:toolid (GET a Specific tool) 
router.get('/:toolid', adminAuth, async (req, res, next) => {
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
});

//  GET api/tools/creator/:userId -- Will get all Tools an User have created.
router.get('/creator/:userid', memberPlus, async (req, res, next) => {
    // same as users/:userid
    let userId;
    try {
        if (req.params.userid) { // Params stores the values from URL segmets like :me as params.me
            userId = parseInt(req.params.userid);
        }
        if (!userId) throw new TakeError(400, 'Bad request: user = should refer an users id (integer)');

        const user = {
            creator: true,
            creatorId: userId
        }
        // Validate our new object:
        const { error} = Tool.validate_creator(user);
        if (error) throw new TakeError(400, 'Bad request: req.params formatted incorrectly');

        const tool = await Tool.readAll(user);
        return res.send(JSON.stringify(tool));
    } catch (err) {
        next(err);
    }
});

//------------------------POST-------------------------------

// This router is for:
    // Authorization: Member+ = Member + Admin
    // -- If a user want to create a new tool
    // What is needed:
        // Expected req.body:
            // {
            //     userId: '', -- The creater of the tool
            //     toolTitle: '',
            //     toolDescription: '',
            //     toolLink: '',
            //     toolCategoryId: ''
            // }
router.post('/', memberPlus, async (req, res, next) => {
    try {
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

// This router is for:
    // Authorization: Member+ = Member + Admin
    // -- If a user want to add a tool to their Favorites
    // What is needed:
       // Expected req.body:
            // {
            //     toolId: '',
            //     userId: ''
            // }
router.post('/favorite', memberPlus, async (req, res, next) => {
    try { 
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

//------------------------ PUT -------------------------------

// This router is for:
    // Authorization: Member+ = Member + Admin
    // -- If a user want to UPDATE a tools data!
    // What is needed:
        // In the path:
        // -- :userId - needs to be the creature of the tool.
        // -- :toolId - is for the tool that should be UPDATEed.
        // Expected req.body:
            // {
            //     toolTitle: '',
            //     toolDescription: '',
            //     toolLink: '',
            //     toolCategoryId: ''
            // }
router.put('/:userid/:toolid', memberPlus, async (req, res, next) => {
    let toolId, userId;
    try {
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


// This router is for:
    // Authorization: Admin
    // -- If a Admin want to UPDATE ANY tools data!
    // What is needed:
        // In the path:
        // -- :toolId - is for the tool that should be UPDATEed.
router.put('/:toolid', adminAuth,  async (req, res, next) => { 
    let toolId;
    try {
        // Expected req.body:
            // {
            //     toolTitle: '',
            //     toolDescription: '',
            //     toolLink: '',
            //     toolCategoryId: ''
            // }
            // Add the toolId from req.params

        if (req.params.toolid) {
            toolId = parseInt(req.params.toolid);
            // Add our toolId to our req.body for use in Tool.
            req.body.toolId = toolId;
        }
        if (!toolId) throw new TakeError(400, 'Bad request: toolid = should refer a tools id (integer)');

        const 
        { error } = Tool.validate_tool(req.body);
        if (error) throw new TakeError(400, 'Bad request: Tool payload formatted incorrectly');

        const 
        // Update a Tool from the req.body, 
        // -- and use the .update() to UPDATE DB(If everything checks out)
        updatedTool = new Tool(req.body),
        tool = await updatedTool.update_admin();
        
        return res.send(JSON.stringify(tool));
    } catch (err) {
        next(err);
    }
});

// ---------------------------------------- DELETE ------------------------------------------

// This router is for:
    // Authorization: Admin
    // -- If a user want to "remove" a Tool (Will change the toolStatus = inactive)
    // -- If a user want to "show" a Tool (Will change the toolStatus = active)
    // What is needed:
        // In the path:
        // -- /delete/ follow by the id of the tool that should be "removed"!.
router.delete('/delete/:toolid', adminAuth, async (req, res, next) => {
    // .delete is used, but in the DB a status is just changed from active/inactive to the opposite.
    let toolId; // Used to check if we have correct req.params.
    try {
        if (req.params.toolid) toolId = parseInt(req.params.toolid);
        if (!toolId) throw new TakeError(400, 'Bad request: toolid = should refer a tools id (integer)');

        const deactivatTool = await Tool.soft_delete(toolId);

        return res.send(JSON.stringify(deactivatTool));
    } catch(err) {
        next(err);
    }
});

// This router is for:
    // Authorization: Member+ = Member + Admin
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