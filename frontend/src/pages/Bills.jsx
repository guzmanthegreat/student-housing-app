import { useEffect, useState } from "react";
import "./Bills.css";

const ICON_URL =
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/receipt.svg";

export default function BillsPage({ roomNum }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [bills, setBills] = useState([]);

  const ROOM = roomNum;

  // Split modal state
  const [splitOpen, setSplitOpen] = useState(false);
  const [billToSplit, setBillToSplit] = useState(null);
  const [numPeople, setNumPeople] = useState("");
  const [perPerson, setPerPerson] = useState(null);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadError(""); 
  };

  // Load receipts from DB
  useEffect(() => {
    (async () => {
      try {
        console.log("room number: ", ROOM);
        const res = await fetch(`http://localhost:3000/receipt/${ROOM}`);
        if (!res.ok) throw new Error("Failed to load receipts");
        const data = await res.json();
        setBills(data.receipts || []);
      } catch (err) {
        console.error("Error loading receipts:", err);
      }
    })();
  }, [ROOM]);

  // Upload new receipt
  const handleUpload = async () => {
    if (!selectedFile)
    {
      setUploadError("Please select a file first");
      return;
    }
    setUploadError("")
    const formData = new FormData();
    formData.append("receipt", selectedFile);

    try {
      const res = await fetch("http://localhost:3000/api/receipts/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const receipt = data?.data || data;

      const total = Number(receipt?.total || 0);
      const title = receipt?.vendor?.name || "Untitled";

      // Save to DB
      const save = await fetch("http://localhost:3000/receipt/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_num: ROOM,
          name: title,
          total: total.toFixed(2),
        }),
      });

      if (!save.ok) throw new Error("Failed to save receipt to DB");
      const saved = await save.json();

      // Update list
      setBills((prev) => [
        { id: saved.id, name: title, total },
        ...prev,
      ]);

      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console.");
    }
  };

  // Open split modal for a specific bill
  const openSplitModal = (bill) => {
    setBillToSplit(bill);
    setNumPeople("");
    setPerPerson(null);
    setError("");
    setSplitOpen(true);
  };

  const closeSplitModal = () => {
    setSplitOpen(false);
    setBillToSplit(null);
    setNumPeople("");
    setPerPerson(null);
    setError("");
  };

  const handleCalculateSplit = () => {
    const n = Number(numPeople);

    if (!n || n <= 0) {
      setError("Enter a number of people greater than 0.");
      setPerPerson(null);
      return;
    }

    if (!billToSplit) return;

    const total = Number(billToSplit.total);
    const share = total / n;

    setPerPerson(share);
    setError("");
  };

  return (
    <div className="bills-page">
      <h1 className="page-title">Bills / Receipts</h1>

      <div>
        {uploadError && <p className="upload-error">{uploadError}</p>}
      </div>

      <div className="upload-container">
        <input
          type="file"
          accept="image/*"
          id="fileInput"
          onChange={handleFileChange}
        />
        <button className="upload-button" onClick={handleUpload}>
          Upload Receipt
        </button>
      </div>

      {bills.length === 0 ? (
        <p className="no-bills">No receipts uploaded yet</p>
      ) : (
        <div className="bills-list">
          {bills.map((bill) => (
            <div className="bill-card" key={bill.id}>
              <img
                src={ICON_URL}
                alt="Receipt icon"
                className="receipt-icon"
                onClick={() => openSplitModal(bill)}
                style={{ cursor: "pointer" }}
              />
              <div className="bill-info">
                <p className="bill-title">{bill.name}</p>
                <p className="bill-total">
                  <strong>${Number(bill.total).toFixed(2)}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Split Bill Modal */}
      {splitOpen && billToSplit && (
        <div className="split-overlay">
          <div className="split-modal">
            <button className="split-close" onClick={closeSplitModal}>×</button>
            <h2>Split Bill</h2>
            <p className="split-bill-name">{billToSplit.name}</p>
            <p className="split-total">
              Total: <strong>${Number(billToSplit.total).toFixed(2)}</strong>
            </p>

            <label className="split-label">
              Number of people:
              <input
                type="number"
                min="1"
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
                className="split-input"
              />
            </label>

            <button className="split-button" onClick={handleCalculateSplit}>
              Calculate
            </button>

            {error && <p className="split-error">{error}</p>}

            {perPerson != null && !error && (
              <p className="split-result">
                Each person pays:{" "} ${perPerson.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
