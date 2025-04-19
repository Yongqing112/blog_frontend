import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import NavbarComponent from '../NavbarComponent';

export default function SearchPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const params = {};
      if (title) params.title = title;
      if (category) params.category = category;
      if (tag) params.tag = tag;

      const response = await axios.get('http://localhost:8080/article/condition', { params });
      console.log(response.data);
      setResults(response.data);
    } catch (error) {
      alert('搜尋失敗');
    }
  };

  const handleCardClick = (articleId) => {
    navigate(`/article/${articleId}`);
  };

  return (
    <>
      <NavbarComponent />
      <div className="container mt-4">
        <h2>搜尋文章</h2>
        <Form className="mb-3">
          <Form.Group className="mb-2">
            <Form.Label>標題</Form.Label>
            <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>分類</Form.Label>
            <Form.Control value={category} onChange={(e) => setCategory(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>標籤</Form.Label>
            <Form.Control value={tag} onChange={(e) => setTag(e.target.value)} />
          </Form.Group>
          <Button onClick={handleSearch}>搜尋</Button>
        </Form>

        {results ? results.map((article) => (
          <Card
            key={article.articleId}
            className="mb-2"
            style={{ cursor: 'pointer' }}
            onClick={() => handleCardClick(article.articleId)}
          >
            <Card.Body>
              <Card.Title>{article.title}</Card.Title>
              <Card.Text>分類：{article.category}</Card.Text>
              <Card.Text>標籤：{article.tag}</Card.Text>
            </Card.Body>
          </Card>
        )): <Alert variant="info" className="mt-3 text-center">未搜尋到任何文章</Alert>}
      </div>
    </>
  );
}
