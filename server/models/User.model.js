const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  relation: {
    type: String,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      enum: ["user", "responder", "admin"],
      default: "user",
    },

    // Profile details
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    medicalConditions: [String],
    allergies: [String],

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    emergencyContacts: [emergencyContactSchema],

    // Push notification token
    fcmToken: String,

    // Account status
    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    otp: String,
    otpExpire: Date,

    fakeAlertCount: {
      type: Number,
      default: 0,
    },

    avatar: String,
  },
  {
    timestamps: true,
  }
);


// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model("User", userSchema);