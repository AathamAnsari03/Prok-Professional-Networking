import React from 'react';

interface ProfileCardProps {
  profile: any;
  onEdit: () => void;
  onUpload: () => void;
  onEndorse: (skill: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onEdit, onUpload, onEndorse }) => (
  <div className="glass neon p-8 max-w-md w-full flex flex-col items-center text-center mt-12 shadow-xl transition-transform hover:scale-105 duration-300">
    <div className="relative mb-4">
      <img
        src={profile.photo}
        alt="Profile"
        className="w-32 h-32 rounded-full border-4 border-neonBlue shadow-neon object-cover mx-auto transition-transform hover:scale-110 duration-300"
      />
      <button
        className="absolute bottom-2 right-2 bg-neonPurple text-white px-2 py-1 rounded-full text-xs shadow-neon hover:bg-neonBlue hover:text-black transition"
        onClick={onUpload}
      >
        <span className="animate-pulse">Upload</span>
      </button>
    </div>
    <h1 className="text-3xl font-bold font-inter mb-1 flex items-center justify-center gap-2">
      {profile.name}
      <span className="bg-neonBlue text-black px-2 py-0.5 rounded-full text-xs font-semibold ml-2 animate-glow">Admin</span>
    </h1>
    <p className="text-neonBlue mb-2">{profile.location}</p>
    <p className="mb-4 text-sm opacity-80">{profile.bio}</p>
    <div className="flex flex-wrap gap-2 justify-center mb-4">
      {profile.skills.map((skill: any) => (
        <span
          key={skill.name}
          className="bg-neonBlue/20 text-neonBlue px-3 py-1 rounded-full font-semibold shadow-neon text-xs flex items-center gap-1 hover:bg-neonPurple/30 transition cursor-pointer animate-bounce"
          onClick={() => onEndorse(skill.name)}
        >
          {skill.name} <span className="bg-neonPurple text-white px-2 py-0.5 rounded-full ml-1 animate-pulse">+{skill.endorsements}</span>
        </span>
      ))}
    </div>
    <div className="mb-2">
      <span className="font-bold">Education:</span> {profile.education}
    </div>
    <div className="mb-2">
      <span className="font-bold">Languages:</span> {profile.languages.join(', ')}
    </div>
    <div className="mb-2">
      <span className="font-bold">Contact:</span> {profile.contact}
    </div>
    <button
      className="mt-4 px-6 py-2 bg-neonPurple text-white rounded-full shadow-neon font-bold transition hover:bg-neonBlue hover:text-black animate-glow"
      onClick={onEdit}
    >
      Edit Profile
    </button>
  </div>
);

export default ProfileCard; 