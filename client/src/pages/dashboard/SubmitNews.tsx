import { useState } from 'react';
import { databases, DATABASE_ID, COLLECTION_ID_ARTICLES } from '../../lib/appwrite';
import { ID } from 'appwrite';
import { useAuth } from '../../context/AuthContext';

const SubmitNews = () => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [category, setCategory] = useState('General');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // 1. AI Check (Call Python Service)
            let aiResult = { result: 'UNKNOWN', score: 0 };
            try {
                const response = await fetch('http://127.0.0.1:5000/detect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: content })
                });
                if (response.ok) {
                    aiResult = await response.json();
                }
            } catch (aiError) {
                console.warn('AI Service unavailable', aiError);
            }

            // 2. Submit to Database
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_ARTICLES,
                ID.unique(),
                {
                    title,
                    content,
                    authorId: user?.$id,
                    authorName: user?.name,
                    status: 'PENDING', // Default status for review
                    aiLabel: String(aiResult.result || 'UNKNOWN').substring(0, 50),
                    aiScore: aiResult.score,
                    createdAt: new Date().toISOString(),
                    sourceUrl: sourceUrl,
                    category: category,
                    imageUrl: imageUrl
                }
            );

            setMessage({ type: 'success', text: 'Article submitted successfully! It has been sent for review.' });
            setTitle('');
            setContent('');
            setSourceUrl('');

        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to submit article. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-bg-tertiary)', paddingBottom: '0.5rem' }}>Submit News Article</h2>

            {message.text && (
                <div style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
                    backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                    border: `1px solid ${message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Article Headline</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Local Community Center Opens New Wing"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-tertiary)', color: 'white', outline: 'none' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Main Content</label>
                    <textarea
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={10}
                        placeholder="Write your article here..."
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-tertiary)', color: 'white', outline: 'none', resize: 'vertical' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Image URL (Optional)</label>
                    <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="e.g. https://example.com/image.jpg"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-tertiary)', color: 'white', outline: 'none' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Source URL / Citation (Optional)</label>
                    <input
                        type="text"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="e.g. https://official-government-site.gov/news/123"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-bg-tertiary)', color: 'white', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '0.75rem 2rem',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Analyzing & Submitting...' : 'Submit Article'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubmitNews;
