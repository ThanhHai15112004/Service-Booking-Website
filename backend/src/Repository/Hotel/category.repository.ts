import { Category } from "../../models/Hotel/category.model";

export class CategoryRepository {
  // Hàm lấy tất cả danh mục khách sạn
  async getAll() {
    return await Category.findAll({
      order: [['created_at', 'DESC']],
      raw: true
    });
  }
}