// src/components/issues/IssueMedia.jsx
import React, { useState } from "react";
const ip = import.meta.env.VITE_BASE_IP

const IssueMedia = ({ media }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const BASE_URL = `http://${ip}:5000`;
  if (!media || media.length === 0) {
    return (
      <div className="mb-6 bg-white rounded-lg shadow-xs dark:bg-gray-800">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Media
          </h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-gray-500 dark:text-gray-400">No media available</p>
        </div>
      </div>
    );
  }

  const imageMedia = media.filter((item) => item.type === "image");
  const audioMedia = media.filter((item) => item.type === "audio");

  return (
    <div className="mb-6 bg-white rounded-lg shadow-xs dark:bg-gray-800">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Media
        </h3>
      </div>

      <div className="px-6 py-4">
        {/* Images */}
        {imageMedia.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Images
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {imageMedia.map((item, index) => (
                <div key={index} className="relative group">
                  <img
                    src={`${BASE_URL}${item.url}`}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedImage(item.url)}
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                    {item.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio Files */}
        {audioMedia.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Audio Recordings
            </h4>
            <div className="space-y-3">
              {audioMedia.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg dark:bg-gray-700"
                >
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-800">
                      <span className="text-blue-600 dark:text-blue-200">
                        🎵
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Audio Recording {index + 1}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.role}
                    </p>
                  </div>
                  <audio controls className="ml-3">
                    <source src={item.url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="max-w-4xl max-h-full">
              <img
                src={selectedImage}
                alt="Enlarged view"
                className="max-w-full max-h-full"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueMedia;
