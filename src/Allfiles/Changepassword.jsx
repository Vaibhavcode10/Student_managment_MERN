import React from "react";
import { Col, Card, Button, Form, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserProvider";

const ChangePasswordCard = () => {
  const {
    role,
    formData,
    handleChange,
    handleChangePasswordSubmit,
    isLoading,
    message,
  } = useUser();
  // const roleval=()=>{
  //   if(role==="student"){
  //     return true;
  //   }else{
  //     return false ;
  //   }
  // }
  return (
    <Col md={6} style={{ display: role ? "block" : "none" }}>
      <Card className="mb-4">
        <Card.Header>
          <h4 className="mb-0">🔐 Change Password</h4>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              readOnly={role !== "admin"}
              plaintext={role !== "admin"}
            />
          </Form.Group>

          <Form onSubmit={handleChangePasswordSubmit}>
            <Form.Group className="mb-3" controlId="oldPassword">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {message && (
              <Alert
                variant={message.includes("success") ? "success" : "danger"}
              >
                {message}
              </Alert>
            )}

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? "Changing Password..." : "Change Password"}
              </Button>
            </div>
          </Form>

          <div className="mt-3 text-center">
            <Link to="/" className="btn btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ChangePasswordCard;
