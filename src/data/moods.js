// Netflix's "This show is…" tags. We don't have hand-written moods per
// title, so they come from genres (Drama alone says little).
const BY_GENRE = {
  Crime: ['Gritty', 'Suspenseful'],
  History: ['Thought-Provoking', 'Emotional'],
  Romance: ['Romantic', 'Heartfelt'],
  Music: ['Inspiring', 'Intense'],
  Comedy: ['Witty', 'Darkly Comic'],
  War: ['Harrowing', 'Emotional'],
  Mystery: ['Suspenseful', 'Dark'],
  Adventure: ['Exciting', 'Inspiring'],
  Nature: ['Heartfelt', 'Inspiring'],
  Documentary: ['Thought-Provoking'],
};

export function moodsFor(title) {
  const moods = new Set(title.genres.flatMap((g) => BY_GENRE[g] ?? []));
  if (moods.size === 0) moods.add('Emotional').add('Intimate');
  return [...moods].slice(0, 3);
}
