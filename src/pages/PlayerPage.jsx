import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import MockPlayer from '../components/MockPlayer.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { getEpisode, getNextEpisode, getPlayable, getTitleById, isAllowed, isAvailable } from '../data/catalog.js';
import { isResumable, useProgress } from '../state/ProgressContext.jsx';
import { useProfiles } from '../state/ProfileContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import NotFoundPage from './NotFoundPage.jsx';
import NotAvailableOnProfile from '../components/NotAvailableOnProfile.jsx';

export default function PlayerPage() {
  const { titleId } = useParams();
  const title = getTitleById(titleId);
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { getProgress, saveProgress } = useProgress();
  const { current: profile } = useProfiles();
  useDocumentTitle(title ? `Watching ${title.title}` : 'Not found');

  if (!title) return <NotFoundPage missingTitleId={titleId} />;
  if (!isAllowed(title)) {
    return (
      <NotAvailableOnProfile>
        <p>
          {title.title} is rated {title.contentRating}, above this profile’s maturity setting.
        </p>
      </NotAvailableOnProfile>
    );
  }

  if (!isAvailable(title)) {
    return (
      <div className="page">
        <EmptyState heading="Coming soon">
          <p>
            {title.title} arrives on DramaStream on{' '}
            {new Date(`${title.availableFrom}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            .
          </p>
        </EmptyState>
      </div>
    );
  }

  const detailsPath = `/titles/${title.id}`;
  // If we arrived from this title's details page, step back to it (keeps
  // history tidy); otherwise go there directly, carrying the original origin
  // forward so the details page's own Back still returns to Search/My List/Home.
  const from = location.state?.from;
  const backToDetails = () =>
    from === detailsPath ? navigate(-1) : navigate(detailsPath, { replace: true, state: from ? { from } : undefined });

  // Which episode: the one asked for (?s=&e=), else the one being watched, else the first.
  const saved = getProgress(title.id);
  const resumable = isResumable(saved);
  const asked = params.get('s') && params.get('e');
  const episode =
    title.type === 'series'
      ? asked
        ? getEpisode(title, params.get('s'), params.get('e'))
        : resumable && saved.season
          ? getEpisode(title, saved.season, saved.episode)
          : getEpisode(title)
      : null;
  const sameAsSaved = !episode || (saved?.season === episode.season && saved?.episode === episode.episode);

  // Resume where the viewer left off, unless they chose Start Over (?t=0) or another episode.
  const startOver = params.get('t') === '0';
  const initialTime = !startOver && resumable && sameAsSaved ? saved.position : 0;
  const nextEpisode = getNextEpisode(title, episode);

  const onProgress = (position, duration) =>
    saveProgress(title.id, {
      position,
      duration: duration || getPlayable(title, episode ?? undefined).durationSeconds,
      season: episode?.season ?? null,
      episode: episode?.episode ?? null,
    });

  const playNext = () =>
    nextEpisode &&
    navigate(`/watch/${title.id}?s=${nextEpisode.season}&e=${nextEpisode.episode}`, {
      replace: true,
      state: { ...location.state, autoStart: true },
    });

  return (
    <MockPlayer
      key={`${title.id}-${episode?.season ?? 0}-${episode?.episode ?? 0}`}
      title={title}
      episode={episode}
      onBack={backToDetails}
      initialTime={initialTime}
      onProgress={onProgress}
      nextEpisode={nextEpisode}
      onNext={playNext}
      autoplayNext={profile?.autoplay_next ?? true}
      autoStart={Boolean(location.state?.autoStart)}
      language={profile?.language ?? 'en'}
      subtitleSize={profile?.subtitle_size ?? 'medium'}
      subtitleStyle={profile?.subtitle_style ?? 'white'}
    />
  );
}
