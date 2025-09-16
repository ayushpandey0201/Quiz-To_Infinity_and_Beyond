import mongoose, { Schema, Document } from 'mongoose';

export interface IMovie extends Document {
  _id: mongoose.Types.ObjectId;
  gameId: mongoose.Types.ObjectId;
  title: string;
  index: number;
  levels: {
    easy: mongoose.Types.ObjectId;
    medium: mongoose.Types.ObjectId;
    hard: mongoose.Types.ObjectId;
  };
}

const MovieSchema: Schema = new Schema({
  gameId: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  index: {
    type: Number,
    required: true,
  },
  levels: {
    easy: {
      type: Schema.Types.ObjectId,
      ref: 'Level',
    },
    medium: {
      type: Schema.Types.ObjectId,
      ref: 'Level',
    },
    hard: {
      type: Schema.Types.ObjectId,
      ref: 'Level',
    },
  },
}, {
  timestamps: true,
});

export default mongoose.models.Movie || mongoose.model<IMovie>('Movie', MovieSchema);

