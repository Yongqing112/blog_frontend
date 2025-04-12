import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Navbar, Nav, Button, Form, ListGroup, Alert } from 'react-bootstrap';
import NavbarComponent from './NavbarComponent';

export default function ArticlePage() {
    const { articleId } = useParams();
    const [article, setArticle] = useState({});
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
          axios.get(`http://localhost:8080/article/${articleId}`),
          axios.get('http://localhost:8080/users/profile', { withCredentials: true })
        ])
        .then(([articleRes, userRes]) => {
          setArticle(articleRes.data);
          setUsername(userRes.data.username);
        })
        .catch(() => {
          navigate('/login');
        });
      }, [articleId, navigate]);

    return (
        <>
            <NavbarComponent username={username} />
            <Container className="mt-5">
                <Button variant="link" onClick={() => navigate(-1)}>← Back</Button>
                <h1>{article.title}</h1>
                <p>{article.content}</p>
            </Container>
        </>
    );
}
