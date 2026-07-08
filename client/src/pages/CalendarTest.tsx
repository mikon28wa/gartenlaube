import { useState } from "react";
import { Card } from "@/components/ui/card";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";

export default function CalendarTest() {
  const [selectedDates, setSelectedDates] = useState<{
    checkIn: Date | null;
    checkOut: Date | null;
  }>({ checkIn: null, checkOut: null });

  // Beispiel: Gebuchte Daten
  const bookedDates = [
    new Date(2026, 6, 10),
    new Date(2026, 6, 11),
    new Date(2026, 6, 12),
    new Date(2026, 6, 20),
    new Date(2026, 6, 21),
    new Date(2026, 6, 22),
    new Date(2026, 6, 23),
  ];

  const handleDateRangeSelect = (checkIn: Date, checkOut: Date) => {
    setSelectedDates({ checkIn, checkOut });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-sm" style={{ backgroundColor: "rgba(245, 241, 232, 0.95)", borderBottom: "1px solid #E8DFD3" }}>
        <div className="container py-6">
          <h1 style={{ color: "#2C2C2C" }} className="text-3xl font-bold">
            Verfügbarkeitskalender Test
          </h1>
          <p style={{ color: "#8B8B8B" }} className="text-sm mt-2">
            Überprüfe die interaktive Kalenderansicht für Gartenlauben
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="col-span-2">
            <AvailabilityCalendar
              gartenlaubeId={1}
              bookedDates={bookedDates}
              onDateRangeSelect={handleDateRangeSelect}
            />
          </div>

          {/* Info Panel */}
          <div className="col-span-1">
            <Card className="p-6 sticky top-24" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
              <h2 style={{ color: "#2C2C2C" }} className="text-lg font-bold mb-4">
                Ausgewählte Daten
              </h2>

              {selectedDates.checkIn && selectedDates.checkOut ? (
                <div className="space-y-4">
                  <div>
                    <p style={{ color: "#8B8B8B" }} className="text-xs font-semibold">
                      Ankunft
                    </p>
                    <p style={{ color: "#2C2C2C" }} className="font-bold text-lg">
                      {selectedDates.checkIn.toLocaleDateString("de-DE")}
                    </p>
                  </div>

                  <div>
                    <p style={{ color: "#8B8B8B" }} className="text-xs font-semibold">
                      Abreise
                    </p>
                    <p style={{ color: "#2C2C2C" }} className="font-bold text-lg">
                      {selectedDates.checkOut.toLocaleDateString("de-DE")}
                    </p>
                  </div>

                  <div style={{ borderTop: "1px solid #E8DFD3", paddingTop: "1rem" }}>
                    <p style={{ color: "#8B8B8B" }} className="text-xs font-semibold">
                      Anzahl Nächte
                    </p>
                    <p style={{ color: "#C85A3A" }} className="font-bold text-2xl">
                      {Math.ceil(
                        (selectedDates.checkOut.getTime() -
                          selectedDates.checkIn.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </p>
                  </div>

                  <div style={{ borderTop: "1px solid #E8DFD3", paddingTop: "1rem" }}>
                    <p style={{ color: "#8B8B8B" }} className="text-xs font-semibold mb-2">
                      Zusammenfassung
                    </p>
                    <div className="space-y-2 text-sm">
                      <p style={{ color: "#2C2C2C" }}>
                        <strong>Von:</strong> {selectedDates.checkIn.toLocaleDateString("de-DE", { weekday: "long" })}
                      </p>
                      <p style={{ color: "#2C2C2C" }}>
                        <strong>Bis:</strong> {selectedDates.checkOut.toLocaleDateString("de-DE", { weekday: "long" })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p style={{ color: "#8B8B8B" }}>
                    Wählen Sie ein Ankunfts- und Abreisedatum aus der Kalender aus
                  </p>
                </div>
              )}
            </Card>

            {/* Legend */}
            <Card className="p-6 mt-6" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
              <h3 style={{ color: "#2C2C2C" }} className="font-bold mb-4">
                Legende
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: "#C85A3A" }}
                  />
                  <p style={{ color: "#2C2C2C" }} className="text-sm">
                    Ausgewähltes Datum
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: "#F0E8DC" }}
                  />
                  <p style={{ color: "#2C2C2C" }} className="text-sm">
                    Im Zeitraum enthalten
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}
                  />
                  <p style={{ color: "#2C2C2C" }} className="text-sm">
                    Verfügbar
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: "#EFEFEF" }}
                  />
                  <p style={{ color: "#8B8B8B" }} className="text-sm">
                    Nicht verfügbar
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-12 grid grid-cols-3 gap-6">
          <Card className="p-6" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
            <h3 style={{ color: "#2C2C2C" }} className="font-bold mb-2">
              Intuitive Bedienung
            </h3>
            <p style={{ color: "#8B8B8B" }} className="text-sm">
              Klicken Sie auf ein Datum für Ankunft und dann auf ein späteres Datum für Abreise
            </p>
          </Card>

          <Card className="p-6" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
            <h3 style={{ color: "#2C2C2C" }} className="font-bold mb-2">
              Verfügbarkeitsprüfung
            </h3>
            <p style={{ color: "#8B8B8B" }} className="text-sm">
              Gebuchte Daten werden automatisch grau angezeigt und können nicht ausgewählt werden
            </p>
          </Card>

          <Card className="p-6" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
            <h3 style={{ color: "#2C2C2C" }} className="font-bold mb-2">
              Nächte-Berechnung
            </h3>
            <p style={{ color: "#8B8B8B" }} className="text-sm">
              Die Anzahl der Nächte wird automatisch berechnet und angezeigt
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
