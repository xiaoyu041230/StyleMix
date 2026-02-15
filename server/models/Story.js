import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    user: {type: String, ref: 'User', required: true },
    content: {type: String },
    media_url: {type: String },
    item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    media_type: {type: String, enum: ['image', 'video', 'item', 'item_with_image', 'item_with_video'], required: true,},
    views_count: [{type: String, ref: 'User'}],
    background_color: { type: String  },
}, {timestamps: true, minimize: false})

const Story = mongoose.model('Story', storySchema)

export default Story;