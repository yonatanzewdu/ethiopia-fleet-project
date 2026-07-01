// Thin wrapper around the shared API client for the /reports endpoints.
// Uses get() from ./api/client so requests go to the correct backend
// (VITE_API_URL, falling back to the deployed Render URL) and always
// include the Authorization header — instead of a separate hardcoded
// localhost:3000 base URL.
import { get } from './api/client';

function toQuery(params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      usp.set(key, value);
    }
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export const reportsApi = {
  getVehicles: (companyId) => get(`/vehicles${toQuery({ companyId })}`),

  getDashboard: (companyId, { vehicleId, startDate, endDate } = {}) =>
    get(`/reports/dashboard${toQuery({ companyId, vehicleId, startDate, endDate })}`),

  getExpenseBreakdown: (companyId, { vehicleId, startDate, endDate } = {}) =>
    get(`/reports/expense-breakdown${toQuery({ companyId, vehicleId, startDate, endDate })}`),

  getCpkTrend: (companyId, { vehicleId, startDate, endDate, granularity } = {}) =>
    get(`/reports/cpk-trend${toQuery({ companyId, vehicleId, startDate, endDate, granularity })}`),

  getAssetUtilization: (companyId, { vehicleId, startDate, endDate } = {}) =>
    get(`/reports/asset-utilization${toQuery({ companyId, vehicleId, startDate, endDate })}`),

  getVehicleComparison: (companyId, { vehicleId, startDate, endDate } = {}) =>
    get(`/reports/vehicle-comparison${toQuery({ companyId, vehicleId, startDate, endDate })}`),
};
