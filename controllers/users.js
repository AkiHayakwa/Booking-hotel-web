let userModel = require("../schemas/User");
let roleModel = require("../schemas/Role");
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')

module.exports = {
    CreateAnUser: async function (username, password, email, role, fullName, phone) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName || "",
            phone: phone || "",
            role: role
        });
        await newItem.save();
        return newItem;
    },
    GetAllUser: async function () {
        return await userModel
            .find({ isDeleted: false }).populate('role')
    },
    GetUserById: async function (id) {
        try {
            return await userModel
                .findOne({
                    isDeleted: false,
                    _id: id
                }).populate('role')
        } catch (error) {
            return false;
        }
    },
    GetUserByEmail: async function (email) {
        try {
            return await userModel
                .findOne({
                    isDeleted: false,
                    email: email
                })
        } catch (error) {
            return false;
        }
    },
    GetUserByToken: async function (token) {
        try {
            let user = await userModel
                .findOne({
                    isDeleted: false,
                    forgotPasswordToken: token
                })
            if (user.forgotPasswordTokenExp > Date.now()) {
                return user;
            }
            return false;
        } catch (error) {
            return false;
        }
    },
    UpdateUser: async function (id, body) {
        try {
            return await userModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                body,
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    DeleteUser: async function (id) {
        try {
            return await userModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { isDeleted: true },
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    ToggleActive: async function (id) {
        try {
            let user = await userModel.findOne({ _id: id, isDeleted: false })
            if (!user) return false;
            user.status = !user.status;
            await user.save();
            return user;
        } catch (error) {
            return false;
        }
    },
    QueryLogin: async function (username, password) {
        if (!username || !password) {
            return false;
        }
        // Cho phép đăng nhập bằng username hoặc email
        let user = await userModel.findOne({
            $or: [
                { username: username },
                { email: username.toLowerCase() }
            ],
            isDeleted: false
        })
        if (user) {
            if (user.lockTime && user.lockTime > Date.now()) {
                return false;
            } else {
                if (bcrypt.compareSync(password, user.password)) {
                    user.loginCount = 0;
                    await user.save();
                    let token = jwt.sign({
                        id: user.id
                    }, 'secret', {
                        expiresIn: '1d'
                    })
                    return token;
                } else {
                    user.loginCount++;
                    if (user.loginCount == 3) {
                        user.loginCount = 0;
                        user.lockTime = Date.now() + 3_600_000;
                    }
                    await user.save();
                    return false;
                }
            }
        } else {
            return false;
        }
    },
    ChangePassword: async function (user, oldPassword, newPassword) {
        if (bcrypt.compareSync(oldPassword, user.password)) {
            user.password = newPassword;
            await user.save();
            return true;
        } else {
            return false;
        }
    },
    GetUsersByRoleName: async function (roleName) {
        try {
            let role = await roleModel.findOne({ name: roleName, isDeleted: false });
            if (!role) return [];
            return await userModel.find({ role: role._id, isDeleted: false }).populate('role');
        } catch (error) {
            return [];
        }
    }
}
