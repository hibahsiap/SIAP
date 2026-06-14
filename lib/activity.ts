import { prisma } from '@/lib/prisma'

/** Extract the client IP from a request's forwarded headers. */
export function getClientIp(req: { headers: Headers }): string | null {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null
}

export type LogActivityInput = {
  userId: string
  action: string
  entityType?: string
  entityId?: string
  description?: string
  ipAddress?: string | null
}

/**
 * Record a user activity log entry. Logging must never break the operation it
 * describes, so failures are swallowed (and reported to the console) rather than
 * thrown. Note: login/logout are intentionally NOT logged.
 */
export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        description: input.description ?? null,
        ipAddress: input.ipAddress ?? null,
      },
    })
  } catch (err) {
    console.error('[activityLog]', err)
  }
}
