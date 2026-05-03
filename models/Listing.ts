import mongoose, { Schema, Document, Types } from "mongoose";
import "./User";

export interface IListing extends Document {
  donorId: Types.ObjectId;
  recipientId?: Types.ObjectId;
  foodName: string;
  quantity: string;
  category: string;
  pickupStartTime: Date;
  pickupEndTime: Date;
  photoUrl?: string;
  status: "available" | "claimed" | "collected" | "cancelled" | "removed";
  claimedAt?: Date;
  removalLog?: { adminId: Types.ObjectId; reason: string; removedAt: Date };
  rating?: { stars: number; comment?: string; ratedAt: Date };
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    foodName: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    pickupStartTime: {
      type: Date,
      required: true,
    },
    pickupEndTime: {
      type: Date,
      required: true,
    },
    photoUrl: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["available", "claimed", "collected", "cancelled", "removed"],
      default: "available",
    },
    claimedAt: {
      type: Date,
      required: false,
    },
    removalLog: {
      adminId: { type: Schema.Types.ObjectId, ref: "User" },
      reason: { type: String },
      removedAt: { type: Date },
    },
    rating: {
      stars: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      ratedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema);
