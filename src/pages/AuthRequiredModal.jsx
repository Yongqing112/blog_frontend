import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function AuthRequiredModal({ show, message }) {
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate(-1); // 取消 → 回上一頁
    };

    const handleConfirm = () => {
        navigate('/login'); // 確定 → 去登入頁
    };

    return (
        <Modal show={show} onHide={handleCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>尚未登入</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCancel}>
                    取消
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    確定
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
