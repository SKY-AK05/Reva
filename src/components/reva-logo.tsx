import Image from 'next/image';

type RevaLogoProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg';
};

export default function RevaLogo({ size = 'lg' }: RevaLogoProps) {
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 64,
    lg: 96,
  };

  const imageSize = sizeMap[size] || 96;

  return (
    <div style={{ width: imageSize, height: imageSize }} className="relative">
      <Image
        src="/assets/Light Logo.svg"
        alt="Reva Logo"
        width={imageSize}
        height={imageSize}
        className="object-contain block dark:hidden"
        unoptimized
      />
      <Image
        src="/assets/Dark Logo.svg"
        alt="Reva Logo"
        width={imageSize}
        height={imageSize}
        className="object-contain hidden dark:block"
        unoptimized
      />
    </div>
  );
}
