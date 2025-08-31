"use client"

import { Star } from "lucide-react"

interface RatingDisplayProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  className?: string
}

export function RatingDisplay({
  rating,
  maxRating = 5,
  size = "md",
  showValue = true,
  className = "",
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  const starSize = sizeClasses[size]

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1
          const isFilled = starValue <= Math.floor(rating)
          const isHalfFilled = starValue === Math.ceil(rating) && rating % 1 !== 0

          return (
            <Star
              key={index}
              className={`${starSize} ${
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : isHalfFilled
                    ? "fill-yellow-200 text-yellow-400"
                    : "text-gray-300"
              }`}
            />
          )
        })}
      </div>
      {showValue && (
        <span className={`font-medium ${size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
