interface Stat {
  icon: string;
  iconBg: string;
  title: string;
  value: string | number;
  subtitle: string;
}

interface CardProps {
  stat: Stat;
}

const Card: React.FC<CardProps> = ({ stat }) => {
  return (
    <div
      className="
        bg-white rounded-xl
        p-4
        flex flex-col justify-between
        shadow-sm
        w-full
        min-w-[16rem]   /* 💡 wider minimum width */
        max-w-full
        min-h-[9rem]
        font-[SF_Pro_Display]
      "
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.iconBg}`}
      >
        <img src={stat.icon} alt={stat.title} className="w-5 h-5" />
      </div>

      {/* Title */}
      <p className="text-base font-medium text-gray-700 mt-3">{stat.title}</p>

      {/* Row with Value and Subtitle */}
      <div className="flex justify-between items-center mt-2">
        <p className="text-xl font-bold text-black">{stat.value}</p>
        <p
          className={`text-sm ${
            stat.subtitle.startsWith("-") ? "text-red-500" : "text-[#45CB85]"
          }`}
        >
          {stat.subtitle}
        </p>
      </div>
    </div>
  );
};

export default Card;
