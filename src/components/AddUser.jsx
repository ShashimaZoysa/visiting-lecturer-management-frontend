import React, { useState } from "react";
import axiosInstance from '../utils/axiosInstance';
import "./AddUser.css";

const AddUser = () => {
    const [role, setRole] = useState("");
    const [lecturerDetails, setLecturerDetails] = useState({
        fullName: "",
        gender: "",
        nicNumber: "",
        email: "",
        privateAddress: "",
        phoneNumber: "",
        qualifications: [{ title: "", level: "", university: "" }],
        presentEmployment: "",
        department: "",
        username: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        setLecturerDetails({
            ...lecturerDetails,
            qualifications: e.target.value === "ROLE_VISITING_LECTURER"
                ? [{ title: "", level: "", university: "" }]
                : [], // Clear qualifications for other roles
        });
        setErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLecturerDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const handleQualificationChange = (index, field, value) => {
        const updatedQualifications = [...lecturerDetails.qualifications];
        updatedQualifications[index][field] = value;
        setLecturerDetails((prevDetails) => ({
            ...prevDetails,
            qualifications: updatedQualifications,
        }));
    };

    const handleAddQualification = () => {
        setLecturerDetails((prevDetails) => ({
            ...prevDetails,
            qualifications: [...prevDetails.qualifications, { title: "", level: "", university: "" }],
        }));
    };

    const handleClearForm = () => {
        setLecturerDetails({
            fullName: "",
            gender: "",
            nicNumber: "",
            privateAddress: "",
            phoneNumber: "",
            email: "",
            qualifications: [{ title: "", level: "", university: "" }],
            presentEmployment: "",
            department: "",
            username: "",
            password: "",
        });
        setRole("");
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};
        if (!lecturerDetails.fullName.trim()) newErrors.fullName = "Full Name is required.";
        if (!lecturerDetails.gender) newErrors.gender = "Gender is required.";
        if (!lecturerDetails.nicNumber.trim()) newErrors.nicNumber = "NIC Number is required.";
        if (!lecturerDetails.email.trim()) newErrors.email = "Email is required.";
        if (!lecturerDetails.username.trim()) newErrors.username = "Username is required.";
        if (!lecturerDetails.password.trim()) newErrors.password = "Password is required.";
        if (role === "ROLE_VISITING_LECTURER") {
            if (!lecturerDetails.privateAddress.trim()) newErrors.privateAddress = "Private Address is required.";
            if (!lecturerDetails.phoneNumber.trim() || !/^\d{10}$/.test(lecturerDetails.phoneNumber)) {
                newErrors.phoneNumber = "Phone Number must be a valid 10-digit number.";
            }
            if (!lecturerDetails.department || lecturerDetails.department === "Select Department") {
                newErrors.department = "Please select a valid department.";
            }
            lecturerDetails.qualifications.forEach((q, index) => {
                if (!q.title.trim() || !q.level.trim() || !q.university.trim()) {
                    newErrors[`qualifications-${index}`] = "All qualification fields are required.";
                }
            });
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsLoading(true);
            try {
                const response = await axiosInstance.post("/users/add", {
                    role,
                    ...lecturerDetails,
                });
                console.log("User added successfully:", response.data);
                alert("User added successfully!");
                handleClearForm();
            } catch (error) {
                console.error("Error adding user:", error.response ? error.response.data : error.message);
                alert("Failed to add user. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="avl-container">
            <h1 className="avl-title">Add User</h1>
            <div className="avl-form-group">
                <label>Select Role:</label>
                <select value={role} onChange={handleRoleChange}>
                    <option value="">Select Role</option>
                    <option value="ROLE_ADMIN">Admin</option>
                    <option value="ROLE_VISITING_LECTURER">Visiting Lecturer</option>
                </select>
            </div>

            {role && (
                <form onSubmit={handleFormSubmit} className="avl-form">
                    <div className="avl-form-group">
                        <label>Full Name:</label>
                        <input
                            type="text"
                            name="fullName"
                            value={lecturerDetails.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter full name"
                        />
                        {errors.fullName && <p className="error">{errors.fullName}</p>}
                    </div>

                    <div className="avl-form-group">
                        <label>Gender:</label>
                        <select name="gender" value={lecturerDetails.gender} onChange={handleInputChange}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gender && <p className="error">{errors.gender}</p>}
                    </div>

                    <div className="avl-form-group">
                        <label>NIC Number:</label>
                        <input
                            type="text"
                            name="nicNumber"
                            value={lecturerDetails.nicNumber}
                            onChange={(e) => {
                                handleInputChange(e);
                                setLecturerDetails((prevDetails) => ({
                                    ...prevDetails,
                                    password: e.target.value, // Autofill password as NIC
                                }));
                            }}
                            placeholder="Enter NIC number"
                        />
                        {errors.nicNumber && <p className="error">{errors.nicNumber}</p>}
                    </div>

                    <div className="avl-form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={lecturerDetails.email}
                            onChange={(e) => {
                                handleInputChange(e);
                                setLecturerDetails((prevDetails) => ({
                                    ...prevDetails,
                                    username: e.target.value, // Autofill username as email
                                }));
                            }}
                            placeholder="Enter email"
                        />
                        {errors.email && <p className="error">{errors.email}</p>}
                    </div>

                    {role === "ROLE_VISITING_LECTURER" && (
                        <>
                            <div className="avl-form-group">
                                <label>Private Address:</label>
                                <input
                                    type="text"
                                    name="privateAddress"
                                    value={lecturerDetails.privateAddress}
                                    onChange={handleInputChange}
                                    placeholder="Enter private address"
                                />
                                {errors.privateAddress && <p className="error">{errors.privateAddress}</p>}
                            </div>

                            <div className="avl-form-group">
                                <label>Phone Number:</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={lecturerDetails.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter phone number"
                                />
                                {errors.phoneNumber && <p className="error">{errors.phoneNumber}</p>}
                            </div>

                            <div className="avl-form-group">
                                <label>Qualifications:</label>
                                {lecturerDetails.qualifications.map((qualification, index) => (
                                    <div key={index} className="avl-qualification-group">
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            value={qualification.title}
                                            onChange={(e) => handleQualificationChange(index, "title", e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Level"
                                            value={qualification.level}
                                            onChange={(e) => handleQualificationChange(index, "level", e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="University"
                                            value={qualification.university}
                                            onChange={(e) => handleQualificationChange(index, "university", e.target.value)}
                                        />
                                        {errors[`qualifications-${index}`] && (
                                            <p className="error">{errors[`qualifications-${index}`]}</p>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="avl-add-qualification-button"
                                    onClick={handleAddQualification}
                                >
                                    Add More Qualifications
                                </button>
                            </div>

                            <div className="avl-form-group">
                                <label>Present Employment (if any):</label>
                                <input
                                    type="text"
                                    name="presentEmployment"
                                    value={lecturerDetails.presentEmployment}
                                    onChange={handleInputChange}
                                    placeholder="Enter present employment"
                                />
                            </div>

                            <div className="avl-form-group">
                                <label>Department:</label>
                                <select
                                    name="department"
                                    value={lecturerDetails.department}
                                    onChange={handleInputChange}
                                >
                                    <option value="Select Department">Select Department</option>
                                    <option value="Department of Electrical and Computer Engineering">
                                        Department of Electrical and Computer Engineering
                                    </option>
                                    <option value="Other Department">Other Department</option>
                                </select>
                                {errors.department && <p className="error">{errors.department}</p>}
                            </div>
                        </>
                    )}

                    <div className="avl-form-group">
                        <label>Username:</label>
                        <input
                            type="text"
                            name="username"
                            value={lecturerDetails.username}
                            onChange={handleInputChange}
                            placeholder="Enter username"
                        />
                        {errors.username && <p className="error">{errors.username}</p>}
                    </div>

                    <div className="avl-form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            name="password"
                            value={lecturerDetails.password}
                            onChange={handleInputChange}
                            placeholder="Enter password"
                        />
                        {errors.password && <p className="error">{errors.password}</p>}
                    </div>

                    <div className="avl-button-group">
                        <button type="submit" disabled={isLoading} className="avl-submit-button">
                            {isLoading ? "Loading..." : "Add User"}
                        </button>
                        <button type="button" className="avl-clear-button" onClick={handleClearForm}>
                            Clear Form
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AddUser;

