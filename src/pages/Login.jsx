import { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/users/login', {
        username,
        password,
      }, { withCredentials: true });
      setMessage(res.data);

      window.location.href = '/'; 

    } catch (err) {
      setMessage(err.response?.data || 'Login failed');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row>
        <Col>
          <Card style={{ width: '24rem' }} className="p-4 shadow">
            <Card.Body>
            <img src="/logo.png" alt="Blog Logo" className="d-block mx-auto mb-3" style={{ width: '120px', height: 'auto' }} />
              <h2 className="text-center mb-4">Blog 登入</h2>

              <Form onSubmit={handleLogin}>
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

                <Button variant="primary" type="submit" className="w-100">
                  登入
                </Button>
              </Form>

              {message && <Alert variant="danger" className="mt-3 text-center">{message}</Alert>}

              <div className="d-flex justify-content-center mt-3">
                <Button variant="link" onClick={() => alert('請聯絡管理員重設密碼')}>
                  忘記密碼？
                </Button>
              </div>

              <div className="d-flex justify-content-center mt-4">
                <Button variant="outline-secondary" href="/Register">建立新帳號</Button>
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
