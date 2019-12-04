var router = require("express").Router();
var controller = require("./controller");

router.route("/").get(controller.index);
router.route("/").post(controller.init);

router.route("/game").get(controller.game);
router.route("/error").get(controller.error);

module.exports = router;
