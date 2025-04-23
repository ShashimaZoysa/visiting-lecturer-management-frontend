import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import "./LecturerInfo.css";

const LecturerInfo = () => {
  const [nic, setNic] = useState("");
  const [lecturer, setLecturer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [documentStatus, setDocumentStatus] = useState({});
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [payeeFormData, setPayeeFormData] = useState([]); 
  const [documentUploadDates, setDocumentUploadDates] = useState({});

  const documentTypes = [
    { id: 1, name: "CV" },
    { id: 2, name: "NIC Copy" },
    { id: 3, name: "Tax Declaration Form" },
    { id: 4, name: "Bank Book Copy" },
  ];

  const handleNicChange = (e) => {
    setNic(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLecturer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchLecturerProfile = async (nicNumber) => {
    setLoading(true);
    setError("");
    setEditMode(false);
    setDocumentStatus({});
    setAssignedCourses([]);
    setPayeeFormData([]);
    setDocumentUploadDates({});  

    try {
      // Fetch lecturer profile details
      const response = await axiosInstance.get(`/profile/${nicNumber}`);
      setLecturer(response.data);
      

// Check document statuses and fetch document upload dates
const statuses = {};
const uploadDates = {}; // New state for document upload dates
await Promise.all(
  documentTypes.map(async (doc) => {
    try {
      // Fetch document existence
      const res = await axiosInstance.get("/profile/document/check-existence", {
        params: { nic: nicNumber, documentTypeId: doc.id },
      });
      statuses[doc.id] = res.data === true;
      
      // Fetch document existence and upload date
      const uploadDateRes = await axiosInstance.get("/profile/document/check-existence-with-date", {
        params: { nic: nicNumber, documentTypeId: doc.id },  // No lecturerId is required here anymore
      });
      if (uploadDateRes.data.documentExists) {
        uploadDates[doc.id] = uploadDateRes.data.uploadDate;  // Store the upload date
      } else {
        uploadDates[doc.id] = null;  // If no document exists, set null
      }
    } catch (err) {
      statuses[doc.id] = false;
      uploadDates[doc.id] = null;  // Set null if an error occurs
    }
  })
);

setDocumentStatus(statuses);
setDocumentUploadDates(uploadDates);  // Update document upload dates

      // Fetch assigned courses for the lecturer
      const assignedCoursesResponse = await axiosInstance.get("/profile/assigned-courses", {
        params: { nic: nicNumber },  // Sending NIC as query parameter
      });
      setAssignedCourses(assignedCoursesResponse.data); // Set the assigned courses response data

      const payeeFormStatusResponse = await axiosInstance.get(`/profile/status/${nicNumber}`);
        setPayeeFormData(payeeFormStatusResponse.data);

    } catch (error) {
      setError("Failed to fetch profile. Please check the NIC or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nic) {
      fetchLecturerProfile(nic);
    }
  };

  const handleUpdate = async () => {
    try {
      await axiosInstance.put(`/profile/${lecturer.nicNumber}`, lecturer);
      alert("Profile updated successfully.");
      setEditMode(false);
    } catch (error) {
      alert("Failed to update profile.");
    }
  };

  const handleDueDateChange = (documentId, selectedDate) => {
    // Update the due date for the specific document
    setDocumentUploadDates((prevDates) => ({
      ...prevDates,
      [documentId]: selectedDate,
    }));
  };
  

  const isAdmin = lecturer?.role === "ROLE_ADMIN";
  const fieldsToShow = isAdmin
    ? ["fullName", "nicNumber", "email", "gender"]
    : ["fullName", "nicNumber", "email", "phoneNumber", "gender", "privateAddress"];

  return (
    <div className="lecturer-info-container">
      <div className="lecturer-info-header">
        <h2>Visiting Lecturer Profile - View Details</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <label htmlFor="nic">Enter NIC:</label>
        <input
          id="nic"
          type="text"
          value={nic}
          onChange={handleNicChange}
          className="border p-2 rounded w-full"
          placeholder="Enter NIC number"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700 transition"
        >
          Fetch Profile
        </button>
      </form>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      {lecturer && (
        <div className="lecturer-info">
          {fieldsToShow.map((field) => {
            const label = field === "nicNumber" ? "NIC" : field.replace(/([A-Z])/g, " $1");
            const value = lecturer[field];

            if (!editMode && (!value || value.trim() === "")) return null;

            return (
              <div key={field} className="mt-2">
                <span className="font-semibold">{label}:</span>{" "}
                {editMode ? (
                  <input
                    type="text"
                    name={field}
                    value={value || ""}
                    onChange={handleInputChange}
                    className="border p-1 rounded w-full mt-1"
                  />
                ) : (
                  value
                )}
              </div>
            );
          })}

          {!editMode && (
            <button className="edit-info-button mt-4" onClick={() => setEditMode(true)}>
              Edit Info
            </button>
          )}

          {editMode && (
            <div className="mt-4 flex gap-4">
              <button
                onClick={handleUpdate}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {lecturer?.role === "ROLE_VISITING_LECTURER" && (
        <>
          <div className="uploaded-documents mt-6">
            <h3 className="font-semibold text-lg mb-2">Uploaded Documents</h3>
            <div className="flex flex-col gap-2 pl-2">
              {documentTypes.map((doc) => (
                <div key={doc.id} className="document-item">
                  <span className="font-semibold">
                    {documentStatus[doc.id] ? "[✓]" : "[ ]"} {doc.name}:
                  </span>{" "}
                  {documentStatus[doc.id] ? (
                    <>
                      <a
                        href={`http://localhost:8080/api/profile/document/download?nic=${lecturer.nicNumber}&documentTypeId=${doc.id}&mode=view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 ml-2"
                      >
                        View
                      </a>{" "}
                      |{" "}
                      <a
                        href={`http://localhost:8080/api/profile/document/download?nic=${lecturer.nicNumber}&documentTypeId=${doc.id}&mode=download`}
                        className="text-blue-500 ml-2"
                      >
                        Download
                      </a>
                    </>
                  ) : (
                    <span className="text-gray-500 ml-2">Document not uploaded</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <h3 className="assigned-courses-title">Assigned Courses</h3>

          {assignedCourses.length > 0 ? (
            <table className="assigned-courses-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Reference Number</th>
                  <th>Type of Service</th>
                  <th>Academic Year</th>
                </tr>
              </thead>
              <tbody>
                {assignedCourses.map((course, index) => (
                  <tr key={index}>
                    <td>{course.courseCode}</td>
                    <td>{course.courseTitle}</td>
                    <td>{course.referenceNumber}</td>
                    <td>{course.typeOfService}</td>
                    <td>{course.academicYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600">No courses assigned.</p>
          )}

<div className="payee-form-section mt-6">
  <h3 className="font-semibold text-lg mb-2">Payee Forms</h3>

  {payeeFormData.length > 0 ? (
    payeeFormData.map((course, index) => (
      <div
        key={index}
        className="payee-form-item mb-4 p-4 border rounded bg-gray-50 shadow-md"
      >
        {/* Header with status */}
        <div className="flex items-center gap-2 font-semibold">
          <span className={course.payeeFormCompleted ? "text-green-600" : "text-red-600"}>
            {course.payeeFormCompleted ? "[✓]" : "[✗]"}
          </span>
          <span>
            Payee Form - {course.courseCode}: {course.courseTitle}
          </span>
        </div>

        {/* Academic Year */}
        <div className="mt-1 text-sm text-gray-800">
          Academic Year: {course.academicYear}
        </div>

        {/* Academic Year */}
        <div className="mt-1 text-sm text-gray-800">
          Reference Number: {course.referenceNumber}
        </div>

        {/* Submitted or not */}
        <div className="text-sm text-gray-800">
          {course.payeeFormCompleted ? (
            <>Submitted</>
          ) : (
            <>Not yet submitted</>
          )}
        </div>

        {/* Compact Download Button */}
        {course.payeeFormCompleted && (
          <div className="mt-1">
            <a
              href={`/api/payee-form/download/${course.referenceNumber}`} // Change this to your backend endpoint
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline"
              download
            >
              [Download PDF]
            </a>
          </div>
        )}

        <hr className="mt-4 border-gray-300" />
      </div>
    ))
  ) : (
    <p className="text-gray-600">No Payee Forms available.</p>
  )}
</div>


{/* Task Status Table */}
{/* Task Status Table */}
<div className="task-status-section mt-6">
  <h3 className="font-semibold text-lg mb-2">Task Status</h3>
  <table className="task-status-table">
    <thead>
      <tr>
        <th>Task</th>
        <th>Due Date / Info</th>
      </tr>
    </thead>
    <tbody>
      {documentTypes.map((doc) => (
        <tr key={doc.id}>
          <td>{`Upload ${doc.name}`}</td>
          <td>
            {documentStatus[doc.id] === true ? (
              // If the document exists
              documentUploadDates[doc.id] ? (
                // If there is an upload date
                `Completed on: ${documentUploadDates[doc.id]}`
              ) : (
                "Uploaded but no date available"
              )
            ) : (
              // If the document does not exist
              <>
                Due: 
                <input
                  type="date"
                  className="due-date-input"
                  onChange={(e) => handleDueDateChange(doc.id, e.target.value)}
                />
              </>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>







        </>
      )}
    </div>
  );
};

export default LecturerInfo;






















