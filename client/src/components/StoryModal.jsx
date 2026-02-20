import { useAuth } from '@clerk/clerk-react'
import { ArrowLeft, Sparkle, TextIcon, Upload } from 'lucide-react'
import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const StoryModal = ({ setShowModal, fetchStories }) => {

    const bgColors = ["#4f46e5", "#7c3aed", "#db2777", "#e11d48", "#ca8a04", "#0d9488"]

    const [mode, setMode] = useState("item")
    const [background, setBackground] = useState(bgColors[0])
    const [text, setText] = useState("")
    const [media, setMedia] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const fileInputRef = useRef(null)

    const { getToken } = useAuth()

    const MAX_VIDEO_DURATION = 60; // seconds
    const MAX_VIDEO_SIZE_MB = 50; // MB

    const [itemMeta, setItemMeta] = useState({
        title: '',
        category: 'tops',
        color: '',
        brand: '',
        season: '',
        link: '',
        tags: '',
    })

    const updateItemMeta = (key, value) => {
        setItemMeta(prev => ({ ...prev, [key]: value }))
    }

    const handleMediaUpload = (e, targetMode = mode)=>{
        const file = e.target.files?.[0]
        if(file){
            if(file.type.startsWith("video")){
                if(file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024){
                    toast.error(`Video file size cannot exceed ${MAX_VIDEO_SIZE_MB}MB.`)
                    setMedia(null)
                    setPreviewUrl(null)
                    return;
                }
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = ()=>{
                    window.URL.revokeObjectURL(video.src)
                    if(video.duration > MAX_VIDEO_DURATION){
                        toast.error("Video duration cannot exceed 1 minute.")
                        setMedia(null)
                        setPreviewUrl(null)
                    }else{
                        setMedia(file)
                        setPreviewUrl(URL.createObjectURL(file))
                        setText('')
                        setMode(targetMode)
                    }
                }
                video.src = URL.createObjectURL(file)
            }else if(file.type.startsWith("image")){
                setMedia(file)
                setPreviewUrl(URL.createObjectURL(file))
                setText('')
                setMode(targetMode)
            }
        }
    }

    const handleCreateStory = async () => {
        const media_type = media?.type?.startsWith('image') ? 'image' : 'video'

        // 校验
        if (mode === 'media' && !media) {
            throw new Error('Please upload an image or video')
        }

        if (mode === 'item') {
            if (!media) throw new Error('Please upload an image or video')
            if (!itemMeta?.title?.trim()) throw new Error('Please enter an item title')
            if (!itemMeta?.category) throw new Error('Please choose a category')
        }

        // FormData
        const formData = new FormData()
        formData.append('kind', mode) // 'item' | 'media'
        formData.append('media_type', media_type)
        formData.append('media', media)
        formData.append('background_color', background)

        if (mode === 'item') {
            const tagsArr = itemMeta?.tags
                ? itemMeta.tags.split(',').map(t => t.trim()).filter(Boolean)
                : []

            formData.append(
                'item_metadata',
                JSON.stringify({
                    ...itemMeta,
                    tags: tagsArr,
                })
            )
        }

        const token = await getToken()

        try {
            const { data } = await api.post('/api/story/create', formData, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (data.success) {
                setShowModal(false)
                toast.success('Story created successfully')
                fetchStories?.()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className='fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur text-white flex items-center justify-center p-4'>
            <div className='w-full max-w-md'>

                {/* Header */}
                <div className='text-center mb-4 flex items-center justify-between'>
                    <button onClick={() => setShowModal(false)} className='text-white p-2 cursor-pointer'>
                        <ArrowLeft />
                    </button>
                    <h2 className='text-lg font-semibold'>Create Story</h2>
                    <span className="w-10"></span>
                </div>

                {/* Preview / Item form container */}
                <div className='rounded-lg h-96 flex items-center justify-center relative' style={{ backgroundColor: background }}>
                    {mode === 'item' && (
                        <div className='w-full h-full p-4 overflow-y-auto'>
                            <div className='space-y-3 text-sm'>

                                {/* Upload / Preview (clickable) */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className='w-full h-44 rounded-lg bg-black/20 border border-white/20 overflow-hidden cursor-pointer flex items-center justify-center'
                                >
                                    {!previewUrl ? (
                                        <div className='flex flex-col items-center gap-2 text-white/80'>
                                            <Upload className='w-7 h-7' />
                                            <p className='text-xs'>Click to upload photo/video (required)</p>
                                        </div>
                                    ) : (
                                        media?.type.startsWith('image') ? (
                                            <img src={previewUrl} alt="" className='w-full h-full object-cover' />
                                        ) : (
                                            <video src={previewUrl} className='w-full h-full object-cover' controls />)
                                    )}
                                </div>

                                {/* hidden input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={handleMediaUpload}
                                />

                                <input className='w-full p-2 rounded text-black'
                                    placeholder='Item title (required)'
                                    value={itemMeta.title}
                                    onChange={(e) => updateItemMeta('title', e.target.value)}
                                />

                                <select
                                    className='w-full p-2 rounded text-black'
                                    value={itemMeta.category}
                                    onChange={(e) => updateItemMeta('category', e.target.value)}
                                >
                                    <option value="tops">Tops</option>
                                    <option value="bottoms">Bottoms</option>
                                    <option value="shoes">Shoes</option>
                                    <option value="outerwear">Outerwear</option>
                                    <option value="accessories">Accessories</option>
                                </select>

                                <div className='flex gap-2'>
                                    <input
                                        className='w-1/2 p-2 rounded text-black'
                                        placeholder='Color'
                                        value={itemMeta.color}
                                        onChange={(e) => updateItemMeta('color', e.target.value)}
                                    />
                                    <input
                                        className='w-1/2 p-2 rounded text-black'
                                        placeholder='Brand'
                                        value={itemMeta.brand}
                                        onChange={(e) => updateItemMeta('brand', e.target.value)}
                                    />
                                </div>

                                <div className='flex gap-2'>
                                    <input
                                        className='w-1/2 p-2 rounded text-black'
                                        placeholder='Season'
                                        value={itemMeta.season}
                                        onChange={(e) => updateItemMeta('season', e.target.value)}
                                    />
                                    <input
                                        className='w-1/2 p-2 rounded text-black'
                                        placeholder='Tags (comma)'
                                        value={itemMeta.tags}
                                        onChange={(e) => updateItemMeta('tags', e.target.value)}
                                    />
                                </div>

                                <input
                                    className='w-full p-2 rounded text-black'
                                    placeholder='Product link (optional)'
                                    value={itemMeta.link}
                                    onChange={(e) => updateItemMeta('link', e.target.value)}
                                />

                                <p className='text-white/70 text-xs'>
                                    Upload a photo/video below (required).
                                </p>
                            </div>
                        </div>
                    )}
                    {mode === 'media' && (
                        previewUrl ? (
                            media?.type.startsWith('image') ? (
                                <img src={previewUrl} alt="" className='object-contain max-h-full' />
                            ) : (
                                <video src={previewUrl} className='object-contain max-h-full' controls />)
                        ) : (
                            <p className="text-white/70 text-sm">Upload a photo/video to preview.</p>
                        )
                    )}
                </div>

                <div className='flex mt-4 gap-2'>
                    {bgColors.map((color) => (
                        <button key={color} className='w-6 h-6 rounded-full ring cursor-pointer' style={{ backgroundColor: color }} onClick={() => setBackground(color)} />
                    ))}
                </div>

                {/* kind switch */}
                <div className='flex gap-2 mt-4'>
                    <button onClick={() => { setMode('item') }}
                        className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${mode === 'item' ? "bg-white text-black" : "bg-zinc-800"}`}>
                        <TextIcon size={18} /> item
                    </button>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${mode === 'media' ? "bg-white text-black" : "bg-zinc-800"}`}>
                        <input onChange={(e) => { handleMediaUpload(e, 'media') }} type="file" accept='image/*,video/*' className='hidden' />
                        <Upload size={18} /> Photo/Video
                    </label>
                </div>
                <button onClick={() => toast.promise(handleCreateStory(), {
                    loading: 'Saving...'
                })} className='flex items-center justify-center gap-2 text-white py-3 mt-4 w-full rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition cursor-pointer'>
                    <Sparkle size={18} /> Create Story
                </button>
            </div>
        </div>
    )
}

export default StoryModal