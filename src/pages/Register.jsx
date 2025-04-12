import { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/users/create', {
        username,
        password,
      }, { withCredentials: true });

      setMessage('註冊成功，2秒後跳轉登入畫面');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data || '註冊失敗');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row>
        <Col>
          <Card style={{ width: '24rem' }} className="p-4 shadow">
            <Card.Body>
              <h2 className="text-center mb-4">Blog 註冊</h2>

              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>用戶名稱</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="輸入用戶名稱"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>密碼</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="輸入密碼"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100">
                  註冊
                </Button>
              </Form>

              {message && <Alert variant="info" className="mt-3 text-center">{message}</Alert>}

              <div className="d-flex justify-content-center mt-4">
                <Button variant="link" href="/login">
                  已經有帳號？登入
                </Button>
              </div>

              <div className="text-center text-muted mt-4" style={{ fontSize: '12px' }}>
                © Blog
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
