import { PlayCircle } from "lucide-react";

const Episode = ({ episode }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition w-full">
      <div className="flex items-start gap-4">
        
        {/* Icon */}
        <PlayCircle className="w-10 h-10 text-green-600 mt-1 shrink-0" />
        
        {/* Details */}
        <div className="flex-grow">
          <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
            {episode.title || "Untitled Episode"}
          </h4>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span>{episode.language || "Unknown Language"}</span> &middot;{" "}
            <span>{episode.duration || "Unknown duration"}</span>
          </div>

          {/* Audio */}
          {episode.audioUrl ? (
            <audio
              controls
              src={episode.audioUrl}
              className="mt-3 w-full"
              preload="none"
            />
          ) : (
            <p className="text-xs mt-2 text-red-500">Audio not available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Episode;
