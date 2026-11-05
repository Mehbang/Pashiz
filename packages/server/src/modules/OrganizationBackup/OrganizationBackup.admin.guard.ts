import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

/**
 * Restricts the organization backup routes to an organization's administrator.
 *
 * Exporting a whole organization's books, or replacing them from a file, is far
 * more than any single-resource permission grants, so it is gated on the
 * predefined admin role — the only role whose ability answers `manage all`.
 * This runs after `AuthorizationGuard`, which attaches that ability to the
 * request; a member with an ordinary role is refused.
 */
@Injectable()
export class OrganizationBackupAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ability = (request as any).ability;

    if (!ability || !ability.can('manage', 'all')) {
      throw new ForbiddenException(
        'Only an administrator may export or restore the organization.',
      );
    }
    return true;
  }
}
