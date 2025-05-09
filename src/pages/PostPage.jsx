import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../AuthContext';
import AuthRequiredModal from './AuthRequiredModal';
import NavbarComponent from '../NavbarComponent';

export default function PostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setShowModal(true);
    }
  }, [user]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:8080/article/category', { withCredentials: true });
        setCategories(res.data);
      } catch (err) {
        console.error('載入分類失敗', err);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');

    if (!title.trim() || !content.trim()) {
      setMessage('Title and content cannot be empty.');
      return;
    }

    if (!category) {
      setMessage('Please select a category.');
      return;
    }

    const articleId = new Date().toISOString();
    const date = new Date().toISOString();

    axios.post('http://localhost:8080/article/', {
      articleId,
      userId: user.userId,
      title,
      content,
      tag,
      category,
      date
    }, { withCredentials: true })
      .then(() => {
        setMessage('文章發表成功！');
        setTimeout(() => navigate('/user'), 1500);
      })
      .catch(() => {
        setMessage('發表失敗，請再試一次');
      });
  };

  return (
    <>
      <NavbarComponent />

      <Container className="mt-5">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Article Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your title"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content here..."
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Tag</Form.Label>
            <Form.Control
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Enter tag (ex: tech, life)"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled hidden style={{ color: '#ced4da' }}>
                Please select a category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Button variant="dark" type="submit">Save</Button>
          {message && <Alert variant="info" className="mt-3 text-center">{message}</Alert>}
        </Form>
      </Container>
      <AuthRequiredModal show={showModal} message="請先登入才能發表文章，是否前往登入頁？" />
    </>
  );
}
