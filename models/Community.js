import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['discussion', 'support_group', 'success_story'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  schedule: {
    day: String,
    time: String,
    timezone: String
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
communitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Community = mongoose.model('Community', communitySchema);

export default Community; 