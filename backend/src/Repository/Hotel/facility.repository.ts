import { Facility } from "../../models/Hotel/facility.model";

export class FacilityRepository {
  // Lấy tất cả tiện ích
  async getAll() {
    return await Facility.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']],
      raw: true
    });
  }
}