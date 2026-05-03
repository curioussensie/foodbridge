import mongoose, { Schema, Document } from "mongoose";

export interface IDonorProfile {
  name: string;
  address: string;
  contact: string;
  foodType: string;
}

export interface INgoProfile {
  orgName: string;
  registrationNumber: string;
  contactPerson: string;
  phone: string;
}

export interface IAdminLog {
  adminId: mongoose.Types.ObjectId;
  action: "suspended" | "banned" | "restored";
  reason: string;
  timestamp: Date;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: "Donor" | "Recipient" | "Admin";
  status: "pending" | "active" | "suspended" | "banned" | "rejected";
  rejectionReason?: string;
  donorProfile?: IDonorProfile;
  ngoProfile?: INgoProfile;
  adminLogs?: IAdminLog[];
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

const NgoProfileSchema = new Schema<INgoProfile>(
  {
    orgName: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    contactPerson: { type: String, required: true },
    phone: { type: String, required: true },
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
      enum: ["pending", "active", "suspended", "banned", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, required: false },
    donorProfile: { type: DonorProfileSchema, required: false },
    ngoProfile: { type: NgoProfileSchema, required: false },
    adminLogs: [
      {
        adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        action: { type: String, enum: ["suspended", "banned", "restored"], required: true },
        reason: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
