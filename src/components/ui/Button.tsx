import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary';

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'border-petroleo bg-petroleo text-blanco hover:bg-petroleo-oscuro',
  secondary: 'border-petroleo bg-blanco text-petroleo hover:bg-niebla',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-base inline-flex min-h-11 items-center justify-center gap-2 border px-4 py-2 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    />
  );
}
