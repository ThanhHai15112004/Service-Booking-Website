import api from "../api/axiosClient";

export interface Category {
  categoryId: string;
  name: string;
  icon?: string;
}

export interface Facility {
  facilityId: string;
  name: string;
  category: 'HOTEL' | 'ROOM';
  icon?: string;
}

export interface BedType {
  key: string;
  label: string;
  icon?: string;
}

export interface Policy {
  key: string;
  label: string;
  icon?: string;
  available?: boolean;
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    const res = await api.get('/api/categories');
    // Backend đã format: { success: true, data: [{ categoryId, name, icon, ... }] }
    if (res.data.success && res.data.data) {
      return res.data.data.map((item: any) => ({
        categoryId: item.categoryId,
        name: item.name,
        icon: item.icon || undefined
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getFacilities = async (): Promise<Facility[]> => {
  try {
    const res = await api.get('/api/facilities');
    // Backend đã format: { success: true, data: [{ facilityId, name, category, icon, ... }] }
    if (res.data.success && res.data.data) {
      return res.data.data.map((item: any) => ({
        facilityId: item.facilityId,
        name: item.name,
        category: item.category as 'HOTEL' | 'ROOM',
        icon: item.icon || undefined
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return [];
  }
};

export const getBedTypes = async (): Promise<BedType[]> => {
  try {
    const res = await api.get('/api/bed-types');
    // Backend đã format: { success: true, data: [{ key, label, labelEn, ... }] }
    if (res.data.success && res.data.data) {
      return res.data.data.map((item: any) => ({
        key: item.key,
        label: item.label || item.labelEn,
        icon: item.icon || undefined
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching bed types:', error);
    return [];
  }
};

export const getPolicies = async (): Promise<Policy[]> => {
  try {
    const res = await api.get('/api/policies');
    // Backend đã format: { success: true, data: [{ key, label, labelEn, icon, ... }] }
    if (res.data.success && res.data.data) {
      return res.data.data.map((item: any) => ({
        key: item.key,
        label: item.label || item.labelEn,
        icon: item.icon || undefined,
        available: item.available !== undefined ? item.available : true
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching policies:', error);
    return [];
  }
};
