import React from "react";
import { Link } from "react-router-dom";
import './Navbar.css';

const Navbar = ({ role }) => {
    return (
        <nav className="navbar">
            <ul>
                <li>
                    <Link to="/dashboard">Dashboard</Link> 
                </li>
                {role === "ROLE_ADMIN" && (
                    <li>
                        <div>
                            <Link to="/add-user">Add User</Link>
                        </div>
                        <br></br>
                        <div>
                            <Link to="/recommendation-form">Recommendation Form</Link>
                        </div>
                        <br></br>
                        <div>
                            <Link to="/marking-rates">Managing Marking Rates</Link>
                        </div>
                        <br></br>
                        <div>
                            <Link to="/workload-verification">Workload Verifictaion</Link>
                        </div>
                        <br></br>
                        <div>
                            <Link to="/upload-document">Upload Document</Link>
                        </div>
                        <br></br>
                        <div>
                            <Link to="/lecturer-info">View Lecturer Info</Link>
                        </div>
                    </li>
                    
                )}
                {role === "ROLE_VISITING_LECTURER" && (
                    <li>
                        <div>
                            <Link to="/upload-document">Upload Document</Link>
                        </div>
                        <br></br>
                        <div>
                            <Link to="/payee-form">Payee Form</Link>
                        </div>
                        <br></br>
                        <div>
                            <Link to="/payment-detail">Payment Details</Link>
                        </div>
                    </li>
                    
                )}
                
            </ul>
        </nav>
    );
};

export default Navbar;
