import { cn } from "@/lib/utils"

const GRADIENT =
  "bg-[radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)]"

/**
 * Aceternity-style animated background gradient.
 * Pure CSS (no motion library) so it cannot trigger duplicate-React issues.
 */
export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}) => {
  const animation = animate
    ? "animate-[bg-gradient-pan_5s_ease-in-out_infinite] [background-size:400%_400%]"
    : undefined

  return (
    <div className={cn("relative p-[4px] group", containerClassName)}>
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] opacity-60 group-hover:opacity-100 blur-xl transition-opacity duration-500 will-change-transform",
          GRADIENT,
          animation
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 rounded-3xl z-[1] will-change-transform",
          GRADIENT,
          animation
        )}
      />

      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  )
}
