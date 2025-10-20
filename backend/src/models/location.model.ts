export interface Location{
    locationId: string;
    country: string;
    city: string;
    district?: string | null;
    ward?: string | null;
    areaName?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    distanceCenter?: number | null;
    createAt?: Date;
}

export function mapLocationRow(row: any): Location{
    return{
        locationId: row.location_id,
        country: row.country,
        city: row.city,
        district: row.district,
        ward: row.ward,
        areaName: row.area_name ?? row.areaName ?? null,
        longitude: row.longitude ? Number(row.longitude) : null,
        latitude: row.latitude ? Number(row.latitude) : null,
        distanceCenter: row.distance_center ? Number(row.distance_center) : null,
        createAt: row.create_at,
    };
}