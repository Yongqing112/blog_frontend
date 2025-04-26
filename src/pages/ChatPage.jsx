import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import NavbarComponent from "../NavbarComponent";
import { Container, Button, Card, Form } from 'react-bootstrap';
import AuthRequiredModal from "./AuthRequiredModal";
import axios from "axios";
import {useAuth} from "../AuthContext";

export default function ChatAppLayout() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [content, setContent] = useState("");
    const [error, setError] = useState(null);
    const [activeUsername, setActiveUsername] = useState("");
    const [chats, setChats] = useState([])
    const [users, setUsers] = useState([]);


    function formatDate(timestamp) {
        const date = new Date(timestamp);

        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        return `${mm}/${dd} ${hh}:${min}`;
    }

    useEffect(() => {
        if (!user) {
            setShowModal(true);
            return;
        }
        axios.get(`http://localhost:8080/chats/user/${user.userId}`, { withCredentials: true })
            .then(res => {
                setUsers(Object.keys(res.data))
                console.log(`users: ${users}`)
                setChats(res.data)
                console.log(chats)
            })
            .catch(err => {
                console.error("通知載入失敗", err);
                setError('無法載入通知，請稍後再試');
            });
    }, [user]);

    const handleSend = () => {
        if (!content.trim()) return;
        const chatId = chats[activeUsername].id;

        axios.post(`http://localhost:8080/chats/${chatId}`, {
            user: user.userId,
            content: content
        }).then(r => setContent(""));

    };


    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSend();
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
                                {users.map((user, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => setActiveUsername(user)}
                                        className={`cursor-pointer p-2 rounded ${
                                            activeUsername === user ? "bg-dark text-white" : "hover:bg-gray-200"
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
                                {(chats[activeUsername]?.conversations || []).map((conversation, idx) => (
                                    <div key={idx}>
                                        {/* 根據發送者決定靠左還是右 */}
                                        <div className={`d-flex ${conversation.userId === user.userId ? "justify-content-end" : "justify-content-start"}`}>
                                            <div
                                                className="px-3 py-2 rounded-pill shadow-sm"
                                                style={{
                                                    maxWidth: "75%",
                                                    backgroundColor: conversation.userId === user.userId ? "black" : "lightgray",
                                                    color: conversation.userId === user.userId ? "white" : "black",
                                                    alignSelf: conversation.userId === user.userId ? "flex-end" : "flex-start",
                                                    whiteSpace: "pre-wrap",
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {conversation.content}
                                            </div>
                                        </div>

                                        {/* 時間放外面，位置同樣根據發送者對齊 */}
                                        <div className={`d-flex ${conversation.userId === user.userId ? "justify-content-end" : "justify-content-start"}`}>
                                            <div className="text-muted" style={{ fontSize: "0.75rem", margin: "0 8px" }}>
                                                {formatDate(conversation.date)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
