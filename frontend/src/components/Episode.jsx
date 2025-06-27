import { Play } from "lucide-react";

// components/Episode.jsx
const Episode = ({ episode }) => {
  return (
    <div className="p-4 border rounded-lg shadow bg-white dark:bg-gray-800">
      <h3 className="font-semibold">{episode.title}</h3>
      <p className="text-sm text-gray-600">{episode.language || "English"}</p>
      <p className="text-xs text-gray-500 mb-2">{episode.duration}</p>
      <audio controls className="w-full">
        <source src={episode.audioUrl} type="audio/mpeg" />
        Your browser does not support audio playback.
      </audio>
    </div>
  );
};

export default Episode;
