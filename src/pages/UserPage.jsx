import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Form, ListGroup, Alert } from 'react-bootstrap';
import NavbarComponent from '../NavbarComponent';
import { useAuth } from '../AuthContext';

import '../Button.css';

export default function UserPage() {
  const { user, setUser } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [password, setNewPassword] = useState('');
  const [articles, setArticles] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchArticles();
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');

    axios.put('http://localhost:8080/users/update', {
      username: user.username,
      oldPassword,
      password
    }, { withCredentials: true })
      .then(() => {
        setMessage('更新成功！');
        setOldPassword('');
        setNewPassword('');
        setUser({ ...user, username: user.username });
      })
      .catch(err => {
        setMessage(err.response?.data?.error || '更新失敗');
      });
  }

  const handleDelete = async (articleId) => {
  try {
    await axios.delete(`http://localhost:8080/article/${user.userId}/${articleId}`, {
      withCredentials: true
    });
    fetchArticles();
  } catch (err) {
    console.error('刪除失敗', err);
    alert('刪除失敗');
  }
};

const fetchArticles = () => {
  axios.get(`http://localhost:8080/article/user/${user.userId}`, {
    withCredentials: true
  }).then(res => {
    const visibleArticles = res.data
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    setArticles(visibleArticles);
  }).catch(() => {
    setArticles([]);
  });
};

  
  const handleRecover = async (articleId) => {
    try {
      await axios.put(`http://localhost:8080/article/${user.userId}/${articleId}`, null, {
        withCredentials: true
      });
      fetchArticles();
    } catch (err) {
      console.error('回復失敗', err);
      alert('回復失敗');
    }
  };
  

  return (
    <>
      <NavbarComponent />

      <Container className="mt-5">
        <Row>
          <Col md={8}>
            <h1 className="fw-bold mb-2">{user?.username}</h1>
            <h6 className="text-muted mb-4">bheading for description or instructions</h6>

            {articles.length > 0 ? (
              <ListGroup>
                {articles.map(article => (
                  <ListGroup.Item key={article.articleId} className="mb-3 border-0">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="fw-bold">
                          <Link to={`/article/${article.articleId}`} style={{ textDecoration: 'none', color: 'black' }}>
                            {article.title}
                          </Link>
                        </h5>
                        <p className="text-muted">{article.content.split('\n')[0]}</p>
                      </div>

                      <div className="d-flex flex-column align-items-end ms-3">
                        {!article.deleted ? (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(article.articleId)}
                          >
                            刪除
                          </Button>
                        ) : (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleRecover(article.articleId)}
                          >
                            回復
                          </Button>
                        )}
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p>尚未發表任何文章</p>
            )}
          </Col>

          <Col md={4}>
            <div className="d-flex justify-content-center mb-4">
              <img
                src="https://randomuser.me/api/portraits/men/10.jpg"
                alt="avatar"
                style={{ width: '100%', maxWidth: '250px', borderRadius: '10px' }}
              />
            </div>

            <h5 className="fw-bold mb-3">Change Profile</h5>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>User Name</Form.Label>
                <Form.Control
                  type="text"
                  value={user?.username || ''}
                  onChange={(e) => setUser({ ...user, username: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Old Password</Form.Label>
                <Form.Control
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Form.Group>

              <Button variant="dark" type="submit" className="w-100">
                Submit
              </Button>
            </Form>

            {message && <Alert variant="info" className="mt-3 text-center">{message}</Alert>}
          </Col>
        </Row>
      </Container>
    </>
  );
}
