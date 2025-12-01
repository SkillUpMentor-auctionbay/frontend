import { useAuctionTimer } from "@/hooks/useAuctionTimer"

interface UseTimerDisplayProps {
  staticTimeLeft?: string
  staticIsUrgent?: boolean
  endTime?: string
}

export function useTimerDisplay({
  staticTimeLeft,
  staticIsUrgent = false,
  endTime
}: UseTimerDisplayProps) {
  const { timeLeft: dynamicTimeLeft, isTimeUrgent: dynamicIsUrgent } = useAuctionTimer(
    endTime || ""
  )

  const displayTimeLeft = endTime ? dynamicTimeLeft : staticTimeLeft
  const displayIsUrgent = endTime ? dynamicIsUrgent : staticIsUrgent

  return {
    displayTimeLeft,
    displayIsUrgent
  }
}