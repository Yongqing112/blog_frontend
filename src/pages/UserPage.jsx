import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Navbar, Nav, Button, Form, ListGroup, Alert } from 'react-bootstrap';
import NavbarComponent from '../NavbarComponent';

import '../Button.css';

export default function UserPage() {
    const [username, setUsername] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [articles, setArticles] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8080/users/profile', { withCredentials: true })
            .then(res => {
                const userData = res.data;
                setUsername(userData.username);

                return axios.get(`http://localhost:8080/article/user/${userData.userId}`, { withCredentials: true });
            })
            .then(res => {
                setArticles(res.data);
            })
            .catch(() => {
                navigate('/login');
            });
    }, [navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');

        axios.post('http://localhost:8080/users/update', {
            username,
            oldPassword,
            newPassword
        }, { withCredentials: true })
            .then(() => {
                setMessage('更新成功！');
                setOldPassword('');
                setNewPassword('');
            })
            .catch(err => {
                setMessage(err.response?.data?.error || '更新失敗');
            });
    }

    return (
        <>
            <NavbarComponent username={username} />

            <Container className="mt-5">
                <Row>
                    <Col md={8}>
                        <h1 className="fw-bold mb-2">{username}</h1>
                        <h6 className="text-muted mb-4">bheading for description or instructions</h6>

                        {articles.length > 0 ? (
                            <ListGroup>
                                {articles.map(article => (
                                    <ListGroup.Item key={article.id} className="mb-3 border-0">
                                        <h5 className="fw-bold">
                                            <Link to={`/article/${article.articleId}`} style={{ textDecoration: 'none', color: 'black' }}>
                                                {article.title}
                                            </Link>
                                        </h5>
                                        <p className="text-muted">
                                            {article.content.split('\n')[0]}
                                        </p>
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
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
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
                                    value={newPassword}
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
