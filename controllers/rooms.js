let roomModel = require("../schemas/Room");
let bookingModel = require("../schemas/Booking");

module.exports = {
    GetAllRoom: async function () {
        return await roomModel.find({ isDeleted: false }).populate('roomType').populate('hotel', 'name city')
    },
    GetRoomsByHotel: async function (hotelId) {
        return await roomModel.find({ hotel: hotelId, isDeleted: false }).populate('roomType')
    },
    GetRoomById: async function (id) {
        try {
            return await roomModel.findOne({ _id: id, isDeleted: false }).populate('roomType').populate('hotel', 'name city')
        } catch (error) {
            return false;
        }
    },
    CreateRoom: async function (roomNumber, roomType, floor, hotelId) {
        let newItem = new roomModel({
            roomNumber: roomNumber,
            roomType: roomType,
            floor: floor,
            hotel: hotelId
        });
        await newItem.save();
        return newItem;
    },
    UpdateRoom: async function (id, body) {
        try {
            return await roomModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                body,
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    DeleteRoom: async function (id) {
        try {
            return await roomModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { isDeleted: true },
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    UpdateStatus: async function (id, status) {
        try {
            return await roomModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { status: status },
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    GetAvailableRooms: async function (hotelId, checkIn, checkOut, guests) {
        try {
            let overlappingBookings = await bookingModel.find({
                isDeleted: false,
                hotel: hotelId,
                status: { $in: ['pending', 'confirmed', 'checked_in'] },
                checkInDate: { $lt: new Date(checkOut) },
                checkOutDate: { $gt: new Date(checkIn) }
            })
            let bookedRoomIds = overlappingBookings.flatMap(b => b.rooms || [])

            let query = {
                _id: { $nin: bookedRoomIds },
                hotel: hotelId,
                status: { $ne: 'maintenance' },
                isActive: true,
                isDeleted: false
            }

            let rooms = await roomModel.find(query).populate('roomType')

            if (guests) {
                rooms = rooms.filter(r => r.roomType && r.roomType.maxGuests >= parseInt(guests))
            }
            return rooms;
        } catch (error) {
            return false;
        }
    }
}
