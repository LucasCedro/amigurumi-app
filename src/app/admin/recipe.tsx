import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchAdminRecipes, upsertAdminRecipe } from '@/api/recipes';
import { useAuth } from '@/auth/AuthContext';
import { useCatalog } from '@/state/catalog';
import { theme } from '@/theme/theme';
import { CATEGORY_LABEL, DIFFICULTY_LABEL, font, radius, space, typeface } from '@/theme/tokens';
import type { RecipeStatus } from '@/types/database';
import type { Category, Difficulty, Recipe } from '@/types/recipe';

const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];
const DIFFS = Object.keys(DIFFICULTY_LABEL) as Difficulty[];

const EMPTY_BODY = `{
  "materials": [
    { "type": "fio", "label": "Fio Amigurumi", "color": "Cru", "amount": "1 novelo" }
  ],
  "notes": ["Use marcador de ponto."],
  "pieces": [
    {
      "id": "corpo",
      "name": "Corpo",
      "qty": 1,
      "rounds": [
        {
          "kind": "stitches",
          "label": "1",
          "isMagicRing": true,
          "groups": [{ "pattern": [{ "stitch": "pb", "count": 6 }], "times": 1 }],
          "totalStitches": 6
        }
      ]
    }
  ]
}`;

export default function AdminRecipeScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { refresh } = useCatalog();

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<Category>('bichos');
  const [difficulty, setDifficulty] = useState<Difficulty>('iniciante');
  const [priceReais, setPriceReais] = useState('0');
  const [playProductId, setPlayProductId] = useState('');
  const [emoji, setEmoji] = useState('🧶');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<RecipeStatus>('draft');
  const [bodyJson, setBodyJson] = useState(EMPTY_BODY);

  useEffect(() => {
    if (!id || !isAdmin) {
      setLoading(false);
      return;
    }
    fetchAdminRecipes().then((rows) => {
      const row = rows.find((r) => r.id === id);
      if (!row) {
        setError('Receita não encontrada');
        setLoading(false);
        return;
      }
      setTitle(row.title);
      setSubtitle(row.subtitle ?? '');
      setCategory(row.category as Category);
      setDifficulty(row.difficulty as Difficulty);
      setPriceReais(String((row.price_cents ?? 0) / 100));
      setPlayProductId(row.play_product_id ?? '');
      setEmoji(row.emoji ?? '🧶');
      setTags((row.tags ?? []).join(', '));
      setDescription(row.description ?? '');
      setStatus(row.status);
      setBodyJson(JSON.stringify(row.body ?? {}, null, 2));
      setLoading(false);
    });
  }, [id, isAdmin]);

  const save = async () => {
    if (!user) return;
    setError(null);
    if (!title.trim()) {
      setError('Título obrigatório');
      return;
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(bodyJson) as Record<string, unknown>;
    } catch {
      setError('JSON do body inválido (materials / pieces / …)');
      return;
    }

    const pieces = (body as Partial<Recipe>).pieces;
    if (!Array.isArray(pieces) || pieces.length === 0) {
      setError('body.pieces precisa ter pelo menos 1 peça');
      return;
    }

    const priceCents = Math.round(parseFloat(priceReais.replace(',', '.') || '0') * 100);
    if (Number.isNaN(priceCents) || priceCents < 0) {
      setError('Preço inválido');
      return;
    }
    if (priceCents > 0 && !playProductId.trim()) {
      setError('Receita premium precisa do SKU do Play (play_product_id)');
      return;
    }

    setSaving(true);
    const res = await upsertAdminRecipe({
      id,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      category,
      difficulty,
      priceCents,
      playProductId: playProductId.trim() || undefined,
      emoji: emoji.trim() || undefined,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      description: description.trim() || undefined,
      status,
      body,
      sellerId: user.id,
    });
    setSaving(false);

    if (res.error) {
      setError(res.error);
      return;
    }
    await refresh();
    router.replace('/admin' as never);
  };

  if (!isAdmin) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.text }}>Acesso negado</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/admin' as never))}
              hitSlop={10}
            >
              <Text style={[styles.back, { color: theme.text }]}>‹ Voltar</Text>
            </Pressable>
            <Text style={[styles.title, { color: theme.text }]}>
              {id ? 'Editar receita' : 'Nova receita'}
            </Text>

            <Field label="Título" value={title} onChangeText={setTitle} />
            <Field label="Subtítulo" value={subtitle} onChangeText={setSubtitle} />
            <Field label="Emoji" value={emoji} onChangeText={setEmoji} />
            <Field label="Descrição" value={description} onChangeText={setDescription} multiline />
            <Field label="Tags (vírgula)" value={tags} onChangeText={setTags} />

            <Text style={[styles.label, { color: theme.text }]}>Categoria</Text>
            <View style={styles.rowWrap}>
              {CATEGORIES.map((c) => (
                <Chip key={c} active={c === category} label={CATEGORY_LABEL[c]} onPress={() => setCategory(c)} />
              ))}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Dificuldade</Text>
            <View style={styles.rowWrap}>
              {DIFFS.map((d) => (
                <Chip key={d} active={d === difficulty} label={DIFFICULTY_LABEL[d]} onPress={() => setDifficulty(d)} />
              ))}
            </View>

            <Field
              label="Preço em R$ (0 = grátis / sem premium)"
              value={priceReais}
              onChangeText={setPriceReais}
              keyboardType="decimal-pad"
            />
            <Field
              label="SKU Google Play (obrigatório se preço > 0)"
              value={playProductId}
              onChangeText={setPlayProductId}
              placeholder="ex: receita_ovo_premium"
            />

            <Text style={[styles.label, { color: theme.text }]}>Status</Text>
            <View style={styles.rowWrap}>
              {(['draft', 'published', 'removed'] as RecipeStatus[]).map((s) => (
                <Chip key={s} active={s === status} label={s} onPress={() => setStatus(s)} />
              ))}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>
              Body JSON (materials, pieces, notes, assembly…)
            </Text>
            <TextInput
              value={bodyJson}
              onChangeText={setBodyJson}
              multiline
              style={[styles.json, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              textAlignVertical="top"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              onPress={save}
              disabled={saving}
              style={[styles.save, { backgroundColor: theme.primary, opacity: saving ? 0.7 : 1 }]}
            >
              <Text style={[styles.saveText, { color: theme.primaryText }]}>
                {saving ? 'Salvando…' : 'Salvar'}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={theme.text}
        style={[
          styles.input,
          { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
          props.multiline && { minHeight: 80, textAlignVertical: 'top' },
          props.style,
        ]}
      />
    </View>
  );
}

function Chip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.primary : theme.surface,
          borderColor: active ? theme.primary : theme.border,
        },
      ]}
    >
      <Text style={{ color: active ? theme.primaryText : theme.text, fontFamily: typeface.bodyBold, fontSize: font.small }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: space.lg, gap: space.md, paddingBottom: 64 },
  back: { fontSize: font.body, fontFamily: typeface.bodyBold },
  title: { fontSize: font.title, fontFamily: typeface.display },
  label: { fontSize: font.small, fontFamily: typeface.bodyBold },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    fontSize: font.body,
    fontFamily: typeface.bodySemi,
  },
  json: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    minHeight: 280,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1 },
  error: { color: '#B91C1C', fontFamily: typeface.bodySemi },
  save: { paddingVertical: 16, borderRadius: radius.md, alignItems: 'center', marginTop: space.sm },
  saveText: { fontSize: font.h2, fontFamily: typeface.bodyBold },
});
