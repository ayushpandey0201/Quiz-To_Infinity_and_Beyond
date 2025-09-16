import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  _id: mongoose.Types.ObjectId;
  gameId: mongoose.Types.ObjectId;
  teamNumber: number;
  score: number;
  correctCount: number;
  wrongCount: number;
}

const TeamSchema: Schema = new Schema({
  gameId: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  teamNumber: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  correctCount: {
    type: Number,
    default: 0,
  },
  wrongCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Ensure unique team numbers per game
TeamSchema.index({ gameId: 1, teamNumber: 1 }, { unique: true });

export default mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);

