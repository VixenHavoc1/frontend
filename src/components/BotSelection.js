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
    <div className="h-screen bg-[#2C1F3D] text-white">
      <div className="bg-gradient-to-b from-[#6A2D8C] to-[#F8A5D2] p-4">
        <h1 className="text-3xl font-bold text-center text-white">Voxella AI</h1>
      </div>

      <div className="flex justify-center items-center h-full p-4">
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <div
              key={bot.name}
              className="p-4 rounded-xl shadow-xl transition-all transform hover:scale-105 cursor-pointer relative group"
              onClick={() => onSelect(bot.name)}
            >
              {/* Gradient Background for each model */}
              <div className="h-full bg-gradient-to-b from-[#6A2D8C] to-[#F8A5D2] rounded-xl p-4 flex flex-col items-center">
                {/* Image Section */}
                <div className="h-40 w-40 mb-4 rounded-full overflow-hidden">
                  <img
                    src={bot.image}
                    alt={bot.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info Section */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white mb-2">{bot.name}</h2>
                  <p className="text-lg text-white opacity-80">{bot.vibe} Personality</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
