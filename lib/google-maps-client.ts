export type MapsRuntime = { importLibrary: (name: string) => Promise<unknown> };
type MapsWindow = Window & { google?: { maps?: MapsRuntime }; __weRoofMapsReady?: () => void; gm_authFailure?: () => void };
let loading: Promise<MapsRuntime> | undefined;

export function loadGoogleMaps(): Promise<MapsRuntime> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  if (!key) return Promise.reject(new Error("Maps key is not configured"));
  const runtime = window as MapsWindow;
  if (runtime.google?.maps?.importLibrary) return Promise.resolve(runtime.google.maps);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const timer = window.setTimeout(() => fail(), 15000);
    const previousAuthFailure = runtime.gm_authFailure;
    const cleanup = () => { window.clearTimeout(timer); delete runtime.__weRoofMapsReady; runtime.gm_authFailure = previousAuthFailure; };
    const fail = () => { cleanup(); script.remove(); loading = undefined; reject(new Error("Google Maps could not load")); };
    runtime.__weRoofMapsReady = () => {
      const maps = runtime.google?.maps;
      if (!maps?.importLibrary) { fail(); return; }
      cleanup(); resolve(maps);
    };
    runtime.gm_authFailure = () => { previousAuthFailure?.(); fail(); };
    const url = new URL("https://maps.googleapis.com/maps/api/js");
    url.search = new URLSearchParams({ key, v: "weekly", loading: "async", callback: "__weRoofMapsReady" }).toString();
    script.src = url.toString(); script.async = true; script.onerror = fail;
    document.head.append(script);
  });
  return loading;
}
