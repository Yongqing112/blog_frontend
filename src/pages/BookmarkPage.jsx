import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {Container, ListGroup, Alert, Button} from 'react-bootstrap';
import NavbarComponent from '../NavbarComponent';
import { useAuth } from '../AuthContext';
import AuthRequiredModal from './AuthRequiredModal';

export default function BookmarkPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const formatDate = (isoString) => new Date(isoString).toLocaleDateString('zh-TW');

  useEffect(() => {
    if (!user) {
        setShowModal(true);
       return;
    }

    axios.get(`http://localhost:8080/article/bookmark/${user.userId}`, { withCredentials: true })
      .then(async res => {
        const articleIds = res.data;

        if (articleIds.length === 0) {
          setMessage('尚未收藏任何文章');
          return;
        }

        const articleList = await Promise.all(
          articleIds.map(id => axios.get(`http://localhost:8080/article/${id}`))
        );

        setArticles(articleList.map(a => a.data));
      })
      .catch(err => {
        console.error('取得收藏失敗', err);
        setMessage('尚未收藏任何文章');
      });
  }, [user]);

  const handleRemoveBookmark = async (articleId) => {
    try {
      await axios.delete(`http://localhost:8080/article/bookmark/${user.userId}/${articleId}`, {
        withCredentials: true,
      });

      setArticles(prev => prev.filter(article => article.articleId !== articleId));
    } catch (err) {
      console.error('取消收藏失敗', err);
      alert('取消收藏失敗，請稍後再試');
    }
  };

  return (
    <>
      <NavbarComponent />
      <Container className="mt-5 text-center">
        <h1>我的收藏文章</h1>
      </Container>

      <Container className="mt-4">
        {message && <Alert variant="info">{message}</Alert>}

        <ListGroup className="mt-3">
          {articles.map(article => (
            <ListGroup.Item key={article.articleId} className="d-flex justify-content-between align-items-center">
              <div onClick={() => navigate(`/article/${article.articleId}`)} style={{ cursor: 'pointer' }}>
                <strong>{article.title}</strong><br />
                <small className="text-muted">發布日期：{formatDate(article.date)}</small>
              </div>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleRemoveBookmark(article.articleId)}
              >
                取消收藏
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <Button className="mt-4" onClick={() => navigate(-1)}>← 返回上一頁</Button>
      </Container>
      <AuthRequiredModal show={showModal} message="請先登入才能收藏文章，是否前往登入頁？"/>
    </>
  );
}
