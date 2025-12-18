
import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, color = 'text-blue-400' }) => {
  return (
    <div className="bg-[#1e1f20] hover:bg-[#2e2f30] p-6 rounded-2xl border border-white/5 transition-all duration-300 hover:scale-[1.02] hover:border-white/10 cursor-pointer group">
      <div className={`mb-6 ${color} transition-transform group-hover:scale-110 w-8 h-8`}>
        {icon}
      </div>
      <h3 className="text-white font-medium mb-1">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
