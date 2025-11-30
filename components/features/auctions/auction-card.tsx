import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { getImageUrl } from "@/lib/image-url"
import { Badge } from "@/components/ui/primitives/badge"
import { Button } from "@/components/ui/primitives/button"
import { ImageFallback } from "@/components/ui/primitives/image-fallback"
import { useAuctionTimer } from "@/hooks/useAuctionTimer"

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
  endTime?: string
  imageUrl?: string
  onDelete?: () => void
  onEdit?: () => void
  onClick?: () => void
}

const AuctionCard = React.forwardRef<HTMLDivElement, AuctionCardProps>(({
  className,
  variant,
  title,
  price,
  status = "in-progress",
  timeLeft = "24h",
  isTimeUrgent = false,
  endTime,
  imageUrl,
  onDelete,
  onEdit,
  onClick,
  ...props
}, ref) => {
  const isEditable = variant === "editable"
  const [imageError, setImageError] = React.useState(false)

  const { timeLeft: dynamicTimeLeft, isTimeUrgent: dynamicIsTimeUrgent } = useAuctionTimer(
    endTime || ""
  )

  const displayTimeLeft = endTime ? dynamicTimeLeft : timeLeft
  const displayIsTimeUrgent = endTime ? dynamicIsTimeUrgent : isTimeUrgent

  const handleImageError = React.useCallback(() => {
    setImageError(true)
  }, [])

  const handleCardClick = React.useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    onClick?.()
  }, [onClick])

  const handleButtonClick = React.useCallback((e: React.MouseEvent, buttonHandler?: () => void) => {
    e.stopPropagation()
    buttonHandler?.()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        auctionCardVariants({ variant }),
        className,
        "bg-white",
        onClick && "cursor-pointer hover:shadow-lg transition-shadow"
      )}
      onClick={handleCardClick}
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
            variant={displayIsTimeUrgent ? "time-urgent" : "time"}
            size="small"
            showTimeIcon={true}
          >
          {status != "in-progress"  && status != "winning" && status != "outbid" ? "Ended" : displayTimeLeft}
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
            <div className="absolute inset-0 w-full h-full">
              <ImageFallback
                text="No Image!"
                className="rounded-xl w-full h-full"
                fallbackType="text"
              />
            </div>
          )}
        </div>

        {isEditable && (
          <div className="flex gap-1 items-center relative shrink-0 w-full">
            <Button
              variant="tertiary"
              onClick={(e) => handleButtonClick(e, onDelete)}
              leftIcon="Delete"
              iconSize={16}
            >
            </Button>
            <Button
              variant="secondary"
              onClick={(e) => handleButtonClick(e, onEdit)}
              className="flex-1 "
              leftIcon="Edit"
              iconSize={16}
            >
              Edit
            </Button>
            <Button
              variant="tertiary"
              onClick={(e) => handleButtonClick(e, onDelete)} 
            >Hey</Button>
          </div>
        )}
      </div>
    </div>
  )
})

const MemoizedAuctionCard = React.memo(AuctionCard, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.price === nextProps.price &&
    prevProps.status === nextProps.status &&
    prevProps.timeLeft === nextProps.timeLeft &&
    prevProps.isTimeUrgent === nextProps.isTimeUrgent &&
    prevProps.endTime === nextProps.endTime &&
    prevProps.imageUrl === nextProps.imageUrl &&
    prevProps.variant === nextProps.variant &&
    prevProps.className === nextProps.className &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onClick === nextProps.onClick
  );
});

MemoizedAuctionCard.displayName = "AuctionCard"

export { MemoizedAuctionCard as AuctionCard, auctionCardVariants }
