import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Users, Calendar, Star, X } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import type { Gartenlaube } from "../../../drizzle/schema";

// Verfügbare Ausstattungen
const AVAILABLE_AMENITIES = [
  { id: "WLAN", label: "WiFi" },
  { id: "Küche", label: "Küche" },
  { id: "Dusche", label: "Dusche" },
  { id: "Bett", label: "Bett" },
  { id: "Terrasse", label: "Terrasse" },
  { id: "Garten", label: "Garten" },
  { id: "Parkplatz", label: "Parkplatz" },
  { id: "wifi", label: "WiFi/Internet" },
  { id: "parking", label: "Parkplatz" },
];

export default function SearchFilters() {
  const [, navigate] = useLocation();
  const [searchCity, setSearchCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [maxDistance, setMaxDistance] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showAmenities, setShowAmenities] = useState(false);

  // Memoize query parameters to prevent unnecessary re-renders and race conditions
  const queryParams = useMemo(
    () => ({
      city: searchCity || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      maxDistanceToRadweg: maxDistance ? Number(maxDistance) : undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
      limit: 100,
    }),
    [searchCity, minPrice, maxPrice, maxDistance, selectedAmenities]
  );

  // Fetch listings with memoized params
  const { data: listings, isLoading } = trpc.gartenlauben.list.useQuery(
    queryParams,
    {
      // Prevent unnecessary refetches
      staleTime: 30000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Use useCallback to prevent function recreation on every render
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (searchCity) params.append("city", searchCity);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (maxDistance) params.append("maxDistance", maxDistance);
    if (selectedAmenities.length > 0) {
      params.append("amenities", selectedAmenities.join(","));
    }
    navigate(`/listings?${params.toString()}`);
  }, [searchCity, minPrice, maxPrice, maxDistance, selectedAmenities, navigate]);

  // Use useCallback for toggleAmenity to ensure stable reference
  const toggleAmenity = useCallback((amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  }, []);

  // Use useCallback for resetFilters
  const resetFilters = useCallback(() => {
    setSearchCity("");
    setMinPrice("");
    setMaxPrice("");
    setMaxDistance("");
    setSelectedAmenities([]);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
      {/* Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: "rgba(245, 241, 232, 0.95)", borderBottom: "1px solid #E8DFD3" }}>
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-terracotta rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">GL</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: "#2C2C2C" }}>GartenLaube</h1>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm font-medium hover:text-terracotta transition-colors"
            style={{ color: "#2C2C2C" }}
          >
            Zurück
          </button>
        </div>
      </nav>

      <div className="container py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-organic p-6 rounded-xl sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold" style={{ color: "#2C2C2C" }}>
                  Filter
                </h2>
                <button
                  onClick={resetFilters}
                  className="text-xs text-terracotta hover:text-terracotta-dark"
                >
                  Zurücksetzen
                </button>
              </div>

              <div className="space-y-6">
                {/* City Filter */}
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: "#2C2C2C" }}>
                    Stadt
                  </label>
                  <Input
                    placeholder="z.B. Berlin"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="bg-[#F5F1E8] border-[#E8DFD3]"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: "#2C2C2C" }}>
                    Preis pro Nacht (€)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="bg-[#F5F1E8] border-[#E8DFD3]"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="bg-[#F5F1E8] border-[#E8DFD3]"
                    />
                  </div>
                </div>

                {/* Distance to Radweg */}
                <div>
                  <label className="text-sm font-medium block mb-2" style={{ color: "#2C2C2C" }}>
                    Max. Entfernung zum Radweg (km)
                  </label>
                  <Input
                    type="number"
                    placeholder="z.B. 5"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(e.target.value)}
                    className="bg-[#F5F1E8] border-[#E8DFD3]"
                  />
                </div>

                {/* Amenities Filter */}
                <div>
                  <button
                    onClick={() => setShowAmenities(!showAmenities)}
                    className="text-sm font-medium block mb-2 w-full text-left p-2 rounded hover:bg-cream-dark/30 transition-colors"
                    style={{ color: "#2C2C2C" }}
                  >
                    Ausstattung {selectedAmenities.length > 0 && `(${selectedAmenities.length})`}
                  </button>
                  {showAmenities && (
                    <div className="space-y-2 mt-2">
                      {AVAILABLE_AMENITIES.map((amenity) => (
                        <label key={amenity.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedAmenities.includes(amenity.id)}
                            onChange={() => toggleAmenity(amenity.id)}
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm" style={{ color: "#2C2C2C" }}>
                            {amenity.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  className="w-full btn-primary"
                >
                  Suchen
                </Button>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#2C2C2C" }}>
                Gartenlauben
              </h2>
              <p className="text-sm" style={{ color: "#8B8B8B" }}>
                {listings?.length || 0} Ergebnisse gefunden
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p style={{ color: "#8B8B8B" }}>Lädt...</p>
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((laube: Gartenlaube) => (
                  <Card
                    key={laube.id}
                    className="card-organic overflow-hidden hover:shadow-lg transition-smooth cursor-pointer"
                    onClick={() => navigate(`/listings/${laube.id}`)}
                  >
                    {/* Image Placeholder */}
                    <div className="w-full h-40 bg-gradient-to-br from-terracotta/20 to-sage/20 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-terracotta/50" />
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-base mb-2 text-[#2C2C2C] line-clamp-2">
                        {laube.title}
                      </h3>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-ochre text-ochre" />
                          <span className="text-xs font-medium text-[#2C2C2C]">
                            4.8
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: "#8B8B8B" }}>
                          {laube.maxGuests} Gäste
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: "#8B8B8B" }}>
                        <MapPin className="w-3 h-3" />
                        {laube.city}
                        {laube.distanceToRadweg && (
                          <span className="ml-auto">
                            {laube.distanceToRadweg} km
                          </span>
                        )}
                      </div>

                      {/* Amenities */}
                      {laube.amenities && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(Array.isArray(laube.amenities)
                            ? laube.amenities
                            : typeof laube.amenities === "string"
                            ? JSON.parse(laube.amenities)
                            : []
                          )
                            .slice(0, 2)
                            .map((amenity: string) => (
                              <span
                                key={amenity}
                                className="text-xs px-2 py-1 rounded-full"
                                style={{ backgroundColor: "#E8DFD3", color: "#2C2C2C" }}
                              >
                                {amenity}
                              </span>
                            ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-[#E8DFD3]">
                        <span className="font-bold text-terracotta">
                          €{laube.pricePerNight}/Nacht
                        </span>
                        <Button className="btn-primary text-xs py-1 px-3">
                          Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p style={{ color: "#8B8B8B" }}>
                  Keine Gartenlauben gefunden. Versuchen Sie, die Filter anzupassen.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
