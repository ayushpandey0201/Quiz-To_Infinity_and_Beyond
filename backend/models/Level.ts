import mongoose, { Schema, Document } from 'mongoose';

export interface ILevel extends Document {
  _id: mongoose.Types.ObjectId;
  movieId: mongoose.Types.ObjectId;
  levelName: 'easy' | 'medium' | 'hard';
  questions: mongoose.Types.ObjectId[];
}

const LevelSchema: Schema = new Schema({
  movieId: {
    type: Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  levelName: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'Question',
  }],
}, {
  timestamps: true,
});

export default mongoose.models.Level || mongoose.model<ILevel>('Level', LevelSchema);
