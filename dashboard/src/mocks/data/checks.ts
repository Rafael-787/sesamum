import type { Check } from "../../shared/types";

// ==========================================
// ✅ Checks Mock Data
// ==========================================

/**
 * Mock checks representing staff registration, check-in, and check-out history
 * Linked to events_staff via events_staff_id (Nano UUID)
 *
 * Staff CPFs (for reference):
 * 1 - João Silva: 12345678900
 * 2 - Maria Santos: 98765432100
 * 3 - Pedro Oliveira: 11122233344
 * 4 - Ana Costa: 55566677788
 * 5 - Carlos Souza: 99988877766
 * 6 - Lucia Ferreira: 44455566677
 * 7 - Rafael Alves: 33344455566
 * 8 - Juliana Lima: 22233344455
 */
export let mockChecks: Check[] = [
  // ========================================
  // Event 1 - Rock Festival 2026 Checks
  // ========================================

  // Staff 1 - João Silva (CPF: 12345678900) - Full cycle: registration → check-in → check-out
  {
    id: 1,
    action: "registration",
    timestamp: "2026-01-15T08:00:00Z",
    events_staff_id: "es_V1StGXR8_Z5jdHi6B", // João Silva at Event 1
    user_control_id: 7, // Roberto Lima (control)
    staff_name: "João Silva",
    staff_cpf: 12345678900,
  },
  {
    id: 2,
    action: "check-in",
    timestamp: "2026-01-15T14:30:00Z",
    events_staff_id: "es_V1StGXR8_Z5jdHi6B",
    user_control_id: 7,
    staff_name: "João Silva",
    staff_cpf: 12345678900,
  },
  {
    id: 3,
    action: "check-out",
    timestamp: "2026-01-15T23:45:00Z",
    events_staff_id: "es_V1StGXR8_Z5jdHi6B",
    user_control_id: 7,
    staff_name: "João Silva",
    staff_cpf: 12345678900,
  },

  // Staff 2 - Maria Santos (CPF: 98765432100) - Registration + check-in (still inside)
  {
    id: 4,
    action: "registration",
    timestamp: "2026-01-15T08:15:00Z",
    events_staff_id: "es_K3pL9xR2_M8nQwEr", // Maria Santos at Event 1
    user_control_id: 7,
    staff_name: "Maria Santos",
    staff_cpf: 98765432100,
  },
  {
    id: 5,
    action: "check-in",
    timestamp: "2026-01-15T15:00:00Z",
    events_staff_id: "es_K3pL9xR2_M8nQwEr",
    user_control_id: 8, // Fernanda Costa (control)
    staff_name: "Maria Santos",
    staff_cpf: 98765432100,
  },

  // Staff 3 - Pedro Oliveira (CPF: 11122233344) - Only registered, never checked in
  {
    id: 6,
    action: "registration",
    timestamp: "2026-01-15T09:00:00Z",
    events_staff_id: "es_P7yT4vN1_H6kLmZx", // Pedro Oliveira at Event 1
    user_control_id: 7,
    staff_name: "Pedro Oliveira",
    staff_cpf: 11122233344,
  },

  // ========================================
  // Event 2 - Tech Summit 2026 Checks
  // ========================================

  // Staff 4 - Ana Costa (CPF: 55566677788) - Full cycle
  {
    id: 7,
    action: "registration",
    timestamp: "2026-01-18T07:30:00Z",
    events_staff_id: "es_W2aB8cD5_R9tYuIo", // Ana Costa at Event 2
    user_control_id: 8,
    staff_name: "Ana Costa",
    staff_cpf: 55566677788,
  },
  {
    id: 8,
    action: "check-in",
    timestamp: "2026-01-18T09:00:00Z",
    events_staff_id: "es_W2aB8cD5_R9tYuIo",
    user_control_id: 8,
    staff_name: "Ana Costa",
    staff_cpf: 55566677788,
  },
  {
    id: 9,
    action: "check-out",
    timestamp: "2026-01-18T18:30:00Z",
    events_staff_id: "es_W2aB8cD5_R9tYuIo",
    user_control_id: 8,
    staff_name: "Ana Costa",
    staff_cpf: 55566677788,
  },

  // Staff 5 - Carlos Souza (CPF: 99988877766) - Registration only
  {
    id: 10,
    action: "registration",
    timestamp: "2026-01-18T07:45:00Z",
    events_staff_id: "es_F5gH3jK8_L2mNpQw", // Carlos Souza at Event 2
    user_control_id: 8,
    staff_name: "Carlos Souza",
    staff_cpf: 99988877766,
  },

  // ========================================
  // Event 3 - Corporate Event 2026 Checks
  // ========================================

  // Staff 6 - Lucia Ferreira (CPF: 44455566677) - Registration + check-in
  {
    id: 11,
    action: "registration",
    timestamp: "2026-01-19T08:00:00Z",
    events_staff_id: "es_X9zC4vB6_N8mKlPo", // Lucia Ferreira at Event 3
    user_control_id: 7,
    staff_name: "Lucia Ferreira",
    staff_cpf: 44455566677,
  },
  {
    id: 12,
    action: "check-in",
    timestamp: "2026-01-19T10:30:00Z",
    events_staff_id: "es_X9zC4vB6_N8mKlPo",
    user_control_id: 7,
    staff_name: "Lucia Ferreira",
    staff_cpf: 44455566677,
  },

  // Staff 7 - Rafael Alves (CPF: 33344455566) - Full cycle with multiple check-ins (in/out/in/out)
  {
    id: 13,
    action: "registration",
    timestamp: "2026-01-19T08:15:00Z",
    events_staff_id: "es_Q2wE7rT9_Y5uIoAq", // Rafael Alves at Event 3
    user_control_id: 7,
    staff_name: "Rafael Alves",
    staff_cpf: 33344455566,
  },
  {
    id: 14,
    action: "check-in",
    timestamp: "2026-01-19T09:00:00Z",
    events_staff_id: "es_Q2wE7rT9_Y5uIoAq",
    user_control_id: 7,
    staff_name: "Rafael Alves",
    staff_cpf: 33344455566,
  },
  {
    id: 15,
    action: "check-out",
    timestamp: "2026-01-19T12:00:00Z",
    events_staff_id: "es_Q2wE7rT9_Y5uIoAq",
    user_control_id: 8,
    staff_name: "Rafael Alves",
    staff_cpf: 33344455566,
  },
  {
    id: 16,
    action: "check-in",
    timestamp: "2026-01-19T14:00:00Z",
    events_staff_id: "es_Q2wE7rT9_Y5uIoAq",
    user_control_id: 8,
    staff_name: "Rafael Alves",
    staff_cpf: 33344455566,
  },
  {
    id: 17,
    action: "check-out",
    timestamp: "2026-01-19T18:00:00Z",
    events_staff_id: "es_Q2wE7rT9_Y5uIoAq",
    user_control_id: 8,
    staff_name: "Rafael Alves",
    staff_cpf: 33344455566,
  },

  // Staff 8 - Juliana Lima (CPF: 22233344455) - Registration only (not checked in yet)
  {
    id: 18,
    action: "registration",
    timestamp: "2026-01-19T08:30:00Z",
    events_staff_id: "es_Z7xN3mK9_L4pQwRt", // Juliana Lima at Event 3
    user_control_id: 7,
    staff_name: "Juliana Lima",
    staff_cpf: 22233344455,
  },
];

/**
 * Reset checks to initial state (useful for testing)
 */
export function resetChecks(): void {
  mockChecks = [
    {
      id: 1,
      action: "registration",
      timestamp: "2026-01-15T08:00:00Z",
      events_staff_id: "es_V1StGXR8_Z5jdHi6B",
      user_control_id: 7,
      staff_name: "João Silva",
      staff_cpf: 12345678900,
    },
    {
      id: 2,
      action: "check-in",
      timestamp: "2026-01-15T14:30:00Z",
      events_staff_id: "es_V1StGXR8_Z5jdHi6B",
      user_control_id: 7,
      staff_name: "João Silva",
      staff_cpf: 12345678900,
    },
    {
      id: 3,
      action: "check-out",
      timestamp: "2026-01-15T23:45:00Z",
      events_staff_id: "es_V1StGXR8_Z5jdHi6B",
      user_control_id: 7,
      staff_name: "João Silva",
      staff_cpf: 12345678900,
    },
    {
      id: 4,
      action: "registration",
      timestamp: "2026-01-15T08:15:00Z",
      events_staff_id: "es_K3pL9xR2_M8nQwEr",
      user_control_id: 7,
      staff_name: "Maria Santos",
      staff_cpf: 98765432100,
    },
    {
      id: 5,
      action: "check-in",
      timestamp: "2026-01-15T15:00:00Z",
      events_staff_id: "es_K3pL9xR2_M8nQwEr",
      user_control_id: 8,
      staff_name: "Maria Santos",
      staff_cpf: 98765432100,
    },
    {
      id: 6,
      action: "registration",
      timestamp: "2026-01-15T09:00:00Z",
      events_staff_id: "es_P7yT4vN1_H6kLmZx",
      user_control_id: 7,
      staff_name: "Pedro Oliveira",
      staff_cpf: 11122233344,
    },
    {
      id: 7,
      action: "registration",
      timestamp: "2026-01-18T07:30:00Z",
      events_staff_id: "es_W2aB8cD5_R9tYuIo",
      user_control_id: 8,
      staff_name: "Ana Costa",
      staff_cpf: 55566677788,
    },
    {
      id: 8,
      action: "check-in",
      timestamp: "2026-01-18T09:00:00Z",
      events_staff_id: "es_W2aB8cD5_R9tYuIo",
      user_control_id: 8,
      staff_name: "Ana Costa",
      staff_cpf: 55566677788,
    },
    {
      id: 9,
      action: "check-out",
      timestamp: "2026-01-18T18:30:00Z",
      events_staff_id: "es_W2aB8cD5_R9tYuIo",
      user_control_id: 8,
      staff_name: "Ana Costa",
      staff_cpf: 55566677788,
    },
    {
      id: 10,
      action: "registration",
      timestamp: "2026-01-18T07:45:00Z",
      events_staff_id: "es_F5gH3jK8_L2mNpQw",
      user_control_id: 8,
      staff_name: "Carlos Souza",
      staff_cpf: 99988877766,
    },
    {
      id: 11,
      action: "registration",
      timestamp: "2026-01-19T08:00:00Z",
      events_staff_id: "es_X9zC4vB6_N8mKlPo",
      user_control_id: 7,
      staff_name: "Lucia Ferreira",
      staff_cpf: 44455566677,
    },
    {
      id: 12,
      action: "check-in",
      timestamp: "2026-01-19T10:30:00Z",
      events_staff_id: "es_X9zC4vB6_N8mKlPo",
      user_control_id: 7,
      staff_name: "Lucia Ferreira",
      staff_cpf: 44455566677,
    },
    {
      id: 13,
      action: "registration",
      timestamp: "2026-01-19T08:15:00Z",
      events_staff_id: "es_Q2wE7rT9_Y5uIoAq",
      user_control_id: 7,
      staff_name: "Rafael Alves",
      staff_cpf: 33344455566,
    },
    {
      id: 14,
      action: "check-in",
      timestamp: "2026-01-19T09:00:00Z",
      events_staff_id: "es_Q2wE7rT9_Y5uIoAq",
      user_control_id: 7,
      staff_name: "Rafael Alves",
      staff_cpf: 33344455566,
    },
    {
      id: 15,
      action: "check-out",
      timestamp: "2026-01-19T12:00:00Z",
      events_staff_id: "es_Q2wE7rT9_Y5uIoAq",
      user_control_id: 8,
      staff_name: "Rafael Alves",
      staff_cpf: 33344455566,
    },
    {
      id: 16,
      action: "check-in",
      timestamp: "2026-01-19T14:00:00Z",
      events_staff_id: "es_Q2wE7rT9_Y5uIoAq",
      user_control_id: 8,
      staff_name: "Rafael Alves",
      staff_cpf: 33344455566,
    },
    {
      id: 17,
      action: "check-out",
      timestamp: "2026-01-19T18:00:00Z",
      events_staff_id: "es_Q2wE7rT9_Y5uIoAq",
      user_control_id: 8,
      staff_name: "Rafael Alves",
      staff_cpf: 33344455566,
    },
    {
      id: 18,
      action: "registration",
      timestamp: "2026-01-19T08:30:00Z",
      events_staff_id: "es_Z7xN3mK9_L4pQwRt",
      user_control_id: 7,
      staff_name: "Juliana Lima",
      staff_cpf: 22233344455,
    },
  ];
}

/**
 * Get next check ID for new check creation
 */
export function getNextCheckId(): number {
  return Math.max(...mockChecks.map((c) => c.id), 0) + 1;
}

/**
 * Get last check for a specific events_staff
 */
export function getLastCheckForStaff(eventsStaffId: string): Check | undefined {
  const staffChecks = mockChecks
    .filter((check) => check.events_staff_id === eventsStaffId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  return staffChecks[0];
}

/**
 * Get registration check for a specific events_staff
 */
export function getRegistrationCheck(eventsStaffId: string): Check | undefined {
  return mockChecks.find(
    (check) =>
      check.events_staff_id === eventsStaffId &&
      check.action === "registration",
  );
}
