import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ label, value, color }: { label: string, value: string | number, color: string }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${color}` }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>{label}</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</div>
    </div>
);

const Overview = () => {
    const { user } = useAuth();
    // Mock stats
    const stats = {
        totalSubmitted: 142,
        fakeDetected: 38,
        published: 95
    };

    return (
        <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome, {user?.name}</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Here is what's happening today.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard label="Total Articles" value={stats.totalSubmitted} color="var(--color-primary)" />
                <StatCard label="Fake News Blocked" value={stats.fakeDetected} color="var(--color-danger)" />
                <StatCard label="Published Articles" value={stats.published} color="var(--color-success)" />
            </div>

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>AI Performance</h3>
                <div style={{ height: '20px', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: '73%', backgroundColor: 'var(--color-success)' }} title="Real News"></div>
                    <div style={{ width: '27%', backgroundColor: 'var(--color-danger)' }} title="Fake News"></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    <span>73% Real News</span>
                    <span>27% Fake/Misleading</span>
                </div>
            </div>
        </div>
    );
};

export default Overview;
