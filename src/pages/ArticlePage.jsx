import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Navbar, Nav, Button, Form, ListGroup, Alert } from 'react-bootstrap';
import NavbarComponent from './NavbarComponent';

export default function ArticlePage() {
    const { articleId } = useParams();
    const [article, setArticle] = useState({});
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchData = async () => {
        try {
          const articleRes = await axios.get(`http://localhost:8080/article/${articleId}`);
          setArticle(articleRes.data);
        } catch (err) {
          console.error("文章載入失敗", err);
          setError('找不到這篇文章');
          return; // 可加 navigate('/not-found') 或顯示錯誤頁面
        }
    
        try {
          const userRes = await axios.get('http://localhost:8080/users/profile', { withCredentials: true });
          setUsername(userRes.data.username);
        } catch (err) {
          console.warn("未登入，導向登入頁", err);
          navigate('/login');
        }
      };
    
      fetchData();
    }, [articleId, navigate]);

    return (
        <>
            <NavbarComponent username={username} />
            <Container className="mt-5">
                {error && <Alert variant="danger">{error}</Alert>}
                <Button variant="link" onClick={() => navigate(-1)}>← Back</Button>
                <h1>{article.title}</h1>
                <p>{article.content}</p>
            </Container>
        </>
    );
}
