import mongoose from 'mongoose';
import itemSchema from './item.schema.js';

const storySchema = new mongoose.Schema({
  user: { type: String, ref: 'User', required: true },

  kind: {
    type: String,
    enum: ['media', 'item'],
    default: 'media',
  },

  content: { type: String },

  media_url: { type: String },
  media_type: { type: String, enum: ['image', 'video'] },

  item_metadata: {
    type: itemSchema,
    default: null,
  },

  views_count: [{ type: String, ref: 'User' }],
  background_color: { type: String },
}, { timestamps: true, minimize: false });

const Story = mongoose.model('Story', storySchema);
export default Story;
