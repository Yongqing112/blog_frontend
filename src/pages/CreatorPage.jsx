import { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Table } from 'react-bootstrap';
import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import NavbarComponent from '../NavbarComponent';

export default function CreatorPage() {
    const { isAdminMode } = useAuth();
    const [categoryName, setCategoryName] = useState('');
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    if (!isAdminMode) {
        return <Navigate to="/" replace />;
    }

    const fetchCategories = async () => {
        try {
            const res = await axios.get('http://localhost:8080/article/category', { withCredentials: true });
            setCategories(res.data);
        } catch (err) {
            console.error(err);
            setMessage('	Failed to load categories. Please try again later.');
        }
    };

    const handleCreateCategory = async () => {
        if (!categoryName.trim()) {
            setMessage('Category name cannot be empty.');
            return;
        }

        try {
            await axios.post(
                'http://localhost:8080/article/category/create',
                null,
                { params: { name: categoryName }, withCredentials: true }
            );
            setMessage('Category created successfully!');
            setCategoryName('');
            fetchCategories();
        } catch (err) {
            console.error(err);
            setMessage('	Failed to create category. Please try again later.');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('	Are you sure you want to delete this category?')) return;

        try {
            await axios.delete(`http://localhost:8080/article/category/delete/${id}`, { withCredentials: true });
            setMessage('Category deleted successfully.');
            fetchCategories();
        } catch (err) {
            console.error(err);
            setMessage('Failed to delete category. Please try again later.');
        }
    };

    return (
        <>
            <NavbarComponent />
            <Container className="mt-5">
                <h2 className="mb-4">Creator Management</h2>

                <Form className="mb-4">
                    <Form.Group className="mb-3">
                        <Form.Label>Create New Category</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter new category name"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" onClick={handleCreateCategory}>
                        ➕ Create Category
                    </Button>
                </Form>

                {message && (
                    <Alert variant="info" onClose={() => setMessage(null)} dismissible>
                        {message}
                    </Alert>
                )}

                <h4 className="mb-3">All Categories</h4>
                {categories.length > 0 ? (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Category name</th>
                                <th>operation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat, idx) => (
                                <tr key={cat.id}>
                                    <td>{idx + 1}</td>
                                    <td>{cat.name}</td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDeleteCategory(cat.id)}
                                        >
                                            🗑️ Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <p className="text-muted">empty</p>
                )}
            </Container>
        </>
    );

}
