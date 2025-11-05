import pool from "../../config/db";

export interface Location {
  location_id: string;
  country: string;
  city: string;
  district?: string;
  ward?: string;
  area_name?: string;
  latitude?: number;
  longitude?: number;
  distance_center?: number;
  description?: string;
  is_hot: boolean;
  created_at: string;
}

export class AdminLocationRepository {
  async getAllLocations(): Promise<Location[]> {
    const [rows]: any = await pool.query(
      `SELECT location_id, country, city, district, ward, area_name, 
              latitude, longitude, distance_center, description, is_hot, created_at 
       FROM hotel_location 
       ORDER BY created_at DESC`
    );
    return rows;
  }

  async getLocationById(locationId: string): Promise<Location | null> {
    const [rows]: any = await pool.query(
      `SELECT location_id, country, city, district, ward, area_name, 
              latitude, longitude, distance_center, description, is_hot, created_at 
       FROM hotel_location 
       WHERE location_id = ?`,
      [locationId]
    );
    return rows[0] || null;
  }

  async createLocation(data: {
    location_id: string;
    country: string;
    city: string;
    district?: string;
    ward?: string;
    area_name?: string;
    latitude?: number;
    longitude?: number;
    distance_center?: number;
    description?: string;
    is_hot?: boolean;
  }): Promise<void> {
    await pool.query(
      `INSERT INTO hotel_location 
       (location_id, country, city, district, ward, area_name, latitude, longitude, distance_center, description, is_hot) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.location_id,
        data.country,
        data.city,
        data.district || null,
        data.ward || null,
        data.area_name || null,
        data.latitude || null,
        data.longitude || null,
        data.distance_center || 0,
        data.description || null,
        data.is_hot ? 1 : 0,
      ]
    );
  }

  async updateLocation(locationId: string, data: {
    country?: string;
    city?: string;
    district?: string;
    ward?: string;
    area_name?: string;
    latitude?: number;
    longitude?: number;
    distance_center?: number;
    description?: string;
    is_hot?: boolean;
  }): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.country !== undefined) {
      updates.push("country = ?");
      values.push(data.country);
    }
    if (data.city !== undefined) {
      updates.push("city = ?");
      values.push(data.city);
    }
    if (data.district !== undefined) {
      updates.push("district = ?");
      values.push(data.district);
    }
    if (data.ward !== undefined) {
      updates.push("ward = ?");
      values.push(data.ward);
    }
    if (data.area_name !== undefined) {
      updates.push("area_name = ?");
      values.push(data.area_name);
    }
    if (data.latitude !== undefined) {
      updates.push("latitude = ?");
      values.push(data.latitude);
    }
    if (data.longitude !== undefined) {
      updates.push("longitude = ?");
      values.push(data.longitude);
    }
    if (data.distance_center !== undefined) {
      updates.push("distance_center = ?");
      values.push(data.distance_center);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.is_hot !== undefined) {
      updates.push("is_hot = ?");
      values.push(data.is_hot ? 1 : 0);
    }

    if (updates.length === 0) return;

    values.push(locationId);
    await pool.query(
      `UPDATE hotel_location SET ${updates.join(", ")} WHERE location_id = ?`,
      values
    );
  }

  async deleteLocation(locationId: string): Promise<void> {
    await pool.query(`DELETE FROM hotel_location WHERE location_id = ?`, [locationId]);
  }

  async checkLocationInUse(locationId: string): Promise<boolean> {
    const [rows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM hotel WHERE location_id = ?`,
      [locationId]
    );
    return rows[0].count > 0;
  }
}

