import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Users, Calendar, Star } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import type { Gartenlaube } from "../../../drizzle/schema";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchCity, setSearchCity] = useState("");
  const [searchGuests, setSearchGuests] = useState("1");

  const { data: featuredLauben } = trpc.gartenlauben.list.useQuery({
    limit: 6,
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCity) params.append("city", searchCity);
    if (searchGuests) params.append("guests", searchGuests);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: "#F5F1E8"}}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm" style={{backgroundColor: "rgba(245, 241, 232, 0.95)", borderBottom: "1px solid #E8DFD3"}}>
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-terracotta rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">GL</span>
            </div>
            <h1 className="text-xl font-bold" style={{color: "#2C2C2C"}}>GartenLaube</h1>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-sm font-medium hover:text-terracotta transition-colors" style={{color: "#2C2C2C"}}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="text-sm font-medium hover:text-terracotta transition-colors" style={{color: "#2C2C2C"}}
                >
                  Profil
                </button>
              </>
            ) : (
              <Button
                onClick={() => startLogin()}
                className="bg-terracotta hover:bg-terracotta-dark text-white"
              >
                Anmelden
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 py-20 overflow-hidden">
        <div className="absolute inset-0 organic-overlay" />

        <div className="container relative z-10">
          <div className="grid grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in-up">
              <div className="text-subtitle mb-4">Naturnahe Übernachtungen</div>

              <h1 className="text-hero mb-6" style={{color: "#2C2C2C"}}>
                Schlaf im Grünen
              </h1>

              <p className="text-lg mb-8 max-w-lg leading-relaxed" style={{color: "#8B8B8B"}}>
                Entdecke charmante Gartenlauben entlang der schönsten Radwege
                Deutschlands. Günstig, naturverbunden und perfekt für dein
                Radabenteuer.
              </p>

              <div className="flex gap-4">
                <Button
                  onClick={() => navigate("/search")}
                  className="btn-primary"
                >
                  Lauben entdecken
                </Button>
                {!isAuthenticated && (
                  <Button
                    onClick={() => startLogin()}
                    className="btn-outline"
                  >
                    Deine Laube vermieten
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <div className="text-2xl font-bold" style={{color: "#C85A3A"}}>150+</div>
                  <p className="text-sm" style={{color: "#8B8B8B"}}>Gartenlauben</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-sage">2500+</div>
                  <p className="text-sm" style={{color: "#8B8B8B"}}>Zufriedene Gäste</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-ochre">4.8★</div>
                  <p className="text-sm" style={{color: "#8B8B8B"}}>Durchschnitt</p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-96 md:h-full min-h-96 hidden md:block">
              <div className="absolute inset-0 organic-shape bg-gradient-to-br from-terracotta/20 to-sage/20" />
              <div className="absolute top-1/4 right-1/4 w-32 h-32 organic-shape-2 bg-ochre/10 blur-3xl" />
              <div className="absolute bottom-1/4 left-1/4 w-40 h-40 organic-shape bg-terracotta/10 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-cream-dark/30">
        <div className="container">
          <div className="card-organic p-8 md:p-12 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-[#2C2C2C]">
              Finde deine perfekte Laube
            </h2>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#2C2C2C] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-terracotta" />
                  Ort
                </label>
                <Input
                  placeholder="Stadt oder Region"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="bg-[#F5F1E8] border-[#E8DFD3]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#2C2C2C] flex items-center gap-2">
                  <Users className="w-4 h-4 text-terracotta" />
                  Personen
                </label>
                <select
                  value={searchGuests}
                  onChange={(e) => setSearchGuests(e.target.value)}
                  className="px-4 py-2 bg-[#F5F1E8] border border-[#E8DFD3] rounded-lg text-[#2C2C2C]"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Person" : "Personen"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#2C2C2C] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-terracotta" />
                  Zeitraum
                </label>
                <Input
                  type="date"
                  className="bg-[#F5F1E8] border-[#E8DFD3]"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  className="w-full btn-primary"
                >
                  Suchen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="section-padding">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl text-3xl font-bold mb-2 text-[#2C2C2C]">
              Empfohlen für dich
            </h2>
            <p className="text-muted text-lg">
              Die beliebtesten Gartenlauben unserer Gäste
            </p>
          </div>

          <div className="grid grid-cols-2 grid-cols-3 gap-6">
            {featuredLauben?.map((laube: Gartenlaube) => (
              <Card
                key={laube.id}
                className="card-organic overflow-hidden hover:shadow-lg transition-smooth cursor-pointer"
                onClick={() => navigate(`/listings/${laube.id}`)}
              >
                {/* Image Placeholder */}
                <div className="w-full h-48 bg-gradient-to-br from-terracotta/20 to-sage/20 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-terracotta/50 mx-auto mb-2" />
                    <p className="text-sm" style={{color: "#8B8B8B"}}>Foto</p>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-[#2C2C2C] line-clamp-2">
                    {laube.title}
                  </h3>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-ochre text-ochre" />
                      <span className="text-sm font-medium text-[#2C2C2C]">
                        4.8
                      </span>
                    </div>
                    <span className="text-sm" style={{color: "#8B8B8B"}}>
                      {laube.maxGuests} Gäste
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-sm text-muted">
                    <MapPin className="w-4 h-4" />
                    {laube.city}
                    {laube.distanceToRadweg && (
                      <span className="ml-auto">
                        {laube.distanceToRadweg} km zum Radweg
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#E8DFD3]">
                    <span className="font-bold text-terracotta">
                      €{Number(laube.pricePerNight).toFixed(2)}/Nacht
                    </span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/listings/${laube.id}`);
                      }}
                      className="btn-outline text-sm py-1 px-3"
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => navigate("/listings")}
              className="btn-primary"
            >
              Alle Lauben anschauen
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-terracotta/10 to-sage/10">
        <div className="container text-center">
          <h2 className="text-3xl text-3xl font-bold mb-4 text-[#2C2C2C]">
            Deine Gartenlaube vermieten?
          </h2>
          <p className="text-lg text-muted mb-8 max-w-2xl mx-auto">
            Verdiene nebenbei mit deiner Gartenlaube. Einfach, sicher und
            unkompliziert.
          </p>
          <Button
            onClick={() => (isAuthenticated ? navigate("/host/create") : startLogin())}
            className="btn-primary"
          >
            Jetzt Gastgeber werden
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/5 py-12 border-t border-[#E8DFD3]">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 text-[#2C2C2C]">GartenLaube</h4>
              <p className="text-sm" style={{color: "#8B8B8B"}}>
                Naturnahe Übernachtungen für Radreisende
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#2C2C2C]">Erkunden</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <button
                    onClick={() => navigate("/listings")}
                    className="hover:text-terracotta transition-colors"
                  >
                    Alle Lauben
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/map")}
                    className="hover:text-terracotta transition-colors"
                  >
                    Karte
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#2C2C2C]">Für Gastgeber</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <button
                    onClick={() => navigate("/host/dashboard")}
                    className="hover:text-terracotta transition-colors"
                  >
                    Dashboard
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-[#2C2C2C]">Rechtliches</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li>
                  <a href="#" className="hover:text-terracotta transition-colors">
                    Impressum
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-terracotta transition-colors">
                    Datenschutz
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#E8DFD3] pt-8 text-center text-sm text-muted">
            <p>&copy; 2026 GartenLaube. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
