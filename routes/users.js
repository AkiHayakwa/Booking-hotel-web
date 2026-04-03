var express = require("express");
var router = express.Router();
let userController = require('../controllers/users')
let { CheckLogin, checkRole } = require('../utils/authHandler')
let { UpdateUserValidator, validatedResult } = require('../utils/validator')

router.get('/', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await userController.GetAllUser();
    res.send(result)
})
router.get('/by-role/:roleName', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await userController.GetUsersByRoleName(req.params.roleName);
    res.send(result)
})

router.get('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await userController.GetUserById(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay user")
    } else {
        res.send(result)
    }
})

router.put('/:id', CheckLogin, checkRole('admin'), UpdateUserValidator, validatedResult, async function (req, res, next) {
    let result = await userController.UpdateUser(req.params.id, req.body);
    if (!result) {
        res.status(404).send("khong tim thay user")
    } else {
        res.send(result)
    }
})

router.delete('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await userController.DeleteUser(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay user")
    } else {
        res.send(result)
    }
})

router.patch('/:id/toggle-active', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await userController.ToggleActive(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay user")
    } else {
        res.send(result)
    }
})

module.exports = router;
