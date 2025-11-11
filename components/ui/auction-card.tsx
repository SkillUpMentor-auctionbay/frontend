import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { getImageUrl } from "@/lib/image-url"
import { Badge } from "./badge"
import { Button } from "./button"

const auctionCardVariants = cva(
  "bg-background-2 flex flex-col overflow-clip rounded-2xl",
  {
    variants: {
      variant: {
        default: "min-h-[250px] w-full",
        editable: "min-h-[298px] w-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface AuctionCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof auctionCardVariants> {
  title?: string
  price?: string
  status?: "in-progress" | "outbid" | "winning" | "done"
  timeLeft?: string
  isTimeUrgent?: boolean
  imageUrl?: string
  onDelete?: () => void
  onEdit?: () => void
}

const AuctionCard = React.forwardRef<HTMLDivElement, AuctionCardProps>(({
  className,
  variant,
  title,
  price,
  status = "in-progress",
  timeLeft = "24h",
  isTimeUrgent = false,
  imageUrl,
  onDelete,
  onEdit,
  ...props
}, ref) => {
  const isEditable = variant === "editable"
  const [imageError, setImageError] = React.useState(false)

  const handleImageError = React.useCallback(() => {
    setImageError(true)
  }, [])

  return (
    <div
      ref={ref}
      className={cn(auctionCardVariants({ variant }), className, "bg-white")}
      {...props}
    >
      <div className="flex flex-col gap-2 p-2 pt-2 pb-1 shrink-0 w-full">
        <div className="flex items-center justify-between shrink-0 w-full ">
          <Badge
            variant={status === "in-progress" ? "in-progress" : status === "outbid" ? "outbid" : status === "winning" ? "winning" : "done"}
            size="small"
          >
            {status === "in-progress" ? "In progress" : status === "outbid" ? "Outbid" : status === "winning" ? "Winning" : "Done"}
          </Badge>
          <Badge
            variant={isTimeUrgent ? "time-urgent" : "time"}
            size="small"
            showTimeIcon={true}
          >
            {timeLeft}
          </Badge>
        </div>

        <div className="flex flex-col items-start justify-center relative shrink-0 w-full">
          <p className="font-light leading-6 not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-base text-text-primary w-full whitespace-nowrap">
            {title || "Auction Item"}
          </p>
        </div>

        <p className="font-medium leading-6 not-italic relative shrink-0 text-base text-text-primary">
          {price || "0 €"}
        </p>
      </div>

      <div className="flex flex-col gap-2 items-start justify-center p-1 relative flex-1 min-h-0 min-w-0 w-full">
        <div className="relative w-full rounded-xl flex-1 min-h-0">
          {imageUrl && !imageError ? (
            <img
              src={getImageUrl(imageUrl)}
              alt={title || "Auction item"}
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
              loading="lazy"
              decoding="async"
              onError={handleImageError}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gray-20 rounded-xl flex items-center justify-center">
              <span className="text-gray-60 text-sm">No Image</span>
            </div>
          )}
        </div>

        {isEditable && (
          <div className="flex gap-1 items-center relative shrink-0 w-full">
            <Button
              variant="tertiary"
              onClick={onDelete}
              leftIcon="Delete"
              iconSize={16}
            >
            </Button>
            <Button
              variant="secondary"
              onClick={onEdit}
              className="flex-1 "
              leftIcon="Edit"
              iconSize={16}
            >
              Edit
            </Button>
          </div>
        )}
      </div>
    </div>
  )
})

AuctionCard.displayName = "AuctionCard"

export { AuctionCard, auctionCardVariants }