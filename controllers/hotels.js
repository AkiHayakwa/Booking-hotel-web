let hotelModel = require("../schemas/Hotel");

module.exports = {
    CreateHotel: async function (data) {
        let newItem = new hotelModel({
            name: data.name,
            description: data.description || "",
            address: data.address,
            city: data.city,
            images: data.images || [],
            phone: data.phone || "",
            email: data.email || "",
            owner: data.ownerId,
            amenities: data.amenities || []
        });
        await newItem.save();
        return newItem;
    },
    GetAllHotel: async function () {
        let roomTypeModel = require('../schemas/RoomType');
        let hotels = await hotelModel.find({ isDeleted: false, isApproved: true })
            .populate('owner', 'username fullName email')
    GetAllHotel: async function () {
        const roomTypeModel = require('../schemas/RoomType');
        // 1. Lấy danh sách khách sạn, thêm sort của admin-UI và lean() của main
        let hotels = await hotelModel.find({ isDeleted: false, isApproved: true })
            .populate('owner', 'username fullName email')
            .populate('amenities', 'name icon') // Lấy name và icon như main yêu cầu
            .sort({ createdAt: -1 }) // Giữ lại phần sort của bạn
            .lean();

        // 2. Logic tính minPrice của nhánh main
        const roomTypesAll = await roomTypeModel.find({ isDeleted: false })
            .select('hotel pricePerNight').lean();
        
        const rtMap = {};
        roomTypesAll.forEach(rt => {
            const hid = rt.hotel.toString();
            if (!rtMap[hid] || rt.pricePerNight < rtMap[hid]) {
                rtMap[hid] = rt.pricePerNight;
            }
        });

        // 3. Trả về kết quả đã map thêm minPrice
        return hotels.map(h => ({ 
            ...h, 
            minPrice: rtMap[h._id.toString()] || null 
        }));
    },
    },
    GetAllHotelAdmin: async function () {
        return await hotelModel.find({ isDeleted: false })
            .populate('owner', 'username fullName email')
            .populate('amenities')
            .sort({ createdAt: -1 })
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
        let roomTypeModel = require('../schemas/RoomType');
        let hotels = await hotelModel.find({
            city: { $regex: city, $options: 'i' },
            isDeleted: false,
            isApproved: true
        }).populate('amenities', 'name icon').lean();
        if (!hotels.length) return hotels;
        const hotelIds = hotels.map(h => h._id);
        const roomTypes = await roomTypeModel.find({ hotel: { $in: hotelIds }, isDeleted: false })
            .select('hotel pricePerNight').lean();
        const rtMap = {};
        roomTypes.forEach(rt => {
            const hid = rt.hotel.toString();
            if (!rtMap[hid] || rt.pricePerNight < rtMap[hid]) {
                rtMap[hid] = rt.pricePerNight;
            }
        });
        return hotels.map(h => ({ ...h, minPrice: rtMap[h._id.toString()] || null }));
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
