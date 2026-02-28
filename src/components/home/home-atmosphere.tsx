export function HomeAtmosphere() {
  return (
    <div
      aria-hidden
      className="home-atmosphere pointer-events-none absolute inset-0 -z-10"
    >
      <div className="home-atmosphere__layer home-atmosphere__layer--a" />
      <div className="home-atmosphere__layer home-atmosphere__layer--b" />
      <div className="home-atmosphere__vignette" />
    </div>
  );
}
