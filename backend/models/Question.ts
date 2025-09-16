import mongoose, { Schema, Document } from 'mongoose';

export interface IPassHistory {
  fromTeam: number;
  toTeam: number;
  at: Date;
}

export interface IQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  gameId: mongoose.Types.ObjectId;
  movieId: mongoose.Types.ObjectId;
  level: 'easy' | 'medium' | 'hard';
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  opened: boolean;
  answered: boolean;
  createdAt: Date;
  updatedAt: Date;
  passHistory: IPassHistory[];
}

const PassHistorySchema = new Schema({
  fromTeam: {
    type: Number,
    required: true,
  },
  toTeam: {
    type: Number,
    required: true,
  },
  at: {
    type: Date,
    default: Date.now,
  },
});

const QuestionSchema: Schema = new Schema({
  gameId: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
  },
  movieId: {
    type: Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  level: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(v: string[]) {
        return v.length === 4;
      },
      message: 'Options must contain exactly 4 choices',
    },
  },
  correctIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  opened: {
    type: Boolean,
    default: false,
  },
  answered: {
    type: Boolean,
    default: false,
  },
  passHistory: [PassHistorySchema],
}, {
  timestamps: true,
});

export default mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
