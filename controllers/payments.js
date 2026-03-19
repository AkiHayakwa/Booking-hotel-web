let paymentModel = require("../schemas/Payment");

module.exports = {
    CreatePayment: async function (bookingId, amount, method) {
        let newItem = new paymentModel({
            booking: bookingId,
            amount: amount,
            method: method || 'cash',
            status: 'completed',
            paidAt: new Date()
        });
        await newItem.save();
        return newItem;
    },
    GetAllPayment: async function () {
        return await paymentModel.find({ isDeleted: false })
            .populate({ path: 'booking', populate: { path: 'user', select: 'username email fullName' } })
    },
    GetPaymentById: async function (id) {
        try {
            return await paymentModel.findOne({ _id: id, isDeleted: false })
                .populate({ path: 'booking', populate: { path: 'user', select: 'username email fullName' } })
        } catch (error) {
            return false;
        }
    },
    GetPaymentByBooking: async function (bookingId) {
        try {
            return await paymentModel.find({ booking: bookingId, isDeleted: false })
        } catch (error) {
            return false;
        }
    }
}
