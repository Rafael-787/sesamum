interface cardProps {
  children: React.ReactNode;
}

const Card: React.FC<cardProps> = ({ children }) => {
  return <div className="bg-surface rounded-lg p-6 shadow-sm">{children}</div>;
};

export default Card;
