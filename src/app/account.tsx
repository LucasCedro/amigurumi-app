import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthContext';
import { useWorld } from '@/theme/world-context';
import { font, radius, shadow, space } from '@/theme/tokens';

export default function AccountScreen() {
  const router = useRouter();
  const { theme } = useWorld();
  const { user, loading, isConfigured, signIn, signOut } = useAuth();

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={[styles.close, { color: theme.textMuted }]}>✕</Text>
          </Pressable>
        </View>

        {loading ? null : user ? (
          <View style={styles.content}>
            <View style={[styles.avatar, { backgroundColor: theme.surfaceAlt }]}>
              {user.picture ? (
                <Image source={{ uri: user.picture }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <Text style={styles.avatarEmoji}>🧶</Text>
              )}
            </View>
            <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
            <Text style={[styles.email, { color: theme.textMuted }]}>{user.email}</Text>

            <View style={styles.soonGroup}>
              <SoonRow theme={theme} icon="☁️" text="Projetos salvos na nuvem" />
              <SoonRow theme={theme} icon="⭐" text="Receitas premium e planos" />
              <SoonRow theme={theme} icon="📤" text="Publicar suas receitas" />
            </View>

            <Pressable
              onPress={signOut}
              style={[styles.btnOutline, { borderColor: theme.border }]}
            >
              <Text style={[styles.btnOutlineText, { color: theme.text }]}>Sair</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.bigEmoji}>🧶</Text>
            <Text style={[styles.title, { color: theme.text }]}>Entre na sua conta</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Em breve você vai salvar seus projetos na nuvem, sincronizar entre aparelhos e acessar
              receitas premium.
            </Text>

            <Pressable onPress={signIn} style={[styles.btnGoogle, { backgroundColor: theme.surface }, shadow(2)]}>
              <Text style={styles.googleG}>G</Text>
              <Text style={[styles.btnGoogleText, { color: theme.text }]}>Entrar com Google</Text>
            </Pressable>

            {!isConfigured && (
              <Text style={[styles.note, { color: theme.textMuted }]}>
                (Login em modo demo — configure os Client IDs do Google no app.json pra ativar de
                verdade.)
              </Text>
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

function SoonRow({ theme, icon, text }: { theme: ReturnType<typeof useWorld>['theme']; icon: string; text: string }) {
  return (
    <View style={[styles.soonRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={styles.soonIcon}>{icon}</Text>
      <Text style={[styles.soonText, { color: theme.text }]}>{text}</Text>
      <Text style={[styles.soonTag, { color: theme.textMuted }]}>em breve</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { paddingHorizontal: space.lg, paddingVertical: space.sm },
  close: { fontSize: 22, fontWeight: '700' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: space.xl, paddingTop: space.xl, gap: space.sm },

  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarEmoji: { fontSize: 44 },
  name: { fontSize: font.title, fontWeight: '800', marginTop: space.sm },
  email: { fontSize: font.body },

  soonGroup: { alignSelf: 'stretch', gap: space.sm, marginTop: space.xl },
  soonRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md, borderWidth: 1 },
  soonIcon: { fontSize: 20 },
  soonText: { flex: 1, fontSize: font.body, fontWeight: '600' },
  soonTag: { fontSize: font.tiny, fontWeight: '700', textTransform: 'uppercase' },

  btnOutline: { marginTop: 'auto', alignSelf: 'stretch', paddingVertical: space.md, borderRadius: radius.md, borderWidth: 1, alignItems: 'center' },
  btnOutlineText: { fontSize: font.body, fontWeight: '700' },

  bigEmoji: { fontSize: 64, marginTop: space.xxl },
  title: { fontSize: font.hero, fontWeight: '900' },
  subtitle: { fontSize: font.body, textAlign: 'center', lineHeight: 22 },
  btnGoogle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, alignSelf: 'stretch', paddingVertical: space.md, borderRadius: radius.md, marginTop: space.xl },
  googleG: { fontSize: 20, fontWeight: '900', color: '#4285F4' },
  btnGoogleText: { fontSize: font.h2, fontWeight: '800' },
  note: { fontSize: font.small, textAlign: 'center', marginTop: space.md, lineHeight: 18 },
});
