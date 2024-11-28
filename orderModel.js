const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cake', required: true },
            quantity: { type: Number, required: true },
        },
    ],
    address: {
        province: { type: String, required: true },
        district: { type: String, required: true },
        ward: { type: String, required: true },
        specificAddress: { type: String, required: true },
    },
    status: { type: String, default: 'pending' }, // Trạng thái đơn hàng: 'pending', 'completed', 'cancelled'
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
