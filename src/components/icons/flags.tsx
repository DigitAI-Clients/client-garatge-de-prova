export function FlagCA({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="24" fill="#FFD100"/>
      <g fill="#D52B1E">
        <rect y="4.8" width="32" height="2.4"/>
        <rect y="9.6" width="32" height="2.4"/>
        <rect y="14.4" width="32" height="2.4"/>
        <rect y="19.2" width="32" height="2.4"/>
      </g>
    </svg>
  );
}

export function FlagES({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="24" fill="#AA151B"/>
      <rect y="6" width="32" height="12" fill="#F1BF00"/>
    </svg>
  );
}

export function FlagGB({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="24" fill="#00247D"/>
      <path d="M0,0 L32,24 M32,0 L0,24" stroke="#FFF" strokeWidth="3"/>
      <path d="M0,0 L32,24 M32,0 L0,24" stroke="#CF142B" strokeWidth="1.5"/>
      <path d="M16,0 V24 M0,12 H32" stroke="#FFF" strokeWidth="5"/>
      <path d="M16,0 V24 M0,12 H32" stroke="#CF142B" strokeWidth="2.5"/>
    </svg>
  );
}