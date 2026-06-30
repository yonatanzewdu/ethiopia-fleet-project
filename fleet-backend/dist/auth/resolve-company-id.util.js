"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveCompanyId = resolveCompanyId;
function resolveCompanyId(user, companyIdQuery) {
    if (user.role === 'admin') {
        return companyIdQuery ? Number(companyIdQuery) : undefined;
    }
    return user.companyId ?? undefined;
}
//# sourceMappingURL=resolve-company-id.util.js.map