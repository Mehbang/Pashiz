import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ADMIN_SESSION_COOKIE, AdminAuthService } from './AdminAuth.service';
import { ALLOW_SIGNED_OUT } from './Admin.constants';

/**
 * Guards every route under the portal.
 *
 * Two things have to hold: the URL carries the portal's own segment, and —
 * unless the route is the sign-in form itself — the request carries a valid
 * session.
 *
 * Every refusal is a 404, never a 401 or a 403. A wrong portal segment, a
 * portal that was never configured and a missing session all look identical
 * from outside, so nobody scanning can tell the difference between "there is
 * no admin page here" and "there is one and you did not get in".
 */
@Injectable()
export class AdminPortalGuard implements CanActivate {
  constructor(
    private readonly adminAuth: AdminAuthService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (!this.adminAuth.isConfigured()) throw new NotFoundException();

    const portalKey = request.params?.portalKey;
    if (!this.adminAuth.isPortalPath(portalKey)) throw new NotFoundException();

    const allowsSignedOut = this.reflector.getAllAndOverride<boolean>(
      ALLOW_SIGNED_OUT,
      [context.getHandler(), context.getClass()],
    );
    if (allowsSignedOut) return true;

    const session = readCookie(request, ADMIN_SESSION_COOKIE);
    if (!this.adminAuth.verifySession(session)) throw new NotFoundException();

    return true;
  }
}

/**
 * Read one cookie without adding a body-parser to the whole application; the
 * portal is the only thing here that uses cookies at all.
 */
export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers?.cookie;
  if (!header) return undefined;

  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;

    if (part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }
  return undefined;
}
