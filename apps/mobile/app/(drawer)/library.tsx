import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useLibrary } from "@/context/LibraryContext";
import { formatDateTime } from "@/lib/format";
import type { LibraryItemType } from "@/lib/storage/types";
import {
  ActionChip,
  AppShell,
  GlassCard,
  IconButton,
  PrimaryButton,
  ScreenHeader,
  SectionLabel,
} from "@/src/components";
import { radii, spacing, typography } from "@/src/theme/tokens";
import { useTheme } from "@/src/theme/useTheme";

type LibraryDraft = {
  title: string;
  content: string;
  type: LibraryItemType;
};

const EMPTY_DRAFT: LibraryDraft = {
  title: "",
  content: "",
  type: "note",
};

const itemTypes: LibraryItemType[] = ["note", "prompt", "context"];

export default function LibraryScreen() {
  const theme = useTheme();
  const { items, isLoaded, createItem, deleteItem, updateItem } = useLibrary();
  const [draft, setDraft] = useState<LibraryDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const editorTitle = useMemo(
    () => (editingId ? "Edit item" : "New item"),
    [editingId],
  );

  const handleStartCreate = () => {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setShowEditor(true);
  };

  const handleStartEdit = (item: (typeof items)[number]) => {
    setDraft({
      title: item.title,
      content: item.content,
      type: item.type,
    });
    setEditingId(item.id);
    setShowEditor(true);
  };

  const handleCancel = () => {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setShowEditor(false);
  };

  const handleSave = async () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      return;
    }

    if (editingId) {
      await updateItem(editingId, draft);
    } else {
      await createItem(draft);
    }

    handleCancel();
  };

  return (
    <AppShell contentStyle={styles.shellContent}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Library"
          subtitle="Reusable notes, prompts, and context stay local here so they can support later work without being buried in chats."
        />

        <View style={styles.contentStack}>
          <GlassCard
            title="Reusable local items"
            description="Save context that should outlive a single session. Nothing here claims sync or cloud storage."
            footer={
              isLoaded
                ? `${items.length} saved item${items.length === 1 ? "" : "s"} on this device.`
                : "Loading stored library items..."
            }
            meta="Local only"
          >
            <PrimaryButton
              active={!showEditor}
              disabled={!isLoaded}
              label={
                !isLoaded ? "Loading Items..." : showEditor ? "Close Editor" : "Add Item"
              }
              onPress={showEditor ? handleCancel : handleStartCreate}
            />
          </GlassCard>

          {showEditor ? (
            <GlassCard
              title={editorTitle}
              description="Use the Library for prompts, notes, and context objects you want available across future sessions."
              meta={editingId ? "Editing" : "New"}
            >
              <View style={styles.formStack}>
                <TextInput
                  onChangeText={(title) =>
                    setDraft((currentDraft) => ({ ...currentDraft, title }))
                  }
                  placeholder="Title"
                  placeholderTextColor={theme.text.tertiary}
                  style={[
                    styles.input,
                    {
                      color: theme.text.primary,
                      backgroundColor: theme.surface.glassTint,
                      borderColor: theme.border.idle,
                    },
                  ]}
                  value={draft.title}
                />
                <TextInput
                  multiline
                  onChangeText={(content) =>
                    setDraft((currentDraft) => ({ ...currentDraft, content }))
                  }
                  placeholder="What do you want to keep available for later?"
                  placeholderTextColor={theme.text.tertiary}
                  style={[
                    styles.textArea,
                    {
                      color: theme.text.primary,
                      backgroundColor: theme.surface.glassTint,
                      borderColor: theme.border.idle,
                    },
                  ]}
                  textAlignVertical="top"
                  value={draft.content}
                />
                <View style={styles.typeRow}>
                  {itemTypes.map((type) => (
                    <ActionChip
                      key={type}
                      label={type}
                      onPress={() =>
                        setDraft((currentDraft) => ({ ...currentDraft, type }))
                      }
                      selected={draft.type === type}
                    />
                  ))}
                </View>
                <View style={styles.primaryActionRow}>
                  <PrimaryButton label="Cancel" onPress={handleCancel} />
                  <PrimaryButton
                    active
                    disabled={!draft.title.trim() || !draft.content.trim()}
                    label={editingId ? "Save Item" : "Add Item"}
                    onPress={() => {
                      void handleSave();
                    }}
                  />
                </View>
              </View>
            </GlassCard>
          ) : null}

          <SectionLabel
            aside={isLoaded ? `${items.length} stored` : "Loading"}
            label="Saved Items"
          />
          <View style={styles.cardStack}>
            {!isLoaded ? (
              <GlassCard
                title="Loading library"
                description="Reading saved notes, prompts, and context from local storage."
              />
            ) : items.length > 0 ? (
              items.map((item) => (
                <GlassCard
                  key={item.id}
                  title={item.title}
                  description={item.content}
                  footer={`Updated ${formatDateTime(item.updatedAt)}`}
                  meta={item.type}
                >
                  <View style={styles.utilityRow}>
                    <IconButton
                      icon="edit-3"
                      label="Edit"
                      onPress={() => handleStartEdit(item)}
                    />
                    <IconButton
                      icon="trash-2"
                      label="Delete"
                      onPress={() => {
                        void deleteItem(item.id);
                      }}
                    />
                  </View>
                </GlassCard>
              ))
            ) : (
              <GlassCard
                title="Library is empty"
                description="Save a note, prompt, or reusable context item so it remains available outside a single chat."
              />
            )}
          </View>
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  shellContent: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  contentStack: {
    gap: spacing.sm,
  },
  cardStack: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  formStack: {
    gap: spacing.sm,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.control,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 144,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radii.control,
    borderWidth: 1,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  primaryActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  utilityRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
