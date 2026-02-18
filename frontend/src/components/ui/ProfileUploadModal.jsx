import { useState, useRef } from "react";
import { X, Upload, Camera } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const ProfileUploadModal = ({ isOpen, onClose }) => {
  const { user, updateProfilePicture } = useAuth();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!preview) return;
    
    setIsUploading(true);
    
    try {
      // Convert base64 to blob
      const response = await fetch(preview);
      const blob = await response.blob();
      
      // Create FormData and append the file
      const formData = new FormData();
      formData.append("profilePicture", blob, "profile-picture.jpg");
      
      // Upload to backend
      const uploadResponse = await fetch("http://localhost:5000/api/upload/profile-picture", {
        method: "POST",
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }
      
      const data = await uploadResponse.json();
      
      // Update profile picture with the returned URL
      updateProfilePicture(data.imageUrl);
      
      onClose();
      setPreview(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePicture = () => {
    updateProfilePicture(null);
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Update Profile Picture</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Current Picture / Preview */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : user?.profilePicture ? (
                <img src={user.profilePicture} alt="Current" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || "U"
              )}
            </div>
            <button
              onClick={triggerFileInput}
              className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            {preview ? "Preview of your new profile picture" : "Click the camera icon to upload a new picture"}
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleUpload}
            disabled={!preview || isUploading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
              !preview || isUploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl"
            }`}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Uploading...
              </span>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Picture
              </>
            )}
          </button>

          {user?.profilePicture && (
            <button
              onClick={handleRemovePicture}
              className="w-full py-3 rounded-lg font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              Remove Picture
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileUploadModal;
