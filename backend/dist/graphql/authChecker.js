"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customAuthChecker = void 0;
const customAuthChecker = ({ context }, roles) => {
    // if no roles are specified, then everyone can access
    if (roles.length === 0) {
        return context.user !== undefined; // Check if user is logged in
    }
    // If roles are specified, check if user exists and has one of the roles
    if (!context.user) {
        return false; // Not authenticated
    }
    if (roles.includes(context.user.role)) {
        return true; // User has the required role
    }
    return false; // Access denied
};
exports.customAuthChecker = customAuthChecker;
