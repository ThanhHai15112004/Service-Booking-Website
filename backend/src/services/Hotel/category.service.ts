import { HotelCategory } from "../../models/Hotel/category.model";
import { Hotel } from "../../models/Hotel/hotel.model";
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

        // Transform snake_case → camelCase cho frontend
        const transformedItems = items.map(item => ({
            categoryId: item.category_id,
            name: item.name,
            description: item.description,
            icon: item.icon
        }));

        return {
            success: true,
            message: "Danh sách loại hình nơi ở.",
            count: transformedItems.length,
            items: transformedItems,
        };
    }
}