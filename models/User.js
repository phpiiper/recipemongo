const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const UserSchema = new Schema(
    {
        password: {
            type: String,
            required: true
        },
        user: {
            type: String,
            required: [true, "Username is required"]
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.models?.User || model('User', UserSchema);

module.exports = User;
