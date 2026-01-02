import type {
  Adapter,
  AdapterAccount,
  AdapterAuthenticator,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "@auth/core/adapters";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { FunctionArgs, FunctionReference } from "convex/server";
import { api } from "../convex/_generated/api";
import { Doc, Id } from "../convex/_generated/dataModel";

type User = AdapterUser & { id: Id<"users"> };
type Session = AdapterSession & { userId: Id<"users"> };
type Account = AdapterAccount & { userId: Id<"users"> };
type Authenticator = AdapterAuthenticator & { userId: Id<"users"> };

// 1. Simplest form, a plain object.
export const ConvexAdapter: Adapter = {
  async createAuthenticator(authenticator: Authenticator) {
    const authenticatorToSave = {
      ...authenticator,
      transports: authenticator.transports ?? undefined,
    };
    await callMutation(api.authAdopter.createAuthenticator, {
      authenticator: authenticatorToSave,
    });
    return authenticator;
  },
  async createSession(session: Session) {
    const newId = await callMutation(api.authAdopter.createSession, {
      session: toDB(session) as ToDB<Session>,
    });
    return { ...session, id: newId };
  },
  async createUser(user: User) {
    const { id, ...userWithoutId } = user;
    const newId = await callMutation(api.authAdopter.createUser, {
      user: toDB(userWithoutId),
    });
    return { ...userWithoutId, id: newId };
  },
  async createVerificationToken(verificationToken: VerificationToken) {
    await callMutation(api.authAdopter.createVerificationToken, {
      verificationToken: toDB(verificationToken) as ToDB<VerificationToken>,
    });
    return verificationToken;
  },
  async deleteSession(sessionToken) {
    return maybeSessionFromDB(
      await callMutation(api.authAdopter.deleteSession, {
        sessionToken,
      })
    );
  },
  async deleteUser(id: Id<"users">) {
    return maybeUserFromDB(
      await callMutation(api.authAdopter.deleteUser, { id })
    );
  },
  async getAccount(providerAccountId, provider) {
    return await callQuery(api.authAdopter.getAccount, {
      provider,
      providerAccountId,
    });
  },
  async getAuthenticator(credentialID) {
    return await callQuery(api.authAdopter.getAuthenticator, { credentialID });
  },
  async getSessionAndUser(sessionToken) {
    const result = await callQuery(api.authAdopter.getSessionAndUser, {
      sessionToken,
    });
    if (result === null) {
      return null;
    }
    const { user, session } = result;
    return { user: userFromDB(user), session: sessionFromDB(session) };
  },
  async getUser(id: Id<"users">) {
    return maybeUserFromDB(await callQuery(api.authAdopter.getUser, { id }));
  },
  async getUserByAccount({ provider, providerAccountId }) {
    return maybeUserFromDB(
      await callQuery(api.authAdopter.getUserByAccount, {
        provider,
        providerAccountId,
      })
    );
  },
  async getUserByEmail(email) {
    return maybeUserFromDB(
      await callQuery(api.authAdopter.getUserByEmail, { email })
    );
  },
  async linkAccount(account: Account) {
    return await callMutation(api.authAdopter.linkAccount, { account });
  },
  async listAuthenticatorsByUserId(userId: Id<"users">) {
    return await callQuery(api.authAdopter.listAuthenticatorsByUserId, {
      userId,
    });
  },
  async unlinkAccount({ provider, providerAccountId }) {
    return (
      (await callMutation(api.authAdopter.unlinkAccount, {
        provider,
        providerAccountId,
      })) ?? undefined
    );
  },
  async updateAuthenticatorCounter(credentialID, newCounter) {
    return await callMutation(api.authAdopter.updateAuthenticatorCounter, {
      credentialID,
      newCounter,
    });
  },
  async updateSession(session: Session) {
    return await callMutation(api.authAdopter.updateSession, {
      session: toDB(session) as ToDB<Session>,
    });
  },
  async updateUser(user: User) {
    await callMutation(api.authAdopter.updateUser, {
      user: {
        ...(toDB(user) as ToDB<User>),
        id: user.id,
      },
    });
    return user;
  },
  async useVerificationToken({ identifier, token }) {
    return maybeVerificationTokenFromDB(
      await callMutation(api.authAdopter.useVerificationToken, {
        identifier,
        token,
      })
    );
  },
};

/// Helpers

function callQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: Omit<FunctionArgs<Query>, "secret">
) {
  return fetchQuery(query, addSecret(args) as FunctionArgs<Query>);
}

function callMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  args: Omit<FunctionArgs<Mutation>, "secret">
) {
  return fetchMutation(mutation, addSecret(args) as FunctionArgs<Mutation>);
}

if (process.env.CONVEX_AUTH_ADAPTER_SECRET === undefined) {
  throw new Error("Missing CONVEX_AUTH_ADAPTER_SECRET environment variable");
}

function addSecret<T extends Record<string, unknown>>(args: T): T & { secret: string } {
  return { ...args, secret: process.env.CONVEX_AUTH_ADAPTER_SECRET! };
}

function maybeUserFromDB(user: Doc<"users"> | null) {
  if (user === null) {
    return null;
  }
  return userFromDB(user);
}

function userFromDB(user: Doc<"users">) {
  return {
    ...user,
    id: user._id,
    emailVerified: maybeDate(user.emailVerified),
  };
}

function maybeSessionFromDB(session: Doc<"sessions"> | null) {
  if (session === null) {
    return null;
  }
  return sessionFromDB(session);
}

function sessionFromDB(session: Doc<"sessions">) {
  return { ...session, id: session._id, expires: new Date(session.expires) };
}

function maybeVerificationTokenFromDB(
  verificationToken: Doc<"verificationTokens"> | null
) {
  if (verificationToken === null) {
    return null;
  }
  return verificationTokenFromDB(verificationToken);
}

function verificationTokenFromDB(verificationToken: Doc<"verificationTokens">) {
  return { ...verificationToken, expires: new Date(verificationToken.expires) };
}

function maybeDate(value: number | undefined) {
  return value === undefined ? null : new Date(value);
}

type ToDB<T> = {
  [K in keyof T]: T[K] extends Date
    ? number
    : null extends T[K]
      ? undefined
      : T[K];
};

function toDB<T>(obj: T): ToDB<T> {
  const result: Record<string, unknown> = {};
  for (const key in obj as Record<string, unknown>) {
    const value = (obj as Record<string, unknown>)[key];
    result[key] =
      value instanceof Date
        ? value.getTime()
        : value === null
          ? undefined
          : value;
  }
  return result as ToDB<T>;
}
