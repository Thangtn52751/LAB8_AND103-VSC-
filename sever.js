const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const app = express();

const port = 3000;

// Import các thông tin chung và model
const COMMON = require('./COMMON');
const uri = COMMON.uri; // URI kết nối MongoDB
const cakeModel = require('./cakeModel');

// Middleware xử lý dữ liệu JSON và URL-encoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Kết nối tới MongoDB
const connectToDatabase = async () => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        throw error;
    }
};

// Khởi chạy server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Lấy danh sách bánh
app.get('/', async (req, res) => {
    try {
        await connectToDatabase();
        const cakes = await cakeModel.find();
        res.status(200).send(cakes);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching cakes', error: error.message });
    }
});

// Thêm bánh mới
app.post('/add_cake', async (req, res) => {
    try {
        await connectToDatabase();
        const newCake = req.body;
        await cakeModel.create(newCake);
        const cakes = await cakeModel.find();
        res.status(201).send(cakes);
    } catch (error) {
        res.status(500).send({ message: 'Error adding cake', error: error.message });
    }
});

// Xóa bánh theo ID
app.delete('/delete/:id', async (req, res) => {
    try {
        await connectToDatabase();
        const { id } = req.params;
        await cakeModel.deleteOne({ _id: id });
        res.status(200).send({ message: 'Cake deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting cake', error: error.message });
    }
});

// Cập nhật bánh theo ID
app.put('/update/:id', async (req, res) => {
    try {
        await connectToDatabase();
        const { id } = req.params;
        const updatedCake = req.body;
        await cakeModel.updateOne({ _id: id }, updatedCake);
        const cakes = await cakeModel.find();
        res.status(200).send(cakes);
    } catch (error) {
        res.status(500).send({ message: 'Error updating cake', error: error.message });
    }
});

// Tìm kiếm bánh theo tên
app.get('/search', async (req, res) => {
    try {
        const { name } = req.query;
        await connectToDatabase();
        const cakes = await cakeModel.find({
            name: { $regex: name, $options: 'i' },
        });
        res.status(200).send(cakes);
    } catch (error) {
        res.status(500).send({ message: 'Error searching cakes', error: error.message });
    }
});

// API GHN - Tạo đơn hàng giao vận
app.post('/create-shipping-order', async (req, res) => {
    try {
        const { province, district, ward, specificAddress, customerName } = req.body;

        // Xác minh dữ liệu đầu vào
        if (!province || !district || !ward || !specificAddress || !customerName) {
            return res.status(400).send({ message: 'Missing required fields' });
        }

        // Dữ liệu gửi đi cho GHN API
        const orderData = {
            shop_id: '195433', // Thay bằng Shop ID thực tế
            order: {
                customer_name: customerName,
                address: {
                    province,
                    district,
                    ward,
                    specific_address: specificAddress,
                },
            },
        };

        // Gọi API GHN
        const ghnResponse = await axios.post(
            'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create',
            orderData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Token': '87816858-abb7-11ef-accc-c6f6f22065b5', // Thay bằng Token thực tế
                },
            }
        );

        // Phản hồi kết quả thành công
        res.status(200).send({
            message: 'Order created successfully',
            ghnResponse: ghnResponse.data,
        });
    } catch (error) {
        console.error('Error creating shipping order:', error.message);
        res.status(500).send({ message: 'Error creating shipping order', error: error.message });
    }
});

app.get('/product/:id', async (req, res) => {
    try {
        const product = await Cake.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error); // Log chi tiết
        res.status(500).json({ message: "Internal Server Error" });
    }
});

