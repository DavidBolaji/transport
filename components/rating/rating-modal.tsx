"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ratingService } from "@/services/rating-service"
import type { Booking } from "@/types"
import { Star, MapPin, Calendar } from "lucide-react"
import { format } from "date-fns"

interface RatingModalProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
  onRatingSubmitted: () => void
}

export function RatingModal({ booking, isOpen, onClose, onRatingSubmitted }: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!booking || rating === 0) return

    setIsSubmitting(true)
    try {
      await ratingService.createRating({
        passengerId: booking.passengerId,
        tripId: booking.tripId,
        score: rating,
        comment: comment.trim() || undefined,
      })

      onRatingSubmitted()
      handleClose()
    } catch (error) {
      console.error("Failed to submit rating:", error)
      alert("Failed to submit rating. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setHoveredRating(0)
    setComment("")
    onClose()
  }

  if (!booking) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Trip</DialogTitle>
          <DialogDescription>Share your experience to help us improve our service</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Details */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium">
                {booking.trip.origin} → {booking.trip.destination}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(booking.trip.departureTime), "MMM dd, yyyy HH:mm")}</span>
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-base font-medium">How was your trip?</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 hover:scale-110 transition-transform"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-400"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {rating === 0 && "Click to rate"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Additional Comments (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Tell us more about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">{comment.length}/500</div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
