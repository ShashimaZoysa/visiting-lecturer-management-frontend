import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

const TaxDeclarationUpload = ({ role }) => {
  const [template, setTemplate] = useState({
    file: null,
    url: "",
    exists: false,
    isEditing: false,
  });

  const [documents, setDocuments] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const documentTypes = [
    { id: 1, name: "CV" },
    { id: 2, name: "NIC Copy" },
    { id: 3, name: "Tax Declaration Form" },
    { id: 4, name: "Bank Book Copy" },
  ];

  useEffect(() => {
    fetchLatestTemplate();
    if (role === "ROLE_VISITING_LECTURER") {
      fetchUploadedDocuments();
    }
  }, []);

  const fetchLatestTemplate = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/tax-declaration-template/exists");
      const exists = res.data;

      setTemplate((prev) => ({
        ...prev,
        exists,
        url: exists
          ? "http://localhost:8080/api/tax-declaration-template/pdf/latest"
          : "",
      }));
    } catch (err) {
      console.error("Failed to fetch template:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadedDocuments = async () => {
    const updatedDocs = {};

    for (const doc of documentTypes) {
      try {
        const existsRes = await axiosInstance.get(
          `/visiting-lecturer/documents/exist?documentTypeId=${doc.id}`
        );

        updatedDocs[doc.id] = {
          exists: existsRes.data,
          isEditing: false,
          file: null,
          url: existsRes.data
            ? `http://localhost:8080/api/visiting-lecturer/documents/getDocument?documentTypeId=${doc.id}`
            : null,
        };
      } catch (err) {
        updatedDocs[doc.id] = {
          exists: false,
          isEditing: false,
          file: null,
          url: null,
        };
      }
    }

    setDocuments(updatedDocs);
  };

  const handleTemplateUpload = async (e) => {
    e.preventDefault();
    if (!template.file) return setMessage("Please select a file.");

    const formData = new FormData();
    formData.append("file", template.file);

    const endpoint = template.isEditing
      ? "/tax-declaration-template/edit"
      : "/tax-declaration-template/upload";

    try {
      setLoading(true);
      const method = template.isEditing ? "put" : "post";
      const res = await axiosInstance[method](endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data);
      setTemplate({ file: null, isEditing: false, url: "", exists: true });
      fetchLatestTemplate();
    } catch (err) {
      setMessage("Error: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e, docId) => {
    e.preventDefault();
    const doc = documents[docId];
    if (!doc?.file) return setMessage("Please select a file.");

    const formData = new FormData();
    formData.append("file", doc.file);
    formData.append("documentTypeId", docId);

    const endpoint = doc.isEditing
      ? "/visiting-lecturer/documents/edit"
      : "/visiting-lecturer/documents/upload";

    try {
      setLoading(true);
      const method = doc.isEditing ? "put" : "post";
      const res = await axiosInstance[method](endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data);
      fetchUploadedDocuments();
    } catch (err) {
      setMessage("Error: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateFileChange = (e) => {
    setTemplate((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleDocumentFileChange = (e, docId) => {
    setDocuments((prev) => ({
      ...prev,
      [docId]: { ...prev[docId], file: e.target.files[0] },
    }));
  };

  const toggleTemplateEdit = () =>
    setTemplate((prev) => ({ ...prev, isEditing: !prev.isEditing }));

  const toggleDocumentEdit = (docId) => {
    setDocuments((prev) => ({
      ...prev,
      [docId]: { ...prev[docId], isEditing: !prev[docId].isEditing },
    }));
  };

  return (
    <div className="upload-container">
      <h1>Upload Documents</h1>

      <section>
        <h2>Latest Tax Declaration Template</h2>
        {loading ? (
          <p>Loading...</p>
        ) : template.exists && template.url ? (
          <a href={template.url} target="_blank" rel="noreferrer">
            📄 View Tax Declaration Template
          </a>
        ) : (
          <p>No template available.</p>
        )}
      </section>

      {role === "ROLE_ADMIN" && (
        <section style={{ marginTop: "20px" }}>
          {!template.exists && (
            <form onSubmit={handleTemplateUpload}>
              <input type="file" onChange={handleTemplateFileChange} accept="application/pdf" />
              <button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Upload Template"}
              </button>
            </form>
          )}

          {template.exists && !template.isEditing && (
            <button onClick={toggleTemplateEdit}>Edit Template</button>
          )}

          {template.isEditing && (
            <form onSubmit={handleTemplateUpload}>
              <input type="file" onChange={handleTemplateFileChange} accept="application/pdf" />
              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}
        </section>
      )}

{role === "ROLE_VISITING_LECTURER" && (
  <section style={{ marginTop: "30px" }}>
    <h2>Upload Personal Documents</h2>
    {documentTypes.map((doc) => {
      const docData = documents[doc.id];
      return (
        <div key={doc.id} style={{ marginBottom: "25px" }}>
          <h3>{doc.name}</h3>

          {/* ✅ Show view link if document exists */}
          {docData?.exists && docData.url && (
            <a href={docData.url} download>
            ⬇️ Download Existing {doc.name}
          </a>
          
          )}

          {/* ✅ Show Upload form if not exists */}
          {!docData?.exists ? (
            <form onSubmit={(e) => handleDocumentUpload(e, doc.id)}>
              <input
                type="file"
                onChange={(e) => handleDocumentFileChange(e, doc.id)}
                accept="application/pdf"
              />
              <button type="submit" disabled={loading || !docData?.file}>
                {loading ? "Uploading..." : "Upload"}
              </button>
            </form>
          ) : !docData?.isEditing ? (
            // ✅ Show Edit button if document exists and not editing
            <button onClick={() => toggleDocumentEdit(doc.id)} disabled={loading}>
              Edit {doc.name}
            </button>
          ) : (
            // ✅ Show file input + Save if editing
            <form onSubmit={(e) => handleDocumentUpload(e, doc.id)}>
              <input
                type="file"
                onChange={(e) => handleDocumentFileChange(e, doc.id)}
                accept="application/pdf"
              />
              <button
                type="submit"
                disabled={loading || !docData?.file}
              >
                {loading ? "Uploading..." : "Save"}
              </button>
            </form>
          )}
        </div>
      );
    })}
  </section>
)}


      {message && (
        <p style={{ color: message.includes("Error") ? "red" : "green" }}>{message}</p>
      )}
    </div>
  );
};

export default TaxDeclarationUpload;































