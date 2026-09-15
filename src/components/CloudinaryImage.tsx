import React from 'react';
import Image, { ImageProps } from 'next/image';

interface CloudinaryImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  cloudName?: string;
}

export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  cloudName = 'demo-ecommerce',
  alt,
  width,
  height,
  className,
  ...rest
}) => {
  // Check if image is already a remote URL
  const isRemote = src.startsWith('http');
  const finalSrc = isRemote
    ? src
    : `https://res.cloudinary.com/${cloudName}/image/upload/q_auto,f_auto,w_${width || 800}/${src}`;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width || 600}
      height={height || 600}
      className={className}
      unoptimized={isRemote}
      {...rest}
    />
  );
};
