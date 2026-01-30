import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../../lib/appwrite';
import { useAuth } from '../../context/AuthContext';

const EditArticle = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState({ value: 'General', label: 'General' }); // Simplify state
    const [catValue, setCatValue] = useState('General');
    const [imageUrl, setImageUrl] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id) return;
            try {
                const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID_ARTICLES, id);
                setTitle(doc.title);
                setContent(doc.content);
                setCatValue(doc.category || 'General');
                setImageUrl(doc.imageUrl || '');
                setSourceUrl(doc.sourceUrl || '');
                setFeedback(doc.editorFeedback || '');

                // Security check: only author can edit
                if (user && doc.authorId !== user.$id) {
                    alert("You can only edit your own articles.");
                    navigate('/dashboard/my-articles');
                }
            } catch (err) {
                console.error(err);
                alert("Failed to load article");
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id, user, navigate]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);

        try {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID_ARTICLES,
                id,
                {
                    title,
                    content,
                    category: catValue,
                    imageUrl,
                    sourceUrl,
                    status: 'PENDING', // Reset status to PENDING so Editor reviews it again
                    // aiScore: // Optionally re-run AI check here or on backend function
                }
            );
            alert("Article updated and resubmitted for review!");
            navigate('/dashboard/my-articles');
        } catch (e) {
            console.error(e);
            alert("Failed to update article.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading editor...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Edit Article</h2>

            {feedback && (
                <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', marginBottom: '2rem', color: '#fca5a5' }}>
                    <strong>Editor Feedback:</strong> {feedback}
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Please address these points and resubmit.</div>
                </div>
            )}

            <form onSubmit={handleUpdate} style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
                    <input
                        value={title} onChange={e => setTitle(e.target.value)} required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-tertiary)', color: 'white', outline: 'none' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                    <select
                        value={catValue}
                        onChange={(e) => setCatValue(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-tertiary)', color: 'white', outline: 'none' }}
                    >
                        <option value="General">General</option>
                        <option value="Politics">Politics</option>
                        <option value="Technology">Technology</option>
                        <option value="Health">Health</option>
                        <option value="Sports">Sports</option>
                        <option value="Entertainment">Entertainment</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Main Content</label>
                    <textarea
                        value={content} onChange={e => setContent(e.target.value)} required rows={12}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-tertiary)', color: 'white', outline: 'none' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Image URL</label>
                    <input
                        value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-tertiary)', color: 'white', outline: 'none' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Source URL</label>
                    <input
                        value={sourceUrl} onChange={e => setSourceUrl(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-tertiary)', color: 'white', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/my-articles')}
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', color: 'white', border: '1px solid var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}
                    >
                        {saving ? 'Saving...' : 'Update & Resubmit'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditArticle;
