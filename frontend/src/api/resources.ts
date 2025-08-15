import api from './axios';

export interface Resource {
  name: string;
  type: 'pdf' | 'doc' | 'link' | 'txt' | 'unknown';
  url: string;
  category: string;
  size?: string;
}

export const getResources = async (): Promise<{ [category: string]: Resource[] } | any[]> => {
  const response = await api.get('/resources');
  return response.data;
};

export const deleteResource = async (name: string): Promise<void> => {
  await api.delete(`/admin/resource/${encodeURIComponent(name)}`);
};

export const searchResources = (
  resources: { [category: string]: Resource[] } | any[],
  query: string,
  categoryFilter?: string
): Resource[] => {
  let allResources: Resource[] = [];

  // Handle both object format and array format from GitHub API
  if (Array.isArray(resources)) {
    allResources = resources.flatMap(categoryData => 
      (categoryData.files || []).map((file: any) => ({
        name: file.name,
        type: file.type as 'pdf' | 'doc' | 'link' | 'txt' | 'unknown',
        url: file.url,
        category: categoryData.category,
        size: file.size
      }))
    );
  } else {
    allResources = Object.entries(resources).flatMap(([category, items]) =>
      (items || []).map(item => ({ ...item, category }))
    );
  }

  let filtered = allResources;

  if (categoryFilter && categoryFilter !== 'all') {
    filtered = filtered.filter(resource => resource.category === categoryFilter);
  }

  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(resource =>
      resource.name.toLowerCase().includes(lowerQuery)
    );
  }

  return filtered;
};