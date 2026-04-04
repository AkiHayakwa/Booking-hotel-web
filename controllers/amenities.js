let amenityModel = require("../schemas/Amenity");

module.exports = {
    GetAllAmenity: async function () {
        return await amenityModel.find({ isDeleted: false })
    },
    CreateAmenity: async function (body) {
        try {
            if (!body || !body.name) {
                let error = new Error("Amenity name is required");
                error.status = 400;
                throw error;
            }
            let newItem = new amenityModel({
                name: body.name,
                icon: body.icon || "",
                type: body.type || 'both',
                description: body.description || ""
            });
            await newItem.save();
            return newItem;
        } catch (error) {
            console.error("Error in CreateAmenity:", error.message);
            throw error;
        }
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
