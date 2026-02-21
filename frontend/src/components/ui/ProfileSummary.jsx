import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import ProfileUploadModal from "./ProfileUploadModal";
import ProfileEditModal from "./ProfileEditModal";

const ProfileSummary = () => {
  const { user } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">

      {/* Profile Image */}
      <div className="w-24 h-24 rounded-full bg-green-600 text-white flex items-center justify-center text-3xl font-bold">
        {user?.name?.charAt(0) || "N"}
      </div>

      {/* Profile Info */}
      <div className="flex-1 text-center md:text-left">

        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {user?.name || "NGO Name"}
        </h2>

        <p className="text-gray-500 dark:text-gray-300">{user?.email || "ngo@email.com"}</p>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">

          <p>
            <span className="font-semibold text-gray-700">Role:</span>{" "}
            <span className="capitalize text-green-600">
              {user?.role || "ngo"}
            </span>
          </p>

          <p>
            <span className="font-semibold text-gray-700">Organization:</span>{" "}
            WasteZero Partner NGO
          </p>

          <p>
            <span className="font-semibold text-gray-700">Location:</span>{" "}
            Kolkata, India
          </p>

          <p>
            <span className="font-semibold text-gray-700">Joined:</span>{" "}
            Feb 2026
          </p>

        </div>
      </div>

      {/* Edit Button */}
      {/* Actions */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => setIsEditOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Edit Profile
        </button>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg mt-2 hover:shadow-sm"
        >
          Edit Picture
        </button>
      </div>

      <ProfileUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <ProfileEditModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />

    </div>
  );
};

export default ProfileSummary;
