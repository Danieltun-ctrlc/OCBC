import { useState } from "react";
import { submitIssue, fetchQueues, bookSlot } from "./api.js";
import "./CustomerView.css";

function CustomerView() {
    const [form, setForm] = useState({
        name: "",
        contact: "",
        issueType: "Digital banking issue",
        description: "",
        isUrgent: false
    });

    const [result, setResult] = useState(null);
    const [queueStatus, setQueueStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const [bookingDate, setBookingDate] = useState("");
    const [bookingSlot, setBookingSlot] = useState("");
    const [bookingSaved, setBookingSaved] = useState(false);

    const slots = [
        "09:00–10:00",
        "10:00–11:00",
        "11:00–12:00",
        "13:00–14:00",
        "14:00–15:00",
        "15:00–16:00",
        "16:00–17:00"
    ];

    const handleChange = (e) => {
        const target = e.target;
        const name = target.name;
        const value = target.type === "checkbox" ? target.checked : target.value;

        setForm(function (prev) {
            return {
                ...prev,
                [name]: value
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setBookingSaved(false);

        try {
            const data = await submitIssue(form);
            setResult(data);

            const queues = await fetchQueues();
            const issue = data.issue;
            let position = null;

            if (issue.path === "critical") {
                const index = queues.urgentQueue.findIndex(function (i) {
                    return i.id === issue.id;
                });
                position = index === -1 ? null : index + 1;
            } else {
                const index = queues.normalQueue.findIndex(function (i) {
                    return i.id === issue.id;
                });
                position = index === -1 ? null : index + 1;
            }

            setQueueStatus({
                path: issue.path,
                riskLevel: issue.riskLevel,
                position: position
            });
        } catch (err) {
            console.error(err);
            alert("Submission failed");
        } finally {
            setLoading(false);
        }
    };

    const confirmBooking = async () => {
        if (!bookingDate) {
            alert("Please choose a date");
            return;
        }
        if (!bookingSlot) {
            alert("Please choose a time slot");
            return;
        }

        const id = result.issue.id;

        const res = await bookSlot({
            id: id,
            bookingDate: bookingDate,
            bookingSlot: bookingSlot
        });

        if (res.success) {
            setBookingSaved(true);
            alert("Booking confirmed!");
        } else {
            alert("Booking failed");
        }
    };

    const currentStep =
        !result ? 1 : result.queueInfo.path === "critical" ? 2 : 3;

    return (
        <div className="cv-root">
            <div className="cv-shell cv-animate-in">
                {/* Header / branding bar */}
                <header className="cv-header">
                    <div className="cv-brand">
                        <div className="cv-logo-circle">
                            <span className="cv-logo-mark">OC</span>
                        </div>
                        <div>
                            <div className="cv-brand-title">Smart Consultation Portal</div>
                            <div className="cv-brand-subtitle">
                                Secure human consultation, enhanced by AI triage.
                            </div>
                        </div>
                    </div>

                    {/* Stepper */}
                    <div className="cv-stepper">
                        <Step
                            index={1}
                            label="Describe issue"
                            active={currentStep === 1}
                            done={currentStep > 1}
                        />
                        <Step
                            index={2}
                            label="Triage & checklist"
                            active={currentStep === 2}
                            done={currentStep > 2}
                        />
                        <Step
                            index={3}
                            label="Book consultation"
                            active={currentStep === 3}
                            done={false}
                        />
                    </div>
                </header>

                <div className="cv-main">
                    {/* LEFT: FORM */}
                    <section className="cv-card cv-card-form">
                        <div className="cv-card-header">
                            <div>
                                <h2>Submit an issue</h2>
                                <p>
                                    Tell us what is happening. We will detect urgency and route
                                    you to either{" "}
                                    <span className="cv-chip cv-chip-critical">
                    Critical Path
                  </span>{" "}
                                    or{" "}
                                    <span className="cv-chip cv-chip-normal">Normal Path</span>.
                                </p>
                            </div>
                            {form.isUrgent && (
                                <span className="cv-urgency-badge">
                  Marked as urgent by customer
                </span>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="cv-form-fields">
                            <div className="cv-field-group">
                                <label className="cv-label">
                                    Name
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        className="cv-input"
                                    />
                                </label>

                                <label className="cv-label">
                                    Contact (email or phone)
                                    <input
                                        name="contact"
                                        value={form.contact}
                                        onChange={handleChange}
                                        placeholder="We’ll use this to send your summary"
                                        className="cv-input"
                                    />
                                </label>
                            </div>

                            <label className="cv-label">
                                Issue type
                                <select
                                    name="issueType"
                                    value={form.issueType}
                                    onChange={handleChange}
                                    className="cv-input"
                                >
                                    <option>Lost card</option>
                                    <option>Stolen card</option>
                                    <option>Money missing</option>
                                    <option>Unauthorized / fraud transaction</option>
                                    <option>Account locked</option>
                                    <option>Digital banking issue</option>
                                    <option>Others</option>
                                </select>
                            </label>

                            <label className="cv-label">
                                Describe your issue
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Example: I received a message claiming to be from the bank asking for my OTP..."
                                    rows={5}
                                    className="cv-textarea"
                                />
                            </label>

                            <label className="cv-checkbox-row">
                                <input
                                    type="checkbox"
                                    name="isUrgent"
                                    checked={form.isUrgent}
                                    onChange={handleChange}
                                />
                                <span>
                  This is urgent (money at risk / cannot access my account)
                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className={
                                    "cv-button-primary" + (loading ? " cv-button-loading" : "")
                                }
                            >
                                {loading ? "Submitting..." : "Submit issue"}
                            </button>

                            <p className="cv-disclaimer">
                                This is a prototype demo. For real emergencies, please contact
                                the official OCBC hotline immediately.
                            </p>
                        </form>
                    </section>

                    {/* RIGHT: RESULT / CHECKLIST / BOOKING */}
                    <section className="cv-right-column">
                        {/* Routing result */}
                        {result && (
                            <div className="cv-card cv-card-result cv-animate-in-delayed">
                                <h3>Routing result</h3>
                                <div className="cv-result-row">
                                    <span className="cv-result-label">Path</span>
                                    <span
                                        className={
                                            "cv-chip " +
                                            (result.queueInfo.path === "critical"
                                                ? "cv-chip-critical"
                                                : "cv-chip-normal")
                                        }
                                    >
                    {result.queueInfo.path === "critical"
                        ? "Critical Path (Urgent)"
                        : "Normal Path (1-hour consultation)"}
                  </span>
                                </div>

                                <div className="cv-result-row">
                                    <span className="cv-result-label">Risk level</span>
                                    <span className="cv-result-value">
                    {result.issue.riskLevel}
                  </span>
                                </div>

                                {queueStatus && (
                                    <div className="cv-result-row">
                                        <span className="cv-result-label">Queue position</span>
                                        <span className="cv-result-value">
                      {queueStatus.position != null
                          ? "#" + queueStatus.position
                          : "Calculating..."}
                    </span>
                                    </div>
                                )}

                                <p className="cv-result-message">
                                    {result.queueInfo.message}
                                </p>
                            </div>
                        )}

                        {/* Pre-diagnosis */}
                        {result && (
                            <div className="cv-card cv-animate-in-delayed">
                                <h3>Pre-diagnosis checklist</h3>
                                <p className="cv-card-subtitle">
                                    Prepare these before your consultation so we can help you
                                    faster.
                                </p>

                                <h4 className="cv-subheading">Steps to prepare</h4>
                                <ul className="cv-list">
                                    {result.preDiagnosis.checklist.map(function (
                                        item,
                                        idx
                                    ) {
                                        return (
                                            <li key={idx} className="cv-list-item">
                                                {item}
                                            </li>
                                        );
                                    })}
                                </ul>

                                <h4 className="cv-subheading">Documents / evidence</h4>
                                <ul className="cv-list">
                                    {result.preDiagnosis.docsNeeded.map(function (item, idx) {
                                        return (
                                            <li key={idx} className="cv-list-item">
                                                {item}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {/* Booking section only for Normal Path */}
                        {result && result.queueInfo.path === "normal" && (
                            <div className="cv-card cv-card-booking cv-animate-in-delayed">
                                <h3>Book your 1-hour consultation</h3>
                                <p className="cv-card-subtitle">
                                    Choose a 1-hour window. The exact start time may adjust
                                    slightly based on live queue, just like a clinic or ICA
                                    appointment.
                                </p>

                                <label className="cv-label">
                                    Choose a date
                                    <input
                                        type="date"
                                        value={bookingDate}
                                        onChange={function (e) {
                                            setBookingDate(e.target.value);
                                        }}
                                        className="cv-input"
                                    />
                                </label>

                                <label className="cv-label">
                                    Choose a time slot
                                    <select
                                        value={bookingSlot}
                                        onChange={function (e) {
                                            setBookingSlot(e.target.value);
                                        }}
                                        className="cv-input"
                                    >
                                        <option value="">Select a slot</option>
                                        {slots.map(function (slot) {
                                            return (
                                                <option key={slot} value={slot}>
                                                    {slot}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </label>

                                <button
                                    type="button"
                                    onClick={confirmBooking}
                                    className={
                                        "cv-button-primary cv-button-outline " +
                                        (bookingSaved ? "cv-button-success" : "")
                                    }
                                >
                                    {bookingSaved
                                        ? "Booking confirmed ✓"
                                        : "Confirm booking"}
                                </button>

                                {bookingSaved && (
                                    <p className="cv-success-message">
                                        Your booking details have been locked in. A confirmation
                                        and consultation summary will be sent after the session.
                                    </p>
                                )}
                            </div>
                        )}

                        {!result && (
                            <div className="cv-card cv-placeholder-card">
                                <h3>What you’ll see here</h3>
                                <ul className="cv-list">
                                    <li className="cv-list-item">
                                        Whether your case is routed to{" "}
                                        <span className="cv-chip cv-chip-critical">
                      Critical Path
                    </span>{" "}
                                        or{" "}
                                        <span className="cv-chip cv-chip-normal">
                      Normal Path
                    </span>
                                        .
                                    </li>
                                    <li className="cv-list-item">
                                        A personalised preparation checklist and required
                                        documents.
                                    </li>
                                    <li className="cv-list-item">
                                        For Normal Path, a simple booking panel for your 1-hour
                                        consultation block.
                                    </li>
                                </ul>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

// Small step component for the header stepper
function Step(props) {
    const isActive = props.active;
    const isDone = props.done;
    const baseClass = "cv-step";
    const activeClass = isActive ? " cv-step--active" : "";
    const doneClass = isDone ? " cv-step--done" : "";

    return (
        <div className={baseClass + activeClass + doneClass}>
            <div className="cv-step-circle">{props.index}</div>
            <div className="cv-step-label">{props.label}</div>
        </div>
    );
}

export default CustomerView;
