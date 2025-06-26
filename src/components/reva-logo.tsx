import Image from 'next/image';

type RevaLogoProps = {
  size?: 'sm' | 'md' | 'lg';
};

export default function RevaLogo({ size = 'lg' }: RevaLogoProps) {
  const sizeMap = {
    sm: 32,
    md: 64,
    lg: 96,
  };

  const imageSize = sizeMap[size] || 96;

  return (
    <Image
      src="/assets/logo.png"
      alt="Reva Logo"
      width={imageSize}
      height={imageSize}
      className="object-contain"
    />
  );
}
