const userCtrl = require("../controllers/userCtrl");
const router=require("express").Router();
// const auth = require("../middleware/auth");
// const Upload = require('../middleware/upload');

router.post('/register',userCtrl.register);
router.post('/signin',userCtrl.signin);

module.exports=router;
