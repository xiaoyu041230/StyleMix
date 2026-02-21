import Message from "../models/Message.js";
import User from "../models/User.js"; // 你需要有 User model

export const getConversations = async (req, res) => {
  try {
    const { userId } = req.auth();

    // 找到所有“跟我有关”的消息（我发的 or 发给我的）
    const msgs = await Message.find({
      $or: [{ from_user_id: userId }, { to_user_id: userId }],
    })
      .sort({ createdAt: -1 })
      .select("from_user_id to_user_id createdAt")
      .lean();

    // 取出对方 userId，并按最近消息顺序去重
    const seen = new Set();
    const peerIds = [];

    for (const m of msgs) {
      const peerId =
        String(m.from_user_id) === String(userId)
          ? String(m.to_user_id)
          : String(m.from_user_id);

      if (!seen.has(peerId)) {
        seen.add(peerId);
        peerIds.push(peerId);
      }
    }

    // 查询对方用户信息
    const users = await User.find({ _id: { $in: peerIds } })
      .select("_id full_name username bio profile_picture")
      .lean();

    // 保持顺序
    const map = new Map(users.map((u) => [String(u._id), u]));
    const ordered = peerIds.map((id) => map.get(id)).filter(Boolean);

    return res.json({ success: true, users: ordered });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};