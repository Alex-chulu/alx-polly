"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  /**
   * Renders a customizable label component. It extends the `LabelPrimitive.Root` from `@radix-ui/react-label`
   * and applies additional styling and accessibility attributes using `cn` utility.
   *
   * @param {string} [className] - Optional CSS class names to apply to the label.
   * @param {React.ComponentProps<typeof LabelPrimitive.Root>} props - Additional props passed to the `LabelPrimitive.Root` component.
   */
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
