export default function WelcomePage({ isClosing }) {
  return (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center bg-accent text-white transition-opacity duration-700 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center px-6">
        <p className="text-sm tracking-[0.24em] uppercase text-white/70 mb-3 welcome-rise">
          Selamat Datang
        </p>
        <h1 className="brand text-6xl md:text-7xl text-secondary leading-none welcome-rise-delayed">
          Konilicious.
        </h1>
        <p className="mt-3 text-white/75 text-base md:text-lg welcome-rise-more">
          Sate taichan dengan rasa yang bikin nagih
        </p>

        <div className="mt-8 h-1.5 w-56 md:w-72 mx-auto bg-white/20 rounded-full overflow-hidden">
          <div className="h-full w-full bg-primary welcome-progress" />
        </div>
      </div>
    </div>
  );
}