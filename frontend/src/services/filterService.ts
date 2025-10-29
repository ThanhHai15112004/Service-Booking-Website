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
    if (res.data.success) {
      return res.data.items || [];
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
    if (res.data.success) {
      return res.data.items || [];
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
    if (res.data.success) {
      return res.data.items || [];
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
    if (res.data.success) {
      return res.data.items || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching policies:', error);
    return [];
  }
};
