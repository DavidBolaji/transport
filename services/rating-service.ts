import type { Rating } from "@/types"
import { mockRatings } from "@/lib/mock-data"

export interface IRatingService {
  createRating(data: {
    passengerId: string
    tripId: string
    score: number
    comment?: string
  }): Promise<Rating>
  getRatingsByTrip(tripId: string): Promise<Rating[]>
  getRatingsByPassenger(passengerId: string): Promise<Rating[]>
  getAverageRatingForTrip(tripId: string): Promise<number>
  getAllRatings(): Promise<Rating[]>
}

export class RatingService implements IRatingService {
  private ratings: Rating[] = mockRatings

  async createRating(data: {
    passengerId: string
    tripId: string
    score: number
    comment?: string
  }): Promise<Rating> {
    // Check if rating already exists for this passenger and trip
    const existingRating = this.ratings.find(
      (rating) => rating.passengerId === data.passengerId && rating.tripId === data.tripId,
    )

    if (existingRating) {
      throw new Error("You have already rated this trip")
    }

    const newRating: Rating = {
      id: Date.now().toString(),
      passengerId: data.passengerId,
      tripId: data.tripId,
      score: data.score,
      comment: data.comment,
      createdAt: new Date(),
      // These will be populated by joins in real implementation
      passenger: {} as any,
      trip: {} as any,
    }

    this.ratings.push(newRating)
    return newRating
  }

  async getRatingsByTrip(tripId: string): Promise<Rating[]> {
    return this.ratings.filter((rating) => rating.tripId === tripId)
  }

  async getRatingsByPassenger(passengerId: string): Promise<Rating[]> {
    return this.ratings.filter((rating) => rating.passengerId === passengerId)
  }

  async getAverageRatingForTrip(tripId: string): Promise<number> {
    const tripRatings = await this.getRatingsByTrip(tripId)
    if (tripRatings.length === 0) return 0

    const totalScore = tripRatings.reduce((sum, rating) => sum + rating.score, 0)
    return Math.round((totalScore / tripRatings.length) * 10) / 10 // Round to 1 decimal place
  }

  async getAllRatings(): Promise<Rating[]> {
    return [...this.ratings]
  }
}

export const ratingService = new RatingService()
