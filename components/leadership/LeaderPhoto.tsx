import Image from 'next/image';

type LeaderPhotoProps = {
  name: string;
  image: string | null;
  className: string;
  photoClassName: string;
  borderWidth: number;
  ringWidth: number;
  accentWidth: number;
  sizes: string;
  priority?: boolean;
};

export default function LeaderPhoto({
  name,
  image,
  className,
  photoClassName,
  borderWidth,
  ringWidth,
  accentWidth,
  sizes,
  priority = false,
}: LeaderPhotoProps) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      {/* Cyan ring: drawn once around the photo on load, then stays. */}
      <span
        aria-hidden
        className='leader-photo-ring border-cyan-blue absolute inset-0 rounded-full border-solid'
        style={{ borderWidth: accentWidth }}
      />
      <div
        className={`absolute top-1/2 left-1/2 -translate-1/2 rounded-full border-solid border-white ${photoClassName}`}
        style={{
          borderWidth,
          boxShadow: `0 0 0 ${ringWidth}px #000c9a`,
        }}
      >
        <div className='relative size-full overflow-hidden rounded-full bg-black/20'>
          {image && (
            <Image
              src={image}
              alt={name}
              fill
              sizes={sizes}
              priority={priority}
              className='object-cover'
            />
          )}
        </div>
      </div>
    </div>
  );
}
