import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AvailabilityCalendarProps {
  gartenlaubeId: number;
  onDateRangeSelect?: (checkIn: Date, checkOut: Date) => void;
  bookedDates?: Date[];
  minDate?: Date;
}

export default function AvailabilityCalendar({
  gartenlaubeId,
  onDateRangeSelect,
  bookedDates = [],
  minDate = new Date(),
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(null);

  // Konvertiere gebuchte Daten zu einem Set für schnellere Suche
  const bookedDateSet = useMemo(() => {
    const set = new Set<string>();
    bookedDates.forEach((date) => {
      const dateStr = new Date(date).toISOString().split("T")[0];
      set.add(dateStr);
    });
    return set;
  }, [bookedDates]);

  // Prüfe, ob ein Datum verfügbar ist
  const isDateAvailable = (date: Date): boolean => {
    const dateStr = date.toISOString().split("T")[0];
    return !bookedDateSet.has(dateStr) && date >= minDate;
  };

  // Generiere Tage des Monats
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Leere Tage am Anfang
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Tage des Monats
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const handleDateClick = (date: Date) => {
    if (!isDateAvailable(date)) return;

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      // Starte neue Auswahl
      setSelectedCheckIn(date);
      setSelectedCheckOut(null);
    } else if (date > selectedCheckIn) {
      // Setze Abreisedatum
      setSelectedCheckOut(date);
      if (onDateRangeSelect) {
        onDateRangeSelect(selectedCheckIn, date);
      }
    } else {
      // Datum liegt vor Ankunft - starte neu
      setSelectedCheckIn(date);
      setSelectedCheckOut(null);
    }
  };

  const isDateInRange = (date: Date): boolean => {
    if (!selectedCheckIn || !selectedCheckOut) return false;
    return date > selectedCheckIn && date < selectedCheckOut;
  };

  const isDateSelected = (date: Date): boolean => {
    if (!date) return false;
    const dateStr = date.toISOString().split("T")[0];
    const checkInStr = selectedCheckIn?.toISOString().split("T")[0];
    const checkOutStr = selectedCheckOut?.toISOString().split("T")[0];
    return dateStr === checkInStr || dateStr === checkOutStr;
  };

  const monthName = currentMonth.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleReset = () => {
    setSelectedCheckIn(null);
    setSelectedCheckOut(null);
  };

  return (
    <Card className="p-6" style={{ backgroundColor: "white", border: "1px solid #E8DFD3" }}>
      <div className="mb-6">
        <h3 style={{ color: "#2C2C2C" }} className="text-lg font-bold mb-2">
          Verfügbarkeit prüfen
        </h3>
        <p style={{ color: "#8B8B8B" }} className="text-sm">
          Wählen Sie Ihr Ankunfts- und Abreisedatum
        </p>
      </div>

      {/* Selected Dates Display */}
      {(selectedCheckIn || selectedCheckOut) && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: "#F0E8DC" }}>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p style={{ color: "#8B8B8B" }} className="text-xs">
                Ankunft
              </p>
              <p style={{ color: "#2C2C2C" }} className="font-bold">
                {selectedCheckIn?.toLocaleDateString("de-DE")}
              </p>
            </div>
            <div>
              <p style={{ color: "#8B8B8B" }} className="text-xs">
                Abreise
              </p>
              <p style={{ color: "#2C2C2C" }} className="font-bold">
                {selectedCheckOut?.toLocaleDateString("de-DE") || "—"}
              </p>
            </div>
          </div>
          {selectedCheckOut && (
            <p style={{ color: "#6B8E7F" }} className="text-sm font-semibold">
              {Math.ceil(
                (selectedCheckOut.getTime() - selectedCheckIn!.getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              Nächte
            </p>
          )}
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={handlePrevMonth}
          className="btn-outline p-2"
          disabled={currentMonth <= minDate}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h4 style={{ color: "#2C2C2C" }} className="font-bold capitalize">
          {monthName}
        </h4>
        <Button onClick={handleNextMonth} className="btn-outline p-2">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold"
              style={{ color: "#8B8B8B" }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const available = isDateAvailable(date);
            const inRange = isDateInRange(date);
            const selected = isDateSelected(date);
            const isCheckIn = selectedCheckIn?.toDateString() === date.toDateString();
            const isCheckOut = selectedCheckOut?.toDateString() === date.toDateString();

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                disabled={!available}
                className="aspect-square rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: selected
                    ? "#C85A3A"
                    : inRange
                      ? "#F0E8DC"
                      : available
                        ? "white"
                        : "#EFEFEF",
                  color: selected ? "white" : available ? "#2C2C2C" : "#CCCCCC",
                  border: selected ? "2px solid #C85A3A" : "1px solid #E8DFD3",
                  cursor: available ? "pointer" : "not-allowed",
                  opacity: available ? 1 : 0.6,
                }}
                title={
                  available
                    ? "Verfügbar"
                    : "Nicht verfügbar"
                }
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-lg" style={{ backgroundColor: "#F5F1E8" }}>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: "#C85A3A" }}
          />
          <span style={{ color: "#2C2C2C" }} className="text-xs">
            Ausgewählt
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: "#F0E8DC" }}
          />
          <span style={{ color: "#2C2C2C" }} className="text-xs">
            Im Bereich
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: "#EFEFEF" }}
          />
          <span style={{ color: "#8B8B8B" }} className="text-xs">
            Gebucht
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {selectedCheckOut && (
          <Button onClick={handleReset} className="flex-1 btn-outline">
            Zurücksetzen
          </Button>
        )}
        <Button
          disabled={!selectedCheckOut}
          className="flex-1 btn-primary"
        >
          Zur Buchung
        </Button>
      </div>
    </Card>
  );
}
