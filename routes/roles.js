var express = require("express");
var router = express.Router();
let roleController = require('../controllers/roles')
let { CheckLogin, checkRole } = require('../utils/authHandler')

router.get('/', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await roleController.GetAllRole();
    res.send(result)
})
router.get('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await roleController.GetRoleById(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay role")
    } else {
        res.send(result)
    }
})
router.post('/', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let { name, description } = req.body;
    let result = await roleController.CreateRole(name, description);
    res.send(result)
})
router.put('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await roleController.UpdateRole(req.params.id, req.body);
    if (!result) {
        res.status(404).send("khong tim thay role")
    } else {
        res.send(result)
    }
})
router.delete('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await roleController.DeleteRole(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay role")
    } else {
        res.send(result)
    }
})

module.exports = router;
