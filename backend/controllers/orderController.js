const Order = require('../models/order')
const Product = require('../models/product')

const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')

//Create a new order => /api/v1/order/new
exports.newOrder = catchAsyncErrors(async(req, res, next) => {

    const {
        orderItems,
        shippingInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        message: 'Order created successfully',
        order
    })
})

//Get Single Order Details => /api/v1/order/:id
exports.getSingleOrder = catchAsyncErrors(async(req, res, next) => {

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if(!order){
        return next(new ErrorHandler('Order Not Found', 404));
    }

    return res.status(200).json({
        success: true,
        order
    })
})

//Get Order Details of logged in user => /api/v1/orders/me
exports.myOrders = catchAsyncErrors(async(req, res, next) => {

    const orders = await Order.find({user: req.user.id})

    return res.status(200).json({
        success: true,
        orders
    })
})

//Get All Orders (ADMIN) => /api/v1/admin/orders 
exports.allOrders = catchAsyncErrors(async(req, res, next) => {

    const orders = await Order.find()

    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    return res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})

//Update/Process Order (ADMIN) => /api/v1/admin/order/:id
exports.updateOrder = catchAsyncErrors(async(req, res, next) => {

    const order = await Order.findById(req.params.id)

    if(order.orderStatus === 'Delivered'){
        return next(new ErrorHandler('Order has already been delivered', 400))
    }

    order.orderItems.forEach(async item => {
        await updateStock(item.product, item.quantity)
    })

    order.orderStatus = req.body.status
    order.deliveredAt = Date.now()
    
    await order.save()

    return res.status(200).json({
        success: true,
        order
    })
})

async function updateStock(id, quantity){
    const product = await Product.findById(id);
    product.stock = product.stock - quantity;
    await product.save({validateBeforeSave: false})
}

//Delete Order => api/v1/admin/order/:id
exports.deleteOrder = catchAsyncErrors(async(req, res, next) => {

    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler(`Order not found with id ${req.params.id}`))
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Order Deleted Successfully',
    })
})

