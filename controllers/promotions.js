let promotionModel = require("../schemas/Promotion");

module.exports = {
    GetAllPromotion: async function () {
        return await promotionModel.find({
            isDeleted: false,
            isActive: true,
            endDate: { $gte: new Date() }
        }).populate('hotel', 'name city').populate('applicableRoomTypes')
    },
    GetPromotionsByHotel: async function (hotelId) {
        return await promotionModel.find({ hotel: hotelId, isDeleted: false })
            .populate('applicableRoomTypes')
    },
    GetPromotionById: async function (id) {
        try {
            return await promotionModel.findOne({ _id: id, isDeleted: false })
                .populate('hotel', 'name city').populate('applicableRoomTypes')
        } catch (error) {
            return false;
        }
    },
    CreatePromotion: async function (body) {
        let newItem = new promotionModel(body);
        await newItem.save();
        return newItem;
    },
    UpdatePromotion: async function (id, body) {
        try {
            return await promotionModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                body,
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    DeletePromotion: async function (id) {
        try {
            return await promotionModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { isDeleted: true },
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    ValidatePromoCode: async function (promoCode, hotelId, roomTypeId, nights) {
        try {
            let query = {
                promoCode: promoCode,
                isDeleted: false,
                isActive: true,
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            }
            if (hotelId) query.hotel = hotelId;

            let promotion = await promotionModel.findOne(query)
            if (!promotion) return false;
            if (promotion.maxUsage && promotion.usedCount >= promotion.maxUsage) return false;
            if (promotion.minNights && nights < promotion.minNights) return false;
            if (promotion.applicableRoomTypes.length > 0 &&
                !promotion.applicableRoomTypes.map(r => r.toString()).includes(roomTypeId)) return false;

            return promotion;
        } catch (error) {
            return false;
        }
    }
}
