import { DEFAULT_ORG_ID, DEFAULT_VAULT_ID, type CactusAuthSession, type CactusBackendState, type CactusUser } from "./cactus-backend";
import { redactPotentialSecrets } from "./cactus-settings";

export type BootstrapAuthInput = {
  email: string;
  provider: CactusUser["authProvider"];
  displayName?: string;
  companyName?: string;
};

const now = () => new Date().toISOString();
const plusDays = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

export function normalizeWorkEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) throw new Error("Enter a valid work email to create a Cactus session.");
  return normalized;
}

export function safeEmailSlug(email: string): string {
  return normalizeWorkEmail(email).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function defaultDisplayName(email: string): string {
  const [name] = email.split("@");
  return name.split(/[._+-]+/).filter(Boolean).map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ") || "Cactus User";
}

export function bootstrapAuthSession(state: CactusBackendState, input: BootstrapAuthInput): CactusAuthSession {
  const email = normalizeWorkEmail(input.email);
  const createdAt = now();
  const displayName = redactPotentialSecrets(input.displayName?.trim() || defaultDisplayName(email));
  const organizationName = redactPotentialSecrets(input.companyName?.trim() || state.organizations[0]?.name || "Cactus Capital Partners");

  const org = state.organizations.find((item) => item.id === DEFAULT_ORG_ID);
  if (org) org.name = organizationName;
  else state.organizations.unshift({ id: DEFAULT_ORG_ID, name: organizationName, primaryVaultId: DEFAULT_VAULT_ID, createdAt });

  const userId = `user_${safeEmailSlug(email)}`;
  let user = state.users.find((item) => item.email === email);
  if (!user) {
    user = { id: userId, email, displayName, authProvider: input.provider, createdAt, lastSeenAt: createdAt };
    state.users.push(user);
  } else {
    user.displayName = displayName;
    user.authProvider = input.provider;
    user.lastSeenAt = createdAt;
  }

  let membership = state.organizationMemberships.find((item) => item.userId === user.id && item.organizationId === DEFAULT_ORG_ID);
  if (!membership) {
    membership = { id: `membership_${safeEmailSlug(email)}`, organizationId: DEFAULT_ORG_ID, userId: user.id, role: state.organizationMemberships.length ? "member" : "owner", createdAt };
    state.organizationMemberships.push(membership);
  }

  const session: CactusAuthSession = {
    id: `session_${safeEmailSlug(email)}`,
    userId: user.id,
    organizationId: DEFAULT_ORG_ID,
    email,
    role: membership.role,
    authProvider: input.provider,
    createdAt,
    expiresAt: plusDays(14),
  };
  state.authSessions = [session, ...state.authSessions.filter((item) => item.userId !== user.id)].slice(0, 12);

  const setupTaskId = `task_org_setup_${DEFAULT_ORG_ID}`;
  if (!state.tasks.some((task) => task.id === setupTaskId)) {
    state.tasks.push({ id: setupTaskId, organizationId: DEFAULT_ORG_ID, title: "Complete organization setup and confirm first Vault source", queue: "Maintenance", status: "Inbox", targetType: "organization", targetId: DEFAULT_ORG_ID, createdAt });
  }

  state.auditEvents.unshift({
    id: `audit_auth_${Date.now().toString(36)}`,
    organizationId: DEFAULT_ORG_ID,
    actor: email,
    action: "auth.session_bootstrap",
    targetType: "organization",
    targetId: DEFAULT_ORG_ID,
    summary: `${displayName} created or refreshed a Cactus session with ${input.provider}.`,
    createdAt,
  });

  return session;
}
