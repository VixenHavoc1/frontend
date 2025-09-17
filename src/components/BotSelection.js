"use client";

export default function BotSelection({ onSelect }) {
  const bots = [
    { 
      name: "Lily", 
      vibe: "Submissive", 
      image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic10.png" 
    },
    { 
      name: "Raven", 
      vibe: "Teasing", 
      image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic12.png" 
    },
    { 
      name: "Plaksha", 
      vibe: "Toxic", 
      image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic11.png" 
    },
  ];

  return (
    <div className="min-h-screen bg-[#2C1F3D] text-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#6A2D8C] to-[#F8A5D2] p-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-white">
          Voxella AI
        </h1>
      </div>

      {/* Bot Grid */}
      <div className="flex-1 flex justify-center items-center p-4">
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <div
              key={bot.name}
              className="p-4 rounded-xl shadow-xl transition-transform transform hover:scale-105 cursor-pointer relative group"
              onClick={() => onSelect(bot.name)}
            >
              <div className="h-full bg-gradient-to-b from-[#6A2D8C] to-[#F8A5D2] rounded-xl p-4 flex flex-col items-center">
                {/* Image */}
                <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 mb-4 rounded-full overflow-hidden">
                  <img
                    src={bot.image}
                    alt={bot.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="text-center">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                    {bot.name}
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-white opacity-80">
                    {bot.vibe} Personality
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

