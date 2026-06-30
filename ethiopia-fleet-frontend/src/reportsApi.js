const API = "http://localhost:3000";

const get = (path) => fetch(`${API}${path}`).then((r) => r.json());

export const reportsApi = {
  getDashboard: (companyId, { vehicleId, startDate, endDate } = {}) => {
    const params = new URLSearchParams({ companyId: String(companyId), startDate, endDate });
    if (vehicleId) params.set('vehicleId', String(vehicleId));
    return get(`/reports/dashboard?${params.toString()}`);
  },
  getVehicles: (companyId) => get(`/vehicles?companyId=${companyId}`),
};