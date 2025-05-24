import React, {useEffect, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Card, Form } from 'react-bootstrap';
import NavbarComponent from "../NavbarComponent";
import axios from "axios";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import AuthRequiredModal from "./AuthRequiredModal";
import {useAuth} from "../AuthContext";

export default function ChatAppLayout() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [content, setContent] = useState("");
    const [error, setError] = useState(null);
    const [activeUser, setActiveUser] = useState("");
    const [chats, setChats] = useState([])
    const [users, setUsers] = useState([]);
    const stompClientRef = useRef(null);
    const messagesEndRef = useRef(null);

    function formatDate(timestamp) {
        const date = new Date(timestamp);

        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        return `${mm}/${dd} ${hh}:${min}`;
    }

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [chats, activeUser]);

    useEffect(() => {
        if (!user) {
            setShowModal(true);
            return;
        }

        // 先拿到聊天資料
        axios.get(`http://localhost:8080/chats/user/${user.userId}`, { withCredentials: true })
            .then(res => {
                setUsers(Object.keys(res.data));
                setChats(res.data);
                if (!stompClientRef.current ||
                    !stompClientRef.current.connected && !stompClientRef.current.active) {

                    const stompClient = new Client({
                        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
                        debug: (str) => {
                            console.log("Fdsa",str)},
                        reconnectDelay: 5000,
                    });

                    stompClient.onConnect = () => {
                        console.log('Connected!');

                        const chatIds = Object.values(res.data).map(chat => chat.id);
                        chatIds.forEach((chatId) => {
                            stompClient.subscribe(`/topic/chat/${chatId}`, (message) => {
                                const data = JSON.parse(message.body);

                                setChats(prevChats => {
                                    const updatedChats = { ...prevChats };
                                    const chat = Object.values(updatedChats).find(chat => chat.id === chatId);
                                    const userId = chat.user1Id === user.userId ? chat.user2Id : chat.user1Id;

                                    if (!updatedChats[userId]) {
                                        updatedChats[userId] = { messages: [] };
                                    }
                                    if (updatedChats[userId].messages.some(message => message.id === data.id)){
                                        return updatedChats;
                                    }
                                    updatedChats[userId].messages.push({
                                        id: data.id,
                                        userId: data.userId,
                                        content: data.content,
                                        date: data.date
                                    });
                                    return updatedChats;
                                });
                            });
                        });
                    };

                    stompClient.activate();
                    stompClientRef.current = stompClient;
                }
            })
            .catch(err => {
                console.error("通知載入失敗", err);
                setError('無法載入通知，請稍後再試');
            });

        // 清理函式，component 卸載時
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
        };
    }, [user]);

    const handleSend = () => {
        if (!content.trim() || !activeUser) return;
        const chatId = chats[activeUser].id;
        axios.post(`http://localhost:8080/chats/${chatId}`, {
            userId: user.userId,
            content: content
        }).then(r => {
            setContent("");
        }).catch(err => {
            console.error("發送訊息失敗", err);
        });
    };

    return (
        <>
            <NavbarComponent />
            <Container className="mt-5">
                <Button variant="link" onClick={() => navigate(-1)}>← 返回上一頁</Button>

                {/* 左右分割區塊 */}
                <div className="d-flex flex-column flex-lg-row gap-4 mt-4 align-items-stretch">
                    {/* 左邊：文章內容 */}
                    <div style={{ minWidth: '300px' }}>
                        <Card className="bg-light p-4 shadow-sm position-relative" style={{ height: '100%', overflowY: 'auto' }}>
                            <h3 className="font-bold mb-4">Chat</h3>
                            <ul className="space-y-2">
                                {users.map((user) => (
                                    <li
                                        key={user}
                                        onClick={() => setActiveUser(user)}
                                        className={`cursor-pointer p-2 rounded ${
                                            activeUser === user ? "bg-dark text-white" : "hover:bg-gray-200"
                                        }`}
                                    >
                                        {user}
                                    </li>
                                ))}
                            </ul>

                        </Card>
                    </div>

                    {/* 右邊：留言區 */}
                    <div className="flex-grow-1">
                        <Card className="bg-light p-4 shadow-sm" style={{ height: '60vh', overflowY: 'auto' }}>

                            {/* 訊息列表 */}
                            <div className="d-flex flex-column gap-2">
                                {!activeUser ? (
                                    <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                                        請先選擇一位使用者開始聊天
                                    </div>
                                ):
                                (chats[activeUser]?.messages || []).map((message, idx) => (
                                    <div key={idx}>
                                        {/* 根據發送者決定靠左還是右 */}
                                        <div className={`d-flex ${message.userId === user.userId ? "justify-content-end" : "justify-content-start"}`}>
                                            <div
                                                className="px-3 py-2 rounded-pill shadow-sm"
                                                style={{
                                                    maxWidth: "75%",
                                                    backgroundColor: message.userId === user.userId ? "black" : "lightgray",
                                                    color: message.userId === user.userId ? "white" : "black",
                                                    alignSelf: message.userId === user.userId ? "flex-end" : "flex-start",
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {message.content}
                                            </div>
                                        </div>

                                        {/* 時間放外面，位置同樣根據發送者對齊 */}
                                        <div className={`d-flex ${message.userId === user.userId ? "justify-content-end" : "justify-content-start"}`}>
                                            <div className="text-muted" style={{ fontSize: "0.75rem", margin: "0 8px" }}>
                                                {formatDate(message.date)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                        </Card>
                        <p style={{ marginTop: '1em' }}></p>
                        <Card className="bg-light border rounded-2xl overflow-hidden">
                            <div className="px-4 py-3 border-t bg-light flex items-start gap-2">
                                <Form className="w-full">
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Form.Control
                                            as="textarea"
                                            rows={1}
                                            value={content}
                                            disabled={!activeUser}
                                            onChange={(e) => setContent(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend()
                                                }
                                            }}
                                            placeholder="Write your content here..."
                                            style={{
                                                flex: 1,
                                                resize: 'none',
                                                overflow: 'hidden',
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSend}
                                            disabled={!activeUser}
                                            style={{
                                                padding: '0 16px',
                                                backgroundColor: 'black',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                fontWeight: 'bold',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >發送
                                        </button>
                                    </div>
                                </Form>
                            </div>
                        </Card>
                    </div>
                </div>
            </Container>
            <AuthRequiredModal show={showModal} message="請先登入才能查看聊天室，是否前往登入頁？"/>
        </>

    );
}
