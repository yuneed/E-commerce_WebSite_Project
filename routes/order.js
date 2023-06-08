const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('./verifyToken');
const Order = require("../models/Order");
const router = require('express').Router();

//CREATE
router.post('/', verifyToken, async (req, res) => {
    const newOrder = new Order(req.body);
    
    try {
        const savedOrder = await newOrder.save();
        res.status(200).json(savedOrder);
    }catch(err) {
        res.status(500).json(err);
    }
})

// UPDATE
router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
            $set: req.body }, {new: true} );
            res.status(200).json(updatedOrder);
    }catch (err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json('Order has been deleted...');
    }catch(err) {
        res.status(500).json(err)
    }
})

//GET USER ORDERS
router.get('/find/:userId', verifyTokenAndAuthorization, async (req, res) => {
    try {
        const orders = await Order.find({userId: req.params.userId});
        res.status(200).json(orders);
    }catch(err) {
        res.status(500).json(err)
    }
})

//GET ALL 
router.get('/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    }catch(err) {
        res.status(500).json(err);
    }
})

// GET MONTHLY INCOME
router.get('/income', verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();    // 현재 날짜를 date변수에 저장
    const lastMonth = new Date(date.setMonth(date.getMonth() -1));  // date변수의 달을 한달 전으로 설정해 lastMonth에 저장(한달전)
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() -1));  // lastMonth변수를 한달전 한 후 previousMonth에 저장(2달전)

    try {
        const income = await Order.aggregate([  // 수입 정보를 계산하는 집계작업
            { $match: { createdAt: {$gte: previousMonth}}}, // 필터링
                {
                    $project: { // 변환
                        month: { $month: "$createdAt"},
                        sales: "$amount"
                    },
                },
                {
                    $group: {   // 그룹화
                        _id: "$month",
                        total: { $sum: "$sales"}
                    }
                }
            ]);
            res.status(200).json(income);
        }catch(err) {
            res.status(500).json(err);
        }
});

module.exports = router;