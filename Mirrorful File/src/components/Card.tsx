import React from 'react';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  hover?: boolean;
}
const Card = ({
  children,
  className = '',
  onClick,
  active = false,
  hover = true
}: CardProps) => {
  return <div className={`
        bg-white rounded-xl shadow-card 
        ${active ? 'border-2 border-primary' : 'border border-light-gray'} 
        ${hover && !active ? 'hover:border-primary/50 transition-colors' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `} onClick={onClick}>
      {children}
    </div>;
};
export const CategoryCard = ({
  title,
  icon,
  active = false,
  onClick
}: {
  title: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) => {
  return <Card active={active} onClick={onClick} className={`flex flex-col items-center justify-center p-6 text-center transition-all ${active ? 'bg-primary/5' : ''}`}>
      <div className={`p-4 rounded-full mb-3 ${active ? 'bg-primary text-white' : 'bg-light-gray text-dark-gray'}`}>
        {icon}
      </div>
      <h3 className="font-medium">{title}</h3>
    </Card>;
};
export default Card;