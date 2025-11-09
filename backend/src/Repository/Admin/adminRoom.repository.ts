import pool from "../../config/db";

export interface AdminRoomType {
  room_type_id: string;
  hotel_id: string;
  hotel_name: string;
  name: string;
  description?: string | null;
  bed_type?: string | null;
  area?: number | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  min_capacity?: number | null;
  max_capacity?: number | null;
  avg_capacity?: number | null;
  min_price_base?: number | null;
  max_price_base?: number | null;
  avg_price_base?: number | null;
  room_count?: number;
}

export interface AdminRoom {
  room_id: string;
  room_type_id: string;
  room_type_name: string;
  hotel_id: string;
  hotel_name: string;
  room_number?: string | null;
  capacity: number;
  image_url?: string | null;
  price_base?: number | null;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  created_at: string;
  updated_at: string;
}

export class AdminRoomRepository {
  // ========== ROOM TYPES ==========

  async getRoomTypesByHotel(hotelId: string, filters?: {
    search?: string;
    bedType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ roomTypes: AdminRoomType[]; total: number }> {
    let query = `
      SELECT 
        rt.room_type_id,
        rt.hotel_id,
        h.name as hotel_name,
        rt.name,
        rt.description,
        rt.bed_type,
        rt.area,
        rt.image_url,
        rt.created_at,
        rt.updated_at,
        COALESCE(MIN(r.capacity), 0) as min_capacity,
        COALESCE(MAX(r.capacity), 0) as max_capacity,
        COALESCE(AVG(r.capacity), 0) as avg_capacity,
        COALESCE(MIN(r.price_base), 0) as min_price_base,
        COALESCE(MAX(r.price_base), 0) as max_price_base,
        COALESCE(AVG(r.price_base), 0) as avg_price_base,
        COUNT(DISTINCT r.room_id) as room_count
      FROM room_type rt
      JOIN hotel h ON h.hotel_id = rt.hotel_id
      LEFT JOIN room r ON r.room_type_id = rt.room_type_id AND r.status = 'ACTIVE'
      WHERE rt.hotel_id = ?
      GROUP BY rt.room_type_id, rt.hotel_id, h.name, rt.name, rt.description, rt.bed_type, rt.area, rt.image_url, rt.created_at, rt.updated_at
    `;

    const params: any[] = [hotelId];

    if (filters?.search) {
      query += ` AND (rt.name LIKE ? OR rt.room_type_id LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (filters?.bedType) {
      query += ` AND rt.bed_type = ?`;
      params.push(filters.bedType);
    }

    // Count total
    const countQuery = query.replace(/SELECT[\s\S]*FROM/, "SELECT COUNT(DISTINCT rt.room_type_id) as total FROM").replace(/GROUP BY[\s\S]*$/, "");
    const [countResult]: any = await pool.query(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Order and pagination
    query += ` ORDER BY rt.created_at DESC`;

    if (filters?.page && filters?.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query += ` LIMIT ? OFFSET ?`;
      params.push(filters.limit, offset);
    }

    const [rows]: any = await pool.query(query, params);

    return {
      roomTypes: rows.map((row: any) => ({
        room_type_id: row.room_type_id,
        hotel_id: row.hotel_id,
        hotel_name: row.hotel_name,
        name: row.name,
        description: row.description,
        bed_type: row.bed_type,
        area: row.area ? Number(row.area) : null,
        image_url: row.image_url,
        created_at: row.created_at,
        updated_at: row.updated_at,
        min_capacity: row.min_capacity ? Number(row.min_capacity) : null,
        max_capacity: row.max_capacity ? Number(row.max_capacity) : null,
        avg_capacity: row.avg_capacity ? Math.round(Number(row.avg_capacity)) : null,
        min_price_base: row.min_price_base ? Number(row.min_price_base) : null,
        max_price_base: row.max_price_base ? Number(row.max_price_base) : null,
        avg_price_base: row.avg_price_base ? Number(row.avg_price_base) : null,
        room_count: row.room_count ? Number(row.room_count) : 0,
      })),
      total,
    };
  }

  async getRoomTypeById(roomTypeId: string): Promise<AdminRoomType | null> {
    const [rows]: any = await pool.query(
      `SELECT 
        rt.room_type_id,
        rt.hotel_id,
        h.name as hotel_name,
        rt.name,
        rt.description,
        rt.bed_type,
        rt.area,
        rt.image_url,
        rt.created_at,
        rt.updated_at,
        COALESCE(AVG(r.price_base), 0) as avg_price_base,
        COALESCE(MIN(r.price_base), 0) as min_price_base,
        COALESCE(MAX(r.price_base), 0) as max_price_base,
        COALESCE(AVG(r.capacity), 0) as avg_capacity,
        COALESCE(MIN(r.capacity), 0) as min_capacity,
        COALESCE(MAX(r.capacity), 0) as max_capacity
      FROM room_type rt
      JOIN hotel h ON h.hotel_id = rt.hotel_id
      LEFT JOIN room r ON r.room_type_id = rt.room_type_id AND r.status = 'ACTIVE'
      WHERE rt.room_type_id = ?
      GROUP BY rt.room_type_id, rt.hotel_id, h.name, rt.name, rt.description, rt.bed_type, rt.area, rt.image_url, rt.created_at, rt.updated_at`,
      [roomTypeId]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      room_type_id: row.room_type_id,
      hotel_id: row.hotel_id,
      hotel_name: row.hotel_name,
      name: row.name,
      description: row.description,
      bed_type: row.bed_type,
      area: row.area ? Number(row.area) : null,
      image_url: row.image_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
      avg_price_base: row.avg_price_base ? Number(row.avg_price_base) : null,
      min_price_base: row.min_price_base ? Number(row.min_price_base) : null,
      max_price_base: row.max_price_base ? Number(row.max_price_base) : null,
      avg_capacity: row.avg_capacity ? Math.round(Number(row.avg_capacity)) : null,
      min_capacity: row.min_capacity ? Number(row.min_capacity) : null,
      max_capacity: row.max_capacity ? Number(row.max_capacity) : null,
    };
  }

  async createRoomType(data: {
    room_type_id: string;
    hotel_id: string;
    name: string;
    description?: string;
    bed_type?: string;
    area?: number;
    image_url?: string;
  }): Promise<boolean> {
    const [result]: any = await pool.query(
      `INSERT INTO room_type 
       (room_type_id, hotel_id, name, description, bed_type, area, image_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        data.room_type_id,
        data.hotel_id,
        data.name,
        data.description || null,
        data.bed_type || null,
        data.area || null,
        data.image_url || null,
      ]
    );
    return result.affectedRows > 0;
  }

  async updateRoomType(roomTypeId: string, data: {
    name?: string;
    description?: string;
    bed_type?: string;
    area?: number;
    image_url?: string;
  }): Promise<boolean> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      params.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      params.push(data.description);
    }
    if (data.bed_type !== undefined) {
      updates.push("bed_type = ?");
      params.push(data.bed_type);
    }
    if (data.area !== undefined) {
      updates.push("area = ?");
      params.push(data.area);
    }
    if (data.image_url !== undefined) {
      updates.push("image_url = ?");
      params.push(data.image_url);
    }

    if (updates.length === 0) return false;

    updates.push("updated_at = NOW()");
    params.push(roomTypeId);

    const [result]: any = await pool.query(
      `UPDATE room_type SET ${updates.join(", ")} WHERE room_type_id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  async deleteRoomType(roomTypeId: string): Promise<boolean> {
    const [result]: any = await pool.query(
      `DELETE FROM room_type WHERE room_type_id = ?`,
      [roomTypeId]
    );
    return result.affectedRows > 0;
  }

  // ========== ROOMS ==========

  async getRoomsByHotel(hotelId: string, filters?: {
    roomTypeId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ rooms: AdminRoom[]; total: number }> {
    let query = `
      SELECT 
        r.room_id,
        r.room_type_id,
        rt.name as room_type_name,
        rt.hotel_id,
        h.name as hotel_name,
        r.room_number,
        r.capacity,
        r.image_url,
        r.price_base,
        r.status,
        r.created_at,
        r.updated_at
      FROM room r
      JOIN room_type rt ON rt.room_type_id = r.room_type_id
      JOIN hotel h ON h.hotel_id = rt.hotel_id
      WHERE rt.hotel_id = ?
    `;

    const params: any[] = [hotelId];

    if (filters?.roomTypeId) {
      query += ` AND r.room_type_id = ?`;
      params.push(filters.roomTypeId);
    }

    if (filters?.status) {
      query += ` AND r.status = ?`;
      params.push(filters.status);
    }

    if (filters?.search) {
      query += ` AND (r.room_number LIKE ? OR r.room_id LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Count total
    const countQuery = query.replace(/SELECT[\s\S]*FROM/, "SELECT COUNT(*) as total FROM");
    const [countResult]: any = await pool.query(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Order and pagination
    query += ` ORDER BY r.room_number ASC, r.created_at DESC`;

    if (filters?.page && filters?.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query += ` LIMIT ? OFFSET ?`;
      params.push(filters.limit, offset);
    }

    const [rows]: any = await pool.query(query, params);

    return {
      rooms: rows.map((row: any) => ({
        room_id: row.room_id,
        room_type_id: row.room_type_id,
        room_type_name: row.room_type_name,
        hotel_id: row.hotel_id,
        hotel_name: row.hotel_name,
        room_number: row.room_number,
        capacity: row.capacity,
        image_url: row.image_url,
        price_base: row.price_base ? Number(row.price_base) : null,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
      total,
    };
  }

  async getRoomsByRoomType(roomTypeId: string, filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ rooms: AdminRoom[]; total: number }> {
    let query = `
      SELECT
        r.room_id,
        r.room_type_id,
        rt.name as room_type_name,
        rt.hotel_id,
        h.name as hotel_name,
        r.room_number,
        r.capacity,
        r.image_url,
        r.price_base,
        r.status,
        r.created_at,
        r.updated_at
      FROM room r
      JOIN room_type rt ON rt.room_type_id = r.room_type_id
      JOIN hotel h ON h.hotel_id = rt.hotel_id
      WHERE r.room_type_id = ?
    `;

    const params: any[] = [roomTypeId];

    if (filters?.status) {
      query += ` AND r.status = ?`;
      params.push(filters.status);
    }

    if (filters?.search) {
      query += ` AND (r.room_number LIKE ? OR r.room_id LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Count total
    const countQuery = query.replace(/SELECT[\s\S]*FROM/, "SELECT COUNT(*) as total FROM");
    const [countResult]: any = await pool.query(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Order and pagination
    query += ` ORDER BY r.room_number ASC, r.created_at DESC`;

    if (filters?.page && filters?.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query += ` LIMIT ? OFFSET ?`;
      params.push(filters.limit, offset);
    }

    const [rows]: any = await pool.query(query, params);

    return {
      rooms: rows.map((row: any) => ({
        room_id: row.room_id,
        room_type_id: row.room_type_id,
        room_type_name: row.room_type_name,
        hotel_id: row.hotel_id,
        hotel_name: row.hotel_name,
        room_number: row.room_number,
        capacity: row.capacity,
        image_url: row.image_url,
        price_base: row.price_base ? Number(row.price_base) : null,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
      total,
    };
  }

  async getRoomById(roomId: string): Promise<AdminRoom | null> {
    const [rows]: any = await pool.query(
      `SELECT 
        r.room_id,
        r.room_type_id,
        rt.name as room_type_name,
        rt.hotel_id,
        h.name as hotel_name,
        r.room_number,
        r.capacity,
        r.image_url,
        r.price_base,
        r.status,
        r.created_at,
        r.updated_at
       FROM room r
       JOIN room_type rt ON rt.room_type_id = r.room_type_id
       JOIN hotel h ON h.hotel_id = rt.hotel_id
       WHERE r.room_id = ?`,
      [roomId]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      room_id: row.room_id,
      room_type_id: row.room_type_id,
      room_type_name: row.room_type_name,
      hotel_id: row.hotel_id,
      hotel_name: row.hotel_name,
      room_number: row.room_number,
      capacity: row.capacity,
      image_url: row.image_url,
      price_base: row.price_base ? Number(row.price_base) : null,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async createRoom(data: {
    room_id: string;
    room_type_id: string;
    room_number?: string;
    capacity: number;
    image_url?: string;
    price_base?: number;
    status?: string;
  }): Promise<boolean> {
    const [result]: any = await pool.query(
      `INSERT INTO room 
       (room_id, room_type_id, room_number, capacity, image_url, price_base, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        data.room_id,
        data.room_type_id,
        data.room_number || null,
        data.capacity,
        data.image_url || null,
        data.price_base || null,
        data.status || "ACTIVE",
      ]
    );
    return result.affectedRows > 0;
  }

  async updateRoom(roomId: string, data: {
    room_number?: string;
    capacity?: number;
    image_url?: string;
    price_base?: number;
    status?: string;
  }): Promise<boolean> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.room_number !== undefined) {
      updates.push("room_number = ?");
      params.push(data.room_number);
    }
    if (data.capacity !== undefined) {
      updates.push("capacity = ?");
      params.push(data.capacity);
    }
    if (data.image_url !== undefined) {
      updates.push("image_url = ?");
      params.push(data.image_url);
    }
    if (data.price_base !== undefined) {
      updates.push("price_base = ?");
      params.push(data.price_base);
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      params.push(data.status);
    }

    if (updates.length === 0) return false;

    updates.push("updated_at = NOW()");
    params.push(roomId);

    const [result]: any = await pool.query(
      `UPDATE room SET ${updates.join(", ")} WHERE room_id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  async deleteRoom(roomId: string): Promise<boolean> {
    const [result]: any = await pool.query(
      `DELETE FROM room WHERE room_id = ?`,
      [roomId]
    );
    return result.affectedRows > 0;
  }

  async updateRoomStatus(roomId: string, status: string): Promise<boolean> {
    const [result]: any = await pool.query(
      `UPDATE room SET status = ?, updated_at = NOW() WHERE room_id = ?`,
      [status, roomId]
    );
    return result.affectedRows > 0;
  }

  // ========== HELPER METHODS ==========

  async getBedTypes(): Promise<string[]> {
    const [rows]: any = await pool.query(
      `SELECT bed_type_key, name_vi, name_en
       FROM bed_type_metadata 
       ORDER BY display_order ASC, name_vi ASC`
    );
    // Return bed_type_key for backward compatibility, but we can also return full objects
    return rows.map((row: any) => row.bed_type_key);
  }

  async getRoomTypesForHotel(hotelId: string): Promise<Array<{ room_type_id: string; name: string }>> {
    const [rows]: any = await pool.query(
      `SELECT room_type_id, name 
       FROM room_type 
       WHERE hotel_id = ? 
       ORDER BY name ASC`,
      [hotelId]
    );
    return rows.map((row: any) => ({
      room_type_id: row.room_type_id,
      name: row.name,
    }));
  }

  async getHotelsForRoomManagement(): Promise<Array<{ hotel_id: string; name: string }>> {
    const [rows]: any = await pool.query(
      `SELECT hotel_id, name 
       FROM hotel 
       ORDER BY name ASC`
    );
    return rows.map((row: any) => ({
      hotel_id: row.hotel_id,
      name: row.name,
    }));
  }

  // ========== ROOM IMAGES ==========
  async getRoomImages(roomTypeId: string): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT 
        image_id, room_type_id, image_url, image_alt, is_primary, sort_order, created_at
      FROM room_image
      WHERE room_type_id = ?
      ORDER BY is_primary DESC, sort_order ASC, created_at ASC`,
      [roomTypeId]
    );
    return rows.map((row: any) => ({
      image_id: row.image_id,
      room_type_id: row.room_type_id,
      image_url: row.image_url,
      image_alt: row.image_alt,
      is_primary: Boolean(row.is_primary),
      sort_order: Number(row.sort_order),
      created_at: row.created_at,
    }));
  }

  async addRoomImage(roomTypeId: string, imageUrl: string, imageAlt?: string, isPrimary: boolean = false): Promise<boolean> {
    const imageId = `RIMG${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
    
    // If setting as primary, unset other primaries
    if (isPrimary) {
      await pool.query(
        `UPDATE room_image SET is_primary = 0 WHERE room_type_id = ?`,
        [roomTypeId]
      );
    }

    // Get max sort_order
    const [maxOrder]: any = await pool.query(
      `SELECT COALESCE(MAX(sort_order), 0) as max_order FROM room_image WHERE room_type_id = ?`,
      [roomTypeId]
    );
    const nextOrder = (maxOrder[0]?.max_order || 0) + 1;

    const [result]: any = await pool.query(
      `INSERT INTO room_image (image_id, room_type_id, image_url, image_alt, is_primary, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [imageId, roomTypeId, imageUrl, imageAlt || null, isPrimary ? 1 : 0, nextOrder]
    );
    return result.affectedRows > 0;
  }

  async deleteRoomImage(imageId: string): Promise<boolean> {
    const [result]: any = await pool.query(
      `DELETE FROM room_image WHERE image_id = ?`,
      [imageId]
    );
    return result.affectedRows > 0;
  }

  async setPrimaryRoomImage(roomTypeId: string, imageId: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Unset all primaries
      await connection.query(
        `UPDATE room_image SET is_primary = 0 WHERE room_type_id = ?`,
        [roomTypeId]
      );
      
      // Set new primary
      const [result]: any = await connection.query(
        `UPDATE room_image SET is_primary = 1 WHERE image_id = ? AND room_type_id = ?`,
        [imageId, roomTypeId]
      );
      
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ========== ROOM AMENITIES ==========
  // Get amenities for a room type (from all rooms of that type)
  async getRoomTypeAmenities(roomTypeId: string): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT DISTINCT
        f.facility_id, f.name, f.category, f.icon
      FROM room_amenity ra
      JOIN room r ON r.room_id = ra.room_id
      JOIN facility f ON f.facility_id = ra.facility_id
      WHERE r.room_type_id = ? AND f.category = 'ROOM'
      ORDER BY f.name ASC`,
      [roomTypeId]
    );
    return rows.map((row: any) => ({
      facility_id: row.facility_id,
      name: row.name,
      category: row.category,
      icon: row.icon,
    }));
  }

  // Get all available facilities
  async getAllFacilities(category: string = "ROOM"): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT facility_id, name, category, icon
       FROM facility
       WHERE category = ?
       ORDER BY name ASC`,
      [category]
    );
    return rows.map((row: any) => ({
      facility_id: row.facility_id,
      name: row.name,
      category: row.category,
      icon: row.icon,
    }));
  }

  // Add amenity to all rooms of a room type
  async addRoomTypeAmenity(roomTypeId: string, facilityId: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Get all rooms of this type
      const [rooms]: any = await connection.query(
        `SELECT room_id FROM room WHERE room_type_id = ?`,
        [roomTypeId]
      );
      
      // Add amenity to each room (ignore duplicates)
      for (const room of rooms) {
        await connection.query(
          `INSERT IGNORE INTO room_amenity (room_id, facility_id, created_at)
           VALUES (?, ?, NOW())`,
          [room.room_id, facilityId]
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Remove amenity from all rooms of a room type
  async removeRoomTypeAmenity(roomTypeId: string, facilityId: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Get all rooms of this type
      const [rooms]: any = await connection.query(
        `SELECT room_id FROM room WHERE room_type_id = ?`,
        [roomTypeId]
      );
      
      const roomIds = rooms.map((r: any) => r.room_id);
      if (roomIds.length === 0) {
        await connection.rollback();
        return false;
      }
      
      // Remove amenity from all rooms
      const placeholders = roomIds.map(() => "?").join(",");
      const [result]: any = await connection.query(
        `DELETE FROM room_amenity 
         WHERE room_id IN (${placeholders}) AND facility_id = ?`,
        [...roomIds, facilityId]
      );
      
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ========== ROOM POLICIES ==========
  // Get policies for a room type (from all rooms of that type)
  async getRoomTypePolicies(roomTypeId: string): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT DISTINCT
        rp.id, rp.room_id, rp.policy_key, rp.value, rp.updated_at,
        pt.name_vi, pt.name_en, pt.data_type, pt.icon
      FROM room_policy rp
      JOIN room r ON r.room_id = rp.room_id
      JOIN policy_type pt ON pt.policy_key = rp.policy_key
      WHERE r.room_type_id = ?
      ORDER BY pt.display_order, pt.name_vi`,
      [roomTypeId]
    );
    
    // Group by policy_key and take the most common value
    const policyMap = new Map<string, any>();
    rows.forEach((row: any) => {
      const key = row.policy_key;
      if (!policyMap.has(key)) {
        policyMap.set(key, {
          id: row.id,
          policy_key: row.policy_key,
          name: row.name_vi || row.name_en,
          value: row.value,
          data_type: row.data_type,
          icon: row.icon,
          updated_at: row.updated_at,
        });
      }
    });
    
    return Array.from(policyMap.values());
  }

  // Get all available policy types
  async getAllPolicyTypes(applicableTo: string = "ROOM"): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT policy_key, name_vi, name_en, description, data_type, applicable_to, icon, display_order
       FROM policy_type
       WHERE (applicable_to = ? OR applicable_to = 'BOTH') AND is_active = 1
       ORDER BY display_order, name_vi`,
      [applicableTo]
    );
    return rows.map((row: any) => ({
      policy_key: row.policy_key,
      name: row.name_vi || row.name_en,
      description: row.description,
      data_type: row.data_type,
      applicable_to: row.applicable_to,
      icon: row.icon,
    }));
  }

  // Add policy to all rooms of a room type
  async addRoomTypePolicy(roomTypeId: string, policyKey: string, value: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Get all rooms of this type
      const [rooms]: any = await connection.query(
        `SELECT room_id FROM room WHERE room_type_id = ?`,
        [roomTypeId]
      );
      
      // Add policy to each room (upsert)
      for (const room of rooms) {
        await connection.query(
          `INSERT INTO room_policy (room_id, policy_key, value, created_at, updated_at)
           VALUES (?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE value = ?, updated_at = NOW()`,
          [room.room_id, policyKey, value, value]
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Update policy for all rooms of a room type
  async updateRoomTypePolicy(roomTypeId: string, policyKey: string, value: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Get all rooms of this type
      const [rooms]: any = await connection.query(
        `SELECT room_id FROM room WHERE room_type_id = ?`,
        [roomTypeId]
      );
      
      const roomIds = rooms.map((r: any) => r.room_id);
      if (roomIds.length === 0) {
        await connection.rollback();
        return false;
      }
      
      // Update policy for all rooms
      const placeholders = roomIds.map(() => "?").join(",");
      const [result]: any = await connection.query(
        `UPDATE room_policy 
         SET value = ?, updated_at = NOW()
         WHERE room_id IN (${placeholders}) AND policy_key = ?`,
        [value, ...roomIds, policyKey]
      );
      
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Remove policy from all rooms of a room type
  async removeRoomTypePolicy(roomTypeId: string, policyKey: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Get all rooms of this type
      const [rooms]: any = await connection.query(
        `SELECT room_id FROM room WHERE room_type_id = ?`,
        [roomTypeId]
      );
      
      const roomIds = rooms.map((r: any) => r.room_id);
      if (roomIds.length === 0) {
        await connection.rollback();
        return false;
      }
      
      // Remove policy from all rooms
      const placeholders = roomIds.map(() => "?").join(",");
      const [result]: any = await connection.query(
        `DELETE FROM room_policy 
         WHERE room_id IN (${placeholders}) AND policy_key = ?`,
        [...roomIds, policyKey]
      );
      
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ========== ROOM PRICE SCHEDULES ==========
  async getRoomTypePriceSchedules(roomTypeId: string): Promise<any[]> {
    // First, get all active rooms for this room type to ensure we only count their schedules
    const [rows]: any = await pool.query(
      `SELECT 
        DATE(rps.date) as date,
        AVG(rps.base_price) as avg_base_price,
        MIN(rps.base_price) as min_base_price,
        MAX(rps.base_price) as max_base_price,
        AVG(CASE WHEN rps.discount_percent > 0 THEN rps.discount_percent ELSE NULL END) as avg_discount_percent,
        MAX(rps.discount_percent) as max_discount_percent,
        MIN(CASE WHEN rps.discount_percent > 0 THEN rps.discount_percent ELSE NULL END) as min_discount_percent,
        SUM(rps.available_rooms) as total_available_rooms,
        COUNT(DISTINCT CASE WHEN r.status = 'ACTIVE' THEN r.room_id END) as total_rooms,
        COUNT(DISTINCT CASE WHEN r.status = 'ACTIVE' AND rps.discount_percent > 0 THEN r.room_id END) as rooms_with_discount
      FROM room_price_schedule rps
      JOIN room r ON r.room_id = rps.room_id
      WHERE r.room_type_id = ? AND r.status = 'ACTIVE'
      GROUP BY DATE(rps.date)
      ORDER BY DATE(rps.date) ASC`,
      [roomTypeId]
    );
    
    const result = rows.map((row: any) => {
      // Handle date format - extract date part only (YYYY-MM-DD)
      // Avoid timezone issues by using DATE() function result or string extraction
      let dateStr: string;
      if (row.date instanceof Date) {
        // Get local date components (avoid timezone conversion)
        const year = row.date.getFullYear();
        const month = String(row.date.getMonth() + 1).padStart(2, "0");
        const day = String(row.date.getDate()).padStart(2, "0");
        dateStr = `${year}-${month}-${day}`;
      } else if (typeof row.date === "string") {
        // Extract date part only (YYYY-MM-DD), ignore time if present
        dateStr = row.date.split("T")[0].split(" ")[0];
      } else {
        dateStr = String(row.date);
      }
      
      const avgDiscount = Number(row.avg_discount_percent || 0);
      const maxDiscount = Number(row.max_discount_percent || 0);
      const minDiscount = Number(row.min_discount_percent || 0);
      const roomsWithDiscount = Number(row.rooms_with_discount || 0);
      const totalRooms = Number(row.total_rooms || 0);
      
      // Determine discount percent:
      // 1. If all rooms have the same discount (max === min and all rooms have discount), use that value
      // 2. If some rooms have discount, use average (but only if > 0)
      // 3. Otherwise, use max discount if available
      let discountPercent = 0;
      
      if (maxDiscount > 0) {
        // If all rooms have discount and they're the same
        if (roomsWithDiscount === totalRooms && totalRooms > 0 && maxDiscount === minDiscount && minDiscount !== null) {
          discountPercent = maxDiscount;
        } 
        // If average exists and is valid
        else if (avgDiscount > 0 && !isNaN(avgDiscount)) {
          discountPercent = Math.round(avgDiscount * 100) / 100; // Round to 2 decimal places
        }
        // Fallback to max
        else {
          discountPercent = maxDiscount;
        }
      }
      
      return {
        date: dateStr,
        avg_base_price: Number(row.avg_base_price || 0),
        min_base_price: Number(row.min_base_price || 0),
        max_base_price: Number(row.max_base_price || 0),
        avg_discount_percent: discountPercent,
        total_available_rooms: Number(row.total_available_rooms || 0),
        total_rooms: Number(row.total_rooms || 0),
      };
    });
    
    return result;
  }

  async getRoomTypeBasePrice(roomTypeId: string): Promise<number | null> {
    const [rows]: any = await pool.query(
      `SELECT AVG(r.price_base) as avg_price_base
       FROM room r
       WHERE r.room_type_id = ? AND r.status = 'ACTIVE' AND r.price_base IS NOT NULL`,
      [roomTypeId]
    );
    return rows[0]?.avg_price_base ? Number(rows[0].avg_price_base) : null;
  }

  async updateRoomTypeBasePrice(roomTypeId: string, basePrice: number): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update room.price_base
      const [result]: any = await connection.query(
        `UPDATE room 
         SET price_base = ?, updated_at = NOW()
         WHERE room_type_id = ? AND status = 'ACTIVE'`,
        [basePrice, roomTypeId]
      );


      if (result.affectedRows === 0) {
        await connection.rollback();
        return false;
      }

      // Update ALL existing schedules for this room type
      // Update base_price and recalculate final_price based on current discount_percent
      const [scheduleResult]: any = await connection.query(
        `UPDATE room_price_schedule rps
         JOIN room r ON r.room_id = rps.room_id
         SET rps.base_price = ?,
             rps.final_price = ? * (1 - COALESCE(rps.discount_percent, 0) / 100)
         WHERE r.room_type_id = ? 
           AND r.status = 'ACTIVE'`,
        [basePrice, basePrice, roomTypeId]
      );


      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateRoomTypeDateDiscount(
    roomTypeId: string,
    date: string,
    discountPercent: number
  ): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get all active rooms for this room type
      const [rooms]: any = await connection.query(
        `SELECT room_id, price_base 
         FROM room 
         WHERE room_type_id = ? AND status = 'ACTIVE'`,
        [roomTypeId]
      );

      if (rooms.length === 0) {
        await connection.rollback();
        throw new Error("Không tìm thấy phòng nào thuộc loại phòng này");
      }

      let updatedCount = 0;
      let createdCount = 0;

      // Process each room
      for (const room of rooms) {
        // Check if schedule already exists for this room and date
        // Use DATE() function to ensure exact date match (avoid timezone issues)
        const [existing]: any = await connection.query(
          `SELECT schedule_id, base_price, discount_percent 
           FROM room_price_schedule 
           WHERE room_id = ? AND DATE(date) = DATE(?)`,
          [room.room_id, date]
        );

        let basePrice = room.price_base || 0;
        let scheduleId: string;

        if (existing.length > 0) {
          // Schedule exists - update it
          scheduleId = existing[0].schedule_id;
          // Use existing base_price if it's valid (> 0), otherwise use room.price_base
          basePrice = (existing[0].base_price && Number(existing[0].base_price) > 0) 
            ? Number(existing[0].base_price)
            : (Number(room.price_base) || 0);
          
          // If base_price is still 0, we can't calculate final_price
          if (basePrice <= 0) {
            continue;
          }

          const finalPrice = basePrice * (1 - discountPercent / 100);
          
          // Update schedule with exact date match
          const [updateResult]: any = await connection.query(
            `UPDATE room_price_schedule 
             SET discount_percent = ?,
                 final_price = ?,
                 base_price = ?
             WHERE schedule_id = ? AND DATE(date) = DATE(?)`,
            [discountPercent, finalPrice, basePrice, scheduleId, date]
          );

          if (updateResult.affectedRows > 0) {
            updatedCount++;
          }
        } else {
          // Schedule doesn't exist - create it
          if (basePrice <= 0) {
            continue;
          }

          scheduleId = `RPS${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
          const finalPrice = basePrice * (1 - discountPercent / 100);

          // Ensure date is stored as DATE type (not DATETIME) to avoid timezone issues
          await connection.query(
            `INSERT INTO room_price_schedule 
             (schedule_id, room_id, date, base_price, discount_percent, final_price, available_rooms, refundable, pay_later, created_at)
             VALUES (?, ?, DATE(?), ?, ?, ?, 1, 1, 0, NOW())`,
            [scheduleId, room.room_id, date, basePrice, discountPercent, finalPrice]
          );

          createdCount++;
        }
      }


      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get policies for a specific date (refundable, pay_later)
  async getRoomTypeDatePolicies(roomTypeId: string, date: string): Promise<{
    refundable: boolean;
    pay_later: boolean;
  } | null> {
    try {
      const [rows]: any = await pool.query(
        `SELECT 
          MAX(rps.refundable) as refundable,
          MAX(rps.pay_later) as pay_later
        FROM room_price_schedule rps
        JOIN room r ON r.room_id = rps.room_id
        WHERE r.room_type_id = ? AND r.status = 'ACTIVE' AND DATE(rps.date) = DATE(?)
        LIMIT 1`,
        [roomTypeId, date]
      );

      if (rows.length === 0) {
        return null;
      }

      return {
        refundable: Boolean(rows[0].refundable),
        pay_later: Boolean(rows[0].pay_later),
      };
    } catch (error) {
      throw error;
    }
  }

  // Update policies (refundable, pay_later) for a specific date
  async updateRoomTypeDatePolicies(
    roomTypeId: string,
    date: string,
    refundable: boolean,
    payLater: boolean
  ): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get all active rooms for this room type
      const [rooms]: any = await connection.query(
        `SELECT room_id 
         FROM room 
         WHERE room_type_id = ? AND status = 'ACTIVE'`,
        [roomTypeId]
      );

      if (rooms.length === 0) {
        await connection.rollback();
        throw new Error("Không tìm thấy phòng nào thuộc loại phòng này");
      }

      // Update or create schedules for each room
      for (const room of rooms) {
        // Check if schedule exists
        const [existing]: any = await connection.query(
          `SELECT schedule_id, base_price 
           FROM room_price_schedule 
           WHERE room_id = ? AND DATE(date) = DATE(?)`,
          [room.room_id, date]
        );

        if (existing.length > 0) {
          // Update existing schedule
          const scheduleId = existing[0].schedule_id;
          const basePrice = Number(existing[0].base_price) || 0;
          
          // Recalculate final_price if needed
          const [discountRow]: any = await connection.query(
            `SELECT discount_percent FROM room_price_schedule WHERE schedule_id = ?`,
            [scheduleId]
          );
          const discountPercent = discountRow.length > 0 ? Number(discountRow[0].discount_percent) || 0 : 0;
          const finalPrice = basePrice * (1 - discountPercent / 100);

          await connection.query(
            `UPDATE room_price_schedule 
             SET refundable = ?,
                 pay_later = ?,
                 final_price = ?
             WHERE schedule_id = ?`,
            [refundable ? 1 : 0, payLater ? 1 : 0, finalPrice, scheduleId]
          );
        } else {
          // Create new schedule with default base price
          const [roomData]: any = await connection.query(
            `SELECT price_base FROM room WHERE room_id = ?`,
            [room.room_id]
          );
          
          if (roomData.length === 0 || !roomData[0].price_base) {
            continue;
          }

          const basePrice = Number(roomData[0].price_base) || 0;
          if (basePrice <= 0) {
            continue;
          }

          const scheduleId = `RPS${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
          const finalPrice = basePrice;

          await connection.query(
            `INSERT INTO room_price_schedule 
             (schedule_id, room_id, date, base_price, discount_percent, final_price, available_rooms, refundable, pay_later, created_at)
             VALUES (?, ?, DATE(?), ?, 0, ?, 1, ?, ?, NOW())`,
            [scheduleId, room.room_id, date, basePrice, finalPrice, refundable ? 1 : 0, payLater ? 1 : 0]
          );
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Update base price for a specific date
  async updateRoomTypeDateBasePrice(
    roomTypeId: string,
    date: string,
    basePrice: number
  ): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (basePrice < 0) {
        await connection.rollback();
        throw new Error("Giá cơ bản phải lớn hơn hoặc bằng 0");
      }

      // Get all active rooms for this room type
      const [rooms]: any = await connection.query(
        `SELECT room_id 
         FROM room 
         WHERE room_type_id = ? AND status = 'ACTIVE'`,
        [roomTypeId]
      );

      if (rooms.length === 0) {
        await connection.rollback();
        throw new Error("Không tìm thấy phòng nào thuộc loại phòng này");
      }

      // Update or create schedules for each room
      for (const room of rooms) {
        // Check if schedule exists
        const [existing]: any = await connection.query(
          `SELECT schedule_id, discount_percent 
           FROM room_price_schedule 
           WHERE room_id = ? AND DATE(date) = DATE(?)`,
          [room.room_id, date]
        );

        if (existing.length > 0) {
          // Update existing schedule
          const scheduleId = existing[0].schedule_id;
          const discountPercent = Number(existing[0].discount_percent) || 0;
          const finalPrice = basePrice * (1 - discountPercent / 100);

          await connection.query(
            `UPDATE room_price_schedule 
             SET base_price = ?,
                 final_price = ?
             WHERE schedule_id = ?`,
            [basePrice, finalPrice, scheduleId]
          );
        } else {
          // Create new schedule
          const scheduleId = `RPS${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
          const finalPrice = basePrice;

          await connection.query(
            `INSERT INTO room_price_schedule 
             (schedule_id, room_id, date, base_price, discount_percent, final_price, available_rooms, refundable, pay_later, created_at)
             VALUES (?, ?, DATE(?), ?, 0, ?, 1, 1, 0, NOW())`,
            [scheduleId, room.room_id, date, basePrice, finalPrice]
          );
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Update available rooms for a room type on a specific date
  async updateRoomTypeDateAvailability(
    roomTypeId: string,
    date: string,
    totalAvailableRooms: number
  ): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get all active rooms for this room type
      const [rooms]: any = await connection.query(
        `SELECT room_id 
         FROM room 
         WHERE room_type_id = ? AND status = 'ACTIVE'`,
        [roomTypeId]
      );

      if (rooms.length === 0) {
        await connection.rollback();
        throw new Error("Không tìm thấy phòng nào thuộc loại phòng này");
      }

      const totalRooms = rooms.length;
      
      // Validate: totalAvailableRooms cannot exceed totalRooms
      if (totalAvailableRooms > totalRooms) {
        await connection.rollback();
        throw new Error(`Số phòng trống không thể vượt quá tổng số phòng (${totalRooms} phòng)`);
      }

      if (totalAvailableRooms < 0) {
        await connection.rollback();
        throw new Error("Số phòng trống không thể nhỏ hơn 0");
      }

      // Calculate how many rooms should have available_rooms = 1
      // Remaining rooms will have available_rooms = 0
      const roomsWithAvailability = totalAvailableRooms;
      
      // Update or create schedules for each room
      for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        const shouldHaveAvailability = i < roomsWithAvailability;
        const availableRoomsValue = shouldHaveAvailability ? 1 : 0;

        // Check if schedule exists
        const [existing]: any = await connection.query(
          `SELECT schedule_id, base_price, discount_percent
           FROM room_price_schedule
           WHERE room_id = ? AND DATE(date) = DATE(?)`,
          [room.room_id, date]
        );

        if (existing.length > 0) {
          // Update existing schedule
          const scheduleId = existing[0].schedule_id;
          const basePrice = Number(existing[0].base_price) || 0;
          const discountPercent = Number(existing[0].discount_percent) || 0;
          const finalPrice = basePrice * (1 - discountPercent / 100);

          await connection.query(
            `UPDATE room_price_schedule 
             SET available_rooms = ?,
                 final_price = ?
             WHERE schedule_id = ?`,
            [availableRoomsValue, finalPrice, scheduleId]
          );
        } else {
          // Create new schedule if it doesn't exist
          // Get room base price
          const [roomData]: any = await connection.query(
            `SELECT price_base FROM room WHERE room_id = ?`,
            [room.room_id]
          );
          
          const basePrice = roomData[0]?.price_base || 0;
          const scheduleId = `RPS${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
          const finalPrice = basePrice;

          await connection.query(
            `INSERT INTO room_price_schedule 
             (schedule_id, room_id, date, base_price, discount_percent, final_price, available_rooms, refundable, pay_later, created_at)
             VALUES (?, ?, DATE(?), ?, 0, ?, ?, 1, 0, NOW())`,
            [scheduleId, room.room_id, date, basePrice, finalPrice, availableRoomsValue]
          );
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // ========== DASHBOARD STATS ==========

  async getDashboardStats() {
    try {
      // 1. Tổng số loại phòng
      const [totalRoomTypes]: any = await pool.query(
        `SELECT COUNT(DISTINCT room_type_id) as count FROM room_type`
      );
      const totalRoomTypesCount = totalRoomTypes[0]?.count || 0;

      // 2. Tổng số phòng vật lý
      const [totalRooms]: any = await pool.query(
        `SELECT COUNT(*) as count FROM room`
      );
      const totalRoomsCount = totalRooms[0]?.count || 0;

      // 3. Phòng theo status
      const [statusRows]: any = await pool.query(
        `SELECT status, COUNT(*) as count FROM room GROUP BY status`
      );
      const statusMap: Record<string, number> = {};
      statusRows.forEach((row: any) => {
        statusMap[row.status] = row.count;
      });
      const activeRooms = statusMap["ACTIVE"] || 0;
      const maintenanceRooms = statusMap["MAINTENANCE"] || 0;
      const inactiveRooms = statusMap["INACTIVE"] || 0;

      // 4. Phòng đầy (tính từ booking hiện tại và room_price_schedule với available_rooms = 0)
      // Lấy số phòng đang được đặt trong khoảng thời gian hiện tại
      const today = new Date().toISOString().split('T')[0];
      const [fullRoomsData]: any = await pool.query(
        `SELECT COUNT(DISTINCT r.room_id) as count
         FROM room r
         WHERE r.status = 'ACTIVE'
         AND NOT EXISTS (
           SELECT 1 FROM room_price_schedule rps
           WHERE rps.room_id = r.room_id
           AND rps.date = DATE(?)
           AND rps.available_rooms > 0
         )
         AND EXISTS (
           SELECT 1 FROM booking_detail bd
           JOIN booking b ON b.booking_id = bd.booking_id
           WHERE bd.room_id = r.room_id
           AND b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
           AND DATE(?) BETWEEN bd.checkin_date AND DATE_SUB(bd.checkout_date, INTERVAL 1 DAY)
         )`,
        [today, today]
      );
      const fullRooms = fullRoomsData[0]?.count || 0;

      // 5. Phòng còn trống (available rooms từ room_price_schedule hoặc room active không có booking)
      const [availableRoomsData]: any = await pool.query(
        `SELECT COUNT(DISTINCT r.room_id) as count
         FROM room r
         WHERE r.status = 'ACTIVE'
         AND (
           EXISTS (
             SELECT 1 FROM room_price_schedule rps
             WHERE rps.room_id = r.room_id
             AND rps.date = DATE(?)
             AND rps.available_rooms > 0
           )
           OR NOT EXISTS (
             SELECT 1 FROM booking_detail bd
             JOIN booking b ON b.booking_id = bd.booking_id
             WHERE bd.room_id = r.room_id
             AND b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
             AND DATE(?) BETWEEN bd.checkin_date AND DATE_SUB(bd.checkout_date, INTERVAL 1 DAY)
           )
         )`,
        [today, today]
      );
      const availableRooms = availableRoomsData[0]?.count || 0;

      // 6. Giá trung bình
      const [avgPriceData]: any = await pool.query(
        `SELECT AVG(price_base) as avg_price FROM room WHERE price_base > 0 AND status = 'ACTIVE'`
      );
      const avgBasePrice = Number(avgPriceData[0]?.avg_price) || 0;

      // 7. Tỷ lệ công suất trung bình (tính từ booking trong 12 tháng gần nhất)
      // Tính tổng số đêm đã được đặt và tổng số đêm có thể đặt
      const [occupancyData]: any = await pool.query(
        `SELECT 
          COALESCE(SUM(bd.nights_count), 0) as total_nights_booked,
          (SELECT COUNT(*) FROM room WHERE status = 'ACTIVE') as total_active_rooms,
          DATEDIFF(CURDATE(), DATE_SUB(CURDATE(), INTERVAL 12 MONTH)) as total_days
         FROM booking_detail bd
         JOIN booking b ON b.booking_id = bd.booking_id
         JOIN room r ON r.room_id = bd.room_id
         WHERE b.status IN ('CONFIRMED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT')
         AND bd.checkin_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
         AND r.status = 'ACTIVE'`
      );
      const totalNightsBooked = Number(occupancyData[0]?.total_nights_booked) || 0;
      const totalActiveRooms = Number(occupancyData[0]?.total_active_rooms) || 0;
      const totalDays = Number(occupancyData[0]?.total_days) || 365;
      const totalPossibleNights = totalActiveRooms * totalDays;
      const avgOccupancyRate = totalPossibleNights > 0 
        ? Math.round((totalNightsBooked / totalPossibleNights) * 100 * 10) / 10 
        : 0;

      // 8. Số lượng phòng theo khách sạn
      const [roomsByHotelData]: any = await pool.query(
        `SELECT 
          h.name as hotel,
          COUNT(DISTINCT r.room_id) as count
         FROM hotel h
         LEFT JOIN room_type rt ON rt.hotel_id = h.hotel_id
         LEFT JOIN room r ON r.room_type_id = rt.room_type_id
         WHERE h.status = 'ACTIVE'
         GROUP BY h.hotel_id, h.name
         ORDER BY count DESC
         LIMIT 10`
      );
      const roomsByHotel = roomsByHotelData.map((row: any) => ({
        hotel: row.hotel || "Unknown",
        count: Number(row.count) || 0,
      }));

      // 9. Phân bố loại giường
      const [bedsByTypeData]: any = await pool.query(
        `SELECT 
          COALESCE(rt.bed_type, 'Unknown') as bedType,
          COUNT(*) as count
         FROM room_type rt
         GROUP BY rt.bed_type
         ORDER BY count DESC`
      );
      const bedsByType = bedsByTypeData.map((row: any) => ({
        bedType: row.bedType || "Unknown",
        count: Number(row.count) || 0,
      }));

      // 10. Tỷ lệ công suất theo tháng (12 tháng gần nhất)
      const [occupancyTrendsData]: any = await pool.query(
        `SELECT 
          DATE_FORMAT(bd.checkin_date, '%Y-%m') as month_key,
          COALESCE(SUM(bd.nights_count), 0) as total_nights_booked
         FROM booking_detail bd
         JOIN booking b ON b.booking_id = bd.booking_id
         JOIN room r ON r.room_id = bd.room_id
         WHERE b.status IN ('CONFIRMED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT')
         AND bd.checkin_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
         AND r.status = 'ACTIVE'
         GROUP BY DATE_FORMAT(bd.checkin_date, '%Y-%m')
         ORDER BY month_key ASC`
      );
      
      // Sử dụng lại biến totalActiveRooms đã tính ở trên
      
      // Tạo map từ dữ liệu booking
      const trendsMap = new Map();
      occupancyTrendsData.forEach((row: any) => {
        trendsMap.set(row.month_key, Number(row.total_nights_booked) || 0);
      });
      
      // Tạo đầy đủ 12 tháng và tính tỷ lệ
      const occupancyTrends: Array<{ month: string; rate: number }> = [];
      const currentDate = new Date();

      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = `Th${date.getMonth() + 1}`;
        
        // Tính số ngày trong tháng
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const totalNightsBooked = trendsMap.get(monthKey) || 0;
        const totalPossibleNights = totalActiveRooms * daysInMonth;
        const rate = totalPossibleNights > 0 ? (totalNightsBooked / totalPossibleNights) * 100 : 0;
        
        occupancyTrends.push({
          month: monthName,
          rate: Math.round(rate * 10) / 10, // Làm tròn 1 chữ số thập phân
        });
      }

      // 11. Top loại phòng có doanh thu cao nhất
      const [topRevenueData]: any = await pool.query(
        `SELECT 
          rt.room_type_id,
          rt.name,
          h.name as hotel_name,
          COALESCE(SUM(bd.total_price), 0) as revenue
         FROM room_type rt
         LEFT JOIN hotel h ON h.hotel_id = rt.hotel_id
         LEFT JOIN room r ON r.room_type_id = rt.room_type_id
         LEFT JOIN booking_detail bd ON bd.room_id = r.room_id
         LEFT JOIN booking b ON b.booking_id = bd.booking_id
         WHERE b.status IN ('CONFIRMED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT')
         AND bd.checkin_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
         GROUP BY rt.room_type_id, rt.name, h.name
         ORDER BY revenue DESC
         LIMIT 5`
      );
      const topRevenueRoomTypes = topRevenueData.map((row: any) => ({
        room_type_id: row.room_type_id,
        name: row.name || "Unknown",
        revenue: Number(row.revenue) || 0,
        hotel_name: row.hotel_name || "Unknown",
      }));

      // 12. Top phòng có giá trị booking cao nhất (số lần booking)
      const [topBookedData]: any = await pool.query(
        `SELECT 
          r.room_id,
          r.room_number,
          rt.name as room_type,
          h.name as hotel_name,
          COUNT(DISTINCT bd.booking_id) as booking_count
         FROM room r
         JOIN room_type rt ON rt.room_type_id = r.room_type_id
         JOIN hotel h ON h.hotel_id = rt.hotel_id
         LEFT JOIN booking_detail bd ON bd.room_id = r.room_id
         LEFT JOIN booking b ON b.booking_id = bd.booking_id
         WHERE b.status IN ('CONFIRMED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT')
         AND bd.checkin_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
         GROUP BY r.room_id, r.room_number, rt.name, h.name
         ORDER BY booking_count DESC
         LIMIT 5`
      );
      const topBookedRooms = topBookedData.map((row: any) => ({
        room_id: row.room_id,
        room_number: row.room_number || "N/A",
        room_type: row.room_type || "Unknown",
        booking_count: Number(row.booking_count) || 0,
        hotel_name: row.hotel_name || "Unknown",
      }));

      return {
        totalRoomTypes: totalRoomTypesCount,
        totalRooms: totalRoomsCount,
        activeRooms,
        maintenanceRooms,
        inactiveRooms,
        fullRooms,
        availableRooms,
        avgBasePrice,
        avgOccupancyRate,
        roomsByHotel,
        bedsByType,
        occupancyTrends,
        topRevenueRoomTypes,
        topBookedRooms,
      };
    } catch (error: any) {
      console.error("[AdminRoomRepository] Error getting dashboard stats:", error);
      throw error;
    }
  }
}
