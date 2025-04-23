import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const PayeeFormPage = () => {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [payeeFormData, setPayeeFormData] = useState(null);
  const [officialAddress, setOfficialAddress] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [totalFeeClaimed, setTotalFeeClaimed] = useState("");
  const [signatureFile, setSignatureFile] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  // New: workload activities
  const [workloadActivities, setWorkloadActivities] = useState([]);
  const [selectedActivityIds, setSelectedActivityIds] = useState([]);

  // Fetch Payee Form by reference number
  useEffect(() => {
    if (referenceNumber) {
      axiosInstance
        .get(`/payee-form/prepare/${referenceNumber}`)
        .then((res) => {
          setPayeeFormData(res.data);
  
          // Check if already submitted
          if (res.data.alreadySubmitted) {
            setSubmissionStatus({
              success: false,
              message:
                "A Payee Form has already been submitted for this reference number.",
            });
          } else {
            setSubmissionStatus(null); // Clear if not already submitted
          }
        })
        .catch((err) => {
          console.error("Fetch payee form error:", err);
          setSubmissionStatus({
            success: false,
            message: "Could not retrieve form data.",
          });
        });
    }
  }, [referenceNumber]);
  

  // Fetch workload activities from backend
  useEffect(() => {
    axiosInstance
      .get("/payee-form/workload-activities")
      .then((res) => setWorkloadActivities(res.data))
      .catch((err) => console.error("Fetch workload activities error:", err));
  }, []);

  const handleActivityChange = (activityId) => {
    setSelectedActivityIds((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("referenceNumber", referenceNumber);
    formData.append("officialAddress", officialAddress);
    formData.append("totalHours", totalHours);
    formData.append("totalFeeClaimed", totalFeeClaimed);
    formData.append("signatureFile", signatureFile);

    // Add each selected activity ID
    selectedActivityIds.forEach((id) => {
      formData.append("workloadActivityIds", id);
    });

    axiosInstance
      .post("/payee-form/submit", formData)
      .then((res) =>
        setSubmissionStatus({ success: true, message: "Form submitted!" })
      )
      .catch((err) => {
        setSubmissionStatus({ success: false, message: "Submit failed." });
        console.error("Submit error:", err);
      });
  };

  return (
    <div className="payee-form-page">
      <h2>Payee Form</h2>

      {submissionStatus?.message && (
        <div
          className={`font-medium mb-4 ${
            submissionStatus.success ? "text-green-600" : "text-red-500"
          }`}
        >
          {submissionStatus.message}
        </div>
      )}

      {payeeFormData && !payeeFormData.alreadySubmitted && (
        <form onSubmit={handleSubmit}>
          {/* form fields go here (you already have these) */}
        </form>
      )}

      <div>
        <label>Reference Number:</label>
        <input
          type="text"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          placeholder="Enter Reference Number"
        />
      </div>

      {payeeFormData && (
        <form onSubmit={handleSubmit}>
          {/* Visiting Lecturer Info */}
          <div>
            <h3>Visiting Lecturer Details</h3>
            <p><strong>Name:</strong> {payeeFormData.fullName}</p>
            <p><strong>Appointment Date:</strong> {payeeFormData.appointmentDate}</p>
            <p><strong>Course Code:</strong> {payeeFormData.courseCode}</p>
            <p><strong>Program:</strong> {payeeFormData.programName}</p>
            <p><strong>Private Address:</strong> {payeeFormData.privateAddress}</p>
          </div>

          {/* Inputs */}
          <div>
            <label>Official Address:</label>
            <input
              type="text"
              value={officialAddress}
              onChange={(e) => setOfficialAddress(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Total Hours:</label>
            <input
              type="number"
              value={totalHours}
              onChange={(e) => setTotalHours(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Total Fee Claimed:</label>
            <input
              type="number"
              value={totalFeeClaimed}
              onChange={(e) => setTotalFeeClaimed(e.target.value)}
              required
            />
          </div>

          {/* Workload Activities (Checkboxes) */}
          <div>
            <label>Workload Activities:</label>
            {workloadActivities.map((activity) => (
              <div key={activity.id}>
                <label>
                  <input
                    type="checkbox"
                    value={activity.id}
                    checked={selectedActivityIds.includes(activity.id)}
                    onChange={() => handleActivityChange(activity.id)}
                  />
                  {activity.activityName}
                </label>
              </div>
            ))}
          </div>

          {/* Signature Upload */}
          <div>
            <label>Upload Signature:</label>
            <input
              type="file"
              onChange={(e) => setSignatureFile(e.target.files[0])}
            />
          </div>

          <button type="submit">Submit Payee Form</button>
        </form>
      )}



    </div>
  );
};

export default PayeeFormPage;


