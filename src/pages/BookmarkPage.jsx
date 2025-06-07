import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, ListGroup, Alert, Button, Form } from 'react-bootstrap';
import NavbarComponent from '../NavbarComponent';
import { useAuth } from '../AuthContext';
import AuthRequiredModal from './AuthRequiredModal';

export default function BookmarkPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [message, setMessage] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedBookmarkId, setSelectedBookmarkId] = useState('');
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const formatDate = (isoString) => new Date(isoString).toLocaleDateString('zh-TW');

  useEffect(() => {
    if (!user) {
      setShowModal(true);
      return;
    }

    // 獲取收藏類別
    axios.get(`http://localhost:8080/article/bookmark/user/${user.userId}`, { withCredentials: true })
      .then(res => {
        setBookmarks(res.data);
      })
      .catch(err => {
        console.error('取得收藏類別失敗', err);
        setMessage('無法載入收藏類別');
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // 根據選擇的收藏類別獲取文章
    const fetchArticles = async () => {
      try {
        if (!selectedBookmarkId) {
          setMessage('請選擇類別');
          setArticles([]);
          return;
        }

        let articleIds = [];
        if (selectedBookmarkId) {
          // 獲取特定收藏類別的文章 ID
          const res = await axios.get(`http://localhost:8080/article/bookmark/${selectedBookmarkId}`, { withCredentials: true });
          articleIds = res.data;
        } else {
          // 獲取所有收藏文章
          const res = await axios.get(`http://localhost:8080/article/bookmark/${user.userId}`, { withCredentials: true });
          articleIds = res.data;
        }

        if (articleIds.length === 0) {
          setMessage('尚未收藏任何文章');
          setArticles([]);
          return;
        }

        const articleList = await Promise.all(
          articleIds.map(id => axios.get(`http://localhost:8080/article/${id}`))
        );

        setArticles(articleList.map(a => a.data));
        setMessage('');
      } catch (err) {
        console.error('取得文章失敗', err);
        setMessage('無法載入文章');
        setArticles([]);
      }
    };

    fetchArticles();
  }, [user, selectedBookmarkId]);

  const handleRemoveBookmark = async (articleId) => {
    if (!selectedBookmarkId) {
      alert('請選擇一個收藏類別以取消收藏');
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/article/bookmark/${selectedBookmarkId}/${articleId}`, {
        withCredentials: true,
      });

      setArticles(prev => prev.filter(article => article.articleId !== articleId));
    } catch (err) {
      console.error('取消收藏失敗', err);
      alert('取消收藏失敗，請稍後再試');
    }
  };

  const handleCreateBookmarkCategory = async () => {
    if (!user) {
      setShowModal(true);
      return;
    }

    const bookmarkName = prompt('請輸入收藏類別名稱：');
    if (!bookmarkName || bookmarkName.trim() === '') {
      alert('類別名稱不能為空');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:8080/article/bookmark/${bookmarkName}`, null, {
        withCredentials: true,
      });
      alert(`成功創建收藏類別：${bookmarkName}`);
      setMessage(`已新規範收藏類別：${bookmarkName}`);
      // 重新獲取收藏類別
      const res = await axios.get(`http://localhost:8080/article/bookmark/user/${user.userId}`, { withCredentials: true });
      setBookmarks(res.data);
    } catch (err) {
      console.error('創建收藏類別失敗', err);
      alert('創建收藏類別失敗，請稍後再試');
    }
  };

  const handleBookmarkChange = (e) => {
    const newBookmarkId = e.target.value;
    console.log('選擇的 bookmarkId:', newBookmarkId); // 調試：檢查選擇的值
    setSelectedBookmarkId(newBookmarkId);
  };

  return (
    <>
      <NavbarComponent />
      <Container className="mt-5 text-center">
        <h1>我的收藏文章</h1>
      </Container>

      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Form.Select
            value={selectedBookmarkId}
            onChange={handleBookmarkChange}
            style={{ width: '200px' }}
          >
            <option value="">所有收藏類別</option>
            {bookmarks.map(bookmark => (
              <option key={bookmark.bookmarkId} value={bookmark.bookmarkId}>
                {bookmark.bookmarkName}
              </option>
            ))}
          </Form.Select>
          <Button variant="primary" onClick={handleCreateBookmarkCategory}>
            新增收藏類別
          </Button>
        </div>

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