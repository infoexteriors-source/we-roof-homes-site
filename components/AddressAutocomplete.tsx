"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps-client";
import { propertyFromGoogleAddress, type GoogleAddressComponent } from "@/lib/google-address";
import type { RoofProperty } from "@/lib/roof-view";

type Place = { addressComponents?: GoogleAddressComponent[]; fetchFields(options: { fields: string[] }): Promise<unknown> };
type Selection = Event & { placePrediction: { toPlace(): Place } };
type PlacesLibrary = { PlaceAutocompleteElement: new (options: Record<string, unknown>) => HTMLElement };

export function AddressAutocomplete({ onSelect }: { onSelect: (property: RoofProperty) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  const [status, setStatus] = useState("Loading address suggestions…");
  const [unavailable, setUnavailable] = useState(false);
  onSelectRef.current = onSelect;

  useEffect(() => {
    let stopped = false;
    let widget: HTMLElement | undefined;
    let selectionVersion = 0;
    const denied = () => { if (!stopped) { widget?.remove(); setUnavailable(true); setStatus("Address suggestions are unavailable. Enter your address and ZIP below."); } };
    const select = async (event: Event) => {
      const version = ++selectionVersion;
      setStatus("Finding your address…");
      try {
        const place = (event as Selection).placePrediction.toPlace();
        await place.fetchFields({ fields: ["addressComponents"] });
        if (stopped || version !== selectionVersion) return;
        const property = propertyFromGoogleAddress(place.addressComponents || []);
        onSelectRef.current(property);
        setStatus("Address and ZIP filled in. Check the details below, then preview your home.");
      } catch (cause) {
        if (!stopped && version === selectionVersion) setStatus(cause instanceof Error && !cause.message.includes("Google") ? cause.message : "Couldn’t retrieve this address. Select another suggestion or enter it below.");
      }
    };
    void loadGoogleMaps().then(async (maps) => {
      const places = await maps.importLibrary("places") as PlacesLibrary;
      if (stopped || !host.current) return;
      widget = new places.PlaceAutocompleteElement({
        includedPrimaryTypes: ["street_address"], includedRegionCodes: ["us"],
        locationBias: { north: 39.8, south: 38.5, east: -76.0, west: -77.9 },
        requestedRegion: "us", placeholder: "Start typing your home address",
      });
      widget.setAttribute("aria-label", "Search your home address");
      widget.addEventListener("gmp-select", select);
      widget.addEventListener("gmp-error", denied);
      // Enter chooses a prediction rather than submitting the surrounding property form.
      widget.addEventListener("keydown", (event) => { if ((event as KeyboardEvent).key === "Enter") event.stopPropagation(); });
      host.current.append(widget);
      setStatus("Select your address to fill the street, city and ZIP below.");
    }).catch(denied);
    return () => { stopped = true; selectionVersion++; widget?.removeEventListener("gmp-select", select); widget?.removeEventListener("gmp-error", denied); widget?.remove(); };
  }, []);

  return <div className="calc-address-search">
    <p className="calc-address-search-label">Find your home</p>
    <p className="calc-fine">Search with Google to fill in your address, or enter it below.</p>
    <div ref={host} hidden={unavailable} />
    <p className="calc-address-status" role="status">{status}</p>
  </div>;
}
