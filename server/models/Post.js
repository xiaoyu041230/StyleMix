import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: { type: String, ref: 'User', required: true },
  content: { type: String },
  image_urls: [{ type: String }],

  item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },

  post_type: {
    type: String,
    enum: ['text', 'image', 'text_with_image', 'item', 'text_with_item'],
    required: true,
  },

  likes_count: [{ type: String, ref: 'User' }],
}, { timestamps: true, minimize: false });

const Post = mongoose.model('Post', postSchema)

export default Post;