let roomTypeModel = require("../schemas/RoomType");

module.exports = {
    GetAllRoomType: async function () {
        return await roomTypeModel.find({ isDeleted: false }).populate('hotel', 'name city')
    },
    GetRoomTypesByHotel: async function (hotelId) {
        return await roomTypeModel.find({ hotel: hotelId, isDeleted: false })
    },
    GetRoomTypeById: async function (id) {
        try {
            return await roomTypeModel.findOne({ _id: id, isDeleted: false }).populate('hotel', 'name city')
        } catch (error) {
            return false;
        }
    },
    CreateRoomType: async function (name, description, pricePerNight, maxGuests, images, hotelId) {
        let newItem = new roomTypeModel({
            name: name,
            description: description || "",
            pricePerNight: pricePerNight,
            maxGuests: maxGuests,
            images: images || [],
            hotel: hotelId
        });
        await newItem.save();
        return newItem;
    },
    UpdateRoomType: async function (id, body) {
        try {
            return await roomTypeModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                body,
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    DeleteRoomType: async function (id) {
        try {
            return await roomTypeModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { isDeleted: true },
                { new: true }
            )
        } catch (error) {
            return false;
        }
    }
}
