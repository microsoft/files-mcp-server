import { DynamicToolMode } from "./types.js";
import { stringIsNullOrEmpty } from "./utils.js";

const sessions = new Map<string, MCPSession>();

export interface MCPSession {
    sessionId: string;
    mode: DynamicToolMode;
    currentContextRoot: string;
    props: Record<string, any>;
}

export async function ensureSession(sessionId: string): Promise<MCPSession> {

    if (stringIsNullOrEmpty(sessionId)) {
        throw Error("No Session id.");
    }

    if (sessions.has(sessionId)) {
        return sessions.get(sessionId);
    }

    const sessionCtx: MCPSession = {
        sessionId,
        currentContextRoot: "",
        mode: "site",
        props: {},
    }

    sessions.set(sessionId, sessionCtx);

    return sessionCtx;
}

// TODO: more robust update metchanism
export async function patchSession(sessionId, session: Partial<Omit<MCPSession, "sessionId">>): Promise<MCPSession> {

    if (stringIsNullOrEmpty(sessionId)) {
        throw Error("No Session id.");
    }

    if (!sessions.has(sessionId)) {
        return ensureSession(sessionId);
    }

    const currentSession = sessions.get(sessionId);

    sessions.set(sessionId, { ...currentSession, ...session });

    return sessions.get(sessionId);
}
