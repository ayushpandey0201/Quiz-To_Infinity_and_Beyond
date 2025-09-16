import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  movies: mongoose.Types.ObjectId[];
  status: 'not-started' | 'live' | 'finished';
  allowShowAnswer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  movies: [{
    type: Schema.Types.ObjectId,
    ref: 'Movie',
  }],
  status: {
    type: String,
    enum: ['not-started', 'live', 'finished'],
    default: 'not-started',
  },
  allowShowAnswer: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);

