import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import "./RecommendationForm.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RecommendationForm = () => {
    const [serviceTypes, setServiceTypes] = useState([]);
    const [programsOfStudy, setProgramsOfStudy] = useState([]);
    const [courses, setCourses] = useState([]);
    const [centres, setCentres] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [formData, setFormData] = useState({
        department: "Electrical & Computing",
        applicantName: "",
        medium: "English",
        qualifications: [], // Ensure qualifications is an array
        presentEmployment: "",
        postalAddress: "",
        phoneNumber: "",
        email: "",
        serviceTypeId: "",
        programOfStudyId: "",
        courseId: "",
        centreId: "",
        academicYearId: "",
        referenceNumber: "",
        dateOfAppointment: "",
        dateOfTermination: "",
        estimatedStudents: "",
        workload: "",
        totalFinancialCommitment: "",
        nicNumber: "",
    });

    useEffect(() => {
        fetchServiceTypes("/api/recommendation-data/serviceTypes", setServiceTypes);
        fetchProgramsOfStudy("/api/recommendation-data/programsOfStudy", setProgramsOfStudy);
        fetchCourses("/api/recommendation-data/courses", setCourses);
        fetchCentres("/api/recommendation-data/centres", setCentres);
        fetchAcademicYears("/api/recommendation-data/academicYears", setAcademicYears);
    }, []);

    const showToast = (success, message, duration) => {
        const toastType = success ? toast.success : toast.error;
    
        toastType(message, {
          position: "top-right",
          autoClose: duration,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      };

    const fetchServiceTypes = async (url, setState) => {
        try {
            const response = await axiosInstance.get('/recommendation-data/service-types');  // Axios request
            setState(response.data);  // Set the state with fetched data
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
        }
    };

    const fetchProgramsOfStudy = async (url, setState) => {
        try {
            const response = await axiosInstance.get('/recommendation-data/programs');  // Axios request
            setState(response.data);  // Set the state with fetched data
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
        }
    };
    
    const fetchCourses = async (url, setState) => {
        try {
            const response = await axiosInstance.get('/recommendation-data/courses');  // Axios request
            setState(response.data);  // Set the state with fetched data
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
        }
    };

    const fetchCentres = async (url, setState) => {
        try {
            const response = await axiosInstance.get('/recommendation-data/centres');  // Axios request
            setState(response.data);  // Set the state with fetched data
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
        }
    };

    const fetchAcademicYears = async (url, setState) => {
        try {
            const response = await axiosInstance.get('/recommendation-data/academic-years');  // Axios request
            setState(response.data);  // Set the state with fetched data
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
        }
    };

    const fetchLecturerDetails = () => {
        const { nicNumber } = formData;
        if (!nicNumber) {
            alert("Please enter NIC number first!");
            return;
        }

        axiosInstance.get(`/recommendation/${nicNumber}`)
            .then((response) => {
                console.log("Lecturer details:", response.data);
                //showToast(true, "Data fetched successfully!", 2000);

                if(!response || !response.data || !response.data.role){
                    showToast(false, "Data is incorrect (NULL / Role is Empty)", 2000);
                    return;
                }



                if(response.data.role=="ROLE_VISITING_LECTURER"){
                    showToast(true, "Data fetched successfully!", 2000);
                    setFormData((prevData) => ({
                        ...prevData,
                        department: response.data.department || "Electrical & Computing",
                        applicantName: response.data.fullName || "",
                        presentEmployment: response.data.presentEmployment || "",
                        postalAddress: response.data.privateAddress || "",
                        phoneNumber: response.data.phoneNumber || "",
                        email: response.data.email || "",
                        qualifications: Array.isArray(response.data.qualifications) ? response.data.qualifications : [],
                    }));
                }else{
                    showToast(false, "Role is incorrect " + response.data.role, 2000);
                }
                

            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                alert("Failed to fetch lecturer details. Please check the NIC number or network.");
            });




    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleClear = () => {
        setFormData({
            nicNumber: "",
            department: "Electrical & Computing",
            applicantName: "",
            medium: "English",
            qualifications: [],
            presentEmployment: "",
            postalAddress: "",
            phoneNumber: "",
            email: "",
            serviceTypeId: "",
            programOfStudyId: "",
            courseId: "",
            centreId: "",
            academicYearId: "",
            referenceNumber: "",
            dateOfAppointment: "",
            dateOfTermination: "",
            estimatedStudents: "",
            workload: "",
            totalFinancialCommitment: "",
        });
    };

    const handleSaveAsPDF = () => {
        const doc = new jsPDF({ orientation: "landscape" });
    
        // Set font to Times New Roman
        doc.setFont("times");
    
        // Title
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text("Form of Recommendation for Online External Tutor", doc.internal.pageSize.width / 2, 20, { align: "center" });
        doc.text("The Open University of Sri Lanka", doc.internal.pageSize.width / 2, 30, { align: "center" });

        doc.setFont(undefined, "normal");

        // Add indentation by increasing Y position
        let startY = 45; // Adjusted to add proper spacing

        doc.setFontSize(10);
        doc.text(`Department: ${formData.department || "N/A"}`, 20, startY);
        doc.text(`Academic Year: ${formData.academicYear || "N/A"}`, 130, startY);
        doc.text(`Date of Appointment: ${formData.dateOfAppointment || "N/A"}`, 180, startY);
        doc.text(`Date of Termination: ${formData.dateOfTermination || "N/A"}`, 240, startY);
        doc.text(`Program of Study: ${formData.programOfStudy || "N/A"}`, 20, startY + 5);
    
        // Ensure table starts after enough space
        startY += 10;

        // Table Headers
        const tableColumn = [
            "Program of Study", "Course Code & Name", "Estimated Students",
            "Name of the Applicant", "Centre", "Medium", "Qualifications",
            "Present Employment", "Contact Details", "Workload", "Total Financial Commitment"
        ];
        
        // Table Rows
        const tableRows = [];
        tableRows.push([
            formData.programOfStudyId || "N/A",
            formData.courseCodeAndName || "N/A",
            formData.estimatedStudents || "N/A",
            formData.applicantName || "N/A",
            formData.centreId || "N/A",
            formData.medium || "N/A",
            formData.qualifications?.map(q => `${q.title}, ${q.university}`).join("\n") || "N/A",
            formData.presentEmployment || "N/A",
            `${formData.postalAddress || "N/A"}, ${formData.phoneNumber || "N/A"}, ${formData.email || "N/A"}`,
            formData.workload || "N/A",
            formData.totalFinancialCommitment || "N/A"
        ]);
    
        // Generate Table
        doc.autoTable({
            startY: startY, // Start below department details
            head: [tableColumn],
            body: tableRows,
            styles: { 
                font: "times", 
                fontSize: 9, 
                cellPadding: 3, 
                lineWidth: 0.2,  // 1/2 pt thickness for borders
                lineColor: 0      // Black border color
            },
            headStyles: { 
                fillColor: false,  // No background color for headers
                textColor: 0,      // Black text
                lineWidth: 0.2,    // 1/2 pt thickness for header borders
                lineColor: 0       // Black border color for header
            },
            bodyStyles: { 
                fillColor: false,  // No background color for body
                textColor: 0,      // Black text
                lineWidth: 0.2,    // 1/2 pt thickness for body borders
                lineColor: 0       // Black border color for body
            },
            alternateRowStyles: { fillColor: false }, // No gray shading
            columnStyles: {
                6: { cellWidth: 40 }, // Qualifications column
                8: { cellWidth: 55 }, // Contact details column
            }
        });
    
        // Approval Section
        const approvalY = doc.autoTable.previous.finalY + 20;
        doc.text("Recommended", 20, approvalY);
        doc.text("Recommended", 100, approvalY);
        doc.text("Approved", 200, approvalY);
    
        doc.text("Head of the Department", 20, approvalY + 10);
        doc.text("Dean of the Faculty", 100, approvalY + 10);
        doc.text("Vice Chancellor", 200, approvalY + 10);
    
        doc.text("Date: ___________", 20, approvalY + 20);
        doc.text("Date: ___________", 100, approvalY + 20);
        doc.text("Date: ___________", 200, approvalY + 20);
    
        doc.save("Recommendation_Form.pdf");
    };
    
    return (
        <div className="recommendation-container">
            <ToastContainer />
            <h1 className="title">Recommendation Form</h1>
            <form className="recommendation-form">
                <label htmlFor="nicNumber">Enter NIC of the Visiting Lecturer:</label>
                <input
                    type="text"
                    name="nicNumber"
                    id="nicNumber"
                    value={formData.nicNumber}
                    onChange={handleInputChange}
                    required
                />
                <button type="button" onClick={fetchLecturerDetails}>Fetch Lecturer Details</button>

                <div className="form-group">
                    <label>Department:</label>
                    <input type="text" name="department" value={formData.department} readOnly />
                </div>

                <div className="form-group">
                    <label>Applicant Name:</label>
                    <input type="text" name="applicantName" value={formData.applicantName} readOnly />
                </div>

                <div className="form-group">
                    <label>Qualifications:</label>
                    {formData.qualifications.map((qualification, index) => (
                        <div key={index} className="qualification-entry">
                            <input 
                                type="text" 
                                value={`${qualification.title}, ${qualification.university}`} 
                                readOnly 
                            />
                        </div>
                    ))}
                </div>

                <div className="form-group">
                    <label>Postal Address:</label>
                    <input type="text" name="postalAddress" value={formData.postalAddress} readOnly />
                </div>

                <div className="form-group">
                    <label>Phone Number:</label>
                    <input type="text" name="phoneNumber" value={formData.phoneNumber} readOnly />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} readOnly />
                </div>

                {/* Type of Service */}
                <div className="form-group">
                    <label>Type of Service:</label>
                    <select name="serviceTypeId" value={formData.serviceTypeId} onChange={handleInputChange} required>
                    <option value="">Select an option</option>
                    {serviceTypes.map((serviceType) => (
                        <option key={serviceType.id} value={serviceType.id}>
                            {serviceType.typeOfService}
                        </option>
                    ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Program of Study:</label>
                    <select name="programOfStudyId" value={formData.programOfStudyId} onChange={handleInputChange} required>
                    <option value="">Select an option</option>
                    {programsOfStudy.map((programOfStudy) => (
                        <option key={programOfStudy.id} value={programOfStudy.id}>
                            {programOfStudy.programName}
                        </option>
                    ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Course Code:</label>
                    <select name="courseId" value={formData.courseId} onChange={handleInputChange} required>
                    <option value="">Select an option</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.courseCode}
                        </option>
                    ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Centre:</label>
                    <select name="centreId" value={formData.centreId} onChange={handleInputChange} required>
                    <option value="">Select an option</option>
                    {centres.map((centre) => (
                        <option key={centre.id} value={centre.id}>
                            {centre.centreName}
                        </option>
                    ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Academic Year:</label>
                    <select name="academicYearId" value={formData.academicYearId} onChange={handleInputChange} required>
                    <option value="">Select an option</option>
                    {academicYears.map((academicYear) => (
                        <option key={academicYear.id} value={academicYear.id}>
                            {academicYear.academicYear}
                        </option>
                    ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Reference Number:</label>
                    <input type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleInputChange} required/>
                </div>

                {/* Date of Appointment & Termination */}
                <div className="form-group">
                    <label>Date of Appointment:</label>
                    <input type="date" name="dateOfAppointment" value={formData.dateOfAppointment} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                    <label>Date of Termination:</label>
                    <input type="date" name="dateOfTermination" value={formData.dateOfTermination} onChange={handleInputChange} required />
                </div>

                {/* Estimated Students */}
                <div className="form-group">
                    <label>Estimated Students:</label>
                    <input type="number" name="estimatedStudents" value={formData.estimatedStudents} onChange={handleInputChange} required />
                </div>

                {/* Workload */}
                <div className="form-group">
                    <label>Workload:</label>
                    <input type="text" name="workload" value={formData.workload} onChange={handleInputChange} required />
                </div>

                {/* Total Financial Commitment (Currency Input) */}
                <div className="form-group">
                <label>Total Financial Commitment:</label>
                <input
                    type="number"
                    name="totalFinancialCommitment"
                    value={formData.totalFinancialCommitment}
                    onChange={handleInputChange}
                    placeholder="Enter amount in Rs."
                    required
                />
                </div>

                <div className="form-buttons">
                    <button type="button" onClick={handleClear}>Clear</button>
                    <button type="button" onClick={handleSaveAsPDF}>Save as PDF</button>
                </div>
            </form>
        </div>
    );
};

export default RecommendationForm;






