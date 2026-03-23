interface SpoonIconProps {
  className?: string;
}

export function SpoonIcon({ className = "w-5 h-5" }: SpoonIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Flowy swoosh behind */}
      <path
        d="M4 8C4 8 6 4 10 6C14 8 12 12 16 14C20 16 22 12 22 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
      
      {/* Round spoon bowl */}
      <ellipse
        cx="12"
        cy="8"
        rx="3.5"
        ry="4"
        fill="currentColor"
      />
      
      {/* Spoon handle */}
      <path
        d="M12 12C12 12 11.5 14 11.5 16C11.5 18 11.5 20 11.5 20C11.5 20.5 12 21 12 21C12 21 12.5 20.5 12.5 20C12.5 20 12.5 18 12.5 16C12.5 14 12 12 12 12Z"
        fill="currentColor"
      />
    </svg>
  );
}
