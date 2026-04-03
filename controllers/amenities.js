let amenityModel = require("../schemas/Amenity");

module.exports = {
    GetAllAmenity: async function () {
        return await amenityModel.find({ isDeleted: false })
    },
    CreateAmenity: async function (body) {
        let newItem = new amenityModel({
            name: body.name,
            icon: body.icon || "",
            type: body.type || 'both',
            description: body.description || ""
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
