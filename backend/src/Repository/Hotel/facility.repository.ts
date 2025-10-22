import pool from "../../config/db";
import { Facility } from "../../models/Hotel/facility.model";


export class FacilityRepository {
    async getAll(): Promise<Facility[]> {
        const [rows]: any[] = await pool.query(
            `SELECT facility_id, name, category, icon, created_at
            FROM facility
            ORDER BY category, name`
        );
        return rows;
    }
}