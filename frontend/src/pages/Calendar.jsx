import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import "./Calendar.css";

export default function CalendarPage() {
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const calendarRef = useRef(null);

  function openModal() {
    setForm({
      title: "",
      date: "",
      startTime: "",
      endTime: "",
    });
    setIsModalOpen(true);
    setError("");
  }

  function closeModal() {
    if (creating) return;
    setIsModalOpen(false);
    setError("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreateEvent(e) {
    setError("");
    e.preventDefault();

    if (!form.title || !form.date || !form.startTime || !form.endTime) {
      setError("Please fill in all fields");
  return;
    }

    const start = new Date(`${form.date}T${form.startTime}`);
    const end = new Date(`${form.date}T${form.endTime}`);

    if (end <= start) {
      setError("End time must be after start time");
      return;
    }
    setError("");
    try {
      setCreating(true);
      await fetch("http://localhost:3000/api/calendar/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          startISO: start.toISOString(),
          endISO: end.toISOString(),
        }),
      });

      // refresh calendar events
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }

      // reset + close
      setForm({
        title: "",
        date: "",
        startTime: "",
        endTime: "",
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create event:", err);
      alert("Oops, something went wrong creating the event.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="calendar-page">
      <div className="calendar-card">
        <div className="calendar-header-row">
          <h2 className="calendar-title">Your Calendar</h2>
          <button className="calendar-create-btn" onClick={openModal}>
            + New Event
          </button>
        </div>

        <div className="calendar-underline" />

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          buttonText={{
            today: "Today",
          }}
          events={async (info, success, failure) => {
            try {
              const url = new URL("http://localhost:3000/api/calendar/events");
              url.searchParams.set("start", info.startStr);
              url.searchParams.set("end", info.endStr);
              const r = await fetch(url, { credentials: "include" });
              success(await r.json());
            } catch (e) {
              failure(e);
            }
          }}
          eventDisplay="block"
          eventBorderColor="#e43173"
          eventBackgroundColor="#f8b5cc"
          height="auto"
        />
      </div>

      {isModalOpen && (
        <div className="calendar-modal-backdrop" onClick={closeModal}>
          <div
            className="calendar-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Create Event</h3>
            <form onSubmit={handleCreateEvent} className="calendar-form">
              <label>
                Title
                <input
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Movie night, study session..."
                />
              </label>

              <label>
                Date
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </label>

              <div className="calendar-time-row">
                <label>
                  Start time
                  <input
                    name="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  End time
                  <input
                    name="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="calendar-modal-actions">
                <button
                  type="button"
                  className="calendar-secondary-btn"
                  onClick={closeModal}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="calendar-primary-btn"
                  disabled={creating}
                >
                  {creating ? "Saving..." : "Save Event"}
                </button>
              </div>
              {error && <div className="calendar-error">{error}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}