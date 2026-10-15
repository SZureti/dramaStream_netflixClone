/** Frequently asked questions, shared by the welcome page and Help. */
export const FAQS = [
  {
    q: 'What is DramaStream?',
    a: 'A Netflix-inspired streaming catalog for drama lovers: 30 acclaimed drama films, series and documentaries you can browse, search, rate, review and save. It’s an educational project and isn’t affiliated with Netflix.',
  },
  {
    q: 'How much does it cost?',
    a: 'Nothing. There are no plans, no payment details and no trial that turns into a charge.',
  },
  {
    q: 'Can I watch full films and episodes?',
    a: 'No. The player is a clearly labelled mock-up that shows how playback works, with play, pause, seeking and progress, but no video streams.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. You can browse everything without one. An account saves My List and where you left off, so they follow you to any device.',
  },
  {
    q: 'What does an account store?',
    a: 'Your email address, the titles on My List, and how far you got in each title. Nothing is shared with anyone, and other members can’t see it.',
  },
];

export default function FaqList() {
  return (
    <div className="faq-list">
      {FAQS.map((f) => (
        <details key={f.q} className="faq">
          <summary className="faq__q">{f.q}</summary>
          <p className="faq__a">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
