import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/theme.css";
import 'font-awesome/css/font-awesome.min.css';

const ThemeForm = () => {
    const [nombre, setNombre] = useState('');
    const [message, setMessage] = useState('');
    const [themesList, setThemesList] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [selectedThemeId, setSelectedThemeId] = useState(null);

    const navigate = useNavigate();
    const backendUrl = process.env.REACT_APP_BACKEND_URL || process.env.BACKEND_URL;

    useEffect(() => {
        fetchThemes();
    }, []);

    const fetchThemes = async () => {
        try {
            const response = await fetch(`${backendUrl}api/theme`);
            const data = await response.json();
            if (response.ok) {
                setThemesList(data.themes);
            } else {
                setMessage('Failed to load themes.');
            }
        } catch (error) {
            setMessage('Error fetching themes.');
            console.error('Error fetching themes:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombre) {
            setMessage('Theme name is required!');
            return;
        }

        const url = editMode
            ? `${backendUrl}/api/theme/${selectedThemeId}`
            : `${backendUrl}/api/theme`;

        const method = editMode ? 'PUT' : 'POST';
        const body = JSON.stringify({
            nombre,
        });

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body,
            });

            const data = await response.json();

            if (response.ok) {
                setNombre('');
                setEditMode(false);
                setSelectedThemeId(null);
                fetchThemes();
                setMessage('Theme updated successfully.');
            } else {
                setMessage('Error creating or updating theme.');
            }
        } catch (error) {
            setMessage('Error creating or updating theme.');
            console.error('Error making request:', error);
        }
    };

    const handleDelete = async (themeId) => {
        const isConfirmed = window.confirm('Are you sure you want to delete this theme?');

        if (!isConfirmed) {
            return;
        }

        const url = `${backendUrl}/api/theme/${themeId}`;
        try {
            const response = await fetch(url, { method: 'DELETE' });
            const data = await response.json();

            if (response.ok) {
                setThemesList((prevThemesList) => {
                    const newThemesList = prevThemesList.filter(theme => theme.id !== themeId);
                    if (newThemesList.length === 0) {
                        setMessage("No themes available.");
                    }
                    return newThemesList;
                });
                setMessage('Theme deleted successfully.');
            } else {
                setMessage('Failed to delete theme.');
            }
        } catch (error) {
            setMessage('Error deleting theme.');
            console.error('Error deleting theme:', error);
        }
    };

    const handleEdit = (themeId) => {
        const themeToEdit = themesList.find((theme) => theme.id === themeId);
        if (themeToEdit) {
            setNombre(themeToEdit.nombre);
            setSelectedThemeId(themeId);
            setEditMode(true);
        }
    };

    const handleCancel = () => {
        setNombre('');
        setEditMode(false);
        setSelectedThemeId(null);
    };

    const goToHome = () => {
        navigate('/');
    };

    return (
        <div className="container mt-5 mb-5 container-dark">
            <h2 className="text-center mb-4">{editMode ? 'Edit Theme' : 'Create Theme'}</h2>
            <div className="row justify-content-center">
                <div className="col-md-7">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="theme" className="form-label custom-label">Theme:</label>
                            <input
                                type="text"
                                id="theme"
                                className="form-control custom-input"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                style={{ fontSize: '24px' }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-success w-100"
                        >
                            {editMode ? 'Save Changes' : 'Create Theme'}
                        </button>
                        {editMode && (
                            <button
                                type="button"
                                className="btn btn-danger w-100 mt-2"
                                onClick={handleCancel}
                            >
                                Cancel changes
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {message && <p className="mt-3 text-center text-dark">{message}</p>}

            <h3 className="text-center mt-5">Themes List</h3>
            <div className="mt-4 col-md-7 mx-auto row">
                <ul className="list-group">
                    {themesList.length > 0 ? (
                        themesList.map((theme) => (
                            <li key={theme.id} className="list-group-item d-flex justify-content-between align-items-center  mb-2">
                                <span className="theme-text">{theme.nombre}</span>
                                <div className="col-2 d-flex justify-content-between">
                                    <i
                                        className="fa fa-pencil"
                                        style={{
                                            fontSize: '20px',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => handleEdit(theme.id)}
                                    ></i>
                                    <i
                                        className="fa fa-trash"
                                        style={{
                                            fontSize: '20px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleDelete(theme.id)}
                                    ></i>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="mt-3 text-center text-dark">No themes available.</p>
                    )}
                </ul>
                <button
                    type="button"
                    className="btn btn-primary w-100 mt-2"
                    onClick={goToHome}
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
};

export default ThemeForm;
