"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarDays, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field } from "@/components/ui/field"
import { Label as FieldLabel } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const pad = (value) => String(value).padStart(2, "0")

const toInputDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const parseValue = (value) => {
  if (!value) return undefined
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

const formatDisplay = (value, withTime) => {
  const date = parseValue(value)
  if (!date) return ""
  const label = format(date, "PPP")
  return withTime ? `${label} · ${String(value).split("T")[1]?.slice(0, 5) || ""}` : label
}

/* Demo from the shadcn docs, kept as-is with this project's component names. */
export function DatePickerSimple() {
  const [date, setDate] = React.useState()

  return (
    <Field className="mx-auto w-44">
      <FieldLabel htmlFor="date-picker-simple">Date</FieldLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" id="date-picker-simple" className="justify-start font-normal">
            <CalendarDays className="size-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={date}
          />
        </PopoverContent>
      </Popover>
    </Field>
  )
}

/**
 * Controlled shadcn DatePicker used by the app forms (react-hook-form ready).
 */
function DatePicker({
  value,
  onChange,
  onBlur,
  disabled = false,
  withTime = false,
  min,
  max,
  placeholder = "Select a date",
  className,
  error,
  ...props
}) {
  const matchers = [
    ...(min ? [{ before: new Date(`${min}T00:00:00`) }] : []),
    ...(max ? [{ after: new Date(`${max}T23:59:59`) }] : []),
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          className={cn(
            "flex h-12 w-full items-center gap-2 rounded-xl border border-input bg-background px-4 text-left text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive/10",
            className
          )}
          {...props}
        >
          <CalendarDays size={17} className="shrink-0 text-muted-foreground" />
          <span className={cn(!value && "text-muted-foreground")}>
            {value ? formatDisplay(value, withTime) : placeholder}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={parseValue(value)}
          onSelect={(date) => {
            if (!date) {
              onChange?.("")
              return
            }
            const day = toInputDate(date)
            onChange?.(withTime ? `${day}T${String(value).split("T")[1]?.slice(0, 5) || "09:00"}` : day)
          }}
          disabled={matchers.length ? matchers : undefined}
          initialFocus
        />

        {withTime && (
          <div className="flex items-center gap-2 border-t border-border p-3">
            <Clock size={15} className="shrink-0 text-muted-foreground" />
            <input
              type="time"
              aria-label="Time"
              value={String(value).split("T")[1]?.slice(0, 5) || "09:00"}
              onChange={(event) => {
                const day = String(value).split("T")[0] || toInputDate(new Date())
                onChange?.(`${day}T${event.target.value}`)
              }}
              className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm outline-none focus-visible:border-primary"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
