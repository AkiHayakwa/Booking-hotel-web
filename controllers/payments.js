let paymentModel = require("../schemas/Payment");
let bookingModel = require("../schemas/Booking");
const crypto = require('crypto');

// Thông tin Test Sandbox của MoMo
const MOMO_PARTNER_CODE = "MOMO";
const MOMO_ACCESS_KEY = "F8BBA842ECF85";
const MOMO_SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const MOMO_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";
const SUCCESS_URL = "http://localhost:5173/payment-result"; // Link frontend xử lý kết quả

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
    },

    // ======== MOMO INTEGRATION ========
    CreateMomoPayment: async function (bookingId, amount) {
        try {
            // Lấy thông tin booking để truyền vào orderInfo
            let booking = await bookingModel.findById(bookingId);
            if (!booking) {
                return { error: "Không tìm thấy thông tin đặt phòng." };
            }

            const partnerCode = MOMO_PARTNER_CODE;
            const accessKey = MOMO_ACCESS_KEY;
            const secretKey = MOMO_SECRET_KEY;

            // Unique orderId và requestId
            const orderId = partnerCode + new Date().getTime() + "-" + bookingId.toString().slice(-5);
            const requestId = orderId;
            const orderInfo = "Thanh toán dịch vụ khách sạn LuxStay - Mã Booking: " + bookingId;
            const redirectUrl = SUCCESS_URL;
            const ipnUrl = "http://localhost:3000/api/v1/payments/momo-ipn"; // Địa chỉ Webhook (phải public IP mới hoạt động)
            const requestType = "payWithCC"; // Thanh toán bằng thẻ tín dụng quốc tế
            const extraData = bookingId.toString(); // Chuyển bookingId qua extraData để nhận lại ở IPN

            // Chữ ký RAW chuẩn của MoMo HMAC
            const rawSignature = "accessKey=" + accessKey +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + ipnUrl +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + partnerCode +
                "&redirectUrl=" + redirectUrl +
                "&requestId=" + requestId +
                "&requestType=" + requestType;

            const signature = crypto.createHmac('sha256', secretKey)
                .update(rawSignature)
                .digest('hex');

            const requestBody = {
                partnerCode: partnerCode,
                partnerName: "LuxStay Server",
                storeId: "LuxStay",
                requestId: requestId,
                amount: amount,
                orderId: orderId,
                orderInfo: orderInfo,
                redirectUrl: redirectUrl,
                ipnUrl: ipnUrl,
                lang: "vi",
                requestType: requestType,
                autoCapture: true,
                extraData: extraData,
                signature: signature
            };

            // Gọi API tạo QR/URL thanh toán sang MoMo bằng fetch
            const response = await fetch(MOMO_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseData = await response.json();

            if (responseData && responseData.resultCode === 0) {
                // Trả về payUrl cho Frontend để Redirect người dùng sang trang Momo
                return { payUrl: responseData.payUrl, orderId: orderId };
            } else {
                console.error("MoMo trả về lỗi:", responseData);
                return { error: responseData.message || "Không thể khởi tạo giao dịch MoMo" };
            }

        } catch (error) {
            console.error("MoMo API Error:", error.message);
            return { error: "Lỗi kết nối tới cổng thanh toán MoMo." };
        }
    },

    VerifyMomoIPN: async function (momoData) {
        try {
            const secretKey = MOMO_SECRET_KEY;

            // Tính lại chữ ký
            const rawSignature = "accessKey=" + MOMO_ACCESS_KEY +
                "&amount=" + momoData.amount +
                "&extraData=" + momoData.extraData +
                "&message=" + momoData.message +
                "&orderId=" + momoData.orderId +
                "&orderInfo=" + momoData.orderInfo +
                "&orderType=" + momoData.orderType +
                "&partnerCode=" + momoData.partnerCode +
                "&payType=" + momoData.payType +
                "&requestId=" + momoData.requestId +
                "&responseTime=" + momoData.responseTime +
                "&resultCode=" + momoData.resultCode +
                "&transId=" + momoData.transId;

            const signature = crypto.createHmac('sha256', secretKey)
                .update(rawSignature)
                .digest('hex');

            if (signature !== momoData.signature) {
                return { isSuccess: false, message: "Sai chữ ký bảo mật" };
            }

            // resultCode = 0 nghĩa là giao dịch thành công
            if (momoData.resultCode === 0) {
                const bookingId = momoData.extraData;

                // Cập nhật Database
                let booking = await bookingModel.findById(bookingId);
                if (booking && booking.status === 'pending') {
                    booking.status = 'confirmed';
                    await booking.save();

                    // Tạo một Payment History trong Database
                    let newPayment = new paymentModel({
                        booking: bookingId,
                        amount: momoData.amount,
                        method: 'credit_card', // momo CC
                        status: 'completed',
                        paidAt: new Date()
                    });
                    await newPayment.save();
                }

                return { isSuccess: true };
            }

            return { isSuccess: false, message: "Giao dịch thất bại / Bị hủy" };

        } catch (error) {
            console.log("Verify IPN lỗi: ", error);
            return { isSuccess: false, message: "Lỗi hệ thống trong lúc nhận IPN" };
        }
    }
}
