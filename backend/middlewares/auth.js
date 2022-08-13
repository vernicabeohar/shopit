const jwt = require("jsonwebtoken");
const User = require("../models/user");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

//Checks if user is authenticated or not
//Authenticating on the backend instead of the frontend => more secure
exports.isAuthenticatedUser = catchAsyncErrors(async(req, res, next) => {

    const {token} = req.cookies

    if(!token){
        return next(new ErrorHandler('Please login to access this resource', 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)

    next()
})

//Authorizing User Roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource`, 403))
        }

        next()
    }
}