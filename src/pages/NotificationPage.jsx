import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {Container, Button, Alert, Card} from 'react-bootstrap';
import NavbarComponent from '../NavbarComponent';
import { useAuth } from '../AuthContext';
import AuthRequiredModal from './AuthRequiredModal';

export default function NotificationPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [infoMsg] = useState('');
    const [showModal, setShowModal] = useState(false);

    const timeAgo = (isoString) => {
        const now = new Date();
        const past = new Date(isoString);
        const seconds = Math.floor((now - past) / 1000);

        const intervals = [
            { label: '年', seconds: 31536000 },
            { label: '個月', seconds: 2592000 },
            { label: '天', seconds: 86400 },
            { label: '小時', seconds: 3600 },
            { label: '分鐘', seconds: 60 },
            { label: '秒', seconds: 1 },
        ];

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}前`;
            }
        }

        return '剛剛';
    };

    useEffect(() => {
        if (!user) {
            setShowModal(true);
            return;
        }

        axios.get(`http://localhost:8080/notifications/${user.userId}`, { withCredentials: true })
            .then(res => {
                const sortedNotifications = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setNotifications(sortedNotifications);
            })
            .catch(err => {
                console.error("通知載入失敗", err);
                setError('無法載入通知，請稍後再試');
            });
    }, [user]);

    const handleNotificationClick = (noti) => {
        if (noti.articleId) {
            navigate(`/article/${noti.articleId}`);
        } else {
            console.warn('這則通知沒有關聯的文章');
        }
    };

    return (
        <>
            <NavbarComponent />
            <Container className="mt-5">
                {error && <Alert variant="danger">{error}</Alert>}

                <Button variant="link" onClick={() => navigate(-1)}>← 返回上一頁</Button>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>通知中心</h2>
                </div>

                {infoMsg && <Alert variant="info">{infoMsg}</Alert>}

                {notifications.length > 0 ? (
                    notifications.map((noti, idx) => (
                        <Card
                            key={idx}
                            className="mb-3 p-3 shadow-sm"
                            style={{ cursor: noti.articleId ? 'pointer' : 'default' }}
                            onClick={() => handleNotificationClick(noti)}
                        >
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h5 className="mb-1">{noti.title}</h5>
                                    {/*<p className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>{noti.content}</p>*/}
                                    <small className="text-muted">{timeAgo(noti.date)}</small>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <p className="text-muted">目前沒有任何通知</p>
                )}
            </Container>
            <AuthRequiredModal show={showModal} message="請先登入才能查看通知，是否前往登入頁？"/>
        </>
    );
}
