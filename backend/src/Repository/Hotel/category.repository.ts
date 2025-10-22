import pool from "../../config/db";
import { HotelCategory } from "../../models/Hotel/category.model";

export class CategoryRepository {
    async getALL(): Promise<HotelCategory[]> {
        const [rows]: any[] = await pool.query(
            `SELECT category_id, name, description, icon, created_at
            FROM hotel_category
            ORDER BY created_at DESC`
        );
        return rows;
    }
}