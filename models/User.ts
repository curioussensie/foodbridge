import mongoose, { Schema, Document } from "mongoose";

export interface IDonorProfile {
  name: string;
  address: string;
  contact: string;
  foodType: string;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: "Donor" | "Recipient" | "Admin";
  status: "pending" | "active" | "suspended" | "banned";
  donorProfile?: IDonorProfile;
  createdAt: Date;
  updatedAt: Date;
}

const DonorProfileSchema = new Schema<IDonorProfile>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    foodType: { type: String, required: true },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["Donor", "Recipient", "Admin"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "banned"],
      default: "pending",
    },
    donorProfile: { type: DonorProfileSchema, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
