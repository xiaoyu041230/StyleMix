import StyleMix_logo from './StyleMix_logo.png'
import sample_cover from './sample_cover.jpg'
import sample_profile from './sample_profile.jpg'
import bgImage from './bgImage.png'
import group_users from './group_users.png'
import { Home, MessageCircle, Search, UserIcon, Users } from 'lucide-react'
import sponsored_img from './sponsored_img.png'

export const assets = {
    StyleMix_logo,
    sample_cover,
    sample_profile,
    bgImage,
    group_users,
    sponsored_img
}

export const menuItemsData = [
    { to: '/', label: 'Feed', Icon: Home },
    { to: '/messages', label: 'Messages', Icon: MessageCircle },
    { to: '/connections', label: 'Connections', Icon: Users },
    { to: '/discover', label: 'Discover', Icon: Search },
    { to: '/profile', label: 'Profile', Icon: UserIcon },
];

export const dummyUserData = {
    "_id": "user_2zdFoZib5lNr614LgkONdD8WG32",
    "email": "admin@example.com",
    "full_name": "John Warren",
    "username": "john_warren",
    "bio": "🌍 Dreamer | 📚 Learner | 🚀 Doer\r\nExploring life one step at a time.\r\n✨ Staying curious. Creating with purpose.",
    "profile_picture": sample_profile,
    "cover_photo": sample_cover,
    "location": "New York, NY",
    "followers": ["user_2", "user_3"],
    "following": ["user_2", "user_3"],
    "connections": ["user_2", "user_3"],
    "posts": [],
    "is_verified": true,
    "createdAt": "2025-07-09T09:26:59.231Z",
    "updatedAt": "2025-07-21T06:56:50.017Z",
}

const dummyUser2Data = {
    ...dummyUserData,
    _id: "user_2",
    username: "Richard Hendricks",
    full_name: "Richard Hendricks",
    profile_picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
}

const dummyUser3Data = {
    ...dummyUserData,
    _id: "user_3",
    username: "alexa_james",
    full_name: "Alexa james",
    profile_picture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop",
}

export const dummyStoriesData = [
    // ✅ Item (image) - 带 metadata
    {
        "_id": "story_item_1",
        "user": dummyUserData,
        "kind": "item",
        "content": "",

        "media_url": "https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg",
        "media_type": "image",

        "item_metadata": {
            "title": "Cream Knit Sweater",
            "category": "tops",
            "color": "Cream",
            "brand": "Uniqlo",
            "season": "Fall/Winter",
            "tags": ["minimal", "cozy", "daily"],
            "link": "https://example.com/product/knit-sweater"
        },

        "background_color": "#4f46e5",
        "createdAt": "2025-07-25T08:16:06.958Z",
        "updatedAt": "2025-07-25T08:16:06.958Z",
    },

    // ✅ Media (image) - 纯图片
    {
        "_id": "story_media_img_1",
        "user": dummyUserData,
        "kind": "media",
        "content": "",

        "media_url": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
        "media_type": "image",

        "background_color": "#4f46e5",
        "createdAt": "2025-07-25T08:27:48.134Z",
        "updatedAt": "2025-07-25T08:27:48.134Z",
    },

    // ✅ Media (video) - 纯视频
    {
        "_id": "story_media_vid_1",
        "user": dummyUserData,
        "kind": "media",
        "content": "",

        "media_url": "https://videos.pexels.com/video-files/14447442/14447442-hd_1080_1920_30fps.mp4",
        "media_type": "video",

        "background_color": "#4f46e5",
        "createdAt": "2025-07-25T08:27:21.289Z",
        "updatedAt": "2025-07-25T08:27:21.289Z",
    },

    // ✅ Item (video) - 带 metadata + 视频
    {
        "_id": "story_item_2",
        "user": dummyUser2Data,
        "kind": "item",
        "content": "",

        "media_url": "https://videos.pexels.com/video-files/14447442/14447442-hd_1080_1920_30fps.mp4",
        "media_type": "video",

        "item_metadata": {
            "title": "Black Leather Boots",
            "category": "shoes",
            "color": "Black",
            "brand": "Dr. Martens",
            "season": "Fall/Winter",
            "tags": ["street", "edgy"],
            "link": "https://example.com/product/boots"
        },

        "background_color": "#4f46e5",
        "createdAt": "2025-07-25T08:19:31.080Z",
        "updatedAt": "2025-07-25T08:19:31.080Z",
    },

    // ✅ Item (image) - 换个用户再来一个
    {
        "_id": "story_item_3",
        "user": dummyUser3Data,
        "kind": "item",
        "content": "",

        "media_url": "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg",
        "media_type": "image",

        "item_metadata": {
            "title": "Wide-Leg Jeans",
            "category": "bottoms",
            "color": "Blue",
            "brand": "Levi's",
            "season": "All Season",
            "tags": ["casual", "basic"],
            "link": ""
        },

        "background_color": "#4f46e5",
        "createdAt": "2025-07-25T08:13:18.111Z",
        "updatedAt": "2025-07-25T08:13:18.111Z",
    },
]


export const dummyPostsData = [
    {
        "_id": "68773e977db16954a783839c",
        "user": dummyUserData,
        "content": "We're a small #team with a big vision — working day and night to turn dreams into products, and #products into something people love.",
        "image_urls": [
            "https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg"
        ],
        "post_type": "text_with_image",
        "likes_count": [],
        "createdAt": "2025-07-16T05:54:31.191Z",
        "updatedAt": "2025-07-16T05:54:31.191Z",
    },
    {
        "_id": "686e6d0407845749500c24cd",
        "user": dummyUserData,
        "content": "Unlock your potential—every small step counts. Stay consistent, stay focused, and trust the process. Growth takes time, but every day is a new chance to be better than yesterday. 🌱✨\r\n\r\n#Motivation #GrowthMindset #DailyInspiration #StayFocused #LevelUp #PositiveVibes #KeepGoing #SelfImprovement #MindsetMatters #SuccessJourney",
        "image_urls": [],
        "post_type": "text",
        "likes_count": [],
        "createdAt": "2025-07-09T13:22:12.601Z",
        "updatedAt": "2025-07-09T13:22:12.601Z",
    },
    {
        "_id": "686e6b21de877d29cf02e2a7",
        "user": dummyUserData,
        "content": "This is a sample paragraph with some #hashtags like #socialmedia and #marketing. Let's find them!",
        "image_urls": [],
        "post_type": "text",
        "likes_count": [],
        "createdAt": "2025-07-09T13:14:09.144Z",
        "updatedAt": "2025-07-09T13:14:09.144Z",
    },
    {
        "_id": "686e3e47ba0cf0fecba19947",
        "user": dummyUserData,
        "content": "",
        "image_urls": [
            "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg"
        ],
        "post_type": "image",
        "likes_count": [
            "user_2zdJbcAqiOX9jq2DIueBRQn0lMt"
        ],
        "createdAt": "2025-07-09T10:02:47.213Z",
        "updatedAt": "2025-07-09T10:09:37.075Z",
    },
    {
        "_id": "686e39e86e0585e9e2e58dd3",
        "user": dummyUserData,
        "content": "Finally , got the car !",
        "image_urls": [
            "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg"
        ],
        "post_type": "text_with_image",
        "likes_count": [],
        "createdAt": "2025-07-09T09:44:08.626Z",
        "updatedAt": "2025-07-09T09:44:08.626Z",
    },
    {
        "_id": "686e361389841ba9f2633201",
        "user": dummyUserData,
        "content": "Hello, Everyone this is my first Post",
        "image_urls": [],
        "post_type": "text",
        "likes_count": [],
        "createdAt": "2025-07-09T09:27:47.529Z",
        "updatedAt": "2025-07-09T09:27:47.529Z",
    },

    // ✅ text + item (text optional)
    {
        "_id": "post_item_1",
        "user": dummyUserData,
        "content": "Trying a cozy minimal look today ✨ #minimal #dailyfit",
        "image_urls": [
            "https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg"
        ],
        "post_type": "text_with_item",
        "item": {
            "title": "Cream Knit Sweater",
            "category": "tops",
            "color": "Cream",
            "brand": "Uniqlo",
            "season": "Fall/Winter",
            "tags": ["minimal", "cozy", "daily"],
            "link": "https://example.com/product/knit-sweater"
        },
        "likes_count": [],
        "createdAt": "2025-07-26T10:12:31.191Z",
        "updatedAt": "2025-07-26T10:12:31.191Z"
    },

    // ✅ item only (no text) - but still uses your PostCard item display
    {
        "_id": "post_item_2",
        "user": dummyUser2Data,
        "content": "",
        "image_urls": [
            "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg"
        ],
        "post_type": "item",
        "item": {
            "title": "Wide-Leg Jeans",
            "category": "bottoms",
            "color": "Blue",
            "brand": "Levi's",
            "season": "All Season",
            "tags": ["casual", "basic"],
            "link": ""
        },
        "likes_count": [],
        "createdAt": "2025-07-26T09:02:47.213Z",
        "updatedAt": "2025-07-26T09:02:47.213Z"
    },

    // ✅ text + item (no image_urls) - to test “item card only” UI
    {
        "_id": "post_item_3",
        "user": dummyUser3Data,
        "content": "These boots make every outfit look sharper. #street #edgy",
        "image_urls": [],
        "post_type": "text_with_item",
        "item": {
            "title": "Black Leather Boots",
            "category": "shoes",
            "color": "Black",
            "brand": "Dr. Martens",
            "season": "Fall/Winter",
            "tags": ["street", "edgy"],
            "link": "https://example.com/product/boots"
        },
        "likes_count": [],
        "createdAt": "2025-07-26T12:44:08.626Z",
        "updatedAt": "2025-07-26T12:44:08.626Z"
    },

    // ✅ text + item + multiple images - to test grid layout
    {
        "_id": "post_item_4",
        "user": dummyUserData,
        "content": "Mixing neutrals with a pop of color 🎨 #outfit #color",
        "image_urls": [
            "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
            "https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg"
        ],
        "post_type": "text_with_item",
        "item": {
            "title": "Oversized Blazer",
            "category": "outerwear",
            "color": "Gray",
            "brand": "ZARA",
            "season": "Spring/Fall",
            "tags": ["workwear", "neutral", "layering"],
            "link": "https://example.com/product/blazer"
        },
        "likes_count": [],
        "createdAt": "2025-07-26T15:27:47.529Z",
        "updatedAt": "2025-07-26T15:27:47.529Z"
    }

]

export const dummyRecentMessagesData = [
    {
        "_id": "68833af618623d2de81b5381",
        "from_user_id": dummyUser2Data,
        "to_user_id": dummyUserData,
        "text": "I seen your profile",
        "message_type": "text",
        "media_url": "",
        "seen": true,
        "createdAt": "2025-07-25T08:06:14.436Z",
        "updatedAt": "2025-07-25T08:47:47.768Z",
    },
    {
        "_id": "6878cc3c17a54e4d3748012f",
        "from_user_id": dummyUserData,
        "to_user_id": dummyUserData,
        "text": "This is a Samsung Tablet",
        "message_type": "text",
        "media_url": "",
        "createdAt": "2025-07-17T10:11:08.437Z",
        "updatedAt": "2025-07-25T08:07:11.893Z",
        "seen": true
    },
    {
        "_id": "686fb66c7f0dcbff63b239e7",
        "from_user_id": dummyUser3Data,
        "to_user_id": dummyUserData,
        "text": "how are you",
        "message_type": "text",
        "media_url": "",
        "createdAt": "2025-07-10T12:47:40.510Z",
        "updatedAt": "2025-07-10T12:47:40.510Z",
        "seen": false
    }
]

export const dummyMessagesData = [
    {
        "_id": "6878cc3217a54e4d37480122",
        "from_user_id": "user_2zwZSCMRXQ9GaEEVLgm6akQo96i",
        "to_user_id": "user_2zdFoZib5lNr614LgkONdD8WG32",
        "text": "",
        "message_type": "image",
        "media_url": "https://images.pexels.com/photos/106341/pexels-photo-106341.jpeg",
        "createdAt": "2025-07-17T10:10:58.524Z",
        "updatedAt": "2025-07-25T10:43:50.346Z",
        "seen": true
    },
    {
        "_id": "6878cc3c17a54e4d3748012f",
        "from_user_id": "user_2zwZSCMRXQ9GaEEVLgm6akQo96i",
        "to_user_id": "user_2zdFoZib5lNr614LgkONdD8WG32",
        "text": "This is a Samsung Tablet",
        "message_type": "text",
        "media_url": "",
        "createdAt": "2025-07-17T10:11:08.437Z",
        "updatedAt": "2025-07-25T10:43:50.346Z",
        "seen": true
    },
    {
        "_id": "68835ffc6e4b42b685069def",
        "from_user_id": "user_2zdFoZib5lNr614LgkONdD8WG32",
        "to_user_id": "user_2zwZSCMRXQ9GaEEVLgm6akQo96i",
        "text": "yah , this tablet is good",
        "message_type": "text",
        "media_url": "",
        "seen": false,
        "createdAt": "2025-07-25T10:44:12.753Z",
        "updatedAt": "2025-07-25T10:44:12.753Z",
    },
    {
        "_id": "6878cc2817a54e4d3748010c",
        "from_user_id": "user_2zdFoZib5lNr614LgkONdD8WG32",
        "to_user_id": "user_2zwZSCMRXQ9GaEEVLgm6akQo96i",
        "text": "you can purchase it from amazon",
        "message_type": "text",
        "media_url": "",
        "createdAt": "2025-08-17T10:10:48.956Z",
        "updatedAt": "2025-08-25T10:43:50.346Z",
        "seen": true
    },
]

export const dummyConnectionsData = [
    dummyUserData,
    dummyUser2Data,
    dummyUser3Data
]

export const dummyFollowersData = [
    dummyUser2Data,
    dummyUser3Data
]

export const dummyFollowingData = [
    dummyUser2Data,
    dummyUser3Data
]

export const dummyPendingConnectionsData = [
    dummyUserData
]