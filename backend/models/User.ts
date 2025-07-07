import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String }, 
    dob: { type: Date },
    email :{type:String, required:true, unique:true},
    otp :{type:String},
    otpExpires: {type:Date},
    isVerified: {type:Boolean, default:false}
});

export default mongoose.model('User', UserSchema);