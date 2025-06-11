import { AuthChecker } from 'type-graphql';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

interface MyContext {
  user?: { id: number; email: string; role: string };
}

export const customAuthChecker: AuthChecker<MyContext> = (
  { context },
  roles,
) => {
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