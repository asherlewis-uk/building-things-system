import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useSettings } from "./SettingsContext";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

export type Conversation = {
  id: string;
  characterId: string;
  characterName: string;
  lastMessage: string;
  lastMessageTime: number;
  messages: Message[];
  unread?: boolean;
};

type ChatsContextType = {
  conversations: Conversation[];
  archivedConversations: Conversation[];
  getConversation: (characterId: string) => Conversation | undefined;
  upsertConversation: (conversation: Conversation) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  addMessage: (conversationId: string, message: Message) => Promise<void>;
  updateLastMessage: (conversationId: string, message: Message) => Promise<void>;
  archiveConversation: (conversationId: string) => Promise<void>;
  restoreConversation: (conversationId: string) => Promise<void>;
  deleteArchivedConversation: (conversationId: string) => Promise<void>;
  clearAllConversations: () => Promise<void>;
  exportAllData: () => string;
  isLoaded: boolean;
};

const STORAGE_KEY = "persona:conversations";
const ARCHIVE_KEY = "persona:archived";

const ChatsContext = createContext<ChatsContextType | null>(null);

let messageCounter = 0;
export function generateMessageId(): string {
  messageCounter++;
  return `msg-${Date.now()}-${messageCounter}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateConversationId(characterId: string): string {
  return `conv-${characterId}-${Date.now()}`;
}

export function ChatsProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [archivedConversations, setArchivedConversations] = useState<Conversation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { syncArchivedIds, isLoaded: settingsLoaded } = useSettings();

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (isLoaded && settingsLoaded) {
      syncArchivedIds(archivedConversations.map((c) => c.id));
    }
  }, [archivedConversations, syncArchivedIds, isLoaded, settingsLoaded]);

  const loadAll = async () => {
    try {
      const [rawConvs, rawArchived] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(ARCHIVE_KEY),
      ]);
      if (rawConvs) {
        const parsed = JSON.parse(rawConvs) as Conversation[];
        setConversations(parsed.sort((a, b) => b.lastMessageTime - a.lastMessageTime));
      }
      if (rawArchived) {
        const parsed = JSON.parse(rawArchived) as Conversation[];
        setArchivedConversations(parsed.sort((a, b) => b.lastMessageTime - a.lastMessageTime));
      }
    } catch (e) {
      console.error("Failed to load conversations", e);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveConversations = async (convs: Conversation[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
    } catch (e) {
      console.error("Failed to save conversations", e);
    }
  };

  const saveArchived = async (convs: Conversation[]) => {
    try {
      await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify(convs));
    } catch (e) {
      console.error("Failed to save archived conversations", e);
    }
  };

  const getConversation = useCallback(
    (characterId: string) => conversations.find((c) => c.characterId === characterId),
    [conversations]
  );

  const upsertConversation = useCallback(async (conversation: Conversation) => {
    setConversations((prev) => {
      const existing = prev.findIndex((c) => c.id === conversation.id);
      let updated: Conversation[];
      if (existing >= 0) {
        updated = [...prev];
        updated[existing] = conversation;
      } else {
        updated = [conversation, ...prev];
      }
      updated = updated.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      saveConversations(updated);
      return updated;
    });
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== conversationId);
      saveConversations(updated);
      return updated;
    });
  }, []);

  const addMessage = useCallback(
    async (conversationId: string, message: Message) => {
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            messages: [...c.messages, message],
            lastMessage: message.content.slice(0, 80),
            lastMessageTime: message.timestamp,
          };
        });
        saveConversations(updated);
        return updated;
      });
    },
    []
  );

  const updateLastMessage = useCallback(
    async (conversationId: string, message: Message) => {
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== conversationId) return c;
          const msgs = [...c.messages];
          const lastIdx = msgs.length - 1;
          if (lastIdx >= 0 && msgs[lastIdx].role === "assistant") {
            msgs[lastIdx] = message;
          } else {
            msgs.push(message);
          }
          return {
            ...c,
            messages: msgs,
            lastMessage: message.content.slice(0, 80),
            lastMessageTime: message.timestamp,
          };
        });
        saveConversations(updated);
        return updated;
      });
    },
    []
  );

  const archiveConversation = useCallback(async (conversationId: string) => {
    setConversations((prev) => {
      const toArchive = prev.find((c) => c.id === conversationId);
      const updated = prev.filter((c) => c.id !== conversationId);
      saveConversations(updated);
      if (toArchive) {
        setArchivedConversations((archPrev) => {
          const archUpdated = [toArchive, ...archPrev];
          saveArchived(archUpdated);
          return archUpdated;
        });
      }
      return updated;
    });
  }, []);

  const restoreConversation = useCallback(async (conversationId: string) => {
    setArchivedConversations((prev) => {
      const toRestore = prev.find((c) => c.id === conversationId);
      const updated = prev.filter((c) => c.id !== conversationId);
      saveArchived(updated);
      if (toRestore) {
        setConversations((convPrev) => {
          const convUpdated = [toRestore, ...convPrev].sort(
            (a, b) => b.lastMessageTime - a.lastMessageTime
          );
          saveConversations(convUpdated);
          return convUpdated;
        });
      }
      return updated;
    });
  }, []);

  const deleteArchivedConversation = useCallback(async (conversationId: string) => {
    setArchivedConversations((prev) => {
      const updated = prev.filter((c) => c.id !== conversationId);
      saveArchived(updated);
      return updated;
    });
  }, []);

  const clearAllConversations = useCallback(async () => {
    setConversations([]);
    setArchivedConversations([]);
    await AsyncStorage.multiRemove([STORAGE_KEY, ARCHIVE_KEY]);
  }, []);

  const exportAllData = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      conversations,
      archivedConversations,
    };
    return JSON.stringify(data, null, 2);
  }, [conversations, archivedConversations]);

  return (
    <ChatsContext.Provider
      value={{
        conversations,
        archivedConversations,
        getConversation,
        upsertConversation,
        deleteConversation,
        addMessage,
        updateLastMessage,
        archiveConversation,
        restoreConversation,
        deleteArchivedConversation,
        clearAllConversations,
        exportAllData,
        isLoaded,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
}

export function useChats() {
  const ctx = useContext(ChatsContext);
  if (!ctx) throw new Error("useChats must be used within ChatsProvider");
  return ctx;
}
