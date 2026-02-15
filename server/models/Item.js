import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  owner_user_id: { type: String, ref: 'User', required: true },

  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['tops', 'bottoms', 'shoes', 'outerwear', 'accessories'],
    required: true,
  },
  color: { type: String, default: '' },
  brand: { type: String, default: '' },
  season: { type: String, default: '' },
  tags: [{ type: String }],
  link: { type: String, default: '' },

  image_urls: [{ type: String, default: [] }],

  // 可选：向量库/embedding 的引用
  embedding_id: { type: String, default: '' },
}, { timestamps: true, minimize: false });

const Item = mongoose.model('Item', itemSchema);
export default Item;