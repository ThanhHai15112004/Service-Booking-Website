import { AdminHighlightRepository } from "../../Repository/Admin/adminHighlight.repository";

export class AdminHighlightService {
  private repo: AdminHighlightRepository;

  constructor() {
    this.repo = new AdminHighlightRepository();
  }

  async getAllHighlights() {
    return await this.repo.getAllHighlights();
  }

  async getHighlightById(highlightId: string) {
    const highlight = await this.repo.getHighlightById(highlightId);
    if (!highlight) {
      throw new Error("Không tìm thấy điểm nổi bật");
    }
    return highlight;
  }

  async createHighlight(data: {
    highlight_id: string;
    name: string;
    icon_url?: string;
    description?: string;
    category?: string;
  }) {
    const existing = await this.repo.getHighlightById(data.highlight_id);
    if (existing) {
      throw new Error("Điểm nổi bật đã tồn tại");
    }

    await this.repo.createHighlight(data);
    return await this.repo.getHighlightById(data.highlight_id);
  }

  async updateHighlight(highlightId: string, data: {
    name?: string;
    icon_url?: string;
    description?: string;
    category?: string;
  }) {
    const existing = await this.repo.getHighlightById(highlightId);
    if (!existing) {
      throw new Error("Không tìm thấy điểm nổi bật");
    }

    await this.repo.updateHighlight(highlightId, data);
    return await this.repo.getHighlightById(highlightId);
  }

  async deleteHighlight(highlightId: string) {
    const existing = await this.repo.getHighlightById(highlightId);
    if (!existing) {
      throw new Error("Không tìm thấy điểm nổi bật");
    }

    const inUse = await this.repo.checkHighlightInUse(highlightId);
    if (inUse) {
      throw new Error("Không thể xóa điểm nổi bật đang được sử dụng");
    }

    await this.repo.deleteHighlight(highlightId);
  }
}

