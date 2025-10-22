import { HotelCategory } from "../../models/category.model";
import { Hotel } from "../../models/hotel.model";
import { CategoryRepository } from "../../Repository/Hotel/category.repository";



export class CategoryService{
    private repo = new CategoryRepository();

    async getAllCategories() {
        const items: HotelCategory[] = await this.repo.getALL();

        if (!items || items.length === 0) {
            return {
                success: false,
                message: "Không tìm thấy loại hình khách sạn.",
                items: [],
            };
        }

        return {
            success: true,
            message: "Danh sách loại hình nơi ở.",
            count: items.length,
            items,
        };
    }
}