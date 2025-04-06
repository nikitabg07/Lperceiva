import { useState, useEffect } from "react";
import axios from "axios";
import VideoPlayer from "../../components/VideoPlayer";

const API_URL = "https://voicea-back-ldg3.onrender.com/api/videos";

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  uploadedAt: string;
}

interface StudentViewVideosProps {
  userRole: string;
  userEmail: string;
}

const StudentViewVideos: React.FC<StudentViewVideosProps> = ({ userRole, userEmail }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await axios.get(API_URL);
      const sortedVideos = res.data.sort(
        (a: Video, b: Video) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
      setVideos(sortedVideos);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const handleVideoEnd = () => {
    if (playingIndex !== null && playingIndex < videos.length - 1) {
      setPlayingIndex((prev) => (prev !== null ? prev + 1 : null));
    } else {
      setPlayingIndex(null);
    }
  };

  const handleDelete = async (videoId: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this video?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/${videoId}`);
      setVideos((prev) => prev.filter((vid) => vid._id !== videoId));
      if (playingIndex !== null && videos[playingIndex]?._id === videoId) {
        setPlayingIndex(null);
      }
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-purple-600 text-center mb-6">
        {userRole === "teacher" ? "Teacher" : "Student"}: View Uploaded Videos
      </h2>

      {videos.length === 0 ? (
        <p className="text-center text-gray-600">No videos available.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((vid, index) => (
            <div
              key={vid._id}
              className={`p-4 rounded-lg shadow-lg border ${
                playingIndex === index ? "border-blue-600" : "border-transparent"
              } bg-white`}
            >
              <h3 className="text-lg font-semibold text-gray-800">{vid.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{vid.description}</p>
              <p className="text-xs text-gray-500 italic">
                Uploaded at: {new Date(vid.uploadedAt).toLocaleString()}
              </p>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setPlayingIndex(index)}
                  className="text-blue-600 hover:underline"
                >
                  ▶ {playingIndex === index ? "Now Playing" : "Play"}
                </button>

                {userRole === "teacher" && (
                  <button
                    onClick={() => handleDelete(vid._id)}
                    className="text-red-600 hover:underline"
                  >
                    🗑 Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {playingIndex !== null && videos[playingIndex] && (
        <div className="mt-10">
          <h3 className="text-xl font-bold text-gray-700 mb-2">Now Playing:</h3>
          <VideoPlayer
            videoUrl={videos[playingIndex].videoUrl}
            onClose={() => setPlayingIndex(null)}
            onEnded={handleVideoEnd}
          />
        </div>
      )}
    </div>
  );
};

export default StudentViewVideos;
