import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "./context/UserProvider";
import { Form, Button, Alert, Card } from "react-bootstrap";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState(null);
  const { registerUser } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    const res = await registerUser(formData);
    if (res.success) {
      setMessage({ type: "success", text: "🎉 Registered Successfully!" });
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setMessage({ type: "danger", text: `❌ ${res.error}` });
    }
  };

  return (
    <div className="register-container">
      <Card className="register-card">
        <Card.Body>
          <h2 className="register-title">Create Account</h2>
          {message && (
            <Alert variant={message.type} className="register-alert">
              {message.text}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
            <Form.Label className="register-label" style={{ textAlign: "left", display: "block" ,marginLeft:'10px',fontSize:'20px'}}>
  Name
</Form.Label>

              {/* see these label are shoiwng in center they shoudl be at l;eeft i tried bu text align do changes and give fullcodee  */}
              <Form.Control
                type="text"
                name="name"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="register-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
            <Form.Label className="register-label" style={{ textAlign: "left", display: "block"  ,marginLeft:'10px',fontSize:'20px'}}>
            Email
</Form.Label>

              
              <Form.Control
                type="email"
                name="email"
                required
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className="register-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
            <Form.Label className="register-label" style={{ textAlign: "left", display: "block",marginLeft:'10px',fontSize:'20px'}}>
            Password
</Form.Label>
              
              <Form.Control
                type="password"
                name="password"
                required
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                className="register-input"
              />
            </Form.Group>

            <Button type="submit" className="register-button">
              Register
            </Button>
          </Form>

          <p className="register-footer">
            Already have an account?{" "}
            <Link to="/login" className="register-link">
              Sign In
            </Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;