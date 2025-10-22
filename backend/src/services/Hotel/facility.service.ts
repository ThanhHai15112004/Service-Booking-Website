import { FacilityRepository } from "../../Repository/Hotel/facility.repository";



export class FacilityService {
    private repo = new FacilityRepository();

    async getAllFacilities() {
        try {
            const items = await this.repo.getAll();

            if(!items.length) {
                return {
                    success: false,
                    message: "Không tìm thấy tiện ích khách sạn.",
                    items: { HOTEL: [], ROOM: [] },
                };
            }

            const grouped = {
                HOTEL: items.filter(i => i.category === "HOTEL"),
                ROOM: items.filter(i => i.category === "ROOM"),
            }

            return {
                succes:true,
                massage: "Danh sách tiện ích khách sạn.",
                items: grouped,
            }
        } catch (error) {
            console.error("❌ [FacilityService] getAllFacilities error:", error);
            return {
                success: false,
                message: "Lỗi server khi lấy danh sách tiện nghi.",
                items: { HOTEL: [], ROOM: [] },
            };
        }
    }
}