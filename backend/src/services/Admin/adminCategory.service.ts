import { AdminCategoryRepository } from "../../Repository/Admin/adminCategory.repository";

export class AdminCategoryService {
  private repo: AdminCategoryRepository;

  constructor() {
    this.repo = new AdminCategoryRepository();
  }

  async getAllCategories() {
    return await this.repo.getAllCategories();
  }

  async getCategoryById(categoryId: string) {
    const category = await this.repo.getCategoryById(categoryId);
    if (!category) {
      throw new Error("Không tìm thấy danh mục");
    }
    return category;
  }

  async createCategory(data: {
    category_id: string;
    name: string;
    description?: string;
    icon?: string;
  }) {
    const existing = await this.repo.getCategoryById(data.category_id);
    if (existing) {
      throw new Error("Danh mục đã tồn tại");
    }

    await this.repo.createCategory(data);
    return await this.repo.getCategoryById(data.category_id);
  }

  async updateCategory(categoryId: string, data: {
    name?: string;
    description?: string;
    icon?: string;
  }) {
    const existing = await this.repo.getCategoryById(categoryId);
    if (!existing) {
      throw new Error("Không tìm thấy danh mục");
    }

    await this.repo.updateCategory(categoryId, data);
    return await this.repo.getCategoryById(categoryId);
  }

  async deleteCategory(categoryId: string) {
    const existing = await this.repo.getCategoryById(categoryId);
    if (!existing) {
      throw new Error("Không tìm thấy danh mục");
    }

    const inUse = await this.repo.checkCategoryInUse(categoryId);
    if (inUse) {
      throw new Error("Không thể xóa danh mục đang được sử dụng");
    }

    await this.repo.deleteCategory(categoryId);
  }
}

