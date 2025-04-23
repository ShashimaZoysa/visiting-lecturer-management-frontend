import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PaymentDetailForm = () => {
  const [formData, setFormData] = useState({
    nicFullName: '',
    bankName: '',
    branchName: '',
    branchCode: '',
    accountNumber: '',
  });

  const [originalData, setOriginalData] = useState(null); // for cancel
  const [isEditable, setIsEditable] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get('/payment-details')
      .then((response) => {
        if (response.data) {
          const data = {
            nicFullName: response.data.nicFullName || '',
            bankName: response.data.bankName || '',
            branchName: response.data.branchName || '',
            branchCode: response.data.branchCode || '',
            accountNumber: response.data.accountNumber || '',
          };
          setFormData(data);
          setOriginalData(data);
          setIsExisting(true);
          setIsEditable(false);
        }
      })
      .catch((error) => {
        console.log('No existing data:', error);
        setIsEditable(true); // new user can edit
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isExisting) {
        await axiosInstance.put('/payment-details', formData);
        toast.success('Details updated successfully');
      } else {
        await axiosInstance.post('/payment-details', formData);
        toast.success('Details saved successfully');
        setIsExisting(true);
      }

      setOriginalData(formData); // update stored version
      setIsEditable(false);
    } catch (error) {
      console.error('Error submitting details:', error);
      toast.error('Something went wrong');
    }
  };

  const handleUpdateClick = () => {
    setIsEditable(true);
  };

  const handleCancelClick = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setIsEditable(false);
    toast.info('Edits cancelled');
  };

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <ToastContainer />
      <h2 className="text-xl font-semibold mb-4">Bank Payment Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: 'Full Name (NIC)', name: 'nicFullName' },
          { label: 'Bank Name', name: 'bankName' },
          { label: 'Branch Name', name: 'branchName' },
          { label: 'Branch Code', name: 'branchCode' },
          { label: 'Account Number', name: 'accountNumber' },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium">{field.label}</label>
            <input
              type="text"
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              required
              disabled={!isEditable}
              className={`w-full border px-3 py-2 rounded ${
                !isEditable ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>
        ))}

        <div className="flex justify-end gap-3">
          {isExisting && !isEditable && (
            <button
              type="button"
              onClick={handleUpdateClick}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Update
            </button>
          )}

          {isEditable && (
            <>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {isExisting ? 'Save Changes' : 'Save'}
              </button>
              {isExisting && (
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default PaymentDetailForm;





