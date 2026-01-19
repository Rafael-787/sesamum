import { Avatar } from "radix-ui";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: number; // in pixels
  className?: string;
}

export const AvatarComponent: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = 40,
  className = "",
}) => {
  return (
    <Avatar.Root
      className={`inline-block overflow-hidden rounded-lg ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Avatar.Image
          src={src}
          alt={alt}
          className="object-cover w-full h-full"
        />
      ) : (
        <Avatar.Fallback className="flex items-center justify-center w-full h-full bg-primary text-card-primary">
          {alt.charAt(0).toUpperCase()}
        </Avatar.Fallback>
      )}
    </Avatar.Root>
  );
};

export default AvatarComponent;
