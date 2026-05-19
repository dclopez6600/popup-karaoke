// ─────────────────────────────────────────────
//  Reviews Screen — Event & venue reviews
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Modal, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLiveData } from '../hooks/useLiveData';
import { Review } from '../services/api';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../theme';
import { formatDistanceToNow } from 'date-fns';

function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : i - 0.5 <= rating ? 'star-half' : 'star-outline'}
          size={size}
          color={Colors.gold}
        />
      ))}
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [liked, setLiked] = useState(review.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(review.likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <View style={styles.reviewCard}>
      {/* Author */}
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{review.authorName[0]}</Text>
        </View>
        <View style={styles.reviewMeta}>
          <Text style={styles.authorName}>{review.authorName}</Text>
          <Text style={styles.reviewDate}>
            {formatDistanceToNow(new Date(review.date), { addSuffix: true })}
          </Text>
        </View>
        <StarRow rating={review.rating} size={14} />
      </View>

      {/* Event */}
      <TouchableOpacity style={styles.eventPill}>
        <Ionicons name="mic-outline" size={12} color={Colors.primary} />
        <Text style={styles.eventPillText}>{review.eventTitle}</Text>
        <Text style={styles.venuePillText}>· {review.venueName}</Text>
      </TouchableOpacity>

      {/* Body */}
      <Text style={styles.reviewBody}>{review.body}</Text>

      {/* Tags */}
      <View style={styles.tags}>
        {review.tags.map((tag, i) => (
          <View key={i} style={styles.tag}>
            <Text style={styles.tagText}>✓ {tag}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.reviewActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={toggleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={16}
            color={liked ? Colors.accent : Colors.textMuted}
          />
          <Text style={[styles.actionText, liked && { color: Colors.accent }]}>
            {likeCount} helpful
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={16} color={Colors.textMuted} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function WriteReviewModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={modalStyles.title}>Write a Review</Text>
          <TouchableOpacity
            style={[modalStyles.submitBtn, body.length > 0 && rating > 0 && modalStyles.submitBtnActive]}
            disabled={body.length === 0 || rating === 0}
            onPress={onClose}
          >
            <Text style={modalStyles.submitText}>Post</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={modalStyles.content}>
          <Text style={modalStyles.label}>Your Rating</Text>
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg }}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Ionicons
                  name={i <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={Colors.gold}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={modalStyles.label}>Your Review</Text>
          <TextInput
            style={modalStyles.textArea}
            placeholder="Share your experience — the vibe, the host, the crowd..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={6}
            value={body}
            onChangeText={setBody}
            textAlignVertical="top"
          />

          <Text style={modalStyles.charCount}>{body.length} / 500</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const SORT_OPTIONS = ['Recent', 'Top Rated', 'Most Helpful'];

export default function ReviewsScreen() {
  const { reviews } = useLiveData();
  const [sort, setSort] = useState('Recent');
  const [showWriteModal, setShowWriteModal] = useState(false);

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sort === 'Top Rated') return b.rating - a.rating;
    if (sort === 'Most Helpful') return b.likes - a.likes;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#1A1000', Colors.bg]} style={styles.header}>
        <Text style={styles.headerTitle}>Reviews</Text>

        {/* Rating summary */}
        <View style={styles.ratingSummary}>
          <View style={styles.bigRating}>
            <Text style={styles.bigRatingNum}>{avgRating.toFixed(1)}</Text>
            <StarRow rating={Math.round(avgRating)} size={20} />
            <Text style={styles.bigRatingCount}>{reviews.length} reviews</Text>
          </View>

          {/* Distribution bars */}
          <View style={styles.distribution}>
            {[5, 4, 3, 2, 1].map(star => {
              const count = reviews.filter(r => Math.round(r.rating) === star).length;
              const pct = reviews.length ? count / reviews.length : 0;
              return (
                <View key={star} style={styles.distRow}>
                  <Text style={styles.distStar}>{star}</Text>
                  <Ionicons name="star" size={10} color={Colors.gold} />
                  <View style={styles.distBar}>
                    <View style={[styles.distFill, { width: `${pct * 100}%` }]} />
                  </View>
                  <Text style={styles.distCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </LinearGradient>

      {/* Sort & Write */}
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={[styles.sortPill, sort === opt && styles.sortPillActive]}
                onPress={() => setSort(opt)}
              >
                <Text style={[styles.sortPillText, sort === opt && styles.sortPillTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.writeBtn} onPress={() => setShowWriteModal(true)}>
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.writeBtnText}>Write</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sortedReviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <WriteReviewModal visible={showWriteModal} onClose={() => setShowWriteModal(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 56, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, gap: Spacing.md },
  headerTitle: { fontSize: FontSize.xxl, color: Colors.textPrimary, fontWeight: FontWeight.black },
  ratingSummary: { flexDirection: 'row', gap: Spacing.xl, alignItems: 'center' },
  bigRating: { alignItems: 'center', gap: 4 },
  bigRatingNum: { fontSize: FontSize.display, color: Colors.textPrimary, fontWeight: FontWeight.black, lineHeight: 52 },
  bigRatingCount: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  distribution: { flex: 1, gap: 4 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distStar: { fontSize: FontSize.xs, color: Colors.textMuted, width: 10 },
  distBar: { flex: 1, height: 5, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  distFill: { height: 5, backgroundColor: Colors.gold, borderRadius: 2 },
  distCount: { fontSize: FontSize.xs, color: Colors.textMuted, width: 16, textAlign: 'right' },

  toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sortPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  sortPillActive: { backgroundColor: Colors.bgElevated, borderColor: Colors.borderLight },
  sortPillText: { fontSize: FontSize.sm, color: Colors.textMuted },
  sortPillTextActive: { color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  writeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primary, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 8 },
  writeBtnText: { fontSize: FontSize.sm, color: '#fff', fontWeight: FontWeight.semibold },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg },
  reviewCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + '33', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.bold },
  reviewMeta: { flex: 1 },
  authorName: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  reviewDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  eventPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.bgElevated, borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  eventPillText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  venuePillText: { fontSize: FontSize.xs, color: Colors.textMuted },
  reviewBody: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: Colors.success + '22', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, color: Colors.success, fontWeight: FontWeight.medium },
  reviewActions: { flexDirection: 'row', gap: Spacing.md, paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: FontSize.sm, color: Colors.textMuted },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: FontSize.lg, color: Colors.textPrimary, fontWeight: FontWeight.bold },
  submitBtn: { backgroundColor: Colors.bgElevated, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 8 },
  submitBtnActive: { backgroundColor: Colors.primary },
  submitText: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  content: { padding: Spacing.lg, gap: Spacing.md },
  label: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.semibold },
  textArea: { backgroundColor: Colors.bgInput, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.textPrimary, minHeight: 150, borderWidth: 1, borderColor: Colors.border },
  charCount: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'right' },
});
