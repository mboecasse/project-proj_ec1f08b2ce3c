// File: src/models/Post.js
// Generated: 2025-10-08 12:31:33 UTC
// Project ID: proj_ec1f08b2ce3c
// Task ID: task_z911tqjbu7j5


const mongoose = require('mongoose');


const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      minlength: [10, 'Content must be at least 10 characters long'],
      maxlength: [50000, 'Content cannot exceed 50000 characters']
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      minlength: [2, 'Author name must be at least 2 characters long'],
      maxlength: [100, 'Author name cannot exceed 100 characters'],
      index: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    },
    version: {
      type: Number,
      default: 1,
      min: [1, 'Version must be at least 1']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ isDeleted: 1, createdAt: -1 });
postSchema.index({ author: 1, isDeleted: 1 });

postSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('content')) {
    if (!this.isNew) {
      this.version += 1;
    }
  }
  next();
});

postSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

postSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

postSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

postSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, isDeleted: false });
};

postSchema.statics.findActiveById = function(id) {
  return this.findOne({ _id: id, isDeleted: false });
};

postSchema.statics.countActive = function(filter = {}) {
  return this.countDocuments({ ...filter, isDeleted: false });
};


const Post = mongoose.model('Post', postSchema);

module.exports = Post;
