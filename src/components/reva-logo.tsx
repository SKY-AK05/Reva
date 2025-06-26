type RevaLogoProps = {
  size?: 'sm' | 'md' | 'lg';
}

export default function RevaLogo({ size = 'lg' }: RevaLogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  }

  return (
    <h1 className={`font-bold ${sizeClasses[size]}`}>
      <span className="bg-gradient-to-r from-primary via-blue-400 to-white bg-clip-text text-transparent">
        Reva
      </span>
    </h1>
  );
}
