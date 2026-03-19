let roleModel = require("../schemas/Role");

module.exports = {
    GetAllRole: async function () {
        return await roleModel.find({ isDeleted: false })
    },
    GetRoleById: async function (id) {
        try {
            return await roleModel.findOne({ _id: id, isDeleted: false })
        } catch (error) {
            return false;
        }
    },
    CreateRole: async function (name, description) {
        let newItem = new roleModel({
            name: name,
            description: description || ""
        });
        await newItem.save();
        return newItem;
    },
    UpdateRole: async function (id, body) {
        try {
            return await roleModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                body,
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    DeleteRole: async function (id) {
        try {
            return await roleModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { isDeleted: true },
                { new: true }
            )
        } catch (error) {
            return false;
        }
    }
}
