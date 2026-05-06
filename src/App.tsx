import { useEffect, useMemo, useRef, useState, useCallback } from 'react';

const heroImage = '/images/hero.webp';

const navItems = [
  { href: '#home', label: 'Início' },
  { href: '#produtos', label: 'Produtos' },
  { href: '#contato', label: 'Contato' }
];

type MenuItem = {
  image: string;
  alt: string;
  title: string;
  description?: string;
  imagePosition?: string;
};

type MenuSection = {
  id: string;
  title: string;
  subtitle?: string;
  items: MenuItem[];
};

// All menu content lives here
// to update what shows up in the card strips.
const menuSections: MenuSection[] = [
  {
    id: 'coxinhas',
    title: 'Coxinhas',
    subtitle: 'Sabores clássicos e especiais',
    items: [
      { image: '/images/coxinha-frango.webp', alt: 'Coxinha de frango', title: 'Frango', description: 'Recheio cremoso de frango desfiado temperado na medida certa.' },
      { image: '/images/coxinha-carne.webp', alt: 'Coxinha de carne', title: 'Carne', description: 'Carne moída suculenta com temperos especiais da casa.', imagePosition: 'center 30%' },
      { image: '/images/coxinha-calabresa.webp', alt: 'Coxinha de calabresa', title: 'Calabresa', description: 'Calabresa levemente apimentada com um toque defumado.' },
      { image: '/images/coxinha-queijo.webp', alt: 'Coxinha de queijo', title: 'Queijo', description: 'Queijo derretido por dentro, crocante por fora.' },
      { image: '/images/coxinha-presuntoqueijo.webp', alt: 'Coxinha de presunto e queijo', title: 'Presunto & Queijo', description: 'O clássico irresistível que agrada todo mundo.' },
      { image: '/images/coxinha-docedeleite.webp', alt: 'Coxinha de doce de leite', title: 'Doce de leite', description: 'Versão adocicada com doce de leite cremoso no recheio.', imagePosition: 'center 48%' },
      { image: '/images/coxinha-nutela.webp', alt: 'Coxinha de nutela', title: 'Nutela', description: 'Massa crocante recheada com generosa camada de nutela.', imagePosition: 'center 58%' },
      { image: '/images/coxinha-chocolatebranco.webp', alt: 'Coxinha de chocolate branco', title: 'Chocolate branco', description: 'Chocolate branco derretido por dentro numa casquinha crocante irresistível.', imagePosition: 'center 60%' },
      { image: '/images/coxinha-leitecondesadoeamendoim.webp', alt: 'Coxinha de Leite Condensado e Amendoim', title: 'Leite Condensado e Amendoim', description: 'Combinação perfeita de leite condensado com amendoim torrado e crocante.', imagePosition: 'center 40%' }
    ]
  },
  {
    id: 'pasteis',
    title: 'Pastéis',
    subtitle: 'Doces e salgados',
    items: [
      { image: '/images/pastel-frango.webp', alt: 'Pastel de frango', title: 'Frango', description: 'Massa fininha e crocante com frango cremoso.' },
      { image: '/images/pastel-carne.webp', alt: 'Pastel de carne', title: 'Carne', description: 'Carne temperada com ervas frescas e muito sabor.' },
      { image: '/images/pastel-pizza.webp', alt: 'Pastel de pizza', title: 'Pizza', description: 'Molho, queijo e uma surpresa boa dentro de cada mordida.' },
      { image: '/images/pastel-brocolis.webp', alt: 'Pastel de brócolis', title: 'Brócolis', description: 'Opção leve com brócolis e queijo numa combinação perfeita.' },
      { image: '/images/pastel-banana.webp', alt: 'Pastel de banana', title: 'Banana', description: 'Banana caramelizada com canela pra adoçar o dia.' },
      { image: '/images/pastel-chocolate.webp', alt: 'Pastel de chocolate', title: 'Chocolate', description: 'Chocolate quente derretendo no centro da massa crocante.', imagePosition: 'center 48%' }
    ]
  },
  {
    id: 'outros',
    title: 'Outros',
    subtitle: 'Pra completar o pedido',
    items: [
      { image: '/images/batata-frita.webp', alt: 'Batata frita', title: 'Batata frita', description: 'Crocante, dourada e temperada do jeito que tem que ser.' },
      { image: '/images/salsichinha.webp', alt: 'Salsichinha', title: 'Salsichinha', description: 'Irresistível, perfeita pra petiscar.' },
      { image: '/images/bolinha-queijo.webp', alt: 'Bolinha de queijo', title: 'Bolinha de queijo', description: 'Queijo derretido por dentro, casquinha dourada por fora.' }
    ]
  }
];

function useScrollReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, ...options }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

function RevealSection({
  children,
  className = '',
  delay = 0,
  direction = 'up'
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'fade';
}) {
  const { ref, visible } = useScrollReveal();

  const transforms: Record<string, string> = {
    up: 'translateY(32px)',
    left: 'translateX(-32px)',
    right: 'translateX(32px)',
    fade: 'translateY(0)'
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0)' : transforms[direction],
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

// CSS 3D flip — front shows the photo, back shows the description.
function FlipCard({ item, sectionId, index = 0 }: { item: MenuItem; sectionId: string; index?: number }) {
  const [flipped, setFlipped] = useState(false);
  const { ref, visible } = useScrollReveal({ threshold: 0.05 });

  return (
    <article
      ref={ref}
      data-card
      className="group snap-start shrink-0 cursor-pointer
        w-[80vw] sm:w-[260px] md:w-[300px] lg:w-[calc((100%-48px)/3)]"
      style={{
        perspective: '1200px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.5s ease ${index * 80}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 80}ms`
      }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped(f => !f)}
      aria-label={`${item.title} — clique para ver detalhes`}
    >
      <div className="relative w-full" style={{ paddingTop: '125%' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front face */}
          <div
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-200/60 bg-white shadow-[0_12px_40px_-16px_rgba(217,119,6,0.3)]"
          >
            <div className="relative h-[83%] overflow-hidden">
              <img
                src={item.image}
                alt={item.alt}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ objectPosition: item.imagePosition ?? 'center 38%' }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/5 to-transparent" />
            </div>
            <div className="px-3 sm:px-4 pt-2 pb-2.5 flex items-center justify-between">
              <h4 className="text-sm font-bold text-stone-800 tracking-tight leading-tight">{item.title}</h4>
              <span className="text-[10px] sm:text-xs text-amber-600 font-semibold opacity-70 shrink-0 ml-2">ver →</span>
            </div>
          </div>

          {/* Back face */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
            className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex flex-col items-center justify-center p-5 sm:p-6 text-center"
          >
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">✦</div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">{item.title}</h4>
            <p className="text-xs sm:text-sm text-orange-100 leading-relaxed max-w-[180px]">
              {item.description ?? 'Feito com ingredientes frescos e muito amor.'}
            </p>
            <div className="mt-4 h-px w-8 bg-white/40" />
            <p className="mt-2.5 text-[10px] sm:text-xs text-orange-200 uppercase tracking-widest">Mini Coxinhas</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function App(): JSX.Element {
  const [loaded, setLoaded] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroOffset, setHeroOffset] = useState(0);

  const year = useMemo(() => new Date().getFullYear(), []);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Preloader stays up until window load fires, then CSS slides it away.
  useEffect(() => {
    const onLoad = (): void => setLoaded(true);
    if (document.readyState === 'complete') setLoaded(true);
    else window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    const onScroll = (): void => {
      setIsScrolled(window.scrollY > 40);
      setHeroOffset(window.scrollY);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = !loaded || isNavOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [loaded, isNavOpen]);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsNavOpen(false); };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, []);

  const closeNav = useCallback(() => setIsNavOpen(false), []);

  // Whatsapp connection
  const whatsAppMessage = encodeURIComponent('Oi! Vim pelo site da Mini Coxinhas e quero fazer um pedido.');
  const whatsAppHref = `https://wa.me/+5548933806781?text=${whatsAppMessage}`;

  const scrollSectionByCards = (sectionId: string, direction: 'left' | 'right'): void => {
    const el = sectionRefs.current[sectionId];
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    const cardWidth = card ? card.offsetWidth : 340;
    const cardsToScroll = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
    el.scrollBy({ left: direction === 'right' ? cardWidth * cardsToScroll + 24 * cardsToScroll : -(cardWidth * cardsToScroll + 24 * cardsToScroll), behavior: 'smooth' });
  };

  return (
    <>
      <div className={`preload ${loaded ? 'loaded' : ''}`}>
        <div className="flex flex-col items-center gap-4">
          <img src="/images/minicoxinhaslogo.png" alt="Logo Mini Coxinhas" className="h-20 w-20 rounded-2xl bg-white p-2 object-contain shadow-xl shadow-amber-300/40 ring-1 ring-amber-200" />
          <div className="spinner" />
          <p className="tracking-[0.35em] text-sm uppercase text-amber-800/70 font-medium">Mini Coxinhas</p>
        </div>
      </div>

      <header className="fixed left-0 right-0 top-0 z-40">
        <div className="mx-auto max-w-6xl px-4">
          <div className={[
            'nav-pill mt-4 flex h-16 items-center justify-between gap-3 rounded-2xl px-3 transition-all duration-500 md:px-5',
            isScrolled
              ? 'nav-scrolled border border-amber-200/60 bg-white/90 shadow-[0_8px_32px_-8px_rgba(217,119,6,0.25)] backdrop-blur-xl'
              : 'border border-white/20 bg-white/30 shadow-[0_4px_24px_-8px_rgba(217,119,6,0.1)] backdrop-blur-md'
          ].join(' ')}>

            <a href="#home" className="group flex items-center gap-2.5 rounded-xl px-1 py-1">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src="/images/minicoxinhaslogo.png"
                  alt="Logo Mini Coxinhas"
                  className="h-9 w-9 rounded-xl bg-white p-1 object-contain ring-1 ring-amber-200 transition duration-300 group-hover:scale-110"
                />
              </div>
              <div className="leading-tight">
                <p className="font-black text-stone-800 tracking-tight text-sm transition duration-300 group-hover:text-amber-600" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Mini Coxinhas
                </p>
              </div>
            </a>

            <nav className="hidden md:flex items-center bg-stone-100/70 rounded-xl px-1.5 py-1.5 gap-0.5">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="nav-link relative px-4 py-1.5 text-sm font-semibold text-stone-600 rounded-lg transition-all duration-200 hover:text-amber-700 hover:bg-white hover:shadow-sm"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noreferrer"
                className="group relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-amber-400/30 transition-all duration-300 hover:shadow-amber-400/50 hover:-translate-y-px"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <svg viewBox="0 0 24 24" className="relative h-4 w-4 fill-current shrink-0">
                  <path d="M19.05 4.94A9.86 9.86 0 0 0 12 2a10 10 0 0 0-8.67 14.97L2 22l5.18-1.3A10 10 0 1 0 19.05 4.94Z" />
                </svg>
                <span className="relative">WhatsApp</span>
              </a>
            </div>

            <button
              className={[
                'md:hidden relative inline-flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl border transition-all duration-300',
                isNavOpen
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-amber-200/70 bg-white/60 hover:bg-white/80'
              ].join(' ')}
              aria-label={isNavOpen ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setIsNavOpen(p => !p)}
            >
              <span className={['block h-0.5 w-5 bg-amber-600 rounded-full transition-all duration-300 origin-center', isNavOpen ? 'rotate-45 translate-y-[7px]' : ''].join(' ')} />
              <span className={['block h-0.5 w-5 bg-amber-600 rounded-full transition-all duration-300', isNavOpen ? 'opacity-0 scale-x-0' : ''].join(' ')} />
              <span className={['block h-0.5 w-5 bg-amber-600 rounded-full transition-all duration-300 origin-center', isNavOpen ? '-rotate-45 -translate-y-[7px]' : ''].join(' ')} />
            </button>
          </div>
        </div>

        {isNavOpen && (
          <div className="fixed inset-0 z-50" onClick={closeNav}>
            <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm transition-opacity duration-300" />
            <div
              className="mobile-drawer absolute right-0 top-0 h-full w-[82%] max-w-xs bg-white/98 p-6 shadow-2xl backdrop-blur-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <a href="#home" className="flex items-center gap-2.5" onClick={closeNav}>
                  <img src="/images/minicoxinhaslogo.png" alt="Logo" className="h-9 w-9 rounded-xl bg-white p-1 object-contain ring-1 ring-amber-200" />
                  <p className="font-black text-stone-800 text-sm" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Mini Coxinhas</p>
                </a>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-500 transition-all duration-200 hover:bg-stone-50 hover:text-stone-800 active:scale-90"
                  aria-label="Fechar"
                  onClick={closeNav}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {navItems.map((item, i) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={closeNav}
                    className="drawer-link flex items-center justify-between rounded-xl px-4 py-3.5 font-semibold text-stone-700 transition-all duration-200 hover:bg-amber-50 hover:text-amber-700 group"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {item.label}
                    <span className="text-stone-300 transition group-hover:text-amber-400 group-hover:translate-x-0.5 duration-200">→</span>
                  </a>
                ))}
              </div>

              <div className="my-6 h-px bg-stone-100" />

              <a
                href={whatsAppHref}
                target="_blank"
                rel="noreferrer"
                onClick={closeNav}
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-amber-500 px-4 py-3.5 font-bold text-white transition-all duration-300 hover:bg-amber-600 active:scale-[0.97] shadow-lg shadow-amber-300/30"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current shrink-0">
                  <path d="M19.05 4.94A9.86 9.86 0 0 0 12 2a10 10 0 0 0-8.67 14.97L2 22l5.18-1.3A10 10 0 1 0 19.05 4.94Z" />
                </svg>
                Fazer pedido
              </a>
            </div>
          </div>
        )}
      </header>

      <main id="home">
        <section className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={heroImage}
              alt=""
              className="h-[120%] w-full object-cover will-change-transform"
              style={{ transform: `translateY(${heroOffset * 0.35}px)` }}
            />
          </div>
          <div className="hero-overlay-warm absolute inset-0" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid min-h-screen items-center pt-24 pb-32">
              <div className="flex max-w-2xl flex-col items-start">
                <div className="hero-logo-anim -mb-10 sm:-mb-16 md:-mb-24">
                  <img
                    src="/images/minicoxinhaslogo.png"
                    alt="Logo Mini Coxinhas"
                    className="h-40 w-40 sm:h-56 sm:w-56 md:h-[22rem] md:w-[22rem] object-contain"
                  />
                </div>

                <h1
                  className="hero-text-anim mt-0 text-[clamp(2rem,8vw,4rem)] font-black leading-[1.05] text-stone-900 tracking-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Pequenas no tamanho,{' '}
                  <span className="text-amber-600 italic">gigantes no sabor</span>.
                </h1>

                <p className="hero-text-anim-delay mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-stone-700/90 leading-relaxed max-w-sm sm:max-w-lg">
                  Mini coxinhas, pastéis e salgadinhos feitos com carinho. Perfeitos para sua festa, reunião ou aquele lanche rápido que salva o dia.
                </p>

                <div className="hero-cta-anim mt-6 sm:mt-8 flex flex-col gap-3 w-full sm:w-auto sm:flex-row">
                  <a
                    href="#produtos"
                    className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white transition-all duration-300 hover:bg-amber-600 shadow-xl shadow-amber-400/40 hover:-translate-y-1 active:scale-[0.97]"
                  >
                    Ver produtos
                  </a>
                  <a
                    href={whatsAppHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl border-2 border-stone-200/60 bg-white/70 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-stone-800 transition-all duration-300 hover:bg-white/90 hover:-translate-y-1 active:scale-[0.97] backdrop-blur"
                  >
                    Pedir no WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 left-0 right-0 z-10 flex justify-center">
            <a href="#produtos" className="scroll-cta group flex flex-col items-center gap-2 text-stone-600 hover:text-amber-600 transition-colors duration-300">
              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Ver produtos</span>
              <span className="scroll-chevron flex flex-col items-center gap-0.5">
                <svg viewBox="0 0 24 12" className="w-6 fill-none stroke-current stroke-[2.5] opacity-90" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2,2 12,10 22,2" />
                </svg>
                <svg viewBox="0 0 24 12" className="w-6 fill-none stroke-current stroke-[2.5] opacity-50" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2,2 12,10 22,2" />
                </svg>
              </span>
            </a>
          </div>
        </section>

        <section id="produtos" className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20 lg:py-24">
          <RevealSection direction="up" className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-600 font-bold">Cardápio</p>
              <h2
                className="mt-2 text-3xl font-black text-stone-800 sm:text-4xl lg:text-5xl tracking-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Escolha seus <span className="text-amber-600 italic">favoritos</span>
              </h2>
              <p className="mt-2 sm:mt-3 max-w-lg text-sm sm:text-base text-stone-600">
                Passe o mouse — ou toque — para descobrir cada sabor.
              </p>
            </div>
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noreferrer"
              className="self-start sm:self-auto inline-flex items-center justify-center rounded-2xl border-2 border-amber-200 bg-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-bold text-amber-800 transition-all duration-300 hover:bg-amber-50 hover:-translate-y-1 active:scale-[0.97] shadow-md shadow-amber-100"
            >
              Pedir agora →
            </a>
          </RevealSection>

          <div className="mt-10 sm:mt-14 space-y-12 sm:space-y-16">
            {menuSections.map((section, si) => (
              <RevealSection key={section.id} direction="up" delay={si * 80}>
                <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
                  <div>
                    <h3
                      className="text-xl sm:text-2xl font-black text-stone-800 tracking-tight"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {section.title}
                    </h3>
                    {section.subtitle && <p className="mt-0.5 text-xs sm:text-sm text-stone-500">{section.subtitle}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => scrollSectionByCards(section.id, 'left')}
                      className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl border-2 border-amber-200 bg-white text-amber-800 transition-all duration-200 hover:bg-amber-50 hover:border-amber-400 hover:scale-110 active:scale-90 font-bold text-sm"
                      aria-label={`Voltar ${section.title}`}
                    >←</button>
                    <button
                      type="button"
                      onClick={() => scrollSectionByCards(section.id, 'right')}
                      className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl border-2 border-amber-200 bg-white text-amber-800 transition-all duration-200 hover:bg-amber-50 hover:border-amber-400 hover:scale-110 active:scale-90 font-bold text-sm"
                      aria-label={`Avançar ${section.title}`}
                    >→</button>
                  </div>
                </div>

                <div
                  ref={node => { sectionRefs.current[section.id] = node; }}
                  className="no-scrollbar flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
                >
                  {section.items.map((item, i) => (
                    <FlipCard key={`${section.id}-${item.title}`} item={item} sectionId={section.id} index={i} />
                  ))}
                </div>
              </RevealSection>
            ))}
          </div>
        </section>

        <section id="contato" className="border-t border-amber-200/40 bg-stone-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
            <div className="grid gap-8 sm:gap-10 md:grid-cols-2">
              <RevealSection direction="left">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-600 font-bold">Onde estamos</p>
                <h2
                  className="mt-2 text-2xl sm:text-3xl font-black text-stone-800 tracking-tight"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Contato
                </h2>
                <p className="mt-2 text-sm text-stone-500">Coloca aqui endereço e referências.</p>

                <div className="mt-5 sm:mt-6 space-y-3 sm:space-y-4 text-stone-700">
                  {[
                    { label: 'Endereço', value: 'R. Wâlter Vetterli - Lauro Müller, SC, 88880-000, Brasil' },
                    { label: 'Horário de atendimento', value: 'Seg. a Sex.: 14:00–22:00 | Sáb.: 14:00–19:00 | Dom.: Fechado' },
                    { label: 'WhatsApp', value: '+55 48 933806781' }
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="mt-0.5 h-5 w-5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-600 text-xs">✦</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-stone-400">{label}</p>
                        <p className="text-stone-700 font-medium text-sm sm:text-base">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </RevealSection>

              <RevealSection direction="right" delay={100}>
                <div className="rounded-2xl sm:rounded-3xl border-2 border-amber-200/60 bg-white p-6 sm:p-8 shadow-[0_20px_60px_-20px_rgba(217,119,6,0.2)]">
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-600 font-bold">Pedidos</p>
                  <h3
                    className="mt-2 text-xl sm:text-2xl font-black text-stone-800 tracking-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Faça seu pedido
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-stone-500 leading-relaxed">
                    Clique abaixo e fale direto pelo WhatsApp. Rápido, fácil e sem complicação.
                  </p>
                  <a
                    href={whatsAppHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 sm:mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-amber-500 px-6 py-3.5 sm:py-4 font-bold text-white transition-all duration-300 hover:bg-amber-600 hover:-translate-y-1 active:scale-[0.97] shadow-xl shadow-amber-300/40"
                  >
                    Abrir WhatsApp →
                  </a>
                </div>
              </RevealSection>
            </div>

            <RevealSection direction="up" delay={100} className="mt-10 sm:mt-14">
              <div className="overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-amber-200/60 shadow-[0_20px_60px_-20px_rgba(217,119,6,0.2)]">
                <iframe
                  title="Localização Mini Coxinhas"
                  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Mini+Coxinhas,+R.+W%C3%A2lter+Vetterli+-+Lauro+M%C3%BCller,+SC,+88880-000,+Brazil&zoom=16"
                  className="w-full h-[250px] sm:h-[300px]"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </RevealSection>

            <RevealSection direction="up" delay={100} className="mt-12 sm:mt-16 flex flex-col items-center gap-3">
              <img src="/images/minicoxinhaslogo.png" alt="Logo Mini Coxinhas" className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white p-1.5 object-contain ring-2 ring-amber-200 shadow-md" />
              <p className="text-sm font-bold text-stone-800 tracking-tight">Mini Coxinhas</p>
              <div className="flex items-center gap-3 mt-1">
                <a
                  href="https://www.instagram.com/minicoxinhaslm/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 transition-colors duration-200 hover:text-pink-600"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.08 4.08 0 0 1 1.52.99 4.08 4.08 0 0 1 .99 1.52c.163.46.35 1.26.403 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.43a4.08 4.08 0 0 1-.99 1.52 4.08 4.08 0 0 1-1.52.99c-.46.163-1.26.35-2.43.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.43-.403a4.08 4.08 0 0 1-1.52-.99 4.08 4.08 0 0 1-.99-1.52c-.163-.46-.35-1.26-.403-2.43C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.43a4.08 4.08 0 0 1 .99-1.52 4.08 4.08 0 0 1 1.52-.99c.46-.163 1.26-.35 2.43-.403C8.416 2.175 8.796 2.163 12 2.163M12 0C8.741 0 8.333.014 7.053.072c-1.277.058-2.15.261-2.913.558a5.88 5.88 0 0 0-2.126 1.384A5.88 5.88 0 0 0 .63 4.14C.333 4.903.13 5.776.072 7.053.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.058 1.277.261 2.15.558 2.913a5.88 5.88 0 0 0 1.384 2.126A5.88 5.88 0 0 0 4.14 23.37c.763.297 1.636.5 2.913.558C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c1.277-.058 2.15-.261 2.913-.558a5.88 5.88 0 0 0 2.126-1.384 5.88 5.88 0 0 0 1.384-2.126c.297-.763.5-1.636.558-2.913.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.277-.261-2.15-.558-2.913a5.88 5.88 0 0 0-1.384-2.126A5.88 5.88 0 0 0 19.86.63c-.763-.297-1.636-.5-2.913-.558C15.667.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
                  </svg>
                  @minicoxinhaslm
                </a>
              </div>
              <p className="text-xs text-stone-400 mt-2">© {year} Mini Coxinhas. Todos os direitos reservados.</p>
              <p className="text-[10px] text-stone-300 mt-1">Desenvolvido por Victor Antunes</p>
            </RevealSection>
          </div>
        </section>
      </main>

      <a href={whatsAppHref} target="_blank" rel="noreferrer" aria-label="Chamar no WhatsApp" className="whatsapp-fab fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_36px_-12px_rgba(37,211,102,0.9)] hover:bg-[#20bf5b] active:scale-95">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-current">
          <path d="M19.05 4.94A9.86 9.86 0 0 0 12 2a10 10 0 0 0-8.67 14.97L2 22l5.18-1.3A10 10 0 1 0 19.05 4.94ZM12 20a7.93 7.93 0 0 1-4.04-1.1l-.29-.17-3.07.77.82-2.99-.19-.31A8 8 0 1 1 12 20Zm4.4-5.95c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12s-.62.78-.76.94c-.14.16-.28.18-.52.06a6.43 6.43 0 0 1-1.9-1.17 7.12 7.12 0 0 1-1.3-1.62c-.14-.24-.01-.36.1-.48.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.58 4.12 3.62.58.25 1.03.4 1.38.52.58.19 1.1.16 1.52.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
        </svg>
      </a>
    </>
  );
}

export default App;
