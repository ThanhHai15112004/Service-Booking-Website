import { ReviewRepository } from "../../Repository/Profile/review.repository";

export class ReviewService {
  private repo = new ReviewRepository();

  async getReviews(accountId: string) {
    return await this.repo.getReviewsByAccountId(accountId);
  }

  async getReviewById(reviewId: string, accountId: string) {
    const review = await this.repo.getReviewById(reviewId, accountId);
    if (!review) throw new Error("Không tìm thấy đánh giá.");
    return review;
  }

  async createReview(accountId: string, data: any) {
    const { 
      hotel_id, booking_id, rating, 
      location_rating, facilities_rating, service_rating, cleanliness_rating, value_rating,
      title, comment 
    } = data;
    
    if (!hotel_id) {
      throw new Error("Thiếu thông tin đánh giá.");
    }
    
    // Validate: Phải có ít nhất 1 category rating hoặc overall rating
    const hasCategoryRatings = location_rating || facilities_rating || service_rating || cleanliness_rating || value_rating;
    if (!rating && !hasCategoryRatings) {
      throw new Error("Vui lòng chọn đánh giá cho ít nhất một hạng mục.");
    }
    
    // Validate category ratings (1-5)
    const categoryRatings = [location_rating, facilities_rating, service_rating, cleanliness_rating, value_rating];
    for (const catRating of categoryRatings) {
      if (catRating !== undefined && catRating !== null && (catRating < 1 || catRating > 5)) {
        throw new Error("Đánh giá phải từ 1 đến 5 sao.");
      }
    }
    
    if (!title || title.trim().length === 0) {
      throw new Error("Tiêu đề đánh giá là bắt buộc.");
    }
    
    return await this.repo.createReview({
      account_id: accountId,
      hotel_id,
      booking_id: booking_id || null,
      rating: rating ? parseInt(rating) : 0, // Will be calculated from category ratings
      location_rating: location_rating ? parseInt(location_rating) : null,
      facilities_rating: facilities_rating ? parseInt(facilities_rating) : null,
      service_rating: service_rating ? parseInt(service_rating) : null,
      cleanliness_rating: cleanliness_rating ? parseInt(cleanliness_rating) : null,
      value_rating: value_rating ? parseInt(value_rating) : null,
      title: title.trim() || null,
      comment: comment || null
    });
  }

  async updateReview(reviewId: string, accountId: string, data: any) {
    const review = await this.repo.getReviewById(reviewId, accountId);
    if (!review) throw new Error("Không tìm thấy đánh giá.");

    const updateData: any = {};
    
    // Handle category ratings
    if (data.location_rating !== undefined) {
      if (data.location_rating < 1 || data.location_rating > 5) {
        throw new Error("Đánh giá vị trí phải từ 1 đến 5.");
      }
      updateData.location_rating = parseInt(data.location_rating);
    }
    if (data.facilities_rating !== undefined) {
      if (data.facilities_rating < 1 || data.facilities_rating > 5) {
        throw new Error("Đánh giá cơ sở vật chất phải từ 1 đến 5.");
      }
      updateData.facilities_rating = parseInt(data.facilities_rating);
    }
    if (data.service_rating !== undefined) {
      if (data.service_rating < 1 || data.service_rating > 5) {
        throw new Error("Đánh giá dịch vụ phải từ 1 đến 5.");
      }
      updateData.service_rating = parseInt(data.service_rating);
    }
    if (data.cleanliness_rating !== undefined) {
      if (data.cleanliness_rating < 1 || data.cleanliness_rating > 5) {
        throw new Error("Đánh giá độ sạch sẽ phải từ 1 đến 5.");
      }
      updateData.cleanliness_rating = parseInt(data.cleanliness_rating);
    }
    if (data.value_rating !== undefined) {
      if (data.value_rating < 1 || data.value_rating > 5) {
        throw new Error("Đánh giá đáng giá tiền phải từ 1 đến 5.");
      }
      updateData.value_rating = parseInt(data.value_rating);
    }
    
    if (data.rating !== undefined) {
      if (data.rating < 1 || data.rating > 5) {
        throw new Error("Rating phải từ 1 đến 5.");
      }
      updateData.rating = parseInt(data.rating);
    }
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        throw new Error("Tiêu đề đánh giá là bắt buộc.");
      }
      updateData.title = data.title.trim();
    }
    if (data.comment !== undefined) {
      updateData.comment = data.comment;
    }

    await this.repo.updateReview(reviewId, accountId, updateData);
  }

  async deleteReview(reviewId: string, accountId: string) {
    await this.repo.deleteReview(reviewId, accountId);
  }

  // Lấy reviews của hotel (public)
  async getHotelReviews(hotelId: string, limit: number = 100, offset: number = 0) {
    return await this.repo.getReviewsByHotelId(hotelId, limit, offset);
  }

  // Lấy thống kê reviews của hotel
  async getHotelReviewStats(hotelId: string) {
    return await this.repo.getHotelReviewStats(hotelId);
  }

  // Kiểm tra user đã review hotel này chưa
  async getUserReviewForHotel(accountId: string, hotelId: string) {
    return await this.repo.getUserReviewForHotel(accountId, hotelId);
  }
}


