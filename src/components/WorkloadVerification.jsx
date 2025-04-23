import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import "./WorkloadVerification.css";

export default function LecturerSearch() {
  const [nic, setNic] = useState("");
  const [lecturer, setLecturer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReferenceNumber, setSelectedReferenceNumber] = useState("");
  const [numGroups, setNumGroups] = useState(0);
  const [groupNumbers, setGroupNumbers] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState(""); // Store activity ID
  const [activityNumber, setActivityNumber] = useState("");
  const [activities, setActivities] = useState([]); // Store list of activities
  const [hours, setHours] = useState("");
  //const [workloadChecklist, setWorkloadChecklist] = useState([]);
  const [detailedChecklist, setDetailedChecklist] = useState([]);
  const [selectedChecklistReferenceNumber, setSelectedChecklistReferenceNumber] = useState("");



  // Fetch lecturer data based on NIC
  const fetchLecturerData = async () => {
    if (!nic.trim()) {
      setError("Please enter a NIC number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/visiting-lecturers/${nic}`);
      setLecturer(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Lecturer not found.");
      setLecturer(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available activities from backend
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axiosInstance.get("/workloads/activities");
        console.log("Activities response:", response.data); // 👉 Check what’s coming back
        setActivities(response.data);
      } catch (err) {
        console.error("Activity fetch error:", err); // Log the error
        setError("Failed to fetch activities.");
      }
    };
  
    fetchActivities();
  }, []);

  const handleNumGroupsChange = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    setNumGroups(value);
    setGroupNumbers(Array.from({ length: value }, () => "")); // initialize with empty strings
  };

  const handleGroupNumberChange = (index, value) => {
    const updatedGroups = [...groupNumbers];
    updatedGroups[index] = value;
    setGroupNumbers(updatedGroups);
  };  
  
  const handleAddWorkload = async () => {
    if (
      !selectedReferenceNumber ||
      !selectedActivityId ||
      !activityNumber ||
      !hours ||
      numGroups < 1
    ) {
      setError("Please fill in all fields before adding workload.");
      return;
    }
    

    const newWorkloadPayload = {
      numberOfGroups: numGroups,
      groupNumbers: groupNumbers.map((num) => num.trim()),
      activityId: selectedActivityId, // Use activity ID
      activityNumber: parseInt(activityNumber, 10),
      workloadHours: parseInt(hours, 10),
      referenceNumber: selectedReferenceNumber, // Using reference number here
    };

    try {
      const response = await axiosInstance.post("/workloads/enter", newWorkloadPayload);
      console.log(response.data);
      alert("Workload entered successfully!");

      // Optional: Update checklist
      //setWorkloadChecklist([...workloadChecklist, {
      //  referenceNumber: selectedReferenceNumber,
      //  activity: activities.find((activity) => activity.id === selectedActivityId)?.name, // Get activity name by ID
      //  hours,
     //   numGroups,
      //  groupDetails: newWorkloadPayload.groupNumbers,
     // }]);

      // Reset form fields
      //setSelectedReferenceNumber("");  
      //setNumGroups(0);
      //setGroupNumbers([]);
      setSelectedActivityId("");  // Reset activity ID
      setHours("");
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to submit workload: " + (err.response?.data || err.message));
    }
  };
  useEffect(() => {
    const fetchChecklist = async () => {
      if (!selectedChecklistReferenceNumber) return;
  
      try {
        const response = await axiosInstance.get(`/workloads/checklist?referenceNumber=${selectedChecklistReferenceNumber}`);
        setDetailedChecklist(response.data);
      } catch (err) {
        console.error("Error fetching checklist:", err);
        setError("Failed to load workload checklist.");
        setDetailedChecklist([]);
      }
    };
  
    fetchChecklist();
  }, [selectedChecklistReferenceNumber]);

  const handleVerificationToggle = async (groupIdx, entryIdx) => {
    const updatedChecklist = [...detailedChecklist];
    const entry = updatedChecklist[groupIdx].workloadEntries[entryIdx];

    console.log("Clicked entry:", entry); // DEBUG LOG

    const workloadId = entry.workloadId; // ✅ Correctly mapped

    if (!workloadId) {
        console.error("Workload ID is missing.");
        alert("Workload ID is missing. Cannot verify this entry.");
        return;
    }

    // Toggle the verification status
    const newStatus = entry.status === "VERIFIED" ? "NOT_VERIFIED" : "VERIFIED";
    entry.status = newStatus; // Update the status
    entry.verifiedBy = ""; // Will be set by backend after successful verification

    setDetailedChecklist(updatedChecklist);  // Optimistic UI update

    try {
        // Send the updated verification status to the backend
        await axiosInstance.post(`/workloads/verify/${workloadId}`, null, {
            params: { status: newStatus },
        });

        alert("Workload verification successful!");
    } catch (err) {
        console.error("Verification error:", err);
        alert("Failed to verify workload: " + (err.response?.data || err.message));
    }
};

const handleDeleteWorkload = async (groupIdx, entryIdx) => {
  const updatedChecklist = [...detailedChecklist];
  const entry = updatedChecklist[groupIdx].workloadEntries[entryIdx];

  console.log("Deleting workload entry:", entry); // DEBUG LOG

  const workloadId = entry.workloadId;

  if (!workloadId) {
      console.error("Workload ID is missing.");
      alert("Workload ID is missing. Cannot delete this entry.");
      return;
  }

  try {
      // Send the delete request to the backend
      await axiosInstance.delete(`/workloads/delete/${workloadId}`);

      // Remove the workload entry from the checklist
      updatedChecklist[groupIdx].workloadEntries.splice(entryIdx, 1);
      setDetailedChecklist(updatedChecklist);

      // Success feedback
      alert("Workload deleted and verification updated successfully.");
  } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete workload: " + (err.response?.data || err.message));
  }
};



  
  
  
  
  

  return (
    <div className="search-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search lecturer by NIC"
          value={nic}
          onChange={(e) => setNic(e.target.value)}
          className="search-input"
        />
        <button className="search-button" onClick={fetchLecturerData}>
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {lecturer && (
        <div className="lecturer-details-container">
          <div className="lecturer-details">
            <h3>Lecturer Details</h3>
            <p><strong>NIC:</strong> {lecturer.nicNumber}</p>
            <p><strong>Full Name:</strong> {lecturer.fullName}</p>

            <h4>Assigned Reference Numbers</h4>
            <ul>
              {lecturer.courses
                .filter(course => course.serviceType === "External Online Tutor")
                .map((course, index) => (
                  <li key={index}>
                    <strong>Reference Number:</strong> {course.referenceNumber} <br />
                    <strong>Course Code:</strong> {course.courseCode} <br />
                    <strong>Service Type:</strong> {course.serviceType}
                  </li>
                ))}
            </ul>
          </div>

          {/* Workload Entry */}
          <div className="workload-entry">
            <h3>Workload Entry</h3>

            <div className="workload-field">
              <label>Reference Number</label>
              <select
                className="input-field"
                value={selectedReferenceNumber}
                onChange={(e) => setSelectedReferenceNumber(e.target.value)}
              >
                <option value="">Select a reference number</option>
                {lecturer.courses
                  .filter(course => course.serviceType === "External Online Tutor")
                  .map((course) => (
                    <option key={course.referenceNumber} value={course.referenceNumber}>
                      {course.referenceNumber}
                    </option>
                  ))}
              </select>
            </div>

            <div className="workload-field">
              <label>Number of Groups</label>
              <input
                type="number"
                className="input-field"
                value={numGroups}
                onChange={handleNumGroupsChange}
                min="1"
              />
            </div>

            {groupNumbers.map((value, index) => (
            <div className="workload-field" key={index}>
              <label>Group {index + 1}</label>
              <input
                type="text"
                className="input-field"
                value={value}
                onChange={(e) => handleGroupNumberChange(index, e.target.value)}
                placeholder={`Enter Group Name (e.g., A1, B2)`}
              />
            </div>
          ))}


            <div className="workload-field">
              <label>Activity</label>
              <select
                className="input-field"
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
              >
                <option value="">Select Activity</option>
                {activities.map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.activityName}
                  </option>
                ))}

              </select>
            </div>

            <div className="workload-field">
              <label>Activity Number</label>
              <input
                type="number"
                className="input-field"
                value={activityNumber}
                onChange={(e) => setActivityNumber(e.target.value)}
                min="1"
              />
            </div>


            <div className="workload-field">
              <label>Hours</label>
              <input
                type="number"
                className="input-field"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                min="1"
              />
            </div>

            <button className="add-button" onClick={handleAddWorkload}>
              Add
            </button>
          </div>

          <h3>Workload Checklist:</h3>
          <div className="workload-checklist-field">
            <label>Checklist Reference Number</label>
            <select
              className="input-field"
              value={selectedChecklistReferenceNumber}
              onChange={(e) => setSelectedChecklistReferenceNumber(e.target.value)}
            >
              <option value="">Select a checklist reference number</option>
              {lecturer.courses
                .filter(course => course.serviceType === "External Online Tutor")
                .map((course) => (
                  <option key={course.referenceNumber} value={course.referenceNumber}>
                    {course.referenceNumber}
                  </option>
                ))}
            </select>
          </div>

          {detailedChecklist.length > 0 ? (
  detailedChecklist.map((group, groupIdx) => (
    <div key={groupIdx} className="checklist-group">
      <h3>{group.groupName}</h3>

      <table className="checklist-table">
        <thead>
          <tr>
            <th>Activity</th>
            <th>Hours</th>
            <th>Verification Status</th>
            <th>Verified By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {group.workloadEntries.map((entry, entryIdx) => (
            <tr key={`${groupIdx}-${entryIdx}`}>
              <td>{entry.activityName} {entry.activityNumber?.padStart(2, '0')}</td>
              <td>{entry.hours}</td>
              <td>
                {entry.status === "VERIFIED" ? "✅ Verified" : "❌ Not Verified"}
              </td>
              <td>{entry.verifiedBy || "—"}</td>
              <td>
  <div className="button-group">
    {/* Verify Button */}
    <button
      className={entry.status === "VERIFIED" ? "unverify-button" : "verify-button"}
      onClick={() => handleVerificationToggle(groupIdx, entryIdx)}
    >
      {entry.status === "VERIFIED" ? "🔄 Unverify" : "✅ Verify"}
    </button>

    {/* Delete Button */}
    <button
      className="delete-button"
      onClick={() => handleDeleteWorkload(groupIdx, entryIdx)}
    >
      🗑️ Delete
    </button>
  </div>
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ))
) : (
  <p>No workload checklist available.</p>
)}





        </div>
      )}
    </div>
  );
}









