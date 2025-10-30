import { CategoryRepository } from "../../Repository/Hotel/category.repository";

export class CategoryService {
  private repo = new CategoryRepository();

  async getAllCategories() {
    try {
      const data = await this.repo.getAll();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("❌ [CategoryService] getAllCategories error:", error);
      return {
        success: false,
        message: "Lỗi server",
        data: []
      };
    }
  }
}