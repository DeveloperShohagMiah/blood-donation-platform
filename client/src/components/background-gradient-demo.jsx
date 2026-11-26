import { BackgroundGradient } from "@/components/ui/background-gradient"
import { cn } from "@/lib/utils"

/**
 * Aceternity UI — Background Gradient Demo (adapted).
 * The original demo renders a product card. Here it wraps whatever you pass in,
 * so it can frame the login form while keeping the gradient effect intact.
 */
export default function BackgroundGradientDemo({
  children,
  className,
  containerClassName,
  animate = true,
}) {
  return (
    <BackgroundGradient
      animate={animate}
      containerClassName={cn("w-full max-w-[27.5rem]", containerClassName)}
      className={cn("rounded-[1.6rem]", className)}
    >
      {children}
    </BackgroundGradient>
  )
}
