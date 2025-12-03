import { Badge } from '@/components/ui/primitives/badge';
import { Button } from '@/components/ui/primitives/button';
import { ImageFallback } from '@/components/ui/primitives/image-fallback';
import { useTimerDisplay } from '@/hooks/useTimerDisplay';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/utils/imageUtils';
import { cva, type VariantProps } from 'class-variance-authority';
import Image from 'next/image';
import * as React from 'react';

const auctionCardVariants = cva(
  'bg-background-2 flex flex-col overflow-clip rounded-2xl',
  {
    variants: {
      variant: {
        default: 'min-h-[250px] w-full',
        editable: 'min-h-[298px] w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface AuctionCardHeaderProps {
  status: 'in-progress' | 'outbid' | 'winning' | 'done';
  timeLeft?: string;
  isTimeUrgent?: boolean;
}

const AuctionCardHeader = React.memo(
  ({ status, timeLeft, isTimeUrgent }: AuctionCardHeaderProps) => {
    const getStatusDisplay = () => {
      switch (status) {
        case 'in-progress':
          return 'In progress';
        case 'outbid':
          return 'Outbid';
        case 'winning':
          return 'Winning';
        case 'done':
          return 'Done';
      }
    };

    const getTimeDisplay = () => {
      return status !== 'in-progress' &&
        status !== 'winning' &&
        status !== 'outbid'
        ? 'Ended'
        : timeLeft;
    };

    return (
      <div className="flex items-center justify-between shrink-0 w-full">
        <Badge
          variant={
            ['in-progress', 'outbid', 'winning'].includes(status)
              ? status
              : 'done'
          }
          size="small"
        >
          {getStatusDisplay()}
        </Badge>
        <Badge
          variant={isTimeUrgent ? 'time-urgent' : 'time'}
          size="small"
          showTimeIcon={true}
        >
          {getTimeDisplay()}
        </Badge>
      </div>
    );
  },
);

AuctionCardHeader.displayName = 'AuctionCardHeader';

interface AuctionCardImageProps {
  imageUrl?: string;
  title?: string;
}

const AuctionCardImage = React.memo(
  ({ imageUrl, title }: AuctionCardImageProps) => {
    const [imageError, setImageError] = React.useState(false);

    const handleImageError = React.useCallback(() => {
      setImageError(true);
    }, []);

    return (
      <div className="relative w-full rounded-xl flex-1 min-h-0">
        {imageUrl && !imageError ? (
          <Image
            src={getImageUrl(imageUrl)!}
            alt={title || 'Auction item'}
            className="absolute inset-0 w-full h-full object-cover rounded-xl"
            onError={handleImageError}
            fill
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
    );
  },
);

AuctionCardImage.displayName = 'AuctionCardImage';

interface AuctionCardActionsProps {
  onDelete?: () => void;
  onEdit?: () => void;
}

const AuctionCardActions = React.memo(
  ({ onDelete, onEdit }: AuctionCardActionsProps) => {
    const handleButtonClick = React.useCallback(
      (e: React.MouseEvent, buttonHandler?: () => void) => {
        e.stopPropagation();
        buttonHandler?.();
      },
      [],
    );

    return (
      <div className="flex gap-1 items-center relative shrink-0 w-full">
        <Button
          variant="tertiary"
          onClick={(e) => handleButtonClick(e, onDelete)}
          leftIcon="Delete"
          iconSize={16}
          className="hover:text-red-600"
        />
        <Button
          variant="secondary"
          onClick={(e) => handleButtonClick(e, onEdit)}
          className="flex-1"
          leftIcon="Edit"
          iconSize={16}
        >
          Edit
        </Button>
      </div>
    );
  },
);

AuctionCardActions.displayName = 'AuctionCardActions';

export interface AuctionCardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof auctionCardVariants> {
  title?: string;
  price?: string;
  status?: 'in-progress' | 'outbid' | 'winning' | 'done';
  timeLeft?: string;
  isTimeUrgent?: boolean;
  endTime?: string;
  imageUrl?: string;
  onDelete?: () => void;
  onEdit?: () => void;
  onClick?: () => void;
}

const AuctionCard = React.forwardRef<HTMLDivElement, AuctionCardProps>(
  (
    {
      className,
      variant,
      title,
      price,
      status = 'in-progress',
      timeLeft = '24h',
      isTimeUrgent = false,
      endTime,
      imageUrl,
      onDelete,
      onEdit,
      onClick,
      ...props
    },
    ref,
  ) => {
    const isEditable = variant === 'editable';

    const { displayTimeLeft, displayIsUrgent } = useTimerDisplay({
      staticTimeLeft: timeLeft,
      staticIsUrgent: isTimeUrgent,
      endTime,
    });

    const handleCardClick = React.useCallback(
      (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        onClick?.();
      },
      [onClick],
    );

    return (
      <div
        ref={ref}
        className={cn(
          auctionCardVariants({ variant }),
          className,
          'bg-white',
          onClick && 'cursor-pointer hover:shadow-lg transition-shadow',
        )}
        onClick={handleCardClick}
        {...props}
      >
        <div className="flex flex-col gap-2 p-2 pt-2 pb-1 shrink-0 w-full">
          <AuctionCardHeader
            status={status}
            timeLeft={displayTimeLeft}
            isTimeUrgent={displayIsUrgent}
          />

          <div className="flex flex-col items-start justify-center relative shrink-0 w-full">
            <p className="font-light leading-6 not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-base text-text-primary w-full whitespace-nowrap">
              {title || 'Auction Item'}
            </p>
          </div>

          <p className="font-medium leading-6 not-italic relative shrink-0 text-base text-text-primary">
            {price || '0 €'}
          </p>
        </div>

        <div className="flex flex-col gap-2 items-start justify-center p-1 relative flex-1 min-h-0 min-w-0 w-full">
          <AuctionCardImage imageUrl={imageUrl} title={title} />

          {isEditable && (
            <AuctionCardActions onDelete={onDelete} onEdit={onEdit} />
          )}
        </div>
      </div>
    );
  },
);

AuctionCard.displayName = 'AuctionCard';

const MemoizedAuctionCard = React.memo(AuctionCard, (prevProps, nextProps) => {
  const criticalProps: (keyof AuctionCardProps)[] = [
    'title',
    'price',
    'status',
    'timeLeft',
    'isTimeUrgent',
    'endTime',
    'imageUrl',
    'variant',
    'className',
    'onClick',
  ];

  return criticalProps.every((prop) => prevProps[prop] === nextProps[prop]);
});

MemoizedAuctionCard.displayName = 'AuctionCard';

export { MemoizedAuctionCard as AuctionCard, auctionCardVariants };
