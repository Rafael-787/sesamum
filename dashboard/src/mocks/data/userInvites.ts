import { nanoid } from "nanoid";
import type { UserInvite, UserInviteStatus } from "../../shared/types";

// ==========================================
// 🎫 User Invites Mock Data
// ==========================================

/**
 * Compute invite status based on used_by and expires_at
 * This simulates server-side status computation
 */
export function computeInviteStatus(invite: {
  used_by: number | null;
  expires_at: string;
}): UserInviteStatus {
  if (invite.used_by !== null) {
    return "used";
  }
  const now = new Date();
  const expiresAt = new Date(invite.expires_at);
  return now > expiresAt ? "expired" : "pending";
}

/**
 * Mock user invites representing slots opened by admin for new users
 * Used in registration flow to validate and consume invite tokens
 * Note: status is computed dynamically, not stored
 */
export let mockUserInvites: UserInvite[] = [
  // ✅ PENDING INVITES (Active)
  {
    id: "invite_V1StGXR8_Z5jdHi6B", // Nano UUID
    company_id: 1,
    company: "Produevents",
    email: "newuser@alphaproduction.com", // Email-restricted invite
    role: "company",
    used_by: null,
    status: "pending", // Computed
    created_at: "2026-01-15T10:00:00Z",
    expires_at: "2026-02-15T10:00:00Z", // Valid for 1 month
    created_by: 1, // Admin user
  },
  {
    id: "invite_K3pL9xR2_M8nQwEr",
    company_id: 2,
    company: "Tech Solutions",
    role: "control", // Any email can use this
    used_by: null,
    status: "pending", // Computed
    created_at: "2026-01-18T14:30:00Z",
    expires_at: "2026-01-25T14:30:00Z", // Expires in 5 days
    created_by: 1,
  },
  {
    id: "invite_P7yT4vN1_H6kLmZx",
    company_id: 3,
    company: "Esporte & Eventos",
    email: "tech.lead@gammatech.com",
    role: "company",
    used_by: null,
    status: "pending", // Computed
    created_at: "2026-01-19T09:15:00Z",
    expires_at: "2026-03-19T09:15:00Z", // Valid for 2 months
    created_by: 1,
  },

  // ✅ USED INVITES (Already consumed)
  {
    id: "invite_W2aB8cD5_R9tYuIo",
    company_id: 1,
    company: "Produevents",
    email: "maria.santos@alphaproduction.com",
    role: "company",
    used_by: 2, // Maria Santos user ID
    status: "used", // Computed
    created_at: "2025-12-20T11:00:00Z",
    expires_at: "2026-01-20T11:00:00Z",
    created_by: 1,
  },
  {
    id: "invite_F5gH3jK8_L2mNpQw",
    company_id: 4, // Delta Logistics
    company: "Delta Logistics",
    role: "control",
    used_by: 4, // Pedro Costa user ID
    status: "used", // Computed
    created_at: "2025-12-28T16:45:00Z",
    expires_at: "2026-01-28T16:45:00Z",
    created_by: 1,
  },

  // ❌ EXPIRED INVITES (Past expiration date)
  {
    id: "invite_X9zC4vB6_N8mKlPo",
    company_id: 2,
    company: "Tech Solutions",
    email: "expired@betaservices.com",
    role: "company",
    used_by: null,
    status: "expired", // Computed
    created_at: "2025-11-15T10:00:00Z",
    expires_at: "2025-12-15T10:00:00Z", // Expired last month
    created_by: 1,
  },
  {
    id: "invite_Q2wE7rT9_Y5uIoAq",
    company_id: 5, // Epsilon Media
    company: "Epsilon Media",
    role: "control",
    used_by: null,
    status: "expired", // Computed
    created_at: "2025-10-10T08:30:00Z",
    expires_at: "2025-11-10T08:30:00Z", // Expired 2 months ago
    created_by: 1,
  },
];

/**
 * Reset user invites to initial state (useful for testing)
 */
export function resetUserInvites(): void {
  mockUserInvites = [
    {
      id: "invite_V1StGXR8_Z5jdHi6B",
      company_id: 1,
      company: "Produevents",
      email: "newuser@alphaproduction.com",
      role: "company",
      used_by: null,
      status: "pending",
      created_at: "2026-01-15T10:00:00Z",
      expires_at: "2026-02-15T10:00:00Z",
      created_by: 1,
    },
    {
      id: "invite_K3pL9xR2_M8nQwEr",
      company_id: 2,
      company: "Tech Solutions",
      role: "control",
      used_by: null,
      status: "pending",
      created_at: "2026-01-18T14:30:00Z",
      expires_at: "2026-01-25T14:30:00Z",
      created_by: 1,
    },
    {
      id: "invite_P7yT4vN1_H6kLmZx",
      company_id: 3,
      company: "Esporte & Eventos",
      email: "tech.lead@gammatech.com",
      role: "company",
      used_by: null,
      status: "pending",
      created_at: "2026-01-19T09:15:00Z",
      expires_at: "2026-03-19T09:15:00Z",
      created_by: 1,
    },
    {
      id: "invite_W2aB8cD5_R9tYuIo",
      company_id: 1,
      company: "Produevents",
      email: "maria.santos@alphaproduction.com",
      role: "company",
      used_by: 2,
      status: "used",
      created_at: "2025-12-20T11:00:00Z",
      expires_at: "2026-01-20T11:00:00Z",
      created_by: 1,
    },
    {
      id: "invite_F5gH3jK8_L2mNpQw",
      company_id: 4,
      company: "Delta Logistics",
      role: "control",
      used_by: 4,
      status: "used",
      created_at: "2025-12-28T16:45:00Z",
      expires_at: "2026-01-28T16:45:00Z",
      created_by: 1,
    },
    {
      id: "invite_X9zC4vB6_N8mKlPo",
      company_id: 2,
      company: "Tech Solutions",
      email: "expired@betaservices.com",
      role: "company",
      used_by: null,
      status: "expired",
      created_at: "2025-11-15T10:00:00Z",
      expires_at: "2025-12-15T10:00:00Z",
      created_by: 1,
    },
    {
      id: "invite_Q2wE7rT9_Y5uIoAq",
      company_id: 5,
      company: "Epsilon Media",
      role: "control",
      used_by: null,
      status: "expired",
      created_at: "2025-10-10T08:30:00Z",
      expires_at: "2025-11-10T08:30:00Z",
      created_by: 1,
    },
  ];
}

/**
 * Generate a new invite token (for use in handlers)
 */
export function generateInviteToken(): string {
  return `invite_${nanoid(18)}`;
}
