import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { hasPaidPurchase } from '@/api/recipes';
import { averageRating, listReviews, upsertReview, type ReviewWithAuthor } from '@/api/reviews';
import { useAuth } from '@/auth/AuthContext';
import { useCatalog } from '@/state/catalog';
import { useTheme } from '@/theme/ThemeContext';
import { font, radius, space, typeface } from '@/theme/tokens';

export function RecipeReviews({ recipeId }: { recipeId: string }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { getRecipe } = useCatalog();
  const recipe = getRecipe(recipeId);
  const [reviews, setReviews] = useState<ReviewWithAuthor[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [canReview, setCanReview] = useState(true);

  const load = useCallback(() => {
    listReviews(recipeId).then((list) => {
      setReviews(list);
      const mine = user ? list.find((r) => r.user_id === user.id) : undefined;
      if (mine) {
        setRating(mine.rating);
        setComment(mine.comment ?? '');
      }
    });

    if (!recipe?.isPremium) {
      setCanReview(true);
      return;
    }
    if (!user) {
      setCanReview(false);
      return;
    }
    hasPaidPurchase(recipeId, user.id).then(setCanReview);
  }, [recipeId, user, recipe?.isPremium]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const avg = averageRating(reviews);

  const submit = async () => {
    setError(null);
    if (!user) {
      setError(t('reviews.loginRequired'));
      return;
    }
    if (recipe?.isPremium && !canReview) {
      setError(t('reviews.purchaseRequired'));
      return;
    }
    setSaving(true);
    const err = await upsertReview(recipeId, user.id, rating, comment);
    setSaving(false);
    if (err) {
      setError(err);
      return;
    }
    load();
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: theme.text }]}>{t('reviews.title')}</Text>
        <Text style={[styles.avg, { color: theme.text }]}>
          {avg != null ? `★ ${avg} · ${reviews.length}` : t('reviews.noRatings')}
        </Text>
      </View>

      <View style={[styles.form, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {!user ? (
          <Text style={[styles.hint, { color: theme.text }]}>{t('reviews.loginHint')}</Text>
        ) : recipe?.isPremium && !canReview ? (
          <Text style={[styles.hint, { color: theme.text }]}>{t('reviews.purchaseHint')}</Text>
        ) : (
          <>
            <Text style={[styles.label, { color: theme.text }]}>{t('reviews.yourRating')}</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable key={n} onPress={() => setRating(n)} hitSlop={6}>
                  <Text style={[styles.star, { color: n <= rating ? theme.accent : theme.border }]}>★</Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder={t('reviews.commentPlaceholder')}
              placeholderTextColor={theme.text}
              multiline
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            />
            {!!error && <Text style={styles.error}>{error}</Text>}
            <Pressable
              onPress={submit}
              disabled={saving}
              style={[styles.btn, { backgroundColor: theme.primary, opacity: saving ? 0.7 : 1 }]}
            >
              <Text style={[styles.btnText, { color: theme.primaryText }]}>
                {saving ? t('reviews.sending') : t('reviews.submit')}
              </Text>
            </Pressable>
          </>
        )}
      </View>

      {reviews.map((r) => (
        <View key={r.id} style={[styles.card, { borderColor: theme.border }]}>
          <Text style={[styles.cardName, { color: theme.text }]}>
            {r.profiles?.display_name || t('reviews.anonymous')} · {'★'.repeat(r.rating)}
          </Text>
          {!!r.comment && <Text style={[styles.cardComment, { color: theme.text }]}>{r.comment}</Text>}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { fontSize: font.title, fontFamily: typeface.display },
  avg: { fontSize: font.body, fontFamily: typeface.bodyBold },
  form: { borderWidth: 1, borderRadius: radius.lg, padding: space.lg, gap: space.sm },
  hint: { fontSize: font.body, lineHeight: 22, fontFamily: typeface.bodySemi },
  label: { fontSize: font.small, fontFamily: typeface.bodyBold },
  stars: { flexDirection: 'row', gap: 6 },
  star: { fontSize: 32 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: space.md,
    minHeight: 72,
    fontSize: font.body,
    fontFamily: typeface.bodySemi,
    textAlignVertical: 'top',
  },
  error: { color: '#B91C1C', fontFamily: typeface.bodySemi },
  btn: { paddingVertical: 14, borderRadius: radius.md, alignItems: 'center', marginTop: 4 },
  btnText: { fontSize: font.body, fontFamily: typeface.bodyBold },
  card: { borderTopWidth: 1, paddingTop: space.md, gap: 4 },
  cardName: { fontSize: font.small, fontFamily: typeface.bodyBold },
  cardComment: { fontSize: font.body, lineHeight: 22 },
});
