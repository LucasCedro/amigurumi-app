import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { fetchAdminRecipes, importRecipeAsAdmin } from '@/api/recipes';
import { useAuth } from '@/auth/AuthContext';
import { getRecipeStubsForSeed } from '@/data/recipes';
import { useCatalog } from '@/state/catalog';
import { theme } from '@/theme/theme';
import { font, radius, space, typeface } from '@/theme/tokens';
import type { MarketRecipeRow } from '@/types/database';
import { formatPrice } from '@/iap/billing';

export default function AdminHomeScreen() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { refresh } = useCatalog();
  const [rows, setRows] = useState<MarketRecipeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchAdminRecipes()
      .then(setRows)
      .finally(() => setLoading(false));
  }, [isAdmin]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const importSeed = async () => {
    if (!user) return;
    setMsg(null);
    const local = getRecipeStubsForSeed();
    let ok = 0;
    let fail = 0;
    for (const r of local) {
      const res = await importRecipeAsAdmin(r, user.id, 'published');
      if (res.error) fail += 1;
      else ok += 1;
    }
    setMsg(`Importou ${ok} do JSON local${fail ? ` · ${fail} falha(s)` : ''}.`);
    await refresh();
    load();
  };

  if (authLoading || loading) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: theme.bg }]}>
        <Text style={[styles.title, { color: theme.text }]}>Acesso negado</Text>
        <Text style={[styles.sub, { color: theme.text }]}>Só o administrador entra aqui.</Text>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          style={[styles.btn, { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.btnText, { color: theme.primaryText }]}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.top}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/' as never))}
            hitSlop={10}
          >
            <Text style={[styles.back, { color: theme.text }]}>‹ Conta</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>Admin · Receitas</Text>
          <Text style={[styles.sub, { color: theme.text }]}>
            Cadastre gratuitas (R$ 0) ou premium (preço + SKU do Play).
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push('/admin/recipe')}
            style={[styles.btn, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.btnText, { color: theme.primaryText }]}>+ Nova receita</Text>
          </Pressable>
            <Pressable
              onPress={importSeed}
              style={[styles.btnOutline, { borderColor: theme.border }]}
            >
              <Text style={[styles.btnOutlineText, { color: theme.text }]}>
                Sincronizar seed (JSON → banco)
              </Text>
            </Pressable>
        </View>

        {!!msg && <Text style={[styles.msg, { color: theme.primary }]}>{msg}</Text>}

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {rows.length === 0 && (
            <Text style={[styles.sub, { color: theme.text }]}>
              Nenhuma receita no banco. Importe o seed ou crie uma nova.
            </Text>
          )}
          {rows.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => router.push({ pathname: '/admin/recipe', params: { id: r.id } })}
              style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {r.emoji ? `${r.emoji} ` : ''}
                {r.title}
              </Text>
              <Text style={[styles.cardMeta, { color: theme.text }]}>
                {r.status} · {r.price_cents > 0 ? formatPrice(r.price_cents) : 'Grátis'}
                {r.play_product_id ? ` · ${r.play_product_id}` : ''}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md },
  top: { paddingHorizontal: space.lg, paddingTop: space.sm, gap: 4 },
  back: { fontSize: font.body, fontFamily: typeface.bodyBold, marginBottom: space.sm },
  title: { fontSize: font.title, fontFamily: typeface.display },
  sub: { fontSize: font.small, fontFamily: typeface.bodySemi, lineHeight: 20 },
  actions: { paddingHorizontal: space.lg, gap: space.sm, marginTop: space.lg },
  btn: { paddingVertical: 14, borderRadius: radius.md, alignItems: 'center' },
  btnText: { fontSize: font.h2, fontFamily: typeface.bodyBold },
  btnOutline: { paddingVertical: 14, borderRadius: radius.md, alignItems: 'center', borderWidth: 1 },
  btnOutlineText: { fontSize: font.body, fontFamily: typeface.bodyBold },
  msg: { paddingHorizontal: space.lg, marginTop: space.sm, fontFamily: typeface.bodySemi },
  list: { padding: space.lg, gap: space.sm, paddingBottom: 48 },
  card: { borderWidth: 1, borderRadius: radius.md, padding: space.md, gap: 4 },
  cardTitle: { fontSize: font.h2, fontFamily: typeface.displaySemi },
  cardMeta: { fontSize: font.small, fontFamily: typeface.bodySemi },
});
