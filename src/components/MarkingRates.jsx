import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance"; // Assuming axiosInstance is set up for API calls
import "./MarkingRates.css"; // Ensure this file exists for styling
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles

const MarkingRatesForm = () => {
  const [markingTypes, setMarkingTypes] = useState([]);
  const [markingActivities, setMarkingActivities] = useState([]);
  const [rateTypes, setRateTypes] = useState({});
  const [rates, setRates] = useState([{ type: "", activity: "", rateType: "", rate: "" }]);
  const [activeTab, setActiveTab] = useState("addNew");
  const [existingRates, setExistingRates] = useState([]);
  const [hasAddedRate, setHasAddedRate] = useState(false);

  useEffect(() => {
    fetchMarkingTypes();
    fetchMarkingActivities();
    fetchExistingRates();
  }, []);

  const fetchMarkingTypes = async () => {
    try {
      const response = await axiosInstance.get("/marking-data/marking-types");
      setMarkingTypes(response.data);
    } catch (error) {
      console.error("Error fetching marking types:", error);
    }
  };

  const fetchMarkingActivities = async () => {
    try {
      const response = await axiosInstance.get("/marking-data/marking-activities");
      setMarkingActivities(response.data);
    } catch (error) {
      console.error("Error fetching marking activities:", error);
    }
  };

  const fetchRateTypes = async (markingTypeId) => {
    if (!markingTypeId) return;
    try {
      const response = await axiosInstance.get(`/marking-data/marking-type/${markingTypeId}/rate-types`);
      setRateTypes((prev) => ({ ...prev, [markingTypeId]: response.data }));
    } catch (error) {
      console.error("Error fetching rate types:", error);
    }
  };

  const fetchExistingRates = async () => {
    try {
      const response = await axiosInstance.get("/marking-rates/all");
      setExistingRates(response.data);
    } catch (error) {
      console.error("Error fetching existing rates:", error);
    }
  };

  const handleSave = () => {
    // Ensure all the fields are filled correctly
    const allFieldsValid = rates.every(rate => rate.type && rate.activity && rate.rateType && rate.rate);
    if (!allFieldsValid) {
      console.error("All fields must be filled correctly.");
      return;
    }

    const payload = rates.map(rate => ({
      markingType: { markingTypeId: rate.type },
      markingActivity: { id: rate.activity },
      markingRateType: { id: rate.rateType },
      rate: rate.rate,
    }));

    axiosInstance.post("/marking-rates/save", payload)
      .then(response => {
        console.log("Successfully saved:", response.data);
        toast.success("Marking rates saved successfully!");  // Show success toast
      })
      .catch(error => {
        console.error("Error saving rates:", error.response ? error.response.data : error.message);
        toast.error("Failed to save marking rates.");  // Show error toast if there's an issue 
      });
  };

  const handleAddMore = () => {
    setRates([...rates, { type: "", activity: "", rateType: "", rate: "" }]);
    setHasAddedRate(true);
  };

  const handleChange = async (index, field, value) => {
    const updatedRates = rates.map((rate, i) =>
      i === index ? { ...rate, [field]: value } : rate
    );
    setRates(updatedRates);

    // Fetch rate types if the "type" field changes
    if (field === "type") {
      await fetchRateTypes(value);
    }
  };

  const handleCancel = (index) => {
    const updatedRates = rates.filter((_, i) => i !== index);
    setRates(updatedRates);

    // Reset 'hasAddedRate' if all additional entries are removed
    if (updatedRates.length <= 1) {
      setHasAddedRate(false);
    }
  };

  return (
    <div className="container">
      <h2>Managing Marking Rates</h2>

      <div className="tab-container">
        <button
          className={`tab ${activeTab === "addNew" ? "active" : ""}`}
          onClick={() => setActiveTab("addNew")}
        >
          Add New Marking Rates
        </button>
        <button
          className={`tab ${activeTab === "showExisting" ? "active" : ""}`}
          onClick={() => setActiveTab("showExisting")}
        >
          Show Existing Marking Rates
        </button>
      </div>

      {activeTab === "addNew" && (
        <div className="addNewRates">
          <h3>Add New Marking Rates</h3>

          {rates.map((rate, index) => (
            <div key={index} className="form-container">
              <div className="form-row">
                <label>Type:</label>
                <select value={rate.type} onChange={(e) => handleChange(index, "type", e.target.value)}>
                  <option value="">Select Type</option>
                  {markingTypes.map((type) => (
                    <option key={type.markingTypeId} value={type.markingTypeId}>
                      {type.typeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>Activity:</label>
                <select value={rate.activity} onChange={(e) => handleChange(index, "activity", e.target.value)}>
                  <option value="">Select Activity</option>
                  {markingActivities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.activityName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>Rate Type:</label>
                <select value={rate.rateType} onChange={(e) => handleChange(index, "rateType", e.target.value)}>
                  <option value="">Select Rate</option>
                  {(rateTypes[rate.type] || []).map((rateType) => (
                    <option key={rateType.id} value={rateType.id}>
                      {rateType.rateTypeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>Rate:</label>
                <div className="rate-input-container">
                  <span className="currency">Rs.</span>
                  <input
                    type="number"
                    value={rate.rate}
                    onChange={(e) => handleChange(index, "rate", e.target.value)}
                    placeholder="Enter rate"
                  />
                </div>
              </div>

              {hasAddedRate && index > 0 && (
                <div className="button-container">
                  <button className="cancel-button" onClick={() => handleCancel(index)}>Cancel</button>
                </div>
              )}
            </div>
          ))}

          <div className="button-container">
            <button className="addMoreButton" onClick={handleAddMore}>Add Another Rate</button>
            <button className="save-button" onClick={handleSave}>Save</button>
          </div>
        </div>
      )}

      {activeTab === "showExisting" && (
        <div className="existingRates">
          <h3>Show Existing Marking Rates</h3>

          {existingRates.length > 0 ? (
            <table className="rates-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Activity</th>
                  <th>Rate Type</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
            {existingRates
              .sort((a, b) => {
                if (a.markingType?.typeName < b.markingType?.typeName) {
                  return -1;
                }
                if (a.markingType?.typeName > b.markingType?.typeName) {
                  return 1;
                }
                return 0;
              })
              .map((rate, index) => (
                <tr key={index}>
                  <td>{rate.markingType?.typeName}</td> {/* Accessing markingType.typeName */}
                  <td>{rate.markingActivity?.activityName}</td> {/* Accessing markingActivity.activityName */}
                  <td>{rate.markingRateType?.rateTypeName}</td> {/* Accessing markingRateType.rateTypeName */}
                  <td>Rs. {rate.rate}</td> {/* Accessing rate directly */}
                </tr>
              ))}
          </tbody>


            </table>
          ) : (
            <p>No rates available.</p>
          )}
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default MarkingRatesForm;







