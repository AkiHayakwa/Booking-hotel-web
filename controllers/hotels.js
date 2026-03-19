let hotelModel = require("../schemas/Hotel");

module.exports = {
    CreateHotel: async function (name, description, address, city, images, phone, email, ownerId, amenities) {
        let newItem = new hotelModel({
            name: name,
            description: description || "",
            address: address,
            city: city,
            images: images || [],
            phone: phone || "",
            email: email || "",
            owner: ownerId,
            amenities: amenities || []
        });
        await newItem.save();
        return newItem;
    },
    GetAllHotel: async function () {
        return await hotelModel.find({ isDeleted: false, isApproved: true })
            .populate('owner', 'username fullName email')
            .populate('amenities')
    },
    GetAllHotelAdmin: async function () {
        return await hotelModel.find({ isDeleted: false })
            .populate('owner', 'username fullName email')
            .populate('amenities')
    },
    GetHotelById: async function (id) {
        try {
            return await hotelModel.findOne({ _id: id, isDeleted: false })
                .populate('owner', 'username fullName email')
                .populate('amenities')
        } catch (error) {
            return false;
        }
    },
    GetHotelsByOwner: async function (ownerId) {
        return await hotelModel.find({ owner: ownerId, isDeleted: false })
            .populate('amenities')
    },
    GetHotelsByCity: async function (city) {
        return await hotelModel.find({
            city: { $regex: city, $options: 'i' },
            isDeleted: false,
            isApproved: true
        }).populate('amenities')
    },
    UpdateHotel: async function (id, body) {
        try {
            return await hotelModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                body,
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    DeleteHotel: async function (id) {
        try {
            return await hotelModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { isDeleted: true },
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    ApproveHotel: async function (id) {
        try {
            return await hotelModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { isApproved: true },
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    RejectHotel: async function (id) {
        try {
            return await hotelModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { isApproved: false },
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    UpdateRating: async function (hotelId, newRating) {
        try {
            let hotel = await hotelModel.findById(hotelId);
            if (!hotel) return false;
            let total = hotel.rating * hotel.totalReviews + newRating;
            hotel.totalReviews += 1;
            hotel.rating = (total / hotel.totalReviews).toFixed(1);
            await hotel.save();
            return hotel;
        } catch (error) {
            return false;
        }
    }
}
