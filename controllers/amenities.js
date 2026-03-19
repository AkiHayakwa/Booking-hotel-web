let amenityModel = require("../schemas/Amenity");

module.exports = {
    GetAllAmenity: async function () {
        return await amenityModel.find({ isDeleted: false })
    },
    CreateAmenity: async function (name, icon) {
        let newItem = new amenityModel({
            name: name,
            icon: icon || ""
        });
        await newItem.save();
        return newItem;
    },
    UpdateAmenity: async function (id, body) {
        try {
            return await amenityModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                body,
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    DeleteAmenity: async function (id) {
        try {
            return await amenityModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { isDeleted: true },
                { new: true }
            )
        } catch (error) {
            return false;
        }
    }
}
