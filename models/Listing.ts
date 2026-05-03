import mongoose, { Schema, Document, Types } from "mongoose";

export interface IListing extends Document {
  donorId: Types.ObjectId;
  foodName: string;
  quantity: string;
  category: string;
  pickupStartTime: Date;
  pickupEndTime: Date;
  photoUrl?: string;
  status: "available" | "claimed" | "collected" | "cancelled";
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
      enum: ["available", "claimed", "collected", "cancelled"],
      default: "available",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema);
