import { FacilityRepository } from "../../Repository/Hotel/facility.repository";



export class FacilityService {
    private repo = new FacilityRepository();

    async getAllFacilities() {
        try {
            // Lấy TẤT CẢ facilities từ DB - có bao nhiêu hiện bấy nhiêu
            const items = await this.repo.getAll();

            if(!items.length) {
                return {
                    success: false,
                    message: "Không tìm thấy tiện ích khách sạn.",
                    items: [],
                };
            }

            // Transform snake_case → camelCase cho frontend
            const transformedItems = items.map(item => ({
                facilityId: item.facility_id,
                name: item.name,
                category: item.category,
                icon: item.icon
            }));

            return {
                success: true,
                message: "Danh sách tiện ích khách sạn.",
                count: transformedItems.length,
                items: transformedItems,
            }
        } catch (error) {
            console.error("❌ [FacilityService] getAllFacilities error:", error);
            return {
                success: false,
                message: "Lỗi server khi lấy danh sách tiện nghi.",
                items: [],
            };
        }
    }
}