import { Category } from "../../models/Hotel/category.model";

export class CategoryRepository {
  // Lấy tất cả danh mục khách sạn
  async getAll() {
    return await Category.findAll({
      order: [['created_at', 'DESC']],
      raw: true
    });
  }
}