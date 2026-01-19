interface cardProps {
  children: React.ReactNode;
}

const Card: React.FC<cardProps> = ({ children }) => {
  return (
    <div className="bg-card-primary rounded-lg p-6 shadow-3xl">{children}</div>
  );
};

export default Card;
