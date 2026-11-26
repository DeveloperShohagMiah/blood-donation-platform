import { useId } from "react"
import { AlertCircle, Info } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const SIZES = {
  sm: "h-10 text-[13px]",
  md: "h-12 text-sm",
  lg: "h-14 text-sm",
}

/**
 * shadcn Input + Label composed into a field with the login page's
 * icon / hint / error / trailing-action treatment.
 */
function InputField({
  label,
  icon: Icon,
  error,
  hint,
  trailing,
  size = "md",
  id,
  className,
  ...props
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

  return (
    <div className="w-full">
      {label && (
        <Label
          htmlFor={inputId}
          className="mb-2 block text-[0.7rem] font-extrabold tracking-[0.11em] text-muted-foreground uppercase"
        >
          {label}
        </Label>
      )}

      <div className="group relative min-w-0">
        {Icon && (
          <Icon
            size={18}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground transition duration-200 group-focus-within:text-primary"
          />
        )}

        <Input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={messageId}
          className={cn(
            "rounded-md border-input bg-card px-4 shadow-xs",
            "focus-visible:border-primary focus-visible:ring-primary/20",
            SIZES[size],
            Icon && "pl-11",
            trailing && "pr-12",
            error && "border-destructive focus-visible:ring-destructive/20",
            className
          )}
          {...props}
        />

        {trailing && (
          <div className="absolute top-1/2 right-2 -translate-y-1/2">{trailing}</div>
        )}
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-destructive"
        >
          <AlertCircle size={13} />
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info size={13} />
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export { InputField }
