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

  // 你如果需要 item 有图（比如从 post 的 image_urls 来）
  image_urls: [{ type: String, default: [] }],

  // 可选：向量库/embedding 的引用
  embedding_id: { type: String, default: '' },
}, { timestamps: true, minimize: false });

itemSchema.index({ owner_user_id: 1, createdAt: -1 });

const Item = mongoose.model('Item', itemSchema);
export default Item;