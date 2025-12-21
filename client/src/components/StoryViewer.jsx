import React from 'react'
import { BadgeCheck, X } from 'lucide-react'

const StoryViewer = ({ viewStory, setViewStory }) => {

  if (!viewStory) return null

  const handleClose = () => {
    setViewStory(null)
  }

  const renderMedia = () => {
    if (viewStory.media_type === 'image') {
      return (
        <img
          src={viewStory.media_url}
          alt=""
          className="max-w-full max-h-[80vh] object-contain"
        />
      )
    }

    if (viewStory.media_type === 'video') {
      return (
        <video
          src={viewStory.media_url}
          className="max-w-full max-h-[80vh]"
          controls
          autoPlay
          onEnded={handleClose}
        />
      )
    }

    return null
  }

  return (
    <div className="fixed inset-0 h-screen bg-black/90 z-110 flex items-center justify-center">
      {/* Top Progress Bar（占位） */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
        <div className="h-full bg-white" style={{ width: `${progress}%` }} />
      </div>

      {/* User Info */}
      <div className="absolute top-4 left-4 flex items-center gap-3 p-3 rounded bg-black/50 backdrop-blur">
        <img
          src={viewStory.user?.profile_picture}
          alt=""
          className="size-7 rounded-full object-cover border border-white"
        />
        <div className="text-white flex items-center gap-1.5">
          <span className="font-medium">{viewStory.user?.full_name}</span>
          <BadgeCheck size={18} />
        </div>
      </div>

      {/* Close */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-white"
      >
        <X className="w-8 h-8 hover:scale-110 transition" />
      </button>

      {/* Content */}
      <div className="max-w-[90vw] max-h-[90vh] flex flex-col items-center gap-4">
        {renderMedia()}

        {/* Item metadata（只在 item 时显示） */}
        {viewStory.kind === 'item' && viewStory.item_metadata && (
          <div className="w-full max-w-md bg-black/60 text-white rounded-lg p-4 text-sm space-y-1">
            <p className="font-semibold text-base">
              {viewStory.item_metadata.title}
            </p>
            <p className="text-white/70">
              {viewStory.item_metadata.brand} · {viewStory.item_metadata.color}
            </p>
            <p className="text-white/50">
              {viewStory.item_metadata.category} · {viewStory.item_metadata.season}
            </p>

            {viewStory.item_metadata.link && (
              <a
                href={viewStory.item_metadata.link}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 text-indigo-400 underline"
              >
                View product
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StoryViewer
