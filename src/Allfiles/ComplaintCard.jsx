import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserProvider";
import { Link } from "react-router-dom";

const ComplaintCard = () => {
  const { user, role } = useUser();
  const [formData, setFormData] = useState({
    category: "",
    priority: "medium",
    subject: "",
    description: ""
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("submit");

  const categories = [
    "Academic Issues", "Technical Problems", "Facilities", 
    "Administrative", "Harassment/Bullying", "Other"
  ];

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`https://api-e5q6islzdq-uc.a.run.app/complaints/${user.email}`);
      const data = await res.json();
      if (res.ok) setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (user?.email) fetchComplaints();
  }, [user?.email]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      return setMessage("Please fill in all required fields.");
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("https://api-e5q6islzdq-uc.a.run.app/complaints/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          complaint: `${formData.subject} - ${formData.description}`,
          category: formData.category,
          priority: formData.priority
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage("✅ Complaint submitted successfully.");
        setFormData({ category: "", priority: "medium", subject: "", description: "" });
        fetchComplaints();
      } else {
        setMessage(data.error || "❌ Failed to submit complaint.");
      }
    } catch (err) {
      setMessage("❌ Server error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = { high: "danger", medium: "warning", low: "success" };
    return `badge bg-${colors[priority] || "secondary"}`;
  };

  if (!user || role.toLowerCase() !== "student") return null;

  return (
    <div className="container-fluid py-4" style={{ maxWidth: "1200px" }}>
      <div className="row">
        <div className="col-12">
          <div className="d-flex align-items-center mb-4">
            <div className="bg-primary rounded-circle p-2 me-3">
              <i className="fas fa-exclamation-triangle text-white"></i>
            </div>
            <div>
              <h4 className="mb-0 text-dark">Complaint Management</h4>
              <small className="text-muted">Submit and track your complaints</small>
            </div>
            <Link to="/" className="btn btn-outline-secondary btn-sm ms-auto">
              <i className="fas fa-arrow-left me-1"></i>Dashboard
            </Link>
          </div>

          {/* Tab Navigation */}
          <ul className="nav nav-pills mb-4" role="tablist">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === "submit" ? "active" : ""}`}
                onClick={() => setActiveTab("submit")}
              >
                <i className="fas fa-plus me-1"></i>Submit Complaint
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                <i className="fas fa-history me-1"></i>History ({complaints.length})
              </button>
            </li>
          </ul>

          {/* Submit Complaint Tab */}
          {activeTab === "submit" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Category *</label>
                      <select 
                        className="form-select" 
                        name="category" 
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Priority</label>
                      <select 
                        className="form-select" 
                        name="priority" 
                        value={formData.priority}
                        onChange={handleInputChange}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Subject *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="subject"
                        placeholder="Brief summary of your complaint"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Description *</label>
                      <textarea 
                        className="form-control" 
                        rows="4" 
                        name="description"
                        placeholder="Provide detailed information about your complaint..."
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <small className="text-muted">* Required fields</small>
                    <button 
                      type="submit" 
                      className="btn btn-primary px-4"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          Submit Complaint
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {message && (
                  <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} mt-3 mb-0`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                {complaints.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No complaints found</h5>
                    <p className="text-muted">Your submitted complaints will appear here.</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {complaints.map((complaint, idx) => (
                      <div key={complaint.id || idx} className="col-12">
                        <div className="card border-start border-4 border-primary">
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="mb-1 text-dark">{complaint.complaint?.split(' - ')[0] || "Complaint"}</h6>
                              <span className={getPriorityBadge(complaint.priority || "medium")}>
                                {(complaint.priority || "medium").toUpperCase()}
                              </span>
                            </div>
                            <p className="text-muted small mb-2">
                              {complaint.complaint?.split(' - ').slice(1).join(' - ') || complaint.complaint}
                            </p>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                <i className="fas fa-clock me-1"></i>
                                {complaint.timestamp?._seconds 
                                  ? new Date(complaint.timestamp._seconds * 1000).toLocaleDateString()
                                  : "Date not available"}
                              </small>
                              <span className="badge bg-light text-dark">
                                {complaint.category || "General"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;