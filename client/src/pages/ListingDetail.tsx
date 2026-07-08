import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Star, Heart, ChevronLeft, Users, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import type { Gartenlaube } from "../../../drizzle/schema";

export default function ListingDetail() {
  const [, params] = useRoute("/listings/:id");
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedDates, setSelectedDates] = useState({ start: "", end: "" });
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null);

  const laubenId = params?.id ? Number(params.id) : null;

  const { data: laube, isLoading } = trpc.gartenlauben.getById.useQuery(
    { id: laubenId! },
    { enabled: !!laubenId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
        <div className="container py-8">
          <p style={{ color: "#8B8B8B" }}>Lädt...</p>
        </div>
      </div>
    );
  }

  if (!laube) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
        <div className="container py-12 text-center">
          <p style={{ color: "#2C2C2C" }} className="text-lg font-bold mb-4">
            Gartenlaube nicht gefunden
          </p>
          <Button onClick={() => navigate("/listings")} className="btn-primary">
            Zurück zu Lauben
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-sm" style={{ backgroundColor: "rgba(245, 241, 232, 0.95)", borderBottom: "1px solid #E8DFD3" }}>
        <div className="container py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/listings")}
            className="flex items-center gap-2 hover:text-terracotta transition-colors"
            style={{ color: "#C85A3A" }}
          >
            <ChevronLeft className="w-5 h-5" />
            Zurück
          </button>
          <h1 style={{ color: "#2C2C2C" }} className="text-xl font-bold">
            {laube.title}
          </h1>
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className="transition-colors"
          >
            <Heart
              className="w-6 h-6"
              fill={isFavorited ? "#C85A3A" : "none"}
              stroke={isFavorited ? "#C85A3A" : "#8B8B8B"}
            />
          </button>
        </div>
      </div>

      <div className="container py-8">
        {/* SEO H1 */}
        <h1 className="sr-only">
          {laube.title} - Gartenlaube in {laube.city} am Radweg
        </h1>
        
        <div className="grid grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="col-span-2">
            {/* Image Gallery */}
            <div className="w-full h-96 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-terracotta/20 to-sage/20 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-terracotta/50 mx-auto mb-2" />
                <p style={{ color: "#8B8B8B" }}>Foto-Galerie</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 style={{ color: "#2C2C2C" }} className="text-2xl font-bold mb-4">
                Über diese Laube
              </h2>
              {/* SEO H2 for main content */}
              <div className="sr-only">
                <h2>Gartenlaube Details und Ausstattung</h2>
              </div>
              <p style={{ color: "#8B8B8B" }} className="leading-relaxed mb-6">
                {laube.description}
              </p>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: "#F0E8DC" }}>
                  <Users className="w-5 h-5" style={{ color: "#C85A3A" }} />
                  <div>
                    <p style={{ color: "#8B8B8B" }} className="text-sm">
                      Gäste
                    </p>
                    <p style={{ color: "#2C2C2C" }} className="font-bold">
                      Bis zu {laube.maxGuests} Personen
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: "#F0E8DC" }}>
                  <DollarSign className="w-5 h-5" style={{ color: "#C85A3A" }} />
                  <div>
                    <p style={{ color: "#8B8B8B" }} className="text-sm">
                      Preis pro Nacht
                    </p>
                    <p style={{ color: "#2C2C2C" }} className="font-bold">
                      €{Number(laube.pricePerNight).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {laube.amenities && laube.amenities.length > 0 && (
                <div className="mb-8">
                  <h3 style={{ color: "#2C2C2C" }} className="text-lg font-bold mb-4">
                    Ausstattung
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {laube.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 rounded-full text-sm"
                        style={{ backgroundColor: "#E8DFD3", color: "#2C2C2C" }}
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="mb-8">
                <h3 style={{ color: "#2C2C2C" }} className="text-lg font-bold mb-4">
                  Standort
                </h3>
                <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: "#F0E8DC" }}>
                  <MapPin className="w-5 h-5 mt-1" style={{ color: "#C85A3A" }} />
                  <div>
                    <p style={{ color: "#2C2C2C" }} className="font-semibold">
                      {laube.address}
                    </p>
                    <p style={{ color: "#8B8B8B" }} className="text-sm">
                      {laube.city}, {laube.postalCode}
                    </p>
                    {laube.distanceToRadweg && (
                      <p style={{ color: "#6B8E7F" }} className="text-sm font-semibold mt-2">
                        {laube.distanceToRadweg} km zum nächsten Radweg
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Availability Calendar */}
              <div className="mb-8">
                <h3 style={{ color: "#2C2C2C" }} className="text-lg font-bold mb-4">
                  Verfügbarkeit
                </h3>
                <AvailabilityCalendar
                  gartenlaubeId={laubenId || 1}
                  bookedDates={[]}
                  onDateRangeSelect={(checkIn, checkOut) => {
                    setSelectedCheckIn(checkIn);
                    setSelectedCheckOut(checkOut);
                  }}
                />
              </div>

              {/* Reviews Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 style={{ color: "#2C2C2C" }} className="text-lg font-bold">
                    Bewertungen
                  </h3>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-ochre" style={{ color: "#B8860B" }} />
                    <span style={{ color: "#2C2C2C" }} className="font-bold">
                      4.8
                    </span>
                    <span style={{ color: "#8B8B8B" }} className="text-sm">
                      (12 Bewertungen)
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {[1, 2].map((idx) => (
                    <div key={idx} className="p-4 rounded-lg" style={{ backgroundColor: "#F0E8DC" }}>
                      <div className="flex items-center justify-between mb-2">
                        <p style={{ color: "#2C2C2C" }} className="font-semibold">
                          Gast {idx}
                        </p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4"
                              fill={i < 5 ? "#B8860B" : "none"}
                              style={{ color: "#B8860B" }}
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: "#8B8B8B" }} className="text-sm">
                        Sehr schöne Laube mit tollem Ausblick. Perfekt für eine Radreise!
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Booking Card */}
          <div className="col-span-1">
            <Card className="p-6 sticky top-24" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span style={{ color: "#C85A3A" }} className="text-3xl font-bold">
                    €{Number(laube.pricePerNight).toFixed(0)}
                  </span>
                  <span style={{ color: "#8B8B8B" }}>/Nacht</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-ochre" style={{ color: "#B8860B" }} />
                  <span style={{ color: "#2C2C2C" }} className="font-semibold text-sm">
                    4.8
                  </span>
                  <span style={{ color: "#8B8B8B" }} className="text-xs">
                    (12)
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label style={{ color: "#8B8B8B" }} className="text-sm font-medium block mb-2">
                    Ankunft
                  </label>
                  <Input
                    type="date"
                    value={selectedDates.start}
                    onChange={(e) =>
                      setSelectedDates({ ...selectedDates, start: e.target.value })
                    }
                    className="w-full"
                    style={{ backgroundColor: "#F5F1E8", borderColor: "#E8DFD3" }}
                  />
                </div>

                <div>
                  <label style={{ color: "#8B8B8B" }} className="text-sm font-medium block mb-2">
                    Abreise
                  </label>
                  <Input
                    type="date"
                    value={selectedDates.end}
                    onChange={(e) =>
                      setSelectedDates({ ...selectedDates, end: e.target.value })
                    }
                    className="w-full"
                    style={{ backgroundColor: "#F5F1E8", borderColor: "#E8DFD3" }}
                  />
                </div>
              </div>

              <Button
                onClick={() => {
                  if (!isAuthenticated) {
                    startLogin();
                  } else {
                    alert("Buchungsanfrage wird verarbeitet...");
                  }
                }}
                className="w-full btn-primary mb-3"
              >
                Jetzt buchen
              </Button>

              <Button
                onClick={() => navigate("/listings")}
                className="w-full btn-outline"
              >
                Weitere Lauben
              </Button>

              <div className="mt-6 pt-6" style={{ borderTop: "1px solid #E8DFD3" }}>
                <p style={{ color: "#8B8B8B" }} className="text-xs text-center">
                  Du zahlst erst nach der Bestätigung durch den Gastgeber
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
