import { CategoryRepository } from "../../Repository/Hotel/category.repository";

export class CategoryService {
  private repo = new CategoryRepository();

  async getAllCategories() {
    try {
      const rawData = await this.repo.getAll();
      // Format data từ snake_case sang camelCase
      const data = (rawData as any[]).map(item => ({
        categoryId: item.category_id,
        name: item.name,
        description: item.description,
        icon: item.icon,
        createdAt: item.created_at
      }));
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error("[CategoryService] getAllCategories error:", error?.message || error);
      return {
        success: false,
        message: "Lỗi server",
        data: []
      };
    }
  }
}